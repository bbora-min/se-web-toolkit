import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { Slot } from '@radix-ui/react-slot'
import { Controller, FormProvider, useFormContext, type ControllerProps, type FieldPath, type FieldValues } from 'react-hook-form'
import { cn } from '../lib/cn'

/**
 * 폼 체계 — react-hook-form + zod. shadcn 관례.
 *   <Form {...form}><form onSubmit={form.handleSubmit(fn)}>
 *     <FormField control={form.control} name="version" render={({ field }) => (
 *       <FormItem><FormLabel>버전</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
 *     )} />
 * 라벨·설명·에러의 id 연결(aria)은 여기서 자동으로 한다.
 */
export const Form = FormProvider

interface FieldCtx { name: string }
const FieldContext = React.createContext<FieldCtx | null>(null)
interface ItemCtx { id: string }
const ItemContext = React.createContext<ItemCtx | null>(null)

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(props: ControllerProps<TFieldValues, TName, TTransformedValues>) {
  return (
    <FieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FieldContext.Provider>
  )
}

export function useFormField() {
  const field = React.useContext(FieldContext)
  const item = React.useContext(ItemContext)
  const { getFieldState, formState } = useFormContext()
  if (!field) throw new Error('useFormField는 FormField 안에서만 쓸 수 있습니다')
  const state = getFieldState(field.name, formState)
  const id = item?.id ?? field.name
  return {
    id,
    name: field.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...state,
  }
}

export const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const id = React.useId()
  return (
    <ItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn('flex flex-col gap-1.5', className)} {...props} />
    </ItemContext.Provider>
  )
})
FormItem.displayName = 'FormItem'

export const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { optional?: boolean }
>(({ className, optional, children, ...props }, ref) => {
  const { error, formItemId } = useFormField()
  return (
    <LabelPrimitive.Root ref={ref} htmlFor={formItemId} className={cn('text-sm font-medium text-ink', error && 'text-danger', className)} {...props}>
      {children}
      {optional ? <span className="ml-1.5 text-xs font-normal text-muted">선택</span> : null}
    </LabelPrimitive.Root>
  )
})
FormLabel.displayName = 'FormLabel'

export const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()
  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={!error ? formDescriptionId : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  )
})
FormControl.displayName = 'FormControl'

export const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()
  return <p ref={ref} id={formDescriptionId} className={cn('text-xs text-muted', className)} {...props} />
})
FormDescription.displayName = 'FormDescription'

export const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error.message ?? '') : children
  if (!body) return null
  return (
    <p ref={ref} id={formMessageId} className={cn('text-xs text-danger', className)} {...props}>
      {body}
    </p>
  )
})
FormMessage.displayName = 'FormMessage'

/** 폼 섹션 — 제목·설명 왼쪽, 필드 오른쪽. 설정·등록 화면의 기본 골격 */
export function FormSection({ title, description, children, className }: { title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('grid grid-cols-[minmax(180px,1fr)_2fr] gap-8 border-b border-line py-6 last:border-0', className)}>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {description ? <p className="text-xs leading-relaxed text-muted">{description}</p> : null}
      </div>
      <div className="flex max-w-xl flex-col gap-5">{children}</div>
    </section>
  )
}
