import * as React from 'react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { cn } from '../lib/cn'
import { Button } from './button'
import { Input } from './input'

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** 무엇이 일어나는지, 되돌릴 수 있는지 */
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** 위험 동작이면 빨간 버튼 */
  destructive?: boolean
  /** 되돌릴 수 없는 동작: 이 문자열을 그대로 입력해야 확인 버튼이 열린다 */
  typeToConfirm?: string
  onConfirm: () => void | Promise<void>
}

/** 확인 다이얼로그. 위험 동작은 항상 이걸 거친다 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  destructive,
  typeToConfirm,
  onConfirm,
}: ConfirmDialogProps) {
  const [typed, setTyped] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  React.useEffect(() => {
    if (!open) setTyped('')
  }, [open])
  const ready = !typeToConfirm || typed === typeToConfirm

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-40 bg-black/20" />
        <AlertDialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[420px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2',
            'flex flex-col gap-3 rounded-lg border border-line bg-surface p-5 shadow-overlay',
          )}
        >
          <AlertDialog.Title className="text-md font-semibold leading-tight">{title}</AlertDialog.Title>
          {description ? <AlertDialog.Description className="text-sm text-muted">{description}</AlertDialog.Description> : null}
          {typeToConfirm ? (
            <label className="flex flex-col gap-1 text-xs text-muted">
              확인하려면 <code className="text-ink">{typeToConfirm}</code> 을(를) 입력하세요
              <Input mono value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus />
            </label>
          ) : null}
          <div className="mt-1 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button variant="ghost">{cancelLabel}</Button>
            </AlertDialog.Cancel>
            <Button
              variant={destructive ? 'danger' : 'primary'}
              disabled={!ready}
              loading={busy}
              onClick={async () => {
                setBusy(true)
                try {
                  await onConfirm()
                  onOpenChange(false)
                } finally {
                  setBusy(false)
                }
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
