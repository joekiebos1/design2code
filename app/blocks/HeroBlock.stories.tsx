import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { HeroBlock } from './HeroBlock'

const meta: Meta<typeof HeroBlock> = {
  component: HeroBlock,
  title: 'Blocks/Production/HeroBlock',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof HeroBlock>

const defaultArgs = {
  productName: 'Product name',
  headline: 'Your headline here',
  subheadline: 'Supporting text that explains the value proposition.',
  ctaText: 'Get started',
  ctaLink: '/',
  cta2Text: 'Learn more',
  cta2Link: '/about',
  image: '/placeholder-preview.svg',
}

export const Stacked: Story = {
  args: {
    ...defaultArgs,
    contentLayout: 'stacked',
    blockSurface: 'bold',
  },
}

export const StackedGhost: Story = {
  args: {
    ...defaultArgs,
    contentLayout: 'stacked',
    blockSurface: 'ghost',
  },
}

export const SideBySide: Story = {
  args: {
    ...defaultArgs,
    contentLayout: 'sideBySide',
    containerLayout: 'edgeToEdge',
    blockSurface: 'bold',
    headline: 'Side by side hero',
  },
}

export const TextOnly: Story = {
  args: {
    ...defaultArgs,
    contentLayout: 'textOnly',
    headline: 'Text only hero',
  },
}

export const MediaOverlay: Story = {
  args: {
    ...defaultArgs,
    contentLayout: 'mediaOverlay',
    textAlign: 'center',
    headline: 'Media overlay hero',
  },
}

export const Category: Story = {
  args: {
    ...defaultArgs,
    contentLayout: 'category',
    containerLayout: 'contained',
    headline: 'Category hero',
    subheadline: 'Bold background spans to vertical centre of media.',
  },
}
