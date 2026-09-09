import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '../lib/cn'

/**
 * 버튼. 한 화면에 `primary`는 하나만 — 나머지는 secondary/ghost.
 * 위험 동작은 `danger` + ConfirmDialog.
 * 질감: 아주 얇은 보더 + 1px 그림자. 납작하지도, 튀어나오지도 않게.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-1.5 whitespace-nowrap select-none',
    'rounded-md font-medium text-sm leading-none',
    'transition-[background-color,border-color,box-shadow,color] duration-150 ease-se',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-accent text-on-accent shadow-xs hover:bg-accent-hover active:bg-accent-active',
        secondary:
          'bg-surface text-ink border border-line-strong/80 shadow-xs hover:bg-surface-2/70 active:bg-surface-2',
        ghost: 'text-ink hover:bg-surface-2 active:bg-line/70',
        danger: 'bg-danger text-white shadow-xs hover:opacity-90 active:opacity-80',
        link: 'text-accent-fg underline-offset-4 hover:underline h-auto px-0',
      },
      size: {
        sm: 'h-7 px-2.5 text-xs',
        md: 'h-control px-3',
        lg: 'h-10 px-4 text-base',
        icon: 'size-control',
        'icon-sm': 'size-7',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** 자식 요소(예: `<a>`)를 버튼으로 렌더 */
  asChild?: boolean
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? <Loader2 className="animate-spin" aria-hidden /> : null}
        {children}
      </Comp>
    )
  },
)
Button.displayName = 'Button'
export { buttonVariants }
