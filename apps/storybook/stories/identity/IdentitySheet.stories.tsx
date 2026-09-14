import type { Meta, StoryObj } from '@storybook/react-vite'
import { IdentitySheet, StatusStrip } from '@se/ui'
import { IDENTITIES, byId } from '../identities'

/** 각 프로젝트의 개발 전용 `/__identity` 라우트가 보여 주는 시트. 툴바에서 아이덴티티를 바꿔 보라 */
const meta = {
  title: '아이덴티티/아이덴티티 시트',
  component: IdentitySheet,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof IdentitySheet>

export default meta
type Story = StoryObj<typeof meta>

export const 기본: Story = {
  args: { identity: IDENTITIES[0]!, siblings: IDENTITIES.map((i) => ({ id: i.id, name: i.name, hue: i.accent.hue, signature: i.signature })) },
  render: (args, ctx) => (
    <div className="mx-auto max-w-[1120px] p-6">
      <IdentitySheet
        {...args}
        identity={byId(String(ctx.globals.identity))}
        signaturePreview={
          <StatusStrip health="ok" headline="정상" detail="예시" stats={[{ label: '실행 중', value: 7, trend: [9, 8, 10, 7, 6, 8, 9, 7] }, { label: '대기', value: 9, trend: [4, 6, 5, 7, 9, 8, 10, 12] }, { label: '실패', value: 1, tone: 'danger', trend: [1, 0, 2, 1, 1, 3, 2, 1] }, { label: '성공률', value: '98.1%', trend: [96, 95, 97, 94, 96, 97, 98, 98.1] }]} />
        }
      />
    </div>
  ),
}
