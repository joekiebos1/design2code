import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LabMediaZoomOutOnScroll } from './MediaZoomOutOnScroll'

const meta: Meta<typeof LabMediaZoomOutOnScroll> = {
  component: LabMediaZoomOutOnScroll,
  title: 'Blocks/Lab/MediaZoomOutOnScroll',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof LabMediaZoomOutOnScroll>

export const Default: Story = {
  args: {
    image: '/placeholder-preview.svg',
    alt: 'Media zoom out on scroll',
  },
}
