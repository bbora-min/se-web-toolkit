# Alert

`import { Alert } from '@se/ui'` — 컴포넌트 · `packages/ui/src/components/alert.tsx`

페이지 안의 안내 배너. 토스트는 "방금 일어난 일", 배너는 "지금 상태"

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `title` **필수** | `ReactNode` |  |  |
| `action` | `ReactNode` |  | 우측 액션 (버튼 1개) |
| `tone` | `enum` | `info` |  |
