# DocLayout · DocHeader · Prose · Callout · TreeNav · TableOfContents

`import { DocLayout, DocHeader, Prose, Callout, TreeNav, TableOfContents } from '@se/ui'` — 패턴 · `packages/ui/src/patterns/doc.tsx`

## DocLayout

3단 문서 레이아웃. 양옆은 붙고(sticky) 본문만 흐른다. 1024 이하에서 목차는 본문 위로 접힌다. `--doc-sticky-top` 을 자식(목차·제목 scroll-margin)이 쓴다

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `aside` | `ReactNode` |  | 좌측 — 보통 `TreeNav` |
| `asideWidth` | `number` | `220` | 좌·우 칸 폭(px). 기본 220 · 200 |
| `toc` | `ReactNode` |  | 우측 — 보통 `TableOfContents` |
| `tocWidth` | `number` | `200` |  |

## DocHeader

문서 머리 — 제목이 화면의 절반을 가져도 된다(Notion). 메타는 Confluence 관례: 소유·갱신·감시

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `title` **필수** | `string` |  |  |
| `actions` | `ReactNode` |  |  |
| `className` | `string` |  |  |
| `eyebrow` | `ReactNode` |  | 제목 위 한 줄 — 문서 종류·경로 ("도메인 가이드 · fct") |
| `meta` | `ReactNode` |  | 작성자·갱신·감시자 등 — 점(·)으로 잇는다 |
| `summary` | `ReactNode` |  | 한두 문장 요약 — 본문보다 크고 muted |

## Prose

본문 타이포 — h2/h3/p/ul/ol/code/pre/table/blockquote 를 토큰으로. 스타일은 styles.css 의 `.se-prose`

_props 없음 (HTML 속성 그대로)_

## Callout

본문 속 강조 상자 — 규칙·주의·팁. `Alert` 와 같은 톤·질감에 문단 간격만. 절마다 하나씩, 연달아 쓰지 않는다

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `title` | `ReactNode` |  |  |
| `tone` | `enum` | `info` |  |

## TreeNav

좌측 트리 — 묶음은 접히고, 활성 항목은 액센트. 문서 허브·데이터 사전·런북 묶음

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `items` **필수** | `TreeItem[]` |  |  |
| `activeId` | `string \| null` |  |  |
| `aria-label` | `string` | `문서` |  |
| `className` | `string` |  |  |
| `defaultExpanded` | `string[]` |  | 처음 펼쳐 둘 묶음. 없으면 활성 항목의 조상만 |
| `onSelect` | `((item: TreeItem) => void)` |  | 항목을 골랐을 때 — 라우터 이동은 여기서. 주면 href 의 기본 이동을 막는다 |

## TableOfContents

우측 목차 — 스크롤에 따라 현재 절이 액센트. 항목은 본문의 `id` 를 가진 제목

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `items` **필수** | `TocItem[]` |  |  |
| `className` | `string` |  |  |
| `offset` | `number` |  | 스크롤 감지 기준선(px). 기본: 쉘의 sticky 높이 + 40 |
| `title` | `string` | `이 문서에서` |  |
