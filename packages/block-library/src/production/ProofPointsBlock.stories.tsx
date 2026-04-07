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
    emphasis: 'ghost',
    items,
  },
}

export const Bold: Story = {
  args: {
    title: 'Proof points on bold',
    emphasis: 'bold',
    items,
  },
}

export const Stat: Story = {
  args: {
    title: 'By the numbers',
    description: 'Stat variant uses headline-scale figures.',
    variant: 'stat',
    emphasis: 'ghost',
    items: [
      { title: '10M+', description: 'Active users' },
      { title: '99.9%', description: 'Uptime' },
      { title: '24/7', description: 'Support' },
    ],
  },
}

export const WithFraming: Story = {
  args: {
    title: 'With description and CTAs',
    description: 'Optional framing matches other lab-style blocks.',
    callToActions: [
      { label: 'Get started', link: '/', style: 'filled' },
      { label: 'Compare plans', link: '/plans', style: 'outlined' },
    ],
    emphasis: 'ghost',
    items,
  },
}
