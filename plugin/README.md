# se — Claude Code 플러그인

```
/plugin marketplace add bbora-min/se-web-toolkit
/plugin install se@se-web-toolkit
```

| 종류 | 이름 | 역할 |
|---|---|---|
| 스킬(자동) | `se-ui` | 컴포넌트·토큰·패턴 지식. `references/`는 코드에서 자동 생성 |
| 스킬(자동) | `se-design` | 디자인 플랜·구성 규칙·안티패턴·루브릭 |
| 에이전트 | `se-design-critic` | 스크린샷 채점, 읽기 전용 |
| 에이전트 | `se-reviewer` | 코드 규칙·동작 리뷰, 읽기 전용 |
| 에이전트 | `se-migrator` | 기존 파일을 @se/ui로 치환 |

문서 동기화: `pnpm gen:skill-docs` (CI에서 `--check`).
