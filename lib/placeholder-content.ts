/**
 * Predefined sample content per Block type.
 * Used by "Fill with sample" button in Sanity Studio to test Block rendering.
 */

export const PLACEHOLDER_CONTENT = {
  hero: {
    headline: 'Transform your workflow',
    subheadline:
      'Discover how our platform helps teams ship faster and collaborate better.',
    ctaText: 'Get started',
    ctaLink: '/signup',
  },
  cardGrid: {
    columns: '3',
    title: 'Why choose us',
    titleLevel: 'h2',
    items: [
      { cardStyle: 'image-above', title: 'Fast', description: 'Built for speed. Deploy in seconds, not minutes.' },
      { cardStyle: 'text-on-colour', title: 'Reliable', description: 'Uptime you can count on.', surface: 'bold' },
      { cardStyle: 'text-on-image', title: 'Secure', description: 'Enterprise-grade security.', surface: 'bold' },
    ],
  },
  mediaTextBlock: {
    eyebrow: 'MOBILE GAMES',
    title: 'Free to play and install in the JioGames app.',
    titleLevel: 'h2',
    body: 'The Home tab is your all-in-one destination for getting back into the games you love. Browse trending titles, pick up where you left off, and discover new favorites—all in one place.',
    ctaText: 'Visit JioGames',
    ctaLink: '/games',
    template: 'SideBySide',
    spacing: 'large',
    contentWidth: 'Default',
    imagePosition: 'left',
    imageAspectRatio: '4:3',
  },
  fullBleedVerticalCarousel: {
    items: [
      {
        title: 'First story',
        description:
          'Add an image or video in Sanity Studio. This text will scroll from bottom to top as you scroll through the carousel.',
      },
      {
        title: 'Second story',
        description:
          'Each item gets its own full-bleed media and text overlay. The stepper on the right shows your progress.',
      },
    ],
  },
  proofPoints: {
    title: 'Why believe us',
    items: [
      { title: 'Trusted by millions', description: 'Join 10M+ satisfied customers', icon: 'IcCheckboxOn' },
      { title: 'Award-winning', description: 'Industry recognition for excellence', icon: 'IcAward' },
      { title: '24/7 support', description: 'We\'re here when you need us', icon: 'IcProtection' },
    ],
  },
  carousel: {
    title: 'Featured',
    items: [
      { title: 'Card one', description: 'Add an image in Sanity Studio.', aspectRatio: '4:5' },
      { title: 'Card two', description: 'Edit content in the properties panel.', aspectRatio: '4:5' },
      { title: 'Card three', description: 'Or use the chat to generate blocks.', aspectRatio: '4:5' },
    ],
  },
} as const
