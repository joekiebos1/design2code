import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MediaTextBlock } from './MediaTextBlock'

const meta: Meta<typeof MediaTextBlock> = {
  component: MediaTextBlock,
  title: 'Blocks/Production/MediaTextBlock',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof MediaTextBlock>

const media = {
  type: 'image' as const,
  src: '/placeholder-preview.svg',
  alt: '',
  aspectRatio: '4:3' as const,
}

export const FullBleed: Story = {
  args: {
    variant: 'full-bleed',
    size: 'hero',
    headline: 'Full-bleed hero overlay',
    subhead: 'Text overlaid on image.',
    media: { ...media, aspectRatio: '16:9' as const },
  },
}

export const Stacked: Story = {
  args: {
    variant: 'centered-media-below',
    size: 'feature',
    headline: 'Stacked layout',
    subhead: 'Image below the text.',
    stackImagePosition: 'bottom',
    media,
  },
}

export const StackedImageOnTop: Story = {
  args: {
    variant: 'centered-media-below',
    size: 'feature',
    headline: 'Stacked with image on top',
    subhead: 'Image above the text.',
    stackImagePosition: 'top',
    media,
  },
}

export const TextOnly: Story = {
  args: {
    variant: 'text-only',
    size: 'feature',
    headline: 'Text only block',
    subhead: 'No media.',
  },
}
