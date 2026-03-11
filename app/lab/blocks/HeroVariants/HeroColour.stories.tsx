import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { HeroColour } from './HeroColour'

const meta: Meta<typeof HeroColour> = {
  component: HeroColour,
  title: 'Blocks/Lab/HeroColour',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof HeroColour>

const defaultArgs = {
  productName: 'Product',
  headline: 'Designed for the way you live.',
  subheadline: 'Clean lines. Thoughtful details. Built to last.',
  ctaText: 'Shop now',
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
    blockAccent: 'primary',
  },
}

export const SideBySideEdgeToEdge: Story = {
  args: {
    ...defaultArgs,
    contentLayout: 'sideBySide',
    containerLayout: 'edgeToEdge',
    imageAnchor: 'center',
    blockSurface: 'bold',
    blockAccent: 'primary',
  },
}

export const SideBySideEdgeToEdgeImageBottom: Story = {
  args: {
    ...defaultArgs,
    contentLayout: 'sideBySide',
    containerLayout: 'edgeToEdge',
    imageAnchor: 'bottom',
    blockSurface: 'bold',
  },
}

export const SideBySideContained: Story = {
  args: {
    ...defaultArgs,
    contentLayout: 'sideBySide',
    containerLayout: 'contained',
    blockSurface: 'subtle',
    blockAccent: 'primary',
  },
}

export const MediaOverlayLeft: Story = {
  args: {
    ...defaultArgs,
    contentLayout: 'mediaOverlay',
    textAlign: 'left',
    blockAccent: 'primary',
  },
}

export const MediaOverlayCenter: Story = {
  args: {
    ...defaultArgs,
    contentLayout: 'mediaOverlay',
    textAlign: 'center',
    blockAccent: 'primary',
  },
}
