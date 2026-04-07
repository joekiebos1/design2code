import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MediaText5050Block } from './MediaText5050Block'

const meta: Meta<typeof MediaText5050Block> = {
  component: MediaText5050Block,
  title: 'Blocks/Production/MediaText5050Block',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof MediaText5050Block>

const baseMedia = {
  type: 'image' as const,
  src: '/placeholder-preview.svg',
  alt: 'Placeholder',
  aspectRatio: '4:5' as const,
}

export const ParagraphsMulti: Story = {
  args: {
    variant: 'paragraphs',
    paragraphColumnLayout: 'multi',
    imagePosition: 'right',
    emphasis: 'ghost',
    headline: 'Media + text 50/50',
    description: 'Paragraphs variant with multiple sections beside media.',
    media: baseMedia,
    items: [
      { subtitle: 'First section', body: 'Supporting copy for the first column.' },
      { subtitle: 'Second section', body: 'More detail and context here.' },
    ],
  },
}

export const ParagraphsSingle: Story = {
  args: {
    variant: 'paragraphs',
    paragraphColumnLayout: 'single',
    imagePosition: 'left',
    emphasis: 'ghost',
    headline: 'Single column copy',
    description: 'One prominent text band next to media.',
    media: baseMedia,
    singleSubtitle: 'Highlighted subtitle',
    singleBody: 'Lead paragraph with larger typography when using single layout.',
  },
}

export const ParagraphsFramingCenter: Story = {
  args: {
    ...ParagraphsMulti.args,
    blockFramingAlignment: 'center',
    headline: 'Center-aligned framing',
  },
}

export const Accordion: Story = {
  args: {
    variant: 'accordion',
    imagePosition: 'right',
    emphasis: 'ghost',
    headline: 'Accordion + media',
    description: 'Open a row to swap the media column.',
    media: baseMedia,
    accordionItems: [
      {
        subtitle: 'Panel one',
        body: 'First panel body text.',
        media: {
          type: 'image' as const,
          src: '/placeholder-preview.svg',
          alt: '',
          aspectRatio: '4:5' as const,
        },
      },
      {
        subtitle: 'Panel two',
        body: 'Second panel with its own visual.',
        media: {
          type: 'image' as const,
          src: '/placeholder-preview.svg',
          alt: '',
          aspectRatio: '1:1' as const,
        },
      },
    ],
  },
}
