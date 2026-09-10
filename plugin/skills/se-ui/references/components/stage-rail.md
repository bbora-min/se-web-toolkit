# StageRail

`import { StageRail } from '@se/ui'` — 시그니처 · `packages/ui/src/signatures/stage-rail.tsx`

시그니처 · 단계 레일 — 워크플로 서비스의 얼굴.
"지금 무엇이 어디까지 왔는가"를 좌→우 흐름으로. 단계를 누르면 목록이 그 단계로 좁혀진다.
액센트는 선택된 단계와 연결선에만.

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `stages` **필수** | `Stage[]` |  |  |
| `className` | `string` |  |  |
| `detail` | `ReactNode` |  |  |
| `headline` | `ReactNode` |  | 왼쪽 제목 — "이번 주 릴리스 12건" |
| `onChange` | `((id: string \| null) => void)` |  |  |
| `value` | `string \| null` |  | 선택된 단계 (필터) |
