# BoardPage — 보드 · 상태가 열, 항목이 카드

원본: `references/examples/release-desk/ReleasesBoard.tsx`(보드) · `references/examples/release-desk/ReleasesPage.tsx`(표 ↔ 보드 전환, 시그니처 연결)

"흐름을 볼 때"의 화면이다. 항목의 **상태가 순서 있는 단계**(검토 → 검증 → 승인 → 배포)이고, 어느 단계에 얼마나 쌓였는지가 곧 정보일 때. 같은 목록의 표(원장)를 없애지 않는다 — 비교·정렬·일괄은 표, 흐름·막힘은 보드. `?view=board` 로 오간다.

## 골격
```
<PageBody>
  <PageHeader title actions={[표 | 보드] 세그먼트 + primary 하나} />
  [Alert]
  <시그니처(StageRail) value={null} onChange={열로 스크롤} />     ← 보드에선 필터가 아니라 "그 열로 가기"
  <FilterBar …/>                                                   ← 검색·서비스·기간은 표와 같은 URL 파라미터. 단계 필터만 무시
  <Board onMove canMove>                                           ← 가로 스크롤. useContentWidth(1440)
    <BoardColumn id title count blocked highlighted>
      <BoardCard id onOpen draggable>
        [식별자 mono + 유형 배지]  [⋯ 메뉴: 상세 · 승인 · 다음 단계로 · 링크]
        제목 2줄
        (막힘 · 사유)
        [서비스 배지] [승인자 스택] … [위험]
        [담당 아바타] … [배포 창]
      </BoardCard>
    </BoardColumn> × 단계
  </Board>
</PageBody>
```

## 결정 규칙
- **끌기는 규칙을 우회하지 않는다.** 상세 화면의 "다음 단계" 버튼과 보드의 `canMove`·메뉴가 **같은 함수**(`lib/workflow.ts` 의 `advanceBlocker`: 담당자만, 승인 단계는 승인자만, 필수 체크리스트 미완 불가)를 본다. 옮길 수 없는 열은 끄는 동안 흐려지고, 그래도 놓으면 `onMove` 가 불려 toast 로 이유를 말한다
- **바로 다음 열로만.** 건너뛰기는 워크플로가 아니다. 뒤로 가기는 상세 화면의 명시적 액션
- **끌기만으로 되는 일을 두지 않는다.** 카드 메뉴의 "다음 단계로"가 같은 일을 한다(키보드·터치)
- **초안 열은 없다.** 작성자만 보는 상태는 보드에 올리지 않는다 — 열은 4–6개
- **열 헤더는 단계 · 건수 · 막힘.** 막힘은 warning, 열 자체에 색을 칠하지 않는다. 카드의 단계 색은 `StageBadge` 와 같은 의미 색
- **카드는 3줄.** 식별자+유형 → 제목 → 메타 두 줄. 그 이상은 상세로. 설명·체크리스트·타임라인은 카드에 없다
- 1024px: 가로 스크롤(`snap-start`). 열 폭은 줄이지 않는다

## 3상태 (톤은 se.identity.json)
- loading: 열마다 카드 스켈레톤 2장, 건수는 숨김
- empty (열): "없음" 한 줄 — 열은 비어도 자리를 지킨다. 전체가 비면 페이지의 EmptyState(표와 같은 문구)
- error: 페이지의 ErrorState(표와 같은 문구) — 보드는 그리지 않는다
