# HubPage — 허브 · 입구

원본: `references/examples/se-home/HomePage.tsx`(카드 카탈로그·큰 검색·최근 항목) · `references/examples/se-home/Shell.tsx`(`layout="topnav"` 쉘 · 서비스 점프 팔레트)

"고르는 화면"이다. 목록(목록)이 아니라 카탈로그 — 항목이 수십 개 이하이고 하나를 골라 **다른 곳으로 가는** 것이 목적일 때. 서비스 포털·도구 모음·문서 허브·팀 홈.

## 골격 (위에서 아래로)
```
<AppShell layout="topnav" maxWidth={1200}>          ← 사이드바 없음. 네비는 2–4개, 검색(⌘K)이 주 동선
<PageBody gap-8>
  <header>  인사 + 상태 한 줄                        ← 제목이 아니라 문장. "서비스 5개 중 4개 정상 · X 저하 · 온콜 …"
  <Button secondary h-12 w-full onClick={openSearch}>     ← 큰 검색. `useShellSearch()` 가 undefined 면(쉘에 command 없음) 통째로 그리지 않는다 — 장식 검색창 금지
  [Chip asChild 3–5개 — 주소·숫자는 API(quick[])가 준다]
  <시그니처 />                                      ← 가족 전체의 24시간(TimelineRibbon, 줄 = 항목) 또는 서비스의 것
  <section>
    <SectionHeader title note actions=<link 표로 보기> />
    <grid cols-3 gap-4>  카드 … + "새 항목" 점선 카드   ← 카드는 통째로 링크. 마크(ServiceMark hue) · 이름 · 팀 · 상태 배지 · 설명 2줄 · 하단 메타
  </section>
  <grid [3fr_2fr]>
    <최근 본 것>  Badge(종류) · mono 라벨 · 출처 마크 · 상대 시간   ← 항목을 가로지르는 "내 것"
    <오늘>        온콜 카드 · 공지(프리즈는 warning-soft)
  </grid>
</PageBody>
```

## 결정 규칙
- **카드 vs 표**: 고를 땐 카드(홈), 비교할 땐 표(`/services`, 목록). 둘 다 두고 "표로 보기" 링크로 잇는다
- **색은 남의 것**: 카드의 마크 색은 각 항목의 hue(`ServiceMark`) — 이 앱의 액센트가 아니다. 액센트는 검색 포커스·활성 칩·리본의 "지금" 선에만
- **상태는 의미 색**: 정상/저하/장애 = success/warning/danger `Badge`. 인사 아래 한 줄에서도 저하·장애 항목만 색을 준다
- **빈 카드 슬롯은 다음 행동**: 3열 그리드의 남는 칸은 "새 서비스"(점선 카드) — 빈 곳을 채우려고 장식하지 않는다
- **주소는 화면에 없다**: 형제 서비스의 호스트·경로는 전부 API(`services[].url`·`quick[].href`·`oncall.scheduleUrl`)에서. 화면에 `localhost:5173` 같은 것을 적지 않는다
- **최근 본 것은 실제 데이터**: 서버가 사용자별로 준다. 없으면 한 문장("서비스에서 무언가를 열면 여기에 쌓여요")
- 1024px: 카드 2열, 최근·오늘 1열(`max-lg:`)

## 3상태 문구 (톤 friendly)
- loading: 인사 스켈레톤 1줄 + 리본 스켈레톤 + 카드 스켈레톤 6장
- empty: "아직 등록된 서비스가 없어요" + 설명에 `/se:new` 안내, 버튼은 실제로 가는 링크(툴킷 README) — 갈 곳 없는 primary 금지
- error: "서비스 목록을 불러오지 못했어요 · <서버 메시지>" + 다시 시도 (리본은 숨김)
