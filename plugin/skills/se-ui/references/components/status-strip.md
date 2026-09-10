# StatusStrip

`import { StatusStrip } from '@se/ui'` — 시그니처 · `packages/ui/src/signatures/status-strip.tsx`

시그니처 · 상태 스트립 — 모니터링 서비스의 얼굴.
페이지 맨 위 카드 한 장으로 "지금 괜찮은가"와 핵심 지표 4개를 답한다.
액센트는 좌측 상태 블록의 배경 틴트와 스파크라인 끝점에만.

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `headline` **필수** | `string` |  | "클러스터 정상" 같은 한 문장 |
| `health` **필수** | `enum` |  | 시스템 전체 상태 |
| `stats` **필수** | `StatCardProps[]` |  | 핵심 지표 3–4개. 그 이상은 대시보드로 |
| `className` | `string` |  |  |
| `detail` | `ReactNode` |  | 한 줄 보충 — 노드 수, 갱신 시각 등 |
| `variant` | `enum` | `full` | compact: 목록 페이지용 한 줄 — 스파크라인·델타 없이 숫자만. 개요에서만 full |
