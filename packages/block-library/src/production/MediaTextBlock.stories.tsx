import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MediaTextBlock } from './MediaTextBlock/MediaTextBlock'

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
    headline: 'Media overlay',
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
    align: 'center',
    media,
  },
}

export const StackedTextBelowLeft: Story = {
  args: {
    variant: 'centered-media-below',
    size: 'feature',
    headline: 'Same layout as Large Carousel card',
    body: '2:1 media with h5 + label-s typography below, left aligned.',
    align: 'left',
    media: { ...media, aspectRatio: '2:1' as const },
    descriptionTitle: 'Caption title',
    descriptionBody: 'Caption body uses card-style typography under the image.',
  },
}

export const StackedImageOnTop: Story = {
  args: {
    variant: 'centered-media-below',
    size: 'feature',
    headline: 'Stacked with image on top',
    subhead: 'Image above the text.',
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

export const StackedWithCtas: Story = {
  args: {
    variant: 'centered-media-below',
    size: 'feature',
    headline: 'Stacked with CTAs',
    body: 'Primary and secondary actions below the intro copy.',
    align: 'center',
    media,
    cta: { label: 'Primary', href: '/', appearance: 'primary' },
    ctaSecondary: { label: 'Secondary', href: '/about', appearance: 'secondary' },
  },
}
