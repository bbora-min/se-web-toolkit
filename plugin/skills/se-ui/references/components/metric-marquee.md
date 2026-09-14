# MetricMarquee

`import { MetricMarquee } from '@se/ui'` — 시그니처 · `packages/ui/src/signatures/metric-marquee.tsx`

시그니처 · 지표 마키 — 숫자가 목적인 서비스(비용·사용량·품질 지표)의 얼굴.
"핵심 숫자가 지금 얼마인가"를 첫 줄에. 주 지표 하나가 액센트 블록을 들고, 보조 지표가 그 옆으로 띠처럼 흐른다.
액센트는 주 지표 블록과 스파크라인 끝점에만. 상태 스트립과 달리 "괜찮은가"가 아니라 "얼마인가"를 묻는다.

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `metrics` **필수** | `StatCardProps[]` |  | 보조 지표 3–6개. 가로로 흐르고 좁으면 스크롤 |
| `primary` **필수** | `{ label: string; value: ReactNode; description?: ReactNode; delta?: { value: number; pe…` |  | 이 서비스가 존재하는 이유인 숫자 하나 — 액센트 블록에 크게 |
| `className` | `string` |  |  |
| `period` | `{ value: string; options: { value: string; label: string; }[]; onChange: (v: string) =>…` |  | 기간 선택 칩 — "24시간 · 7일 · 30일" |
