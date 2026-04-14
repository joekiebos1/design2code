import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LabCardGridBlock } from './LabCardGridBlock'

const meta: Meta<typeof LabCardGridBlock> = {
  component: LabCardGridBlock,
  title: 'Blocks/Lab/CardGrid',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof LabCardGridBlock>

const colourIconItems = [
  {
    _type: 'labCardItem' as const,
    cardType: 'colourIconText' as const,
    backgroundColor: 'primary' as const,
    icon: 'IcComputer',
    title: 'Business Broadband',
    description: 'Secure, reliable and fast internet across India.',
  },
  {
    _type: 'labCardItem' as const,
    cardType: 'colourIconText' as const,
    backgroundColor: 'secondary' as const,
    icon: 'IcGlobe',
    title: 'Internet leased line',
    description: 'Enterprise grade connectivity with dedicated bandwidth.',
  },
  {
    _type: 'labCardItem' as const,
    cardType: 'colourIconText' as const,
    backgroundColor: 'tertiary' as const,
    icon: 'IcWifiNetwork',
    title: 'Managed WiFi',
    description: 'Seamless and scalable wireless connectivity.',
  },
]

export const ColourIcon: Story = {
  args: {
    title: 'Business solutions tailored for your growth',
    columns: 3,
    emphasis: 'ghost',
    items: colourIconItems,
  },
}

export const ColourFeatureLarge: Story = {
  args: {
    title: 'Simple headlines',
    columns: 2,
    emphasis: 'ghost',
    items: [
      {
        _type: 'labCardItem' as const,
        cardType: 'colourFeatured' as const,
        backgroundColor: 'primary' as const,
        title: 'Headline one',
        description: 'Supporting description for the first card.',
      },
      {
        _type: 'labCardItem' as const,
        cardType: 'colourFeatured' as const,
        backgroundColor: 'secondary' as const,
        title: 'Headline two',
        description: 'Supporting description for the second card.',
      },
    ],
  },
}
