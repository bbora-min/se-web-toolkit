# se — Claude Code 플러그인

```
/plugin marketplace add bbora-min/se-web-toolkit
/plugin install se@se-web-toolkit
```

| 종류 | 이름 | 역할 |
|---|---|---|
| 스킬(자동) | `se-ui` | 컴포넌트·토큰·패턴 지식. `references/`는 코드에서 자동 생성 |
| 스킬(자동) | `se-design` | 디자인 플랜·구성 규칙·안티패턴·루브릭 |
| 명령 | `/se:new <id>` | 어느 폴더에서든 `pnpm dlx`로 템플릿 생성 → 아이덴티티 인터뷰 → 설치 → 첫 실행 |
| 명령 | `/se:identity` | 슬롯 8개를 2–3안으로 정하고 검증·레지스트리 |
| 명령 | `/se:spec <요구사항>` | 요구사항 → `docs/spec.md` 화면 명세 |
| 명령 | `/se:page <화면>` | 플랜 → 원본 복사·변형 → 목 → 3상태 → 등록 → lint → 스크린샷 |
| 명령 | `/se:api <spec>` | OpenAPI/설명 → 타입 클라이언트·훅, 목을 실제 형태로 |
| 명령 | `/se:review` | 스크린샷 → critic·reviewer 에이전트 → 수정 → 재촬영 |
| 명령 | `/se:audit` | 준수율 리포트 (환경·규칙·화면·디자인 점수·도입 진행률) |
| 명령 | `/se:adopt [0-5]` | 내 기존 프로젝트(예: todo-web)에 점진 도입, 단계 = PR |
| 명령 | `/se:deploy` | Dockerfile·nginx·CI 점검, 빌드 |
| 에이전트 | `se-design-critic` | 스크린샷 채점, 읽기 전용 |
| 에이전트 | `se-reviewer` | 코드 규칙·동작 리뷰, 읽기 전용 |
| 에이전트 | `se-migrator` | 기존 파일을 @se/ui로 치환 |
| 훅 | SessionStart | Node 정책 검사, `@se/ui` 버전, 아이덴티티 요약 주입 |
| 훅 | PostToolUse(Edit·Write) | 저장한 `.ts(x)`를 `@se/eslint-plugin`으로 검사, 위반이면 exit 2 |

문서 동기화: `pnpm gen:skill-docs` (CI에서 `--check`).

## 릴리스 규칙
`plugin/` 을 바꾸면 `plugin/.claude-plugin/plugin.json` 과 `.claude-plugin/marketplace.json` 의 `version` 을 **같이 올린다**. 같으면 `claude plugin update` 가 "이미 최신"이라며 새 스킬을 받지 않는다 (CI `check:plugin-version`). 사용자는 `claude plugin update se@se-web-toolkit` 또는 `scripts/setup.sh`.
