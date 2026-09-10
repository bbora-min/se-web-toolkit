# FormField · FormSection · Form · FormItem · FormLabel · FormControl · FormDescription · FormMessage

`import { FormField, FormSection, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@se/ui'` — 컴포넌트 · `packages/ui/src/components/form.tsx`

## FormField

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `name` **필수** | `string` |  |  |
| `render` **필수** | `({ field, fieldState, formState, }: { field: ControllerRenderProps<TFieldValues, TName>…` |  |  |
| `control` | `Control<TFieldValues, any, TTransformedValues>` |  |  |
| `defaultValue` | `any` |  |  |
| `disabled` | `boolean` |  |  |
| `exact` | `boolean` |  |  |
| `rules` | `Omit<RegisterOptions<TFieldValues, TName>, "valueAsNumber" \| "valueAsDate" \| "setValueA…` |  |  |
| `shouldUnregister` | `boolean` |  |  |

## FormSection

폼 섹션 — 제목·설명 왼쪽, 필드 오른쪽. 설정·등록 화면의 기본 골격

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `title` **필수** | `string` |  |  |
| `className` | `string` |  |  |
| `description` | `string` |  |  |

## Form

폼 체계 — react-hook-form + zod. shadcn 관례.
  <Form {...form}><form onSubmit={form.handleSubmit(fn)}>
    <FormField control={form.control} name="version" render={({ field }) => (
      <FormItem><FormLabel>버전</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
    )} />
라벨·설명·에러의 id 연결(aria)은 여기서 자동으로 한다.

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `clearErrors` **필수** | `UseFormClearErrors<TFieldValues>` |  |  |
| `control` **필수** | `Control<TFieldValues, TContext, TTransformedValues>` |  |  |
| `formState` **필수** | `FormState<TFieldValues>` |  |  |
| `getErrors` **필수** | `UseFormGetErrors<TFieldValues>` |  |  |
| `getFieldState` **필수** | `UseFormGetFieldState<TFieldValues>` |  |  |
| `getValues` **필수** | `UseFormGetValues<TFieldValues>` |  |  |
| `handleSubmit` **필수** | `UseFormHandleSubmit<TFieldValues, TTransformedValues>` |  |  |
| `register` **필수** | `UseFormRegister<TFieldValues>` |  |  |
| `reset` **필수** | `UseFormReset<TFieldValues>` |  |  |
| `resetDefaultValues` **필수** | `UseFormResetDefaultValues<TFieldValues>` |  |  |
| `resetField` **필수** | `UseFormResetField<TFieldValues>` |  |  |
| `setError` **필수** | `UseFormSetError<TFieldValues>` |  |  |
| `setFocus` **필수** | `UseFormSetFocus<TFieldValues>` |  |  |
| `setValue` **필수** | `UseFormSetValue<TFieldValues>` |  |  |
| `setValues` **필수** | `UseFormSetValues<TFieldValues>` |  |  |
| `subscribe` **필수** | `UseFormSubscribe<TFieldValues>` |  |  |
| `trigger` **필수** | `UseFormTrigger<TFieldValues>` |  |  |
| `unregister` **필수** | `UseFormUnregister<TFieldValues>` |  |  |
| `watch` **필수** | `UseFormWatch<TFieldValues>` |  |  |

## FormItem

_props 없음 (HTML 속성 그대로)_

## FormLabel

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `asChild` | `boolean` |  |  |
| `optional` | `boolean` |  |  |

## FormControl

_props 없음 (HTML 속성 그대로)_

## FormDescription

_props 없음 (HTML 속성 그대로)_

## FormMessage

_props 없음 (HTML 속성 그대로)_
