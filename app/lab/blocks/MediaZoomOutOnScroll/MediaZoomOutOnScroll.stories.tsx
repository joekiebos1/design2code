import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MediaZoomOutOnScroll } from './MediaZoomOutOnScroll'

const meta: Meta<typeof MediaZoomOutOnScroll> = {
  component: MediaZoomOutOnScroll,
  title: 'Blocks/Lab/MediaZoomOutOnScroll',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof MediaZoomOutOnScroll>

export const Default: Story = {
  args: {
    image: '/placeholder-preview.svg',
    alt: 'Media zoom out on scroll',
  },
}
