# SearchHero

`import { SearchHero } from '@se/ui'` — 시그니처 · `packages/ui/src/signatures/search-hero.tsx`

시그니처 · 검색 히어로 — 데이터 조회 서비스의 얼굴.
페이지 맨 위에 큰 검색창 하나. "찾는 것"이 이 서비스의 전부라는 선언.
액센트는 포커스 링과 활성 칩에만.

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `onChange` **필수** | `(v: string) => void` |  |  |
| `title` **필수** | `string` |  | 검색창 위 한 줄. "무엇을 찾을 수 있는가" |
| `value` **필수** | `string` |  |  |
| `className` | `string` |  |  |
| `hint` | `ReactNode` |  | 우측 보조 정보 — "1,204개 데이터셋 · 방금 색인" |
| `placeholder` | `string` | `검색` |  |
| `quick` | `{ label: string; count?: number; active?: boolean; onClick: () => void; }[] \| undefined` |  | 검색창 아래 빠른 진입 칩 |
