import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '../lib/cn'
import { Button } from './button'

/** 일반 모달 — 폼·미리보기·선택. 확인만 받는 거면 ConfirmDialog */
export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { width?: number }
>(({ className, children, width = 520, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/25 data-[state=open]:animate-[se-fade_150ms_ease-out]" />
    <DialogPrimitive.Content
      ref={ref}
      style={{ width, maxWidth: 'calc(100vw - 32px)' }}
      className={cn(
        'fixed left-1/2 top-1/2 z-[80] flex max-h-[calc(100vh-64px)] -translate-x-1/2 -translate-y-1/2 flex-col',
        'rounded-xl border border-line bg-surface shadow-overlay',
        'data-[state=open]:animate-[se-pop-center_180ms_cubic-bezier(.2,0,0,1)]',
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close asChild>
        <Button variant="ghost" size="icon-sm" className="absolute right-3 top-3" aria-label="닫기">
          <X />
        </Button>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
DialogContent.displayName = 'DialogContent'

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 px-5 pb-3 pr-12 pt-5', className)} {...props} />
}
export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => <DialogPrimitive.Title ref={ref} className={cn('text-md font-semibold leading-tight', className)} {...props} />)
DialogTitle.displayName = 'DialogTitle'
export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => <DialogPrimitive.Description ref={ref} className={cn('text-sm text-muted', className)} {...props} />)
DialogDescription.displayName = 'DialogDescription'
export function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex-1 overflow-y-auto px-5 py-2', className)} {...props} />
}
export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center justify-end gap-2 px-5 pb-5 pt-3', className)} {...props} />
}
