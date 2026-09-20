import * as React from 'react'
import { ArrowUp, Square } from 'lucide-react'
import { cn } from '../lib/cn'
import { isNearBottom } from '../lib/scroll'
import { Button } from '../components/button'
import { Kbd } from '../components/separator'

/* ──────────────────────────────────────────────────────────────
 * Thread · Message · Composer · Citation — 대화(chat) 골격의 재료.
 * 중앙 대화 컬럼 하나, 아래에 컴포저(ChatGPT·Claude). 어시스턴트 답은 왼쪽에 마크와 함께 평문으로, 사용자 말은 오른쪽 말풍선.
 * 인용은 답 아래 번호 칩(Perplexity) — 내부 도구의 답은 출처(데이터셋·문서·잡)가 있어야 믿는다.
 * 스트리밍은 페이지가 든다(`streaming` 이면 커서). 컴포저는 Enter 보내기 · Shift+Enter 줄바꿈, 보내는 중엔 정지 버튼.
 * ────────────────────────────────────────────────────────────── */

export interface ThreadProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 새 내용이 오면 맨 아래로 — 사용자가 위로 올렸으면 그대로 둔다 */
  follow?: boolean
}

/** 대화 스크롤 영역. 자식은 `Message` 들 */
export function Thread({ follow = true, className, children, ...props }: ThreadProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const stick = React.useRef(true)
  const onScroll = () => {
    const el = ref.current
    if (!el) return
    stick.current = isNearBottom(el, 40)
  }
  React.useEffect(() => {
    const el = ref.current
    if (!el || !follow || !stick.current) return
    el.scrollTop = el.scrollHeight
  })
  return (
    <div ref={ref} onScroll={onScroll} className={cn('flex min-h-0 flex-1 flex-col overflow-y-auto', className)} {...props}>
      <div className="mx-auto flex w-full max-w-[46rem] flex-col gap-6 px-6 py-6">{children}</div>
    </div>
  )
}

export interface CitationItem {
  id: string
  label: React.ReactNode
  href?: string
  /** 앱 안 링크면 여기서 `preventDefault` + 라우터 이동 (수정키가 없을 때만) */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
}

export interface MessageProps {
  role: 'user' | 'assistant'
  /** 어시스턴트 마크(모노그램·아이콘). 사용자는 아바타 */
  mark?: React.ReactNode
  /** 답이 아직 오는 중 — 마지막 글 끝에 커서(`.se-caret`, 블록 자식이면 그 안) */
  streaming?: boolean
  /** 답의 출처 — 번호 칩 */
  citations?: CitationItem[]
  /** 답 아래 작은 액션(복사·다시 생성·좋아요) */
  actions?: React.ReactNode
  /** 상대 시각 등 */
  meta?: React.ReactNode
  className?: string
  children: React.ReactNode
}

/** 말 한 덩이. 어시스턴트는 왼쪽 평문(Prose 를 안에 넣어도 된다), 사용자는 오른쪽 말풍선 */
export function Message({ role, mark, streaming, citations, actions, meta, className, children }: MessageProps) {
  if (role === 'user') {
    return (
      <div className={cn('flex justify-end', className)}>
        <div className="flex max-w-[80%] flex-col items-end gap-1">
          <div className="whitespace-pre-wrap rounded-2xl rounded-br-md bg-surface-2 px-4 py-2.5 text-[15px] leading-relaxed text-ink">{children}</div>
          {meta ? <span className="text-[11px] text-muted">{meta}</span> : null}
        </div>
      </div>
    )
  }
  return (
    <div className={cn('group flex gap-3', className)}>
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-accent font-mono text-[11px] font-semibold text-on-accent" aria-hidden>{mark ?? 'AI'}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className={cn('text-[15px] leading-relaxed text-ink', streaming && 'se-caret')}>{children}</div>
        {citations?.length ? (
          <ol className="flex flex-wrap gap-1.5" aria-label="출처">
            {citations.map((c, i) => (
              <li key={c.id}>
                <Citation index={i + 1} href={c.href} onClick={c.onClick}>{c.label}</Citation>
              </li>
            ))}
          </ol>
        ) : null}
        {actions || meta ? (
          <div className="flex items-center gap-2 text-[11px] text-muted opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            {actions}
            {meta ? <span className="ml-auto">{meta}</span> : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

/** 출처 칩 — 번호 + 이름. 눌러서 원본으로 */
export function Citation({ index, href, onClick, children }: { index: number; href?: string; onClick?: (e: React.MouseEvent<HTMLElement>) => void; children: React.ReactNode }) {
  const cls = 'inline-flex h-6 max-w-[16rem] items-center gap-1.5 rounded-md border border-line bg-surface px-2 text-[12px] text-ink/85 transition-colors hover:border-line-strong hover:text-ink'
  const inner = (
    <>
      <span className="grid size-4 shrink-0 place-items-center rounded-sm bg-accent-soft font-mono text-[10px] text-accent-fg">{index}</span>
      <span className="truncate font-mono">{children}</span>
    </>
  )
  return href ? (
    <a href={href} className={cls} onClick={onClick}>
      {inner}
    </a>
  ) : (
    <button type="button" className={cls} onClick={onClick}>
      {inner}
    </button>
  )
}

export interface ComposerProps {
  onSubmit: (text: string) => void
  /** 답이 오는 중 — 보내기 대신 정지 */
  streaming?: boolean
  onStop?: () => void
  placeholder?: string
  disabled?: boolean
  /** 아래 힌트. 기본: Enter 보내기 · Shift+Enter 줄바꿈 */
  hint?: React.ReactNode
  /** 자동으로 커지는 최대 줄 수 */
  maxRows?: number
  autoFocus?: boolean
  className?: string
}

/** textarea 의 leading-6 · py-1 과 같은 값 — 줄 수를 높이로 바꿀 때 쓴다 */
const LINE = 24
const PAD = 8

/** 입력 상자 — 한 줄에서 시작해 자란다. Enter 보내기, Shift+Enter 줄바꿈 */
export function Composer({ onSubmit, streaming, onStop, placeholder = '무엇이든 물어보세요', disabled, hint, maxRows = 8, autoFocus, className }: ComposerProps) {
  const [text, setText] = React.useState('')
  const ref = React.useRef<HTMLTextAreaElement>(null)
  const maxHeight = LINE * maxRows + PAD
  const fit = () => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
  }
  React.useEffect(fit, [text, maxRows])
  const send = () => {
    const t = text.trim()
    if (!t || streaming || disabled) return
    onSubmit(t)
    setText('')
  }
  return (
    <div className={cn('mx-auto w-full max-w-[46rem] px-6 pb-4', className)}>
      <div className="flex items-end gap-2 rounded-xl border border-line-strong/80 bg-surface p-2 shadow-xs transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25">
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            // IME 조합 중 Enter 는 글자 확정 — Safari 는 compositionend 뒤에 keyCode 229 로 온다
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
              e.preventDefault()
              send()
            }
          }}
          rows={1}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-label="메시지"
          style={{ maxHeight }}
          className="min-h-6 flex-1 resize-none bg-transparent px-2 py-1 text-[15px] leading-6 text-ink outline-none placeholder:text-muted disabled:opacity-50"
        />
        {streaming ? (
          <Button type="button" variant="secondary" size="icon" aria-label="정지" onClick={onStop} className="shrink-0"><Square className="size-3.5" /></Button>
        ) : (
          <Button type="button" variant="primary" size="icon" aria-label="보내기" onClick={send} disabled={!text.trim() || disabled} className="shrink-0"><ArrowUp /></Button>
        )}
      </div>
      <div className="mt-1.5 flex items-center gap-2 px-1 text-[11px] text-muted">{hint ?? <><Kbd>Enter</Kbd> 보내기 · <Kbd>Shift</Kbd>+<Kbd>Enter</Kbd> 줄바꿈</>}</div>
    </div>
  )
}
