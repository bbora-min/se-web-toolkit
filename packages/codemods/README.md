# @se/codemods

기존 React 코드를 `@se/ui`·토큰으로 옮기는 jscodeshift 변환. **80 % 자동**, 못 정하는 것은 `TODO(se-adopt)` 주석으로 남긴다 — 그다음은 `se-migrator` 에이전트.

```
pnpm dlx "github:bbora-min/se-web-toolkit#v0.8.0&path:packages/codemods" all src/ --dry   # 미리보기
pnpm dlx "github:bbora-min/se-web-toolkit#v0.8.0&path:packages/codemods" all src/
```

| 변환 | 하는 일 |
|---|---|
| `mui` | `@mui/material` Button(variant 매핑)·TextField→Input·Checkbox·Switch·Chip→Badge·Alert·Dialog 계열·Divider·Tooltip·Skeleton. Table·Snackbar·Drawer·Select·Tabs·Card·Box 등은 TODO |
| `antd` | Button(type·danger·size)·Input·Input.TextArea→Textarea·Tag→Badge·Alert·Switch·Checkbox·Divider·Tooltip·Skeleton·`message.*`→`toast.*`. Table·Modal·Form 등은 TODO |
| `raw-controls` | `<button>`→`Button`(submit/파란 배경→primary, 빨강→danger), `<input>`→`Input`/`Checkbox`, `<textarea>`→`Textarea`, 정적 `<select>`→`Select options`. `<table>` 은 TODO |
| `tailwind-palette` | `bg-blue-600 text-white`→`bg-info text-on-info`, `bg-indigo-600`→`bg-accent`, 회색→표면/잉크/라인, `-50/-100`→`-soft`. 못 정한 색은 파일 상단 TODO |

`all` 은 위 순서로 전부. 실행 후 `pnpm lint && pnpm typecheck` 로 확인한다.

주의: 바뀐 줄은 큰따옴표로 다시 찍힌다(recast). 실행 뒤 프로젝트 포매터(prettier 등)를 한 번 돌리면 정리된다.
