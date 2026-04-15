import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TopNavBlock } from './TopNavBlock'

const meta: Meta<typeof TopNavBlock> = {
  component: TopNavBlock,
  title: 'Blocks/Lab/TopNavBlock',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof TopNavBlock>

export const Default: Story = {
  args: {},
}
