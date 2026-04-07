import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { EditorialBlock } from './EditorialBlock'

const meta: Meta<typeof EditorialBlock> = {
  component: EditorialBlock,
  title: 'Blocks/Lab/EditorialBlock',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof EditorialBlock>

const defaultContent = {
  headline: 'Designer-crafted moments',
  body: 'Text and image placed independently on a 12×6 grid. Overlap and composition controlled by placement props.',
  image: '/placeholder-preview.svg',
  ctaText: 'Learn more',
  ctaLink: '#',
}

export const Tension: Story = {
  args: {
    ...defaultContent,
    textTopLeft: { column: 1, row: 2 },
    textBottomRight: { column: 6, row: 4 },
    imageTopLeft: { column: 5, row: 1 },
    imageBottomRight: { column: 12, row: 6 },
    textInFront: false,
    headlineSize: 'display',
    emphasis: 'ghost',
  },
}

export const Offset: Story = {
  args: {
    ...defaultContent,
    textTopLeft: { column: 1, row: 1 },
    textBottomRight: { column: 6, row: 3 },
    imageTopLeft: { column: 5, row: 2 },
    imageBottomRight: { column: 12, row: 6 },
    textInFront: true,
    headlineSize: 'headline',
    emphasis: 'minimal',
    appearance: 'primary',
  },
}

export const TypeDominant: Story = {
  args: {
    ...defaultContent,
    textTopLeft: { column: 1, row: 1 },
    textBottomRight: { column: 9, row: 4 },
    imageTopLeft: { column: 9, row: 2 },
    imageBottomRight: { column: 12, row: 5 },
    textInFront: true,
    headlineSize: 'display',
    emphasis: 'subtle',
    appearance: 'secondary',
  },
}

export const Anchored: Story = {
  args: {
    ...defaultContent,
    textTopLeft: { column: 1, row: 4 },
    textBottomRight: { column: 5, row: 6 },
    imageTopLeft: { column: 4, row: 1 },
    imageBottomRight: { column: 12, row: 5 },
    textInFront: true,
    headlineSize: 'headline',
    textVerticalAlign: 'bottom',
    rows: 8,
    emphasis: 'bold',
    appearance: 'primary',
  },
}

export const CentredSplit: Story = {
  args: {
    ...defaultContent,
    textTopLeft: { column: 1, row: 2 },
    textBottomRight: { column: 6, row: 5 },
    imageTopLeft: { column: 7, row: 1 },
    imageBottomRight: { column: 12, row: 6 },
    textInFront: false,
    headlineSize: 'headline',
    textAlign: 'center',
    textVerticalAlign: 'center',
    emphasis: 'ghost',
  },
}

export const BackgroundPositioned: Story = {
  args: {
    ...defaultContent,
    backgroundImage: '/placeholder-preview.svg',
    backgroundImagePositionX: 30,
    backgroundImagePositionY: 50,
    textTopLeft: { column: 1, row: 2 },
    textBottomRight: { column: 6, row: 4 },
    imageTopLeft: { column: 5, row: 1 },
    imageBottomRight: { column: 12, row: 6 },
    textInFront: true,
    headlineSize: 'display',
    emphasis: 'ghost',
  },
}
