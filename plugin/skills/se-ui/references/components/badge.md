# Badge · StatusBadge

`import { Badge, StatusBadge } from '@se/ui'` — 컴포넌트 · `packages/ui/src/components/badge.tsx`

## Badge

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `tone` | `"neutral" \| "success" \| "warning" \| "danger" \| "info" \| "accent" \| null` |  |  |

## StatusBadge

작업 상태 배지. 상태 → 색 매핑은 브랜드 코어에 고정되어 있어 서비스마다 같다

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `state` **필수** | `enum` |  |  |
| `label` | `string` |  | 기본 한국어 라벨 대신 표시할 텍스트 |
