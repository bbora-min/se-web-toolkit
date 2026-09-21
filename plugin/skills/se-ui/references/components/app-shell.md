# AppShell · NavItem · NavSection · ShellFill · PageHeader · SectionHeader · PageBody · ThemeToggle

`import { AppShell, NavItem, NavSection, ShellFill, PageHeader, SectionHeader, PageBody, ThemeToggle } from '@se/ui'` — 패턴 · `packages/ui/src/patterns/app-shell.tsx`

## AppShell

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `mark` **필수** | `ReactNode` |  | 마크: 모노그램 텍스트 또는 아이콘 노드 |
| `name` **필수** | `string` |  | 서비스 이름 — se.identity.json의 name |
| `nav` **필수** | `ReactNode` |  |  |
| `command` | `CommandGroup[]` |  | 커맨드 팔레트 그룹. 주면 상단 검색 버튼 + ⌘K가 켜진다 |
| `credit` | `ReactNode` | `SE · Web Toolkit` | 크레딧 — sidebar 는 사이드바 하단, topnav 는 푸터, panes 는 헤더 우측. 기본 "SE · Web Toolkit", `false`/`null` 이면 숨김, 노드면 그것으로 (버전·환경 등) |
| `layout` | `enum` |  | 쉘 배치 — se.identity.json 의 shell. 기본 sidebar |
| `maxWidth` | `number` | `1120` | 콘텐츠 최대 폭(px). 표가 화면 끝까지 늘어나지 않게. panes 는 전폭이라 무시 |
| `searchPlaceholder` | `string` | `검색` |  |
| `subtitle` | `string` |  | 로크업 아래 한 줄 (환경·팀 등). topnav·panes 에서는 이름 옆 muted 로 |
| `topEnd` | `ReactNode` |  | 상단 바 우측 (갱신 시각·아바타 등) |

## NavItem

라우터 링크를 쓰려면 `asChild`로 감싼다: `<NavItem asChild><NavLink to=…>{icon}<span>이름</span></NavLink></NavItem>`.
배치에 따라 모양이 바뀐다 — sidebar: 행, topnav: 밑줄 탭, panes: 아이콘만(이름은 툴팁·스크린리더).

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `active` | `boolean` |  |  |
| `asChild` | `boolean` |  |  |
| `end` | `ReactNode` |  | 우측 카운트 등 |
| `icon` | `ReactNode` |  |  |
| `label` | `string` |  | panes 배치의 아이콘 레일에서 툴팁으로 보여 줄 이름. asChild 로 감쌌을 때 넘긴다 (없으면 툴팁 없음, 라벨은 스크린리더에만) |

## NavSection

네비 묶음. sidebar 는 제목 있는 세로 묶음, topnav 는 가로(제목은 스크린리더만), panes 는 구분선 있는 세로 묶음

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `title` | `string` |  |  |

## ShellFill

쉘 콘텐츠 영역의 패딩·최대 폭을 무르고 전폭으로 — 대시보드·처리함·콘솔처럼 "페이지"가 아닌 골격.
배치별 패딩 값은 여기 한 곳에만 있다. 페이지가 `-mx-6` 같은 쉘 내부 값을 적지 않는다.

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `fixed` | `boolean` |  | true 면 남은 화면 높이에 고정(처리함·콘솔 — 칸마다 스크롤). false 면 폭만 전폭(대시보드) |

## PageHeader

페이지 상단: 제목 + 설명 + 우측 액션.

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `title` **필수** | `string` |  |  |
| `actions` | `ReactNode` |  |  |
| `className` | `string` |  |  |
| `description` | `string` |  |  |

## SectionHeader

섹션 머리: 제목 + 한 줄 설명 + 우측 액션(링크). 페이지 안의 블록 제목 — h2

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `title` **필수** | `string` |  |  |
| `actions` | `ReactNode` |  |  |
| `className` | `string` |  |  |
| `note` | `string` |  |  |

## PageBody

페이지 본문 컨테이너 — 섹션 간 24px. 화면마다 같은 리듬

_props 없음 (HTML 속성 그대로)_

## ThemeToggle

테마 토글. `compact` 는 버튼 하나로 라이트 → 다크 → 시스템 순환 (topnav·panes 의 좁은 자리)

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `compact` | `boolean` |  |  |
