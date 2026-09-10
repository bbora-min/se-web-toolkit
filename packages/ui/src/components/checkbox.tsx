import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check, Minus } from 'lucide-react'
import { cn } from '../lib/cn'

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer grid size-4 shrink-0 place-items-center rounded-sm border border-line-strong bg-surface shadow-xs',
      'transition-colors duration-150',
      'data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-on-accent',
      'data-[state=indeterminate]:border-accent data-[state=indeterminate]:bg-accent data-[state=indeterminate]:text-on-accent',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator>
      {props.checked === 'indeterminate' ? <Minus className="size-3" strokeWidth={3} /> : <Check className="size-3" strokeWidth={3} />}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = 'Checkbox'

/** 체크박스 + 라벨 + 설명 한 줄. 체크리스트에 쓴다 */
export function CheckboxField({
  id,
  label,
  description,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & { label: React.ReactNode; description?: React.ReactNode }) {
  const gen = React.useId()
  const cid = id ?? gen
  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <Checkbox id={cid} className="mt-0.5" {...props} />
      <label htmlFor={cid} className="flex cursor-pointer select-none flex-col gap-0.5 text-sm leading-tight">
        <span className="text-ink">{label}</span>
        {description ? <span className="text-xs text-muted">{description}</span> : null}
      </label>
    </div>
  )
}
