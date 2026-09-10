/**
 * 새 릴리스 — FormWizardPage 패턴의 원본.
 *  3단계: 기본 정보 → 변경·위험·체크리스트 → 승인자·검토. 단계마다 그 단계 필드만 검증.
 *  주 액션은 항상 우하단 하나("다음" / "등록"). 완료된 단계는 위 Steps로 되돌아갈 수 있다.
 */
import * as React from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Alert, Badge, Button, CheckboxField, Combobox, DateRangePicker, DescriptionList, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
  Input, PageBody, PageHeader, RadioCards, Steps, SwitchRow, Textarea, toast,
} from '@se/ui'
import { useCreateRelease } from '../../api/releases'
import { CHECKLIST_TEMPLATE, PEOPLE, SERVICES } from '../../api/types'
import { TYPE_LABEL } from './bits'

const schema = z.object({
  service: z.string().min(1, '서비스를 선택하십시오'),
  version: z.string().regex(/^v\d+\.\d+\.\d+(-rc\d+)?$/, 'v1.2.3 또는 v1.2.3-rc1 형식으로 입력하십시오'),
  title: z.string().min(4, '4자 이상').max(60, '60자 이내'),
  type: z.enum(['feature', 'hotfix', 'maintenance']),
  description: z.string().max(400).optional().or(z.literal('')),
  changes: z.string().min(10, '변경 내용을 한 줄에 하나씩, 최소 한 항목 이상 적으십시오'),
  risk: z.enum(['low', 'medium', 'high']),
  checklist: z.array(z.string()),
  rollback: z.string().min(20, '롤백 절차를 20자 이상 구체적으로 적으십시오 (무엇을, 얼마나 걸리는지)'),
  window: z.object({ from: z.string().min(1), to: z.string().min(1) }, { required_error: '배포 창을 선택하십시오', invalid_type_error: '배포 창을 선택하십시오' }),
  approvers: z.array(z.string()),
  notifySlack: z.boolean(),
}).superRefine((v, ctx) => {
  const need = v.risk === 'high' ? 3 : 2
  if (v.approvers.length < need) ctx.addIssue({ code: 'custom', path: ['approvers'], message: `${v.risk === 'high' ? '고위험' : '이 위험도'} 릴리스는 승인자 ${need}명이 필요합니다` })
  const required = CHECKLIST_TEMPLATE.filter((c) => c.required).map((c) => c.id)
  if (v.type === 'hotfix' && !required.every((id) => v.checklist.includes(id))) ctx.addIssue({ code: 'custom', path: ['checklist'], message: '핫픽스는 등록 시점에 필수 항목이 모두 완료되어야 합니다' })
})
type Values = z.infer<typeof schema>

const STEPS = [
  { id: 'basic', label: '기본 정보', description: '서비스·버전·유형', fields: ['service', 'version', 'title', 'type', 'description'] as const },
  { id: 'change', label: '변경과 위험', description: '변경 내용·체크리스트·롤백', fields: ['changes', 'risk', 'checklist', 'rollback', 'window'] as const },
  { id: 'review', label: '승인자와 검토', description: '승인자 지정 후 등록', fields: ['approvers', 'notifySlack'] as const },
]

export function NewReleasePage() {
  const navigate = useNavigate()
  const create = useCreateRelease()
  const [step, setStep] = React.useState(0)
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { service: '', version: '', title: '', type: 'feature', description: '', changes: '', risk: 'low', checklist: ['tests'], rollback: '', approvers: [], notifySlack: true },
  })
  const type = form.watch('type')
  const risk = form.watch('risk')
  React.useEffect(() => {
    if (type === 'hotfix') form.setValue('risk', 'high')
  }, [type, form])

  const next = async () => {
    const ok = await form.trigger([...STEPS[step]!.fields])
    if (!ok) return
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const submit = form.handleSubmit(async (v) => {
    const { window: w, ...rest } = v
    const r = await create.mutateAsync({ ...rest, description: v.description ?? '', windowFrom: w.from, windowTo: w.to })
    toast.success('릴리스가 등록되었습니다', { description: `${r.version} · 승인자에게 알림이 전송되었습니다.` })
    navigate(`/releases/${r.id}`)
  })

  return (
    <PageBody className="max-w-3xl">
      <div className="pt-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted"><Link to="/releases"><ArrowLeft /> 릴리스</Link></Button>
      </div>
      <PageHeader title="새 릴리스" description="세 단계로 등록합니다. 등록 즉시 코드 검토 단계로 이동하며 승인자에게 알림이 전송됩니다." className="pt-0" />
      <Steps steps={STEPS} current={step} onStepClick={setStep} />

      <Form {...form}>
        <form onSubmit={submit} className="flex flex-col gap-6 rounded-lg border border-line bg-surface p-6 shadow-xs" onKeyDown={(e) => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') e.preventDefault() }}>
          {step === 0 ? (
            <>
              <FormField control={form.control} name="service" render={({ field }) => (
                <FormItem>
                  <FormLabel>서비스</FormLabel>
                  <FormControl><Combobox options={SERVICES.map((s) => ({ value: s, label: s }))} value={field.value || null} onChange={(v) => field.onChange(v ?? '')} placeholder="서비스 선택" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-[200px_1fr] gap-4">
                <FormField control={form.control} name="version" render={({ field }) => (
                  <FormItem>
                    <FormLabel>버전</FormLabel>
                    <FormControl><Input mono placeholder="v4.19.0" {...field} /></FormControl>
                    <FormDescription>semver. 후보는 -rc1</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>제목</FormLabel>
                    <FormControl><Input placeholder="예: 결제 재시도 큐 도입" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>유형</FormLabel>
                  <FormControl>
                    <RadioCards name="type" value={field.value} onValueChange={field.onChange} options={[
                      { value: 'feature', label: TYPE_LABEL.feature, description: '새 기능·개선. 일반 승인 절차' },
                      { value: 'hotfix', label: TYPE_LABEL.hotfix, description: '장애 대응. 항상 고위험, 3인 승인', badge: <Badge tone="danger">고위험</Badge> },
                      { value: 'maintenance', label: TYPE_LABEL.maintenance, description: '의존성·인프라. 사용자 영향 없음' },
                    ]} />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel optional>배경</FormLabel>
                  <FormControl><Textarea rows={3} placeholder="왜 이 릴리스가 필요한지 한두 문장" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </>
          ) : step === 1 ? (
            <>
              <FormField control={form.control} name="changes" render={({ field }) => (
                <FormItem>
                  <FormLabel>변경 내용</FormLabel>
                  <FormControl><Textarea rows={5} placeholder={'한 줄에 하나씩\n핵심 경로 리팩터링\n설정 키 2개 추가'} {...field} /></FormControl>
                  <FormDescription>승인자가 읽는 첫 번째 정보입니다. 사용자 관점에서 적으십시오.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="risk" render={({ field }) => (
                <FormItem>
                  <FormLabel>위험도</FormLabel>
                  <FormControl>
                    <RadioCards name="risk" value={field.value} onValueChange={field.onChange} disabled={type === 'hotfix'} options={[
                      { value: 'low', label: '낮음', description: '플래그 뒤, 되돌리기 쉬움. 2인 승인' },
                      { value: 'medium', label: '보통', description: '스키마 변경·외부 연동. 2인 승인' },
                      { value: 'high', label: '높음', description: '결제·인증·데이터 이동. 3인 승인' },
                    ]} />
                  </FormControl>
                  {type === 'hotfix' ? <FormDescription>핫픽스는 위험도가 "높음"으로 고정됩니다.</FormDescription> : null}
                </FormItem>
              )} />
              <FormField control={form.control} name="checklist" render={({ field }) => (
                <FormItem>
                  <FormLabel>체크리스트</FormLabel>
                  <div className="flex flex-col gap-3 rounded-lg border border-line bg-canvas p-4">
                    {CHECKLIST_TEMPLATE.map((c) => (
                      <CheckboxField
                        key={c.id}
                        checked={field.value.includes(c.id)}
                        onCheckedChange={(v) => field.onChange(v === true ? [...field.value, c.id] : field.value.filter((x) => x !== c.id))}
                        label={c.label}
                        description={c.required ? '필수 — 승인 단계 전까지 완료' : '해당 시'}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="rollback" render={({ field }) => (
                <FormItem>
                  <FormLabel>롤백 계획</FormLabel>
                  <FormControl><Textarea rows={3} placeholder="이전 태그로 재배포 (약 4분). 마이그레이션은 하위 호환이라 되돌리지 않음." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="window" render={({ field }) => (
                <FormItem>
                  <FormLabel>배포 창</FormLabel>
                  <FormControl><DateRangePicker value={field.value ?? null} onChange={field.onChange} placeholder="날짜 범위 선택" min={new Date().toISOString().slice(0, 10)} /></FormControl>
                  <FormDescription>금요일 18시 이후 주말은 프리즈입니다.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </>
          ) : (
            <>
              <FormField control={form.control} name="approvers" render={({ field }) => (
                <FormItem>
                  <FormLabel>승인자</FormLabel>
                  <FormControl>
                    <Combobox multiple options={PEOPLE.filter((p) => p.name !== 'bora').map((p) => ({ value: p.name, label: p.name, description: p.team }))} value={field.value} onChange={field.onChange} placeholder="승인자 선택" searchPlaceholder="이름 또는 팀" />
                  </FormControl>
                  <FormDescription>{risk === 'high' ? '고위험: 3명 이상, 보안(dohyun) 또는 SRE(yuna) 포함 권장' : '2명 이상'}</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="notifySlack" render={({ field }) => (
                <FormItem>
                  <SwitchRow label="Slack 알림" description="#releases 채널에 등록·단계 이동·승인 결과를 게시합니다" checked={field.value} onCheckedChange={field.onChange} className="py-0" />
                </FormItem>
              )} />
              <Summary values={form.getValues()} />
              {type === 'hotfix' ? <Alert tone="danger" title="핫픽스 등록">승인자 3인 전원 승인 후 즉시 배포 단계로 이동합니다. 프리즈 규칙은 적용되지 않습니다.</Alert> : null}
            </>
          )}

          <div className="flex items-center justify-between border-t border-line pt-5">
            <Button type="button" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}><ArrowLeft /> 이전</Button>
            <span className="text-xs text-muted tnum">{step + 1} / {STEPS.length}</span>
            {step < STEPS.length - 1 ? (
              <Button type="button" variant="primary" onClick={next}>다음 <ArrowRight /></Button>
            ) : (
              <Button type="submit" variant="primary" loading={create.isPending}><Check /> 릴리스 등록</Button>
            )}
          </div>
        </form>
      </Form>
    </PageBody>
  )
}

function Summary({ values: v }: { values: Values }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg bg-canvas p-4">
      <h3 className="text-sm font-semibold text-ink">검토</h3>
      <DescriptionList
        columns={2}
        items={[
          { label: '서비스 / 버전', value: `${v.service || '—'} · ${v.version || '—'}`, mono: true },
          { label: '제목', value: v.title || '—' },
          { label: '유형 / 위험도', value: `${TYPE_LABEL[v.type]} · ${{ low: '낮음', medium: '보통', high: '높음' }[v.risk]}` },
          { label: '배포 창', value: v.window?.from ? `${v.window.from} ~ ${v.window.to}` : '—' },
          { label: '체크리스트', value: `${v.checklist.length}/${CHECKLIST_TEMPLATE.length} 완료` },
          { label: '변경 항목', value: `${v.changes.split('\n').filter((s) => s.trim()).length}개` },
        ]}
      />
    </section>
  )
}
