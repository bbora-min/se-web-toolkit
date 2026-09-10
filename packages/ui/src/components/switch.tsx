import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '../lib/cn'

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-line-strong p-0.5',
      'transition-colors duration-150 data-[state=checked]:bg-accent',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="block size-4 rounded-full bg-white shadow-xs transition-transform duration-150 data-[state=checked]:translate-x-4" />
  </SwitchPrimitive.Root>
))
Switch.displayName = 'Switch'

/** 설정 화면의 한 줄: 라벨·설명 왼쪽, 스위치 오른쪽 */
export function SwitchRow({
  id,
  label,
  description,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> & { label: React.ReactNode; description?: React.ReactNode }) {
  const gen = React.useId()
  const sid = id ?? gen
  return (
    <div className={cn('flex items-center justify-between gap-6 py-3', className)}>
      <label htmlFor={sid} className="flex cursor-pointer flex-col gap-0.5">
        <span className="text-sm text-ink">{label}</span>
        {description ? <span className="text-xs text-muted">{description}</span> : null}
      </label>
      <Switch id={sid} {...props} />
    </div>
  )
}
