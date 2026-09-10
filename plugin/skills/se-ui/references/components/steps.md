# Steps

`import { Steps } from '@se/ui'` — 컴포넌트 · `packages/ui/src/components/steps.tsx`

다단계 폼의 진행 표시. 완료=체크, 현재=액센트, 이후=회색

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `current` **필수** | `number` |  | 현재 단계 인덱스 |
| `steps` **필수** | `Step[]` |  |  |
| `className` | `string` |  |  |
| `onStepClick` | `((index: number) => void)` |  | 완료된 단계로 되돌아갈 수 있게 |
