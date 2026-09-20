# CanvasPage — 캔버스 · 관계가 정보

원본: `references/examples/reference-app/PipelinePage.tsx`(파이프라인 DAG — 자동 배치 캔버스 · 상태색 노드 · 인스펙터)

"무엇이 무엇에 달려 있나"가 질문인 화면이다. 파이프라인 DAG·서비스 의존 맵·노드 토폴로지(Airflow·n8n·Datadog Service Map). 목록(원장)은 개별을, 벽은 지표를, 캔버스는 **관계**를 보여 준다. `@se/canvas`(React Flow 래퍼)를 쓴다 — `@xyflow/react` 를 직접 import 하지 않는다(린트가 막는다).

## 골격
```
<ShellFill fixed className="border-t">                                ← 화면 높이 고정. useContentWidth(1600)
  <h1 sr-only />
  <상단 바 h-12>  [← 목록] 파이프라인 이름들(aria-current) … 스케줄 · 담당 · 마지막 실행 배지
  <SplitPane rightWidth=300 right={<Inspector />}>                     ← 왼쪽 칸 없음. 인스펙터는 선택 태스크 또는 요약
    <Canvas nodes edges selectedId onSelect minimap overlay={범례} />   ← 배치는 dagLayout 이 자동. 노드는 TaskNode(이름 · 상태 배지 · 메타)
  </SplitPane>
</ShellFill>
```

## 결정 규칙
- **상태는 테두리, 흐름은 간선.** 실패 danger · 실행 중 info(흐르는 간선) · 성공 success(옅게) · 대기 회색. 노드 안을 칠하지 않는다 — 20개가 넘으면 벽지가 된다
- **선택은 페이지가 든다**(`selectedId`·`onSelect`). 인스펙터는 선택이 없으면 파이프라인 요약, 있으면 태스크의 사실 + 로그 링크 + 상태에 맞는 액션(실패 → 여기서부터 재시도)
- **편집하지 않는다.** 노드는 끌지 않고(위치는 자동 배치) 연결도 바꾸지 않는다. 사용자는 화면을 이동·확대할 뿐. DAG 는 코드가 정의한다
- **자동 배치**: `dagLayout`(층 = 가장 긴 상류 경로, 좌→우). 수십 개까지. 수백 개면 dagre·elk 를 `@se/canvas` 에 붙이고 페이지는 그대로
- **미니맵은 20개 넘을 때만.** 범례는 캔버스 우상단에 떠 있는 한 줄(`overlay`)
- **키보드**: 캔버스는 마우스 화면이다. 같은 정보를 인스펙터의 상류·하류 목록으로도 준다 — 그래프를 못 봐도 관계는 읽힌다
- 1024px: 인스펙터가 접힌다(SplitPane 기본). 상단 바의 부가 정보는 `lg:` 이상에서만

## 3상태 (톤은 se.identity.json)
- loading: 캔버스 자리 스켈레톤(여백 12)
- empty: 캔버스 자리에 "태스크가 없습니다" 한 줄
- error: 원인 + 다시 시도(캔버스 대신)
