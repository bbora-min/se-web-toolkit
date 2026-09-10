// 원본: examples/release-desk/src/pages/releases/DecisionDialog.tsx (자동 복사 — 수정하지 말 것, pnpm gen:skill-docs)
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Button, Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, RadioCards, Textarea, toast,
} from '@se/ui'
import { useDecide } from '../../api/releases'
import type { Release } from '../../api/types'

const schema = z
  .object({
    decision: z.enum(['approved', 'rejected']),
    comment: z.string().max(500, '500자 이내로 작성하십시오'),
  })
  .refine((v) => v.decision === 'approved' || v.comment.trim().length >= 10, {
    path: ['comment'],
    message: '반려 사유를 10자 이상 작성하십시오. 담당자가 무엇을 고쳐야 하는지 알 수 있어야 합니다.',
  })
type Values = z.infer<typeof schema>

/** 승인/반려 — 반려에는 사유가 필수. 위험 릴리스는 체크리스트 완료를 요구한다 */
export function DecisionDialog({ release, onClose }: { release: Release | null; onClose: () => void }) {
  const decide = useDecide(release?.id ?? '')
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { decision: 'approved', comment: '' } })
  React.useEffect(() => {
    if (release) form.reset({ decision: 'approved', comment: '' })
  }, [release, form])
  const missing = release?.checklist.filter((c) => c.required && !c.done) ?? []
  const decision = form.watch('decision')

  const submit = form.handleSubmit(async (v) => {
    if (!release) return
    await decide.mutateAsync({ decision: v.decision, comment: v.comment || undefined })
    toast[v.decision === 'approved' ? 'success' : 'error'](v.decision === 'approved' ? '승인되었습니다' : '반려되었습니다', { description: `${release.version} · ${release.title}` })
    onClose()
  })

  return (
    <Dialog open={Boolean(release)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent width={560}>
        {release ? (
          <Form {...form}>
            <form onSubmit={submit} className="contents">
              <DialogHeader>
                <DialogTitle>
                  <span className="font-mono">{release.version}</span> 승인 검토
                </DialogTitle>
                <DialogDescription>{release.service} · {release.title} · 담당 {release.owner}</DialogDescription>
              </DialogHeader>
              <DialogBody className="flex flex-col gap-5">
                <FormField
                  control={form.control}
                  name="decision"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>결정</FormLabel>
                      <FormControl>
                        <RadioCards
                          name="decision"
                          value={field.value}
                          onValueChange={field.onChange}
                          className="sm:grid-cols-2"
                          options={[
                            { value: 'approved', label: '승인', description: missing.length ? `필수 체크 ${missing.length}건이 미완료입니다` : '필수 체크리스트 완료됨' },
                            { value: 'rejected', label: '반려', description: '담당자에게 사유와 함께 돌려보냅니다' },
                          ]}
                        />
                      </FormControl>
                      {missing.length && field.value === 'approved' ? (
                        <FormDescription className="text-warning">미완료: {missing.map((m) => m.label).join(', ')}. 승인 전 담당자에게 확인을 요청하십시오.</FormDescription>
                      ) : null}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel optional={decision === 'approved'}>{decision === 'rejected' ? '반려 사유' : '코멘트'}</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder={decision === 'rejected' ? '무엇을, 왜, 어떻게 고쳐야 하는지 작성하십시오.' : '검토 시 참고한 내용이 있으면 남기십시오.'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </DialogBody>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={onClose}>돌아가기</Button>
                <Button type="submit" variant={decision === 'rejected' ? 'danger' : 'primary'} loading={decide.isPending}>
                  {decision === 'rejected' ? '반려하기' : '승인하기'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
