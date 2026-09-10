export { cn } from './lib/cn'
export { ThemeProvider, useTheme, type ThemeMode, type Density } from './lib/theme'

export { Button, buttonVariants, type ButtonProps } from './components/button'
export { Input, type InputProps } from './components/input'
export { Select, type SelectProps, type SelectOption } from './components/select'
export { Badge, StatusBadge, type BadgeProps, type StatusBadgeProps } from './components/badge'
export { Skeleton } from './components/skeleton'
export { Tabs, type TabsProps, type TabItem } from './components/tabs'
export { Avatar } from './components/avatar'
export { Sparkline, type SparklineProps } from './components/sparkline'
export { StatCard, type StatCardProps } from './components/stat-card'
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/tooltip'
export { EmptyState, ErrorState } from './components/states'
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/table'
export { DataTable, type DataTableProps, type ColumnDef } from './components/data-table'
export { FilterBar, SearchInput } from './components/filter-bar'
export {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './components/sheet'
export { ConfirmDialog, type ConfirmDialogProps } from './components/confirm-dialog'
export { DescriptionList, type DescriptionItem } from './components/description-list'
export { Toaster, toast } from './components/toast'

export { AppShell, NavItem, NavSection, PageHeader, PageBody, ThemeToggle, type AppShellProps } from './patterns/app-shell'

export { StatusStrip, type StatusStripProps, type StripHealth } from './signatures/status-strip'
export { SearchHero, type SearchHeroProps } from './signatures/search-hero'
export { CommandPalette, useCommandPalette, type CommandGroup, type CommandItem } from './components/command-palette'
export { IdentitySheet, useIdentityFavicon, type IdentitySheetProps } from './patterns/identity-sheet'
