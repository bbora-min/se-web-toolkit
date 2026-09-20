// 원본: examples/dataset-explorer/src/pages/ask/AskPage.tsx (자동 복사 — 수정하지 말 것, pnpm gen:skill-docs)
/**
 * 질문 — 대화(chat) 골격의 원본. 스레드 목록 | 대화 컬럼 + 컴포저. 답마다 출처(데이터셋) 칩.
 *
 * 디자인 플랜
 *  골격       : 대화. 데이터셋을 "찾는" 목록(원장·검색 히어로)과 달리 "묻는" 화면 — 시간순으로 쌓이는 말과 입력 상자 하나.
 *  목적       : 어떤 테이블을 쓰면 되는지, 언제 갱신되는지, 조인은 어떻게 하는지를 문장으로 묻고 출처 있는 답을 받는다.
 *  첫 시선    : 빈 스레드면 시작 질문 칩 3개, 답이 오면 스트리밍 커서와 출처 칩.
 *  주 액션    : 보내기(컴포저의 primary 아이콘). 보내는 중엔 정지.
 *  정보 계층  : 스레드 목록(새 대화 · 최근) → 대화(질문 → 답 → 출처) → 컴포저.
 *  밀도       : 컬럼 46rem, 답 15px/1.6. 화면 높이 고정(ShellFill fixed), 폭은 쉘 기본.
 *  액센트     : 어시스턴트 마크, 커서, 출처 번호, 보내기 버튼. 그 외 회색.
 *  3상태      : 스레드 스켈레톤 / 새 대화(시작 질문) / 답 실패는 어시스턴트 자리에 원인 + 다시 시도(질문은 남긴다).
 *  톤         : friendly.
 */
import * as React from 'react'
import { Copy, MessageSquarePlus, RefreshCw } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Chip, Composer, ErrorState, Message, Prose, ShellFill, Skeleton, SplitPane, Thread, cn, formatAbsolute, formatRelative, toast, useContentWidth } from '@se/ui'
import { ask, useThread, useThreads } from '../../api/ask'
import type { AskMessage } from '../../api/types'

const STARTERS = ['fct.orders_daily 는 언제 갱신돼?', 'PII 컬럼이 있는 events 테이블은?', '최근 30일 조회가 가장 많은 데이터셋은?', 'dim.users 를 특정 시점 값으로 조인하려면?']

export function AskPage() {
  const { threadId } = useParams()
  return <Ask key={threadId ?? 'new'} threadId={threadId} />
}

function Ask({ threadId }: { threadId: string | undefined }) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const threads = useThreads()
  // 새 스레드로 막 넘어온 화면은 서버에서 다시 읽지 않는다 — 이전 화면이 건넨 답을 흘리는 중이라 겹쳐 쓰면 안 된다
  const fromHandoff = React.useRef(Boolean(threadId && pendingAnswers.has(threadId)))
  const past = useThread(fromHandoff.current ? undefined : threadId)
  useContentWidth(1280)

  const [messages, setMessages] = React.useState<AskMessage[]>([])
  const [pending, setPending] = React.useState<{ text: string; error?: string } | null>(null)
  const [streaming, setStreaming] = React.useState<{ full: AskMessage; shown: number } | null>(null)
  React.useEffect(() => {
    if (past.data) setMessages(past.data.messages)
  }, [past.data])

  /** 목은 답을 한 번에 준다 — 클라이언트에서 글자를 흘려 스트리밍을 흉내 낸다. 실제 백엔드는 SSE·chunk 로 이어 붙인다 */
  const stream = (m: AskMessage) => setStreaming({ full: m, shown: 0 })
  const streamingId = streaming?.full.id
  React.useEffect(() => {
    if (!streamingId) return
    const id = window.setInterval(() => {
      setStreaming((s) => (s ? { ...s, shown: Math.min(s.full.text.length, s.shown + 3 + Math.floor(Math.random() * 4)) } : s))
    }, 16)
    return () => window.clearInterval(id)
  }, [streamingId])
  React.useEffect(() => {
    if (streaming && streaming.shown >= streaming.full.text.length) {
      setMessages((ms) => [...ms, streaming.full])
      setStreaming(null)
    }
  }, [streaming])
  const stop = () => {
    if (!streaming) return
    setMessages((ms) => [...ms, { ...streaming.full, text: streaming.full.text.slice(0, streaming.shown) + ' …', citations: [] }])
    setStreaming(null)
  }
  const send = async (text: string) => {
    const user: AskMessage = { id: `u-${Date.now()}`, role: 'user', text, at: new Date().toISOString() }
    setMessages((ms) => [...ms, user])
    setPending({ text })
    try {
      const res = await ask({ threadId, text })
      setPending(null)
      if (!threadId) {
        void qc.invalidateQueries({ queryKey: ['ask', 'threads'] })
        navigate(`/ask/${res.threadId}`, { replace: true })
        // 새 스레드로 넘어가면 key 가 바뀌어 다시 마운트되므로, 흐름은 그 화면이 이어받는다
        pendingAnswers.set(res.threadId, { user, answer: res.message })
        return
      }
      stream(res.message)
    } catch (e) {
      setPending({ text, error: (e as Error).message })
    }
  }
  // 새 스레드가 만들어져 마운트된 직후 — 이전 화면이 받아 둔 답을 흘린다
  React.useEffect(() => {
    if (!threadId) return
    const handoff = pendingAnswers.get(threadId)
    if (!handoff) return
    pendingAnswers.delete(threadId)
    setMessages([handoff.user])
    stream(handoff.answer)
  }, [threadId])

  const busy = Boolean(pending && !pending.error) || Boolean(streaming)

  return (
    <ShellFill fixed className="border-t border-line">
      <h1 className="sr-only">질문</h1>
      <SplitPane
        storageKey="ask"
        leftWidth={260}
        minLeft={200}
        left={
          <div className="flex flex-col gap-2 p-2">
            <Button variant="secondary" size="sm" asChild className="justify-start"><Link to="/ask"><MessageSquarePlus /> 새 대화</Link></Button>
            <div className="px-2 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted">최근</div>
            {threads.isPending ? (
              <div className="flex flex-col gap-1">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-9 rounded-md" />)}</div>
            ) : threads.isError ? (
              <p className="px-2 text-xs text-muted">스레드를 불러오지 못했어요.</p>
            ) : (
              <ol className="flex flex-col gap-px">
                {threads.data?.items.map((t) => (
                  <li key={t.id}>
                    <Link to={`/ask/${t.id}`} aria-current={t.id === threadId ? 'page' : undefined} className={cn('flex flex-col gap-0.5 rounded-md px-2 py-1.5 text-[13px]', t.id === threadId ? 'bg-accent-soft text-accent-fg' : 'text-ink/85 hover:bg-surface-2')}>
                      <span className="truncate">{t.title}</span>
                      <span className="text-[11px] text-muted" title={formatAbsolute(t.updatedAt)}>{formatRelative(t.updatedAt)}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
        }
      >
        {past.isError ? (
          <ErrorState title="대화를 불러오지 못했어요" description={past.error.message} action={<Button onClick={() => past.refetch()}>다시 시도</Button>} />
        ) : (
          <>
            <Thread>
              {past.isLoading ? (
                <div className="flex flex-col gap-4"><Skeleton className="ml-auto h-10 w-64 rounded-2xl" /><Skeleton className="h-24 w-full" /></div>
              ) : null}
              {!threadId && messages.length === 0 && !pending ? (
                <div className="flex flex-col gap-4 pt-10">
                  <div className="flex flex-col gap-1">
                    <h2 className="font-display text-xl font-semibold text-ink">무엇이 궁금하세요?</h2>
                    <p className="text-sm text-muted">데이터셋의 갱신·소유·컬럼·조인 방법을 물어보면 출처와 함께 답해요.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {STARTERS.map((s) => <Chip key={s} onClick={() => void send(s)}>{s}</Chip>)}
                  </div>
                </div>
              ) : null}
              {messages.map((m) => <Bubble key={m.id} m={m} />)}
              {pending ? (
                <Message role="assistant" mark="DE" streaming={!pending.error}>
                  {pending.error ? (
                    <span className="flex flex-wrap items-center gap-2 text-sm text-danger">답을 가져오지 못했어요 — {pending.error} <Button variant="link" size="sm" onClick={() => { setMessages((ms) => ms.slice(0, -1)); setPending(null); void send(pending.text) }}><RefreshCw /> 다시 시도</Button></span>
                  ) : (
                    <span className="text-muted">찾는 중…</span>
                  )}
                </Message>
              ) : null}
              {streaming ? <Bubble m={{ ...streaming.full, text: streaming.full.text.slice(0, streaming.shown), citations: [] }} streaming /> : null}
            </Thread>
            <Composer onSubmit={(t) => void send(t)} streaming={busy} onStop={stop} placeholder="데이터셋, 컬럼, 조인, 갱신 주기… 무엇이든" autoFocus={!threadId} />
          </>
        )}
      </SplitPane>
    </ShellFill>
  )
}

/** 새 스레드로 옮겨 가는 사이 답을 건네는 자리 — 화면이 key 로 다시 마운트되기 때문 */
const pendingAnswers = new Map<string, { user: AskMessage; answer: AskMessage }>()

function Bubble({ m, streaming }: { m: AskMessage; streaming?: boolean }) {
  if (m.role === 'user') return <Message role="user" meta={<span title={formatAbsolute(m.at)}>{formatRelative(m.at)}</span>}>{m.text}</Message>
  return (
    <Message
      role="assistant"
      mark="DE"
      streaming={streaming}
      citations={m.citations?.map((c) => ({ id: c.id, label: c.label, href: c.href }))}
      meta={<span title={formatAbsolute(m.at)}>{formatRelative(m.at)}</span>}
      actions={
        <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[11px]" onClick={() => { void navigator.clipboard?.writeText(m.text); toast('답을 복사했어요') }}><Copy /> 복사</Button>
      }
    >
      <Answer text={m.text} />
    </Message>
  )
}

/** 답 본문 — 문단·번호 목록·```코드``` 블록만. 마크다운 전체를 받지 않는다(색·컨트롤 규칙을 우회하지 않게) */
function Answer({ text }: { text: string }) {
  const parts = text.split(/```(?:\w+)?\n([\s\S]*?)```/g)
  return (
    <Prose className="max-w-none text-[15px] [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ol]:my-3 [&_pre]:my-3">
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <pre key={i}><code>{part.trim()}</code></pre>
        ) : (
          part
            .split(/\n{2,}/)
            .filter((p) => p.trim())
            .map((p, j) => {
              const lines = p.trim().split('\n')
              return lines.length > 1 && lines.every((l) => /^\d+\. /.test(l)) ? (
                <ol key={`${i}-${j}`}>{lines.map((l, k) => <li key={k}>{l.replace(/^\d+\. /, '')}</li>)}</ol>
              ) : (
                <p key={`${i}-${j}`}>{p.trim()}</p>
              )
            })
        ),
      )}
    </Prose>
  )
}
