# DashboardPage — 지표·차트·상태 요약 = **관측 벽**

원본: `references/examples/reference-app/OverviewPage.tsx`

"볼 때"의 화면이다 — 읽지도 고르지도 않고 훑는다. 그래서 페이지 제목이 없고, 12칸 격자를 타일이 채운다(Grafana·Datadog). 같은 앱의 목록 화면이 원장(제목 → 띠 → 표)이라도 대시보드는 벽으로 — "고를 땐 표, 볼 땐 벽".

## 골격
```
<div -mx-6 xl:-mx-8 px-6 xl:px-8 bg-canvas border-t flex-col gap-3>   ← 쉘 패딩을 무르고 전폭. 바탕은 canvas(원장은 surface)
  <h1 sr-only />
  <툴바 h-9>  [범위 라벨] [기간 Select] [자동 갱신 · n분 전 갱신] … [목록 링크들]   ← 제목 대신. 기간 하나가 벽 전체를 바꾼다
  <시그니처 full />                                                    ← 상태 블록(단색 액센트) + 스탯 4개. 벽에서도 첫 줄
  <TileGrid>                                                          ← 12칸 · 간격 12
    <Tile span=8 title legend actions><BarChart stacked /></Tile>
    <Tile span=4 title tone=danger?><MeterList /></Tile>
    <Tile span=6 title legend><LineChart referenceLines /></Tile>
    <Tile span=3 …><MeterList /></Tile>  <Tile span=3 …><사용률 바></Tile>
    <Tile span=12 title actions><최근 N건 행></Tile>
  </TileGrid>
</div>
```
쉘은 이 페이지가 떠 있는 동안만 넓다: 페이지 안에서 `useContentWidth(1440)` — 쉘이 라우트 이름을 알 필요 없다.

## 결정 규칙
- **읽는 화면, 주 액션 없음.** 모든 타일에 목록으로 가는 링크(`실패만 →`). 툴바의 기간이 유일한 컨트롤
- **타일 헤더는 한 줄**: 제목 13px · 설명(선택) · 범례(`ChartLegend`) · 링크. 카드처럼 설명을 길게 쓰지 않는다
- **임계는 형태로**: 값이 목표를 넘으면 `Tile tone="warning|danger"`(제목 옆 점)와 차트의 `referenceLines`. 숫자만으로 경고하지 않는다
- **시그니처 좌측 블록은 단색 액센트** — 정상이면 서비스 색, 저하/장애면 warning/danger 가 넘겨받는다. 여기서 "누구의 화면인지" 읽힌다
- 스탯 델타: 오르면 좋은 것(`upIsGood: true`), 나쁜 것(`false`), 방향에 가치 없는 것(`null` → 중립색)
- 차트 규칙: 성공/실패/취소는 의미 색 고정, 계열은 `chart-1..8` 순서 고정, 2개 이상 시리즈면 범례 필수, 축선 없음, 격자 점선, 막대 얇게. 순위·비율 비교는 막대 차트보다 `MeterList`
- 타일 높이는 본문이 정한다(`height={220}` 등). `h-full` 은 쓰지 않는다 — flex 부모 높이를 순환 참조한다
- 1024px: `spanNarrow`(기본 6 이상 → 12, 미만 → 6)로 접힌다. 좁은 타일(3)은 둘씩 한 줄

## 3상태
- loading: 타일마다 본문 높이의 스켈레톤(레이아웃이 흔들리지 않게)
- empty: "최근 실패한 잡이 없습니다" 같은 타일 안 한 줄 — 벽은 비어도 격자를 유지한다
- error: 격자 대신 `ErrorState` 하나(원인 + 다시 시도). 시그니처는 자기 쿼리(/summary)를 따로 든다 — 둘 다 실패하면 "상태를 가져올 수 없음"(health=down)

## 카드형이 나은 경우
지표가 3–4개뿐이고 설명이 긴 "리포트"라면 `ChartCard` 2열(0.11.0 이전 골격)이 낫다. 벽은 타일이 6장 이상일 때 힘이 난다.
