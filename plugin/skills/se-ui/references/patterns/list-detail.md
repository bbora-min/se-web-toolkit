# ListDetailPage — 목록 + 필터 + 상세

원본: `references/examples/reference-app/JobsPage.tsx`(드로어 상세·서버 모드·선택·일괄) · `references/examples/release-desk/ReleasesPage.tsx`(페이지 상세·단계 레일)

## 골격 (위에서 아래로, 이 순서를 지킨다)
```
<PageBody>
  <PageHeader title description actions={새로고침·CSV·primary 하나} />
  [Alert — 지금 상태에 대한 안내가 있을 때만]
  <시그니처 />                            ← StatusStrip은 variant="compact"(한 줄), SearchHero·StageRail은 그대로
  <section gap-4>
    <Tabs items=[전체 N · 실패 N …] />      ← 1차 분류. 실패 카운트는 tone="danger"
    <FilterBar end={건수 · 필터 초기화}>    ← 2차. 검색 + 셀렉트 1–2개 + 기간
    <DataTable … />                         ← 바깥 테두리 없음(plain), 3상태, rowActions
  </section>
  <상세: Sheet(드로어) 또는 라우트>
</PageBody>
```

## 결정 규칙
- **드로어 vs 페이지**: 목록을 떠나지 않고 훑어야 하면 드로어(잡 로그), 상세가 깊고 URL로 공유하면 페이지(릴리스·데이터셋)
- **필터는 URL에**: `useSearchParams`로 q·state·pipeline·page·sort 동기화. 필터가 바뀌면 page를 지운다
- **탭 카운트는 상태 필터를 뺀 기준**으로 서버가 계산 — 탭을 옮겨도 숫자가 흔들리지 않는다
- **1만 건 이상이면 서버 모드**: `pagination`+`sorting` 컨트롤드. `placeholderData: prev`로 페이지 전환 시 깜빡임 방지
- **행 액션**: 가장 흔한 동작 1–2개(재시도·로그·즐겨찾기) + `⋯` DropdownMenu. 위험 동작은 ConfirmDialog
- **선택 + 일괄**: `selectable` + `bulkActions` — 가능한 건수만 활성 ("재시도 (3)")
- 컬럼: 이름(mono) · 상태(StatusBadge) · 분류(Badge) · 사람(Avatar) · 시간(상대+절대 title) · 숫자(우정렬 tnum) · 마지막에 rowActions

## 3상태 문구 (톤은 se.identity.json)
- loading: 스켈레톤 행 (DataTable이 그림)
- empty (필터 있음): "조건에 맞는 항목이 없습니다" + 필터 초기화 버튼
- empty (필터 없음): "아직 X가 없습니다" + 다음 행동 primary 아님(헤더에 이미 primary가 있으면 secondary)
- error: 서버 메시지를 그대로 + 다시 시도
