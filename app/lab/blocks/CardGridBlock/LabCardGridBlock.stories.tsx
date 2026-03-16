import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LabCardGridBlock } from './LabCardGridBlock'

const meta: Meta<typeof LabCardGridBlock> = {
  component: LabCardGridBlock,
  title: 'Blocks/Lab/CardGrid',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof LabCardGridBlock>

const textOnColourItems = [
  {
    _type: 'textOnColourCardItem' as const,
    size: 'small' as const,
    backgroundColor: 'primary' as const,
    icon: 'IcComputer',
    title: 'Business Broadband',
    description: 'Secure, reliable and fast internet across India.',
    callToActionButtons: [
      { label: 'Buy now', link: '/', style: 'filled' as const },
      { label: 'Know more', link: '/about', style: 'outlined' as const },
    ],
    features: ['Speeds up to 1 Gbps', 'High-speed data up to 10 TB'],
  },
  {
    _type: 'textOnColourCardItem' as const,
    size: 'small' as const,
    backgroundColor: 'secondary' as const,
    icon: 'IcGlobe',
    title: 'Internet leased line',
    description: 'Enterprise grade connectivity with dedicated bandwidth.',
    callToActionButtons: [{ label: 'Know more', link: '/', style: 'outlined' as const }],
    features: ['Symmetric upload and download', '99.9% uptime SLA'],
  },
  {
    _type: 'textOnColourCardItem' as const,
    size: 'small' as const,
    backgroundColor: 'tertiary' as const,
    icon: 'IcWifiNetwork',
    title: 'Managed WiFi',
    description: 'Seamless and scalable wireless connectivity.',
    callToActionButtons: [{ label: 'Learn more', link: '/', style: 'filled' as const }],
    features: ['End-to-end management', 'Wi-Fi 6 technology'],
  },
]

export const TextOnColour: Story = {
  args: {
    title: 'Business solutions tailored for your growth',
    columns: 3,
    emphasis: 'ghost',
    items: textOnColourItems,
  },
}

export const TextOnColourLarge: Story = {
  args: {
    title: 'Simple headlines',
    columns: 2,
    emphasis: 'ghost',
    items: [
      {
        _type: 'textOnColourCardItem' as const,
        size: 'large' as const,
        backgroundColor: 'primary' as const,
        title: 'Headline one',
        description: 'Supporting description for the first card.',
      },
      {
        _type: 'textOnColourCardItem' as const,
        size: 'large' as const,
        backgroundColor: 'secondary' as const,
        title: 'Headline two',
        description: 'Supporting description for the second card.',
      },
    ],
  },
}
