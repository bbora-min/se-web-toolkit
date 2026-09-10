# DashboardPage — 지표·차트·상태 요약

원본: `references/examples/reference-app/OverviewPage.tsx`

## 골격
```
<PageBody>
  <PageHeader title="개요" description actions={기간 Select} />
  <시그니처 full />                              ← 상태 블록(단색 액센트) + 스탯 4개(스파크라인·전기 대비)
  <div grid-cols-[3fr_2fr] gap-5>
    <ChartCard 시간별 … legend actions={링크}><BarChart stacked /></ChartCard>
    <ChartCard 순위 …><MeterList /></ChartCard>
  </div>
  <div grid-cols-[3fr_2fr] gap-5>
    <ChartCard 최근 실패 …><목록 5건 + 링크></ChartCard>
    <ChartCard 노드 …><사용률 미터></ChartCard>
  </div>
  <ChartCard 큐 대기 legend><LineChart /></ChartCard>
</PageBody>
```

## 결정 규칙
- **읽는 화면, 주 액션 없음.** 대신 모든 블록에 목록으로 가는 링크(`실패만 보기 →`)
- **시그니처 좌측 블록은 단색 액센트** — 정상이면 서비스 색, 저하/장애면 warning/danger가 넘겨받는다. 여기서 "누구의 화면인지" 읽힌다
- 스탯 델타: 오르면 좋은 것(`upIsGood: true`), 나쁜 것(`false`), 방향에 가치 없는 것(`null` → 중립색)
- 차트 규칙: 성공/실패/취소는 의미 색 고정, 계열은 `chart-1..8` 순서 고정, 2개 이상 시리즈면 `legend` 필수, 축선 없음, 격자 점선, 막대 얇게. 순위·비율 비교는 막대 차트보다 `MeterList`
- 카드 높이: 같은 행의 차트 높이를 맞춘다(`height={268}` 등). `h-full`은 쓰지 않는다 — flex 부모 높이를 순환 참조한다
- 1024px에서 시그니처는 1열 → 2×2로 접힌다 (컴포넌트가 처리). 카드 그리드는 그대로 2열
