import * as React from 'react'
import * as Menu from '@radix-ui/react-dropdown-menu'
import { Check, ChevronRight } from 'lucide-react'
import { cn } from '../lib/cn'

export const DropdownMenu = Menu.Root
export const DropdownMenuTrigger = Menu.Trigger
export const DropdownMenuGroup = Menu.Group
export const DropdownMenuSub = Menu.Sub
export const DropdownMenuRadioGroup = Menu.RadioGroup

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof Menu.Content>,
  React.ComponentPropsWithoutRef<typeof Menu.Content>
>(({ className, sideOffset = 6, align = 'end', ...props }, ref) => (
  <Menu.Portal>
    <Menu.Content
      ref={ref}
      sideOffset={sideOffset}
      align={align}
      className={cn(
        'z-50 min-w-[180px] rounded-lg border border-line bg-surface p-1 text-ink shadow-raised',
        'data-[state=open]:animate-[se-pop-in_150ms_cubic-bezier(.2,0,0,1)]',
        className,
      )}
      {...props}
    />
  </Menu.Portal>
))
DropdownMenuContent.displayName = 'DropdownMenuContent'

const itemCls = [
  'relative flex h-8 cursor-default select-none items-center gap-2 rounded-md px-2 text-sm outline-none',
  'data-[highlighted]:bg-surface-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted',
].join(' ')

export const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof Menu.Item>,
  React.ComponentPropsWithoutRef<typeof Menu.Item> & { destructive?: boolean; shortcut?: string }
>(({ className, destructive, shortcut, children, ...props }, ref) => (
  <Menu.Item ref={ref} className={cn(itemCls, destructive && 'text-danger data-[highlighted]:bg-danger-soft [&_svg]:text-danger', className)} {...props}>
    {children}
    {shortcut ? <span className="ml-auto pl-4 font-mono text-[11px] text-muted">{shortcut}</span> : null}
  </Menu.Item>
))
DropdownMenuItem.displayName = 'DropdownMenuItem'

export const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof Menu.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof Menu.CheckboxItem>
>(({ className, children, ...props }, ref) => (
  <Menu.CheckboxItem ref={ref} className={cn(itemCls, 'pl-7', className)} {...props}>
    <span className="absolute left-2 flex size-3.5 items-center justify-center">
      <Menu.ItemIndicator>
        <Check className="!size-3.5 !text-accent-fg" strokeWidth={2.5} />
      </Menu.ItemIndicator>
    </span>
    {children}
  </Menu.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem'

export const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof Menu.RadioItem>,
  React.ComponentPropsWithoutRef<typeof Menu.RadioItem>
>(({ className, children, ...props }, ref) => (
  <Menu.RadioItem ref={ref} className={cn(itemCls, 'pl-7', className)} {...props}>
    <span className="absolute left-2 flex size-3.5 items-center justify-center">
      <Menu.ItemIndicator>
        <span className="size-1.5 rounded-full bg-accent" />
      </Menu.ItemIndicator>
    </span>
    {children}
  </Menu.RadioItem>
))
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem'

export const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof Menu.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof Menu.SubTrigger>
>(({ className, children, ...props }, ref) => (
  <Menu.SubTrigger ref={ref} className={cn(itemCls, 'data-[state=open]:bg-surface-2', className)} {...props}>
    {children}
    <ChevronRight className="ml-auto" />
  </Menu.SubTrigger>
))
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger'

export const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof Menu.SubContent>,
  React.ComponentPropsWithoutRef<typeof Menu.SubContent>
>(({ className, ...props }, ref) => (
  <Menu.Portal>
    <Menu.SubContent ref={ref} className={cn('z-50 min-w-[160px] rounded-lg border border-line bg-surface p-1 shadow-raised', className)} {...props} />
  </Menu.Portal>
))
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent'

export function DropdownMenuLabel({ className, ...props }: React.ComponentPropsWithoutRef<typeof Menu.Label>) {
  return <Menu.Label className={cn('px-2 py-1.5 text-[11px] font-medium text-muted', className)} {...props} />
}
export function DropdownMenuSeparator({ className, ...props }: React.ComponentPropsWithoutRef<typeof Menu.Separator>) {
  return <Menu.Separator className={cn('-mx-1 my-1 h-px bg-line', className)} {...props} />
}
