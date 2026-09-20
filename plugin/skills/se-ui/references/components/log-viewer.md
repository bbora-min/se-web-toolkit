# LogViewer · LOG_LEVEL_RE

`import { LogViewer, LOG_LEVEL_RE } from '@se/ui'` — 컴포넌트 · `packages/ui/src/components/log-viewer.tsx`

## LogViewer

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

## LOG_LEVEL_RE

로그 줄의 레벨 — 1번 그룹이면 ERROR 급, 2번 그룹이면 WARN 급. 콘솔 화면의 패싯이 같은 규칙을 쓴다

_props 없음 (HTML 속성 그대로)_
