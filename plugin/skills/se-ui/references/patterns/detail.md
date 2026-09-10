# DetailPage — 단일 객체 + 탭

원본: `references/examples/dataset-explorer/DatasetPage.tsx`(정보형) · `references/examples/release-desk/ReleasePage.tsx`(워크플로형)

## 골격
```
<PageBody>
  <Button ghost asChild><Link>← 목록</Link></Button>
  <header>
    <h1 mono 2xl>{id} <Badge 상태/> <Badge 분류/></h1> <p>{제목·설명}</p>
    <actions: primary 하나(역할에 따라 다름) + ghost>
  </header>
  [Alert — 막힘·경고]
  [Steps — 워크플로면 단계 진행]
  <핵심 사실 행: grid-cols-5 카드 (담당·숫자·상태·시간·추세)>
  <Tabs 개요 / 세부(n) / 이력(n) />
  <탭 내용 — grid-cols-[3fr_2fr]>
</PageBody>
```

## 결정 규칙
- **핵심 사실 행과 탭 내용은 겹치지 않는다.** 사실 행에 있는 소유자·SLA를 개요 탭에 또 쓰지 않는다
- **개요 탭은 "써도 되나 / 무엇을 해야 하나"에 답한다**: 추세 차트 + 최근 변경 + "쓰기 전에" 안내 + 관련 항목. 60%가 비면 정보 설계 실패
- **주 액션은 역할에 따라 바뀐다** — 내 차례면 승인/반려, 담당자면 다음 단계, 아니면 없음. 자리는 하나. 서로 다른 Button은 `key`를 달리 준다
- 체크리스트는 그 자리에서 토글(즉시 저장) + 진행 바
- 탭은 URL `?tab=`에 동기화
- 타임라인: 좌측 세로선 + 점 색(단계=액센트, 승인=success, 반려=danger)
