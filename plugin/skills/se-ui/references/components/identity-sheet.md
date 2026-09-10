# IdentitySheet

`import { IdentitySheet } from '@se/ui'` — 패턴 · `packages/ui/src/patterns/identity-sheet.tsx`

아이덴티티 시트 — 서비스의 "얼굴"을 한 장으로.
브랜드 코어(고정)와 서비스 슬롯(가변)이 실제 렌더에서 어떻게 보이는지, 형제와 어떻게 다른지.

| prop | 타입 | 기본 | 설명 |
|---|---|---|---|
| `identity` **필수** | `{ accent: { hue: number; }; name: string; id: string; mark: { type: "monogram"; text: s…` |  |  |
| `siblings` | `{ id: string; name: string; hue: number; signature: string; }[]` |  | 레지스트리의 형제들 — 가족 초상화 |
| `signaturePreview` | `ReactNode` |  | 이 서비스의 시그니처를 실제 컴포넌트로 렌더한 것 |
