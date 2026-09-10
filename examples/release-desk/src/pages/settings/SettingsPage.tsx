/**
 * 설정 — SettingsPage 패턴의 원본.
 *  좌측 제목·설명 / 우측 필드의 2열 섹션. 저장은 섹션 단위가 아니라 화면 하단 한 번.
 *  위험 구역은 맨 아래, 빨간 테두리, 이름 재입력 확인.
 */
import * as React from 'react'
import { Save, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Button, Combobox, ConfirmDialog, DateRangePicker, Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, FormSection,
  Input, PageBody, PageHeader, RadioCards, SwitchRow, toast,
} from '@se/ui'
import { PEOPLE } from '../../api/types'

const schema = z.object({
  notifyStage: z.boolean(),
  notifyDecision: z.boolean(),
  notifyDigest: z.boolean(),
  approvalRule: z.enum(['two', 'three', 'all']),
  requiredReviewer: z.string().nullable(),
  freeze: z.object({ from: z.string(), to: z.string() }).nullable(),
  webhook: z.string().url('https:// 로 시작하는 URL을 입력하십시오').or(z.literal('')),
  channel: z.string().regex(/^#[a-z0-9-_]+$/, '#channel-name 형식').or(z.literal('')),
})
type Values = z.infer<typeof schema>

export function SettingsPage() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { notifyStage: true, notifyDecision: true, notifyDigest: false, approvalRule: 'two', requiredReviewer: 'yuna', webhook: 'https://hooks.slack.com/services/T000/B000/xxxx', channel: '#releases' },
  })
  const [danger, setDanger] = React.useState(false)
  const submit = form.handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 500))
    toast.success('설정이 저장되었습니다')
    form.reset(form.getValues())
  })

  return (
    <PageBody className="max-w-4xl">
      <PageHeader title="설정" description="Release Desk 워크스페이스의 알림·승인 규칙·통합을 관리합니다. 변경은 하단에서 한 번에 저장됩니다." />
      <Form {...form}>
        <form onSubmit={submit} className="flex flex-col">
          <FormSection title="알림" description="어떤 사건에 Slack·이메일 알림을 보낼지 정합니다. 개인 설정은 프로필에서.">
            <div className="divide-y divide-line rounded-lg border border-line bg-surface px-4 shadow-xs">
              <FormField control={form.control} name="notifyStage" render={({ field }) => <SwitchRow label="단계 이동" description="릴리스가 다음 단계로 넘어갈 때" checked={field.value} onCheckedChange={field.onChange} />} />
              <FormField control={form.control} name="notifyDecision" render={({ field }) => <SwitchRow label="승인·반려" description="승인자가 결정할 때 담당자에게" checked={field.value} onCheckedChange={field.onChange} />} />
              <FormField control={form.control} name="notifyDigest" render={({ field }) => <SwitchRow label="아침 요약" description="매일 09:00 진행 중·막힘 요약" checked={field.value} onCheckedChange={field.onChange} />} />
            </div>
          </FormSection>

          <FormSection title="승인 규칙" description="위험도에 따라 필요한 승인자 수. 핫픽스는 항상 3인입니다.">
            <FormField control={form.control} name="approvalRule" render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioCards name="approvalRule" value={field.value} onValueChange={field.onChange} options={[
                    { value: 'two', label: '2인', description: '낮음·보통 위험도 기본' },
                    { value: 'three', label: '3인', description: '모든 릴리스에 3인' },
                    { value: 'all', label: '지정 전원', description: '지정된 승인자 전원' },
                  ]} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="requiredReviewer" render={({ field }) => (
              <FormItem>
                <FormLabel optional>필수 승인자</FormLabel>
                <FormControl><Combobox options={PEOPLE.map((p) => ({ value: p.name, label: p.name, description: p.team }))} value={field.value} onChange={field.onChange} placeholder="없음" className="w-72" /></FormControl>
                <FormDescription>고위험 릴리스에 항상 포함되는 승인자 (예: SRE 온콜)</FormDescription>
              </FormItem>
            )} />
          </FormSection>

          <FormSection title="배포 프리즈" description="이 기간에 배포 창을 잡을 수 없습니다. 매주 금 18:00–월 09:00는 항상 프리즈입니다.">
            <FormField control={form.control} name="freeze" render={({ field }) => (
              <FormItem>
                <FormLabel optional>추가 프리즈 기간</FormLabel>
                <FormControl><DateRangePicker value={field.value ?? null} onChange={field.onChange} placeholder="예: 연말 프리즈" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </FormSection>

          <FormSection title="Slack 통합" description="등록·단계 이동·승인 결과를 채널에 게시합니다.">
            <FormField control={form.control} name="webhook" render={({ field }) => (
              <FormItem>
                <FormLabel>Incoming Webhook URL</FormLabel>
                <FormControl><Input mono type="url" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="channel" render={({ field }) => (
              <FormItem>
                <FormLabel>채널</FormLabel>
                <FormControl><Input mono className="w-60" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </FormSection>

          <div className="sticky bottom-0 -mx-6 mt-2 flex items-center justify-between border-t border-line bg-surface/90 px-6 py-3 backdrop-blur xl:-mx-8 xl:px-8">
            <span className="text-xs text-muted">{form.formState.isDirty ? '저장되지 않은 변경이 있습니다' : '모든 변경이 저장됨'}</span>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => form.reset()} disabled={!form.formState.isDirty}>되돌리기</Button>
              <Button type="submit" variant="primary" disabled={!form.formState.isDirty} loading={form.formState.isSubmitting}><Save /> 저장</Button>
            </div>
          </div>
        </form>
      </Form>

      <section className="mt-6 flex items-center justify-between gap-6 rounded-lg border border-danger/30 bg-danger-soft/40 p-5">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-danger">워크스페이스 초기화</h3>
          <p className="text-xs leading-relaxed text-ink/80">모든 릴리스·이력·설정이 삭제됩니다. 되돌릴 수 없습니다.</p>
        </div>
        <Button variant="danger" onClick={() => setDanger(true)}><Trash2 /> 초기화</Button>
      </section>
      <ConfirmDialog
        open={danger}
        onOpenChange={setDanger}
        title="워크스페이스를 초기화할까요?"
        description="릴리스 28건과 승인 이력이 영구 삭제됩니다."
        confirmLabel="초기화"
        destructive
        typeToConfirm="release-desk"
        onConfirm={async () => {
          await new Promise((r) => setTimeout(r, 600))
          toast('초기화 요청이 접수되었습니다', { description: '관리자 승인 후 실행됩니다.' })
        }}
      />
    </PageBody>
  )
}
