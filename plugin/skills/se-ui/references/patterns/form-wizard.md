# FormWizardPage — 여러 단계 입력

원본: `examples/release-desk/src/pages/releases/NewReleasePage.tsx`

## 골격
```
<PageBody max-w-3xl>
  ← 목록
  <PageHeader title description />
  <Steps steps current onStepClick />        ← 완료된 단계로만 되돌아감
  <Form {...form}><form className="rounded-lg border bg-surface p-6">
    {step === 0 ? … : step === 1 ? … : …}    ← 단계별 FormField들
    <footer: [이전 ghost] [n / N] [다음 primary | 등록 primary(key 다르게)]>
  </form></Form>
</PageBody>
```

## 결정 규칙
- **zod 스키마 하나 + 단계별 `form.trigger(fields)`** — "다음"은 그 단계 필드만 검증. 등록은 전체
- **"다음"과 "등록"은 다른 Button에 다른 `key`** — 같은 자리의 Button이 재사용되면 마지막 단계로 넘어가는 클릭이 submit으로 이어진다 (실제로 겪은 버그)
- 폼 안에서 Enter는 textarea 외엔 막는다 (`onKeyDown`)
- 규칙이 값을 강제하면 UI가 따라간다: 핫픽스 → 위험도 "높음" 고정(`disabled`) + 설명
- 마지막 단계에 **검토 요약**(DescriptionList) — 무엇을 등록하는지 한 번 더
- 선택지가 3–5개고 설명이 필요하면 `RadioCards`, 항목이 8개 넘으면 `Combobox`, 체크리스트는 `CheckboxField`(필수 표시)
- 완료 후: toast + 상세 페이지로 이동
