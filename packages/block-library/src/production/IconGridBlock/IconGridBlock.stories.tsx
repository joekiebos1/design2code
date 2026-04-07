import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { IconGridBlock } from './IconGridBlock'

const meta: Meta<typeof IconGridBlock> = {
  component: IconGridBlock,
  title: 'Blocks/Production/IconGridBlock',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof IconGridBlock>

const items = [
  { title: 'Connectivity', body: 'Fast, reliable network.', icon: 'IcWifiNetwork', accentColor: 'primary' as const },
  { title: 'Home', body: 'Smart living.', icon: 'IcHome', accentColor: 'secondary' as const },
  { title: 'Entertainment', body: 'Stream and play.', icon: 'IcEntertainment', accentColor: 'tertiary' as const },
  { title: 'Payments', body: 'Pay securely.', icon: 'IcPayment', accentColor: 'positive' as const },
]

export const Default: Story = {
  args: {
    title: 'Icon grid',
    description: 'Four-up grid with DS icons and accent wells.',
    emphasis: 'ghost',
    items,
  },
}

export const WithFramingCtas: Story = {
  args: {
    title: 'Services',
    description: 'Optional description and CTAs above the grid.',
    callToActions: [
      { label: 'Primary', link: '/', style: 'filled' },
      { label: 'Secondary', link: '/about', style: 'outlined' },
    ],
    emphasis: 'minimal',
    items,
  },
}

export const BoldSurface: Story = {
  args: {
    title: 'On bold surface',
    emphasis: 'bold',
    appearance: 'primary',
    items: items.map((i) => ({ ...i, accentColor: 'neutral' as const })),
  },
}

export const ExplicitColumns: Story = {
  args: {
    title: 'Three columns',
    columns: 3,
    emphasis: 'ghost',
    items: items.slice(0, 3),
  },
}
