import * as React from 'react'
import * as RadioPrimitive from '@radix-ui/react-radio-group'
import { cn } from '../lib/cn'

export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioPrimitive.Root>
>(({ className, ...props }, ref) => <RadioPrimitive.Root ref={ref} className={cn('grid gap-2', className)} {...props} />)
RadioGroup.displayName = 'RadioGroup'

export const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioPrimitive.Item
    ref={ref}
    className={cn(
      'grid size-4 shrink-0 place-items-center rounded-full border border-line-strong bg-surface shadow-xs',
      'transition-colors duration-150 data-[state=checked]:border-accent',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  >
    <RadioPrimitive.Indicator className="size-2 rounded-full bg-accent" />
  </RadioPrimitive.Item>
))
RadioGroupItem.displayName = 'RadioGroupItem'

/** 선택지가 3–5개고 각각 설명이 필요할 때 — 카드형 라디오 */
export function RadioCards({
  options,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadioPrimitive.Root> & {
  options: Array<{ value: string; label: React.ReactNode; description?: React.ReactNode; badge?: React.ReactNode }>
}) {
  return (
    <RadioGroup className={cn('grid-cols-1 gap-2 sm:grid-cols-3', className)} {...props}>
      {options.map((o) => {
        const id = `${props.name ?? 'radio'}-${o.value}`
        return (
          <label
            key={o.value}
            htmlFor={id}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-surface p-3 shadow-xs transition-colors',
              'has-[[data-state=checked]]:border-accent has-[[data-state=checked]]:bg-accent-soft/40 hover:border-line-strong',
            )}
          >
            <RadioGroupItem id={id} value={o.value} className="mt-0.5" />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="flex items-center gap-2 text-sm font-medium text-ink">
                {o.label}
                {o.badge}
              </span>
              {o.description ? <span className="text-xs leading-snug text-muted">{o.description}</span> : null}
            </span>
          </label>
        )
      })}
    </RadioGroup>
  )
}
