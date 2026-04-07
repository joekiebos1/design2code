/**
 * Mock data for Lab block experiments.
 * Uses local placeholder from Image Library. Replace with real content when promoting blocks.
 */

const PLACEHOLDER_IMAGE = '/placeholder-preview.svg'

export const mockFullBleedVerticalCarousel = {
  surface: 'ghost' as const,
  items: [
    {
      title: 'First story',
      description:
        'Add an image or video in Sanity Studio. This text will scroll from bottom to top as you scroll through the carousel.',
      image: PLACEHOLDER_IMAGE,
    },
    {
      title: 'Second story',
      description:
        'Each item gets its own full-bleed media and text overlay. The stepper on the right shows your progress.',
      image: PLACEHOLDER_IMAGE,
    },
  ],
}

export const mockRotatingMedia = {
  variant: 'small' as const,
  surface: 'ghost' as const,
  items: [
    { image: PLACEHOLDER_IMAGE, title: 'Card 1', label: 'Label 1' },
    { image: PLACEHOLDER_IMAGE, title: 'Card 2', label: 'Label 2' },
    { image: PLACEHOLDER_IMAGE, title: 'Card 3', label: 'Label 3' },
    { image: PLACEHOLDER_IMAGE, title: 'Card 4', label: 'Label 4' },
    { image: PLACEHOLDER_IMAGE, title: 'Card 5', label: 'Label 5' },
    { image: PLACEHOLDER_IMAGE, title: 'Card 6', label: 'Label 6' },
  ],
}

export const mockMediaZoomOutOnScroll = {
  image: PLACEHOLDER_IMAGE,
  alt: 'Media zoom out on scroll demo',
}

export const mockHero = {
  eyebrow: 'Product Name',
  title: 'Designed for the way you live.',
  body: 'Clean lines. Thoughtful details. Built to last.',
  ctaText: 'Shop now',
  ctaLink: '#',
  cta2Text: 'Learn more',
  cta2Link: '#',
  image: PLACEHOLDER_IMAGE,
  imagePosition: 'right' as const,
}

