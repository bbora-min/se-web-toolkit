# TriagePage — 처리함 · 목록 | 본문 | 속성

원본: `references/examples/release-desk/ApprovalsPage.tsx`(내 승인 대기 — 3단, j/k, 결정 뒤 다음 항목)

"하나씩 처리하는" 화면이다. 받은 편지함(Gmail·Superhuman)·이슈 처리함(Linear·Sentry)·승인 대기. 목록은 표에서 고르고 상세로 *가지만*, 처리함는 상세가 옆에 *상주*하고 처리하면 다음으로 넘어간다. 화면은 세로로 스크롤하지 않는다 — 칸마다 스크롤한다.

## 골격
```
<ShellFill fixed className="border-t">                          ← 쉘 패딩을 무르고 화면 높이에 고정(배치별 값은 쉘이 안다). useContentWidth(1440)
  <h1 sr-only />
  <SplitPane storageKey left={<Queue />} right={<Props />}>       ← 320 | 남는 폭 | 280. 손잡이로 조절, 폭은 기억
    <액션 바 sticky top-0 h-14>  [식별자 · 상태 · 제목] … [상세 ↗] [반려…] [승인 primary]
    <본문 max-w-[72ch] px-6 py-6>  결정에 필요한 것만 위에서 아래로(변경 → 롤백 → 체크리스트 → 승인 현황)
  </SplitPane>
  <DecisionDialog onDecided={다음으로} onClose={자리에} />          ← 사유가 필요한 결정만 다이얼로그. 취소는 자리에 남는다
</ShellFill>
```

## 결정 규칙
- **선택은 URL 에**(`/approvals/:id`). 없으면 첫 항목으로 `replace`. 새로고침·공유해도 같은 화면
- **키보드가 UI 다**: `j`/`k`(↑↓) 이동, `Enter` 상세(아무것도 포커스되지 않았을 때만). 입력·버튼·링크·다이얼로그 위에서는 손대지 않는다. 목록 헤더에 `<Kbd>` 로 알려 준다
- **처리하면 다음으로**: 결정한 항목은 목록에서 빠지므로 다음(없으면 이전) 항목으로 `replace`. 마지막이면 빈 상태("모두 처리했습니다")
- **주 액션은 액션 바 오른쪽 끝, 하나**: 승인(primary, 바로). 사유가 필요한 반려는 secondary + 다이얼로그. 안 되는 이유는 `lib/workflow` 의 규칙 함수(`decisionBlocker`) 하나가 정하고 — 상세 화면·다이얼로그도 같은 함수 — primary 를 disabled 로 두고 본문 첫 줄에 문장으로
- **왼쪽 행은 3줄**: 식별자+유형+날짜 → 제목 → 서비스·위험·막힘. 행은 `Link`(버튼 아님) — 선택은 `aria-current="page"` + accent-soft
- **오른쪽은 사실만**: 본문에 있는 것을 또 쓰지 않는다. dl + 최근 활동 3–4개
- 목록이 1만 건이면 서버 페이지네이션 + 가상 스크롤. 처리함는 보통 수십 건 — "내 것"으로 좁힌다

## 3상태 (톤은 se.identity.json)
- loading: 목록 행 스켈레톤 5 + 본문 스켈레톤. 오른쪽은 비움
- empty: 본문 자리에 "승인할 릴리스가 없습니다 · 모두 처리했습니다" + 목록 링크. 왼쪽은 "비어 있습니다"
- error: 본문 자리에 원인 + 다시 시도. 왼쪽에도 작은 다시 시도
