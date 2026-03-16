import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LabTopNavBlock } from './TopNavBlock'

const meta: Meta<typeof LabTopNavBlock> = {
  component: LabTopNavBlock,
  title: 'Blocks/Lab/TopNavBlock',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof LabTopNavBlock>

export const Default: Story = {
  args: {},
}
