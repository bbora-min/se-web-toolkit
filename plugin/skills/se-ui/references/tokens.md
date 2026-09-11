# 토큰 클래스

`@se/tokens/tailwind.css`가 Tailwind 기본 팔레트를 지우고 아래만 남긴다. 값은 `se.identity.json`의 hue에서 `createTheme`이 계산한다.

## 색 (라이트·다크 자동)
| 용도 | 클래스 | 메모 |
|---|---|---|
| 페이지 바탕 | `bg-canvas` | 사이드바·코드 블록 |
| 카드·콘텐츠 | `bg-surface` | 기본 콘텐츠 영역은 surface |
| 눌린 면·표 헤더·칩 | `bg-surface-2` | |
| 본문 | `text-ink` | 보조는 `text-ink/80` |
| 보조 텍스트·라벨 | `text-muted` | 4.5:1 보장 |
| 구분선 | `border-line` | 강조는 `border-line-strong` |
| 액센트 (서비스 색) | `bg-accent` `text-on-accent` `hover:bg-accent-hover` | primary 버튼·활성 탭·시그니처 블록 |
| 액센트 텍스트·링크 | `text-accent-fg` | |
| 의미 색 블록 위 글자 | `text-on-danger` `text-on-warning` `text-on-success` `text-on-info` | 같은 이름의 `bg-*` 블록 위에. 배경마다 흰색/잉크 중 잘 읽히는 쪽이 자동 선택된다(경고 노랑·다크는 잉크) — `text-white` 쓰지 말 것 |
| 액센트 틴트 | `bg-accent-soft` | 선택 행·활성 메뉴 |
| 의미 색 | `text-success` `text-warning` `text-danger` `text-info` | 모든 서비스에서 같다 |
| 의미 배경 | `bg-success-soft` `bg-warning-soft` `bg-danger-soft` `bg-info-soft` | 배지·배너 |
| 중립 상태 | `text-neutral` `bg-neutral-soft` | 취소됨 등 |
| 차트 | `bg-chart-1` … `bg-chart-8` (`fill-`·`stroke-`·`text-`) | 순서 고정 |
| 흰·검 | `text-white` `bg-black` | 오버레이 정도에만. 의미 색 위엔 `text-on-<의미>` |

## 타이포
`text-xs`(12) `text-sm`(13) `text-base`(14) `text-md`(16) `text-lg`(20) `text-xl`(24) `text-2xl`(28) `text-3xl`(36) — 이 8단계 밖은 쓰지 않는다.
페이지 제목 `text-2xl font-semibold tracking-[-0.02em]` · 핵심 숫자 `text-2xl` · 카드 제목 `text-sm font-semibold` · 라벨 `text-xs text-muted`.
`font-sans`(Pretendard) `font-mono`(IBM Plex Mono) `font-display`(헤딩, 아이덴티티 슬롯). 숫자 열은 `tnum`.

## 반경·그림자·모션
`rounded-sm`(4) `rounded-md`(6, 컨트롤) `rounded-lg`(10, 카드) `rounded-full`.
`shadow-xs`(컨트롤·카드) `shadow-raised`(팝오버) `shadow-overlay`(모달·드로어).
`duration-150`·`ease-se`. 진입은 `motion-safe:animate-[se-rise_220ms_cubic-bezier(.2,0,0,1)]`.

## 밀도·테마
`<html data-density="compact|comfortable">` — `h-control`(30/36) `h-row`(34/44) `gap-gap` `p-pad`. 기본은 `se.identity.json`의 `density`.
`<html data-theme="light|dark">` 또는 속성 없음(시스템). `ThemeProvider`·`useTheme()`가 관리. 코드에서 다크 전용 클래스(`dark:`)는 쓰지 않는다 — 토큰이 알아서 바뀐다.
