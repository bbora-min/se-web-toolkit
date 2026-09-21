# DocPage — 문서 · 읽는 화면

원본: `references/examples/dataset-explorer/DomainPage.tsx`(도메인 가이드 — 트리 · 본문 · 목차, 데이터 사전 표)

"읽는 화면"이다. 런북·포스트모템·온콜 핸드북·ADR·데이터 사전처럼 사람이 위에서 아래로 읽는 것. 목록(스캔)·대시보드(훑기)·보드(흐름)와 달리 **타이포와 여백이 전부**고 크롬(제목 바·필터·표 헤더)이 없다. 같은 앱 안에 있어도 이 화면만은 다르게 보여야 한다.

## 골격
```
<DocLayout aside={<TreeNav />} toc={<TableOfContents items={h2들} />}>   ← 220 · 65자 본문 · 200. 양옆은 sticky
  <DocHeader eyebrow="도메인 가이드 · fct" title summary meta={소유 · 갱신 · 감시 · 개수} actions={ghost 하나} />
  <Prose>
    <section id="overview"><h2>개요</h2><p/>…</section>
    <section id="rules"><h2>규칙</h2><ul/><Callout tone="warning" title>…</Callout></section>
    <section id="dictionary"><h2>데이터 사전</h2><div class="se-prose-table"><Table>…</Table></div></section>
    <section id="queries"><h2>쿼리</h2><pre><code>…</code></pre></section>
  </Prose>
</DocLayout>
```
콘텐츠 폭은 쉘 기본(1120) 그대로 — 문서는 넓을 필요가 없다.

## 결정 규칙
- **본문은 `Prose` 안에, 클래스 없이.** h2/h3/p/ul/ol/code/pre/table/blockquote 가 토큰으로 이미 꾸며져 있다(`.se-prose`). 문단마다 클래스를 붙이기 시작하면 문서가 아니라 화면이 된다
- **절(section)에 id, 목차는 그 id.** `TableOfContents` 가 스크롤에 따라 현재 절을 액센트로. h2 만 목차에 — h3 은 `level: 3` 으로 들여쓰기
- **머리는 Confluence 관례**: 종류·경로(eyebrow) → 제목 → 요약 문장 → 소유 · 갱신 · 감시. 액션은 ghost 하나("편집 제안"). 문서에 primary 는 없다
- **강조 상자는 절마다 하나까지**(`Callout`). 연달아 두 개면 본문을 고쳐야 한다
- **데이터 사전은 표지만 `DataTable` 이 아니다** — `DataTable` 은 정렬·페이지가 있는 목록용. 문서 속 표는 정적 `Table` 프리미티브(`Table`·`TableHeader`·`TableRow`·`TableHead`·`TableCell`)를 `se-prose-table` 로 감싼다
- **좌측 트리는 위치, 우측 목차는 진행.** 트리는 문서 사이를 옮기고(라우터), 목차는 문서 안을 옮긴다(스크롤). 둘을 합치지 않는다
- **콘텐츠는 백엔드의 구조화된 블록**(p · ul · code · callout · 표 데이터). 마크다운을 그대로 렌더하면 색·컨트롤 규칙을 우회하게 된다
- 1024px: 목차가 본문 위로 접힌다. 트리는 남는다

## 3상태 (톤은 se.identity.json)
- loading: 머리(eyebrow · 제목 · 요약)와 본문 블록 스켈레톤 — 트리는 따로 로드
- empty: "아직 작성된 가이드가 없어요" + 첫 절을 쓰는 다음 행동(문서 편집이 없으면 관련 목록 링크)
- error: 본문 자리에 원인 + 다시 시도. 트리·목차는 남긴다
