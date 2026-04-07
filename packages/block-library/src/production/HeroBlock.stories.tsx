import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { HeroBlock } from './HeroBlock'

const meta: Meta<typeof HeroBlock> = {
  component: HeroBlock,
  title: 'Blocks/Production/HeroBlock',
}
export default meta

type Story = StoryObj<typeof HeroBlock>

const defaultArgs = {
  eyebrow: 'Product name',
  title: 'Your title here',
  body: 'Supporting text that explains the value proposition.',
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
    emphasis: 'bold',
  },
}

export const StackedGhost: Story = {
  args: {
    ...defaultArgs,
    contentLayout: 'stacked',
    emphasis: 'ghost',
  },
}

export const SideBySide: Story = {
  args: {
    ...defaultArgs,
    contentLayout: 'sideBySide',
    containerLayout: 'edgeToEdge',
    emphasis: 'minimal',
    title: 'Side by side hero',
  },
}

export const TextOnly: Story = {
  args: {
    ...defaultArgs,
    contentLayout: 'textOnly',
    title: 'Text only hero',
  },
}

export const MediaOverlay: Story = {
  args: {
    ...defaultArgs,
    contentLayout: 'mediaOverlay',
    textAlign: 'center',
    title: 'Media overlay hero',
  },
}

export const Category: Story = {
  args: {
    ...defaultArgs,
    contentLayout: 'category',
    containerLayout: 'contained',
    title: 'Category hero',
    body: 'Bold background spans to vertical centre of media.',
  },
}
