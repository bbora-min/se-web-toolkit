import { Toaster as Sonner, toast } from 'sonner'

/** 토스트는 우하단 한 곳. 완료 알림은 짧게, 실패는 원인을 포함 */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex items-center gap-2 w-[360px] rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink shadow-raised',
          title: 'font-medium',
          description: 'text-muted text-xs',
          success: '[&_svg]:text-success',
          error: '[&_svg]:text-danger',
          icon: '[&_svg]:size-4',
        },
      }}
    />
  )
}
export { toast }
