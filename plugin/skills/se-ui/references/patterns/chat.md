# ChatPage — 대화 · 어시스턴트

원본: `references/examples/dataset-explorer/AskPage.tsx`(데이터 질의 어시스턴트 — 스레드 목록 · 대화 컬럼 · 컴포저 · 출처 칩)

"묻고 답하는" 화면이다. 데이터 질의·런북 봇·VOC 요약(ChatGPT·Claude·Perplexity). 목록도 문서도 아니고, 시간순으로 쌓이는 말과 그 아래 입력 상자 하나. 내부 도구의 답은 **출처**(데이터셋·문서·잡)가 있어야 믿으므로 답마다 인용 칩을 단다.

## 골격
```
<ShellFill fixed className="border-t">                              ← 화면 높이 고정. 폭은 쉘 기본
  <h1 sr-only />
  <SplitPane leftWidth=260 left={<스레드 목록: [+ 새 대화] · 최근 스레드(제목 · 시각)>}>   ← 오른쪽 칸 없음
    <Thread>                                                         ← 46rem 컬럼, 아래로 따라가기(사용자가 올리면 멈춤)
      [빈 스레드: 인사 한 줄 + 시작 질문 Chip 3–4개]
      <Message role="user">…</Message>
      <Message role="assistant" mark streaming citations actions>   ← 답 본문은 Prose(문단·코드)
    </Thread>
    <Composer onSubmit streaming onStop placeholder />                ← Enter 보내기 · Shift+Enter 줄바꿈 · 보내는 중 정지
  </SplitPane>
</ShellFill>
```

## 결정 규칙
- **답은 평문, 질문은 말풍선.** 어시스턴트 답에 상자를 씌우지 않는다 — 문서처럼 읽힌다. 사용자 말만 오른쪽 surface-2 말풍선
- **출처가 없는 답은 없다.** 답이 참조한 데이터셋·문서·잡을 번호 칩(`Citation`)으로 달고, 본문에서도 `[1]` 로 가리킨다. 칩은 원본 화면으로 가는 링크
- **스트리밍은 페이지가 든다.** 백엔드가 SSE·chunk 로 주면 그대로 이어 붙이고 `streaming` 으로 커서를 켠다. 원본은 목이라 클라이언트에서 흉내 냈다 — 실제 연결 땐 `fetch` 스트림으로 바꾼다
- **정지는 보내기 자리에.** 보내는 중엔 보내기 버튼이 정지 버튼이 된다. 정지하면 받은 만큼만 남긴다
- **빈 스레드는 안내가 아니라 시작 질문이다.** "무엇이든 물어보세요" 대신 이 도구가 잘 답하는 질문 3–4개를 `Chip` 으로
- **스레드는 URL**(`/ask/:threadId?`). 새 대화는 첫 답이 오면 id 를 받아 `replace`
- **답 아래 액션은 호버에만**: 복사 · 다시 생성 · 도움 됐어요. 메타(시각)는 오른쪽 끝
- 1024px: 스레드 목록이 접히지 않는다(왼쪽 칸). 컬럼은 46rem 안에서 줄어든다

## 3상태 (톤은 se.identity.json)
- loading: 스레드 목록 스켈레톤, 과거 스레드를 여는 중이면 말풍선 스켈레톤 2–3
- empty: 새 대화 — 인사 한 줄 + 시작 질문 칩
- error: 답이 실패하면 어시스턴트 자리에 원인 + "다시 시도" — 사용자의 질문은 남긴다
