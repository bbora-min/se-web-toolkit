# SettingsPage — 설정·토글

원본: `examples/release-desk/src/pages/settings/SettingsPage.tsx`

## 골격
```
<PageBody max-w-4xl>
  <PageHeader title="설정" description />
  <Form><form>
    <FormSection title description>        ← 좌 제목·설명 / 우 필드 (2열)
      <SwitchRow … /> 묶음은 divide-y 카드
      <RadioCards … />  <Combobox … />  <DateRangePicker … />  <Input … />
    </FormSection> × N
    <sticky bottom bar: "저장되지 않은 변경이 있습니다" [되돌리기] [저장 primary disabled={!isDirty}]>
  </form></Form>
  <위험 구역: border-danger/30 bg-danger-soft/40 — [초기화 danger] → ConfirmDialog typeToConfirm>
</PageBody>
```

## 결정 규칙
- 저장은 **화면 하단 한 번**(sticky bar), 섹션마다 저장 버튼 없음. `isDirty`로 상태 문구와 버튼 활성화
- 스위치 행은 라벨·설명 왼쪽, 스위치 오른쪽. 즉시 저장이 아니라 폼의 일부
- 위험 구역은 맨 아래, 빨간 테두리, 워크스페이스 이름 재입력
- 규칙 설명은 필드 옆 `FormDescription`에 — 도움말 페이지로 보내지 않는다
