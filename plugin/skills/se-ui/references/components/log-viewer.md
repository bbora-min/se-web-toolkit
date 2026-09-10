# LogViewer

`import { LogViewer } from '@se/ui'` — 컴포넌트 · `packages/ui/src/components/log-viewer.tsx`

로그 뷰어 — 수천 줄을 가상 스크롤로. ANSI 색, 레벨 강조, 검색(일치 이동), 따라가기, 줄바꿈, 복사.
로그는 읽는 게 아니라 "빨간 줄을 찾는" 것이므로 ERROR 줄에 좌측 마커를 준다.

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `lines` **필수** | `string[]` |  |  |
| `className` | `string` |  |  |
| `emptyText` | `string` | `로그가 없습니다` |  |
| `height` | `string \| number` | `480` |  |
| `live` | `boolean` |  | 아직 쓰이는 중 — 따라가기 기본 ON, 상단에 라이브 표시 |
| `title` | `ReactNode` |  | 상단 바 좌측 제목 |
