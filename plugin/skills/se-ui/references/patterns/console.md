# ConsolePage — 콘솔 · 패싯 | 스트림 | 컨텍스트

원본: `references/examples/reference-app/JobConsolePage.tsx`(잡 콘솔 — 레벨·단계 패싯, 줄 필터, 라이브 테일, 원인·런북·같은 파이프라인)

"파고드는" 화면이다. 로그·트레이스·빌드 출력처럼 수천 줄 속에서 빨간 줄과 그 앞뒤 맥락을 찾는 것(Vercel Logs·Datadog Logs·DevTools). 드로어 속 로그가 "잠깐 보기"라면 콘솔은 자기 화면을 갖는다 — 같은 데이터, 다른 골격. 전폭·모노스페이스·화면 높이 고정.

## 골격
```
<ShellFill fixed className="border-t">                              ← 화면 높이 고정. useContentWidth(1600)
  <h1 sr-only />
  <상단 바 h-12>  [← 목록] 식별자(mono) · 상태 배지 · 분류 배지 · 노드 · 시작 · 소요 · 시도 … [취소 ghost] [재시도 primary]
  <SplitPane storageKey leftWidth=240 rightWidth=280 minCenter=480 left={패싯} right={컨텍스트}>
    <필터 바 h-11>  [줄 필터 input(mono)] n / N 줄 [필터 초기화] … 라이브 테일 Switch
    <div p-3 min-h-0 flex-1><LogViewer height="100%" lines={filtered} live /></div>
  </SplitPane>
</ShellFill>
```

## 결정 규칙
- **패싯은 값 · 건수, 그룹 안은 OR, 그룹끼리 AND**(`FacetGroup`). 건수는 지금 로그 기준으로 다시 센다. 건수를 누르면 그 값만("only")
- **필터와 검색은 다르다**: 위 필터 바는 줄을 *거른다*(`n / N`), `LogViewer` 의 검색은 일치로 *이동*한다. 둘 다 둔다 — 이름을 "줄 필터"·"검색"으로 갈라 부른다
- **레벨 색은 의미 색**: ERROR danger · WARN warning. 스트림의 좌측 마커·패싯 라벨·상단 오류 수가 같은 색
- **라이브 테일은 실행 중일 때만 켜진다.** 끝난 잡은 Switch 를 비활성으로. 따라가기는 `LogViewer` 가 스크롤 위치로 스스로 끈다
- **컨텍스트 칸은 스트림에 없는 것만**: 실패 원인(+ 같은 원인의 잡 링크) · 런북 · 같은 파이프라인 최근 실행. 잡의 사실(노드·소요)은 상단 바에 이미 있다
- **주 액션은 상태가 정한다**: 실패·취소 → 재시도(primary), 실행·대기 → 취소(ghost), 성공 → 없음
- 줄 파싱(레벨·단계)은 화면이 아니라 백엔드가 주는 게 맞다 — 원본은 목이라 정규식으로 흉내 냈다. 실제 연결 땐 `{ raw, level, stage }` 로 받는다
- 1024px: 오른쪽 칸이 접힌다(SplitPane 기본). 상단 바의 부가 정보(노드·소요)는 `lg:` 이상에서만

## 3상태 (톤은 se.identity.json)
- loading: 상단 바 스켈레톤 + 스트림 자리 스켈레톤
- empty: `LogViewer emptyText` — 대기 중이면 "아직 시작되지 않았습니다", 필터 때문이면 "필터에 맞는 줄이 없습니다"
- error: 잡 자체를 못 가져오면 스트림 자리에 원인 + 다시 시도. 로그만 실패하면 스트림 안에
