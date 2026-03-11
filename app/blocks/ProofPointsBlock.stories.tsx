import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProofPointsBlock } from './ProofPointsBlock'

const meta: Meta<typeof ProofPointsBlock> = {
  component: ProofPointsBlock,
  title: 'Blocks/Production/ProofPointsBlock',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof ProofPointsBlock>

const items = [
  { title: 'Trusted by millions', description: 'Join 10M+ satisfied customers', icon: 'IcCheckboxOn' },
  { title: 'Fast delivery', description: 'Next-day shipping available', icon: 'IcCheckboxOn' },
  { title: '24/7 support', description: "We're here when you need us", icon: 'IcCheckboxOn' },
]

export const Default: Story = {
  args: {
    title: 'Why choose us',
    blockSurface: 'ghost',
    items,
  },
}

export const Bold: Story = {
  args: {
    title: 'Proof points on bold',
    blockSurface: 'bold',
    items,
  },
}
