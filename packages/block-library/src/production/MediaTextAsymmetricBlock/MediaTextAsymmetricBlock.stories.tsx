import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MediaTextAsymmetricBlock } from './MediaTextAsymmetricBlock'

const meta: Meta<typeof MediaTextAsymmetricBlock> = {
  component: MediaTextAsymmetricBlock,
  title: 'Blocks/Production/MediaTextAsymmetricBlock',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof MediaTextAsymmetricBlock>

const emphasis = 'ghost' as const
const size = 'feature' as const

export const TextList: Story = {
  args: {
    blockTitle: 'Text list',
    variant: 'textList',
    size,
    emphasis,
    items: [
      { title: 'First item', body: 'Body copy with optional detail.', linkText: 'Learn more', linkUrl: '/' },
      { title: 'Second item', body: 'Another row in the list pattern.' },
    ],
  },
}

export const Paragraphs: Story = {
  args: {
    blockTitle: 'Merged paragraphs',
    variant: 'paragraphs',
    size,
    emphasis,
    paragraphRows: [
      { title: 'Row one', body: 'Paragraph body with optional link below.', linkText: 'Details', linkUrl: '/about' },
      { title: 'Row two', body: 'Second merged paragraph block.' },
    ],
  },
}

export const Faq: Story = {
  args: {
    blockTitle: 'FAQ',
    variant: 'faq',
    size,
    emphasis,
    items: [
      { title: 'What is included?', body: 'Everything you need to get started.' },
      { title: 'How do I upgrade?', body: 'Use the account portal or contact support.' },
    ],
  },
}

export const Links: Story = {
  args: {
    blockTitle: 'Quick links',
    variant: 'links',
    size,
    emphasis,
    items: [
      { subtitle: 'Documentation', linkUrl: '/docs' },
      { subtitle: 'Support centre', linkUrl: '/support' },
    ],
  },
}

export const LongForm: Story = {
  args: {
    blockTitle: 'Long form',
    variant: 'longForm',
    size,
    emphasis,
    longFormParagraphs: [
      { text: 'Opening paragraph with editorial pacing.' },
      { text: 'A second paragraph continues the story.', bodyTypography: 'large' },
    ],
  },
}

export const ImageVariant: Story = {
  args: {
    blockTitle: 'Image + title',
    variant: 'image',
    size,
    emphasis,
    mainImageSrc: '/placeholder-preview.svg',
    imageAspectRatio: '4:5',
    imageAlt: 'Placeholder',
  },
}
