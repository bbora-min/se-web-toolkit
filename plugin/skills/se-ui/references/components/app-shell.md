# AppShell · NavItem · NavSection · PageHeader · PageBody

`import { AppShell, NavItem, NavSection, PageHeader, PageBody } from '@se/ui'` — 패턴 · `packages/ui/src/patterns/app-shell.tsx`

## AppShell

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `mark` **필수** | `ReactNode` |  | 마크: 모노그램 텍스트 또는 아이콘 노드 |
| `name` **필수** | `string` |  | 서비스 이름 — se.identity.json의 name |
| `nav` **필수** | `ReactNode` |  |  |
| `command` | `CommandGroup[]` |  | 커맨드 팔레트 그룹. 주면 상단 검색 버튼 + ⌘K가 켜진다 |
| `maxWidth` | `number` | `1120` | 콘텐츠 최대 폭(px). 표가 화면 끝까지 늘어나지 않게 |
| `searchPlaceholder` | `string` | `검색` |  |
| `subtitle` | `string` |  | 로크업 아래 한 줄 (환경·팀 등) |
| `topEnd` | `ReactNode` |  | 상단 바 우측 (갱신 시각·아바타 등) |

## NavItem

라우터 링크를 쓰려면 `asChild`로 감싼다: `<NavItem asChild><NavLink to=…>…</NavLink></NavItem>`

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `active` | `boolean` |  |  |
| `asChild` | `boolean` |  |  |
| `end` | `ReactNode` |  | 우측 카운트 등 |
| `icon` | `ReactNode` |  |  |

## NavSection

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `title` | `string` |  |  |

## PageHeader

페이지 상단: 제목 + 설명 + 우측 액션.

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `title` **필수** | `string` |  |  |
| `actions` | `ReactNode` |  |  |
| `className` | `string` |  |  |
| `description` | `string` |  |  |

## PageBody

페이지 본문 컨테이너 — 섹션 간 24px. 화면마다 같은 리듬

_props 없음 (HTML 속성 그대로)_
