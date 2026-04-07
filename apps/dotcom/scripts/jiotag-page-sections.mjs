/**
 * JioTag product page — 14 `pageBuilder` sections (Figma JioTag – Go | Air).
 * Imagery: pass `imageRef(getAsset(n))` from seed; authors replace in Studio.
 */

const CARD_BELOW = 'mediaTextBelow'

/** @param {(i: number) => string | null} getAsset @param {(id: string | null) => object | undefined} imageRef */
export function buildJioTagPageSections(getAsset, imageRef) {
  const img = (i) => imageRef(getAsset(i))

  const shopCta = (key) => ({
    _key: key,
    label: 'Start shopping',
    link: 'https://www.jiomart.com/',
    style: 'outlined',
  })

  return [
    // 1 — Hero · Stacked
    {
      _type: 'hero',
      _key: 'jiotag-hero',
      contentLayout: 'stacked',
      emphasis: 'minimal',
      appearance: 'primary',
      spacingBottom: 'large',
      eyebrow: 'JioTag',
      title: 'Keep Track of What Matters',
      ctaText: 'Shop on JioMart',
      ctaLink: 'https://www.jiomart.com/',
      image: img(0),
    },
    // 2 — Media + Text: Stacked (merged intro + Universal Tracking band)
    {
      _type: 'mediaTextStacked',
      _key: 'jiotag-intro-tracking',
      template: 'stacked',
      alignment: 'center',
      mediaSize: 'default',
      emphasis: 'ghost',
      appearance: 'primary',
      spacingTop: 'large',
      spacingBottom: 'large',
      title: 'Universal Tracking for Everyday Belongings',
      body: 'Know where your keys, bag, and everyday essentials are—with reliable alerts and a calm, straightforward experience that stays out of your way.',
      ctaText: 'Start shopping',
      ctaLink: 'https://www.jiomart.com/',
      image: img(1),
    },
    // 3 — Proof points (holiday / use-case band)
    {
      _type: 'proofPoints',
      _key: 'jiotag-use-cases',
      variant: 'icon',
      emphasis: 'minimal',
      appearance: 'primary',
      spacingTop: 'large',
      spacingBottom: 'large',
      title: 'Get ready for the holidays with MyJio',
      description: 'Pick the JioTag that fits how you move—at home, on the road, or across a busy household.',
      callToActions: [
        { _key: 'know-more', label: 'Know more', link: 'https://www.jio.com/', style: 'outlined' },
      ],
      items: [
        {
          _key: 'uc-1',
          title: 'Everyday essentials',
          description: 'Keys, wallets, and the small things you reach for every morning—found fast when they slip under a cushion or into a tote.',
          icon: 'IcShoppingBag',
        },
        {
          _key: 'uc-2',
          title: 'Family & shared items',
          description: 'One tag per person, or shared items everyone borrows—so school bags, umbrellas, and chargers do not vanish without a trace.',
          icon: 'IcHome',
        },
        {
          _key: 'uc-3',
          title: 'Travel & luggage',
          description: 'Check tags before you leave the hotel, the cab, or the carousel—especially when connections are tight and every minute counts.',
          icon: 'IcGlobe',
        },
        {
          _key: 'uc-4',
          title: 'Mixed-device households',
          description: 'Android and iPhone in the same home—pair the right JioTag to the right network so everyone sees what they need on their phone.',
          icon: 'IcWifiNetwork',
        },
      ],
    },
    // 4 — Card grid · 3 columns
    {
      _type: 'cardGrid',
      _key: 'jiotag-alerts',
      columns: '3',
      title: 'Reliable Alerts & Easy Recovery',
      emphasis: 'ghost',
      appearance: 'primary',
      spacingTop: 'large',
      spacingBottom: 'large',
      items: [
        {
          _type: 'cardGridItem',
          _key: 'alert-1',
          cardType: CARD_BELOW,
          title: 'Notifications you can trust',
          description: 'Get nudges when your item moves out of range or when the network spots it—without drowning in noise.',
          image: img(2),
        },
        {
          _type: 'cardGridItem',
          _key: 'alert-2',
          cardType: CARD_BELOW,
          title: 'Guided recovery',
          description: 'Lean on familiar Find My and Find My Device flows so the path back to your item feels obvious, not technical.',
          image: img(3),
        },
        {
          _type: 'cardGridItem',
          _key: 'alert-3',
          cardType: CARD_BELOW,
          title: 'Built for real life',
          description: 'Small enough for a keyring or luggage tag, tough enough for daily commutes, school runs, and baggage holds.',
          image: img(4),
        },
      ],
    },
    // 5 — Media + Text: Stacked · Text only (display title)
    {
      _type: 'mediaTextStacked',
      _key: 'jiotag-title-battery',
      template: 'textOnly',
      alignment: 'center',
      emphasis: 'ghost',
      appearance: 'primary',
      spacingTop: 'large',
      spacingBottom: 'none',
      title: 'Long Battery Life & Low Maintenance',
    },
    // 6 — Media + Text: 50/50 · image left
    {
      _type: 'mediaText5050',
      _key: 'jiotag-battery',
      variant: 'paragraphs',
      imagePosition: 'left',
      emphasis: 'minimal',
      appearance: 'primary',
      spacingTop: 'none',
      spacingBottom: 'large',
      callToActions: [shopCta('cta-battery')],
      items: [
        {
          _key: 'bat-1',
          subtitle: 'Weeks of calm, not days of anxiety.',
          body: 'Power-stingy Bluetooth and community networks keep JioTag useful for longer stretches between attention—so you are not recharging another gadget every night.',
        },
      ],
      image: img(5),
    },
    // 7 — Media + Text: 50/50 · image right
    {
      _type: 'mediaText5050',
      _key: 'jiotag-lightweight',
      variant: 'paragraphs',
      imagePosition: 'right',
      emphasis: 'ghost',
      appearance: 'primary',
      spacingTop: 'large',
      spacingBottom: 'large',
      callToActions: [shopCta('cta-lightweight')],
      items: [
        {
          _key: 'lw-1',
          subtitle: 'Lightweight & discreet',
          body: 'Slide it on a keyring, tuck it in a pocket, or keep it on luggage—it stays noticeable to you, not to everyone else.',
        },
      ],
      image: img(6),
    },
    // 8 — Media + Text: Stacked · Text only
    {
      _type: 'mediaTextStacked',
      _key: 'jiotag-title-effortless',
      template: 'textOnly',
      alignment: 'center',
      emphasis: 'ghost',
      appearance: 'primary',
      spacingTop: 'large',
      spacingBottom: 'none',
      title: 'Effortless Setup That Works Across Your Devices',
    },
    // 9 — Media + Text: 50/50 · image left
    {
      _type: 'mediaText5050',
      _key: 'jiotag-ecosystem',
      variant: 'paragraphs',
      imagePosition: 'left',
      emphasis: 'minimal',
      appearance: 'primary',
      spacingTop: 'none',
      spacingBottom: 'large',
      callToActions: [shopCta('cta-ecosystem')],
      items: [
        {
          _key: 'eco-1',
          subtitle: 'Works with your ecosystem — Android and iOS',
          body: 'JioTag Go taps into Google’s Find My Device network on Android, while JioTag Air connects to Apple’s Find My network for global, beyond-Bluetooth tracking on iPhone, iPad, and Mac.',
        },
      ],
      image: img(7),
    },
    // 10 — Media + Text: 50/50 · image right (block headline = display line from Figma)
    {
      _type: 'mediaText5050',
      _key: 'jiotag-no-sim',
      variant: 'paragraphs',
      imagePosition: 'right',
      emphasis: 'ghost',
      appearance: 'primary',
      spacingTop: 'large',
      spacingBottom: 'large',
      headline: 'Get ready for the holidays with MyJio',
      callToActions: [shopCta('cta-nosim')],
      items: [
        {
          _key: 'ns-1',
          subtitle: 'No SIM or Subscription Needed',
          body: 'Uses Bluetooth and community networks with no SIM or subscription — just pair it once and it quietly tracks in the background with minimal upkeep.',
        },
      ],
      image: img(8),
    },
    // 11 — Proof points · colours / reasons to believe
    {
      _type: 'proofPoints',
      _key: 'jiotag-colours',
      variant: 'icon',
      emphasis: 'minimal',
      appearance: 'secondary',
      spacingTop: 'large',
      spacingBottom: 'large',
      title: 'Available in beautiful colours.',
      description: 'Choose a finish that matches your keys, bag, or travel kit.',
      items: [
        { _key: 'col-1', title: 'Distinct colourways', description: 'Easy to spot in a drawer or on a hotel desk.', icon: 'IcCheckboxOn' },
        { _key: 'col-2', title: 'Matte, lived-in finish', description: 'Designed to look good after months of daily carry.', icon: 'IcStar' },
        { _key: 'col-3', title: 'Mix and match', description: 'Colour-code family tags so everyone knows which is whose.', icon: 'IcHealthy' },
      ],
    },
    // 12 — Card grid · 3 columns, two cards
    {
      _type: 'cardGrid',
      _key: 'jiotag-commerce',
      columns: '3',
      title: '',
      emphasis: 'ghost',
      appearance: 'primary',
      spacingTop: 'large',
      spacingBottom: 'large',
      items: [
        {
          _type: 'cardGridItem',
          _key: 'com-1',
          cardType: CARD_BELOW,
          title: 'Shop from JioMart',
          description:
            'The JioTag line is available at your favourite online retailer — JioMart. Browse models, bundles, and delivery options in one place.',
          image: img(9),
          ctaText: 'Visit JioMart',
          ctaLink: 'https://www.jiomart.com/',
        },
        {
          _type: 'cardGridItem',
          _key: 'com-2',
          cardType: CARD_BELOW,
          title: 'Free and fast delivery',
          description: 'JioMart delivers quickly to your door, with straightforward tracking on qualifying orders—check product pages for the latest offer details.',
          image: img(10),
        },
      ],
    },
    // 13 — Media + Text: Asymmetric · FAQ
    {
      _type: 'mediaTextAsymmetric',
      _key: 'jiotag-faq',
      variant: 'faq',
      emphasis: 'minimal',
      appearance: 'primary',
      spacingTop: 'large',
      spacingBottom: 'large',
      blockTitle: 'Questions, answered',
      items: [
        {
          _type: 'mediaTextAsymmetricItem',
          _key: 'faq-1',
          title: 'Which JioTag do I need — Go or Air?',
          body: 'JioTag Go is built for Android phones and tablets using Google’s Find My Device network. JioTag Air is for iPhone, iPad, and Mac on Apple’s Find My network. Pick the one that matches the phone you carry every day.',
        },
        {
          _type: 'mediaTextAsymmetricItem',
          _key: 'faq-2',
          title: 'Do I need a SIM or a monthly plan?',
          body: 'No. JioTag uses Bluetooth plus the relevant finder network. There is no separate SIM or subscription to manage for core tracking—just pair once in the MyJio or compatible app flow.',
        },
        {
          _type: 'mediaTextAsymmetricItem',
          _key: 'faq-3',
          title: 'How private is community finding?',
          body: 'Location is relayed through encrypted, rotating identifiers on the finder network. You see your item; other people do not see your identity in the exchange. Exact behaviour follows Google and Apple’s network policies.',
        },
        {
          _type: 'mediaTextAsymmetricItem',
          _key: 'faq-4',
          title: 'What is the battery life like?',
          body: 'Battery life depends on how often the tag connects and how often it is played to ring. Under typical use you should expect longer stretches between replacements than daily-charge gadgets—check in-box guidance for your model.',
        },
      ],
    },
    // 14 — Card grid · 2 columns
    {
      _type: 'cardGrid',
      _key: 'jiotag-compare',
      columns: '2',
      title: 'Pick your JioTag',
      emphasis: 'ghost',
      appearance: 'primary',
      spacingTop: 'large',
      spacingBottom: 'large',
      items: [
        {
          _type: 'cardGridItem',
          _key: 'cmp-go',
          cardType: CARD_BELOW,
          title: 'JioTag Go',
          description: 'For Android. Uses Google’s Find My Device network for beyond-Bluetooth locating where supported.',
          image: img(11),
          ctaText: 'Shop JioTag Go',
          ctaLink: 'https://www.jiomart.com/',
        },
        {
          _type: 'cardGridItem',
          _key: 'cmp-air',
          cardType: CARD_BELOW,
          title: 'JioTag Air',
          description: 'For iPhone, iPad, and Mac. Works with Apple’s Find My network—pair once and track from the Find My app.',
          image: img(12),
          ctaText: 'Shop JioTag Air',
          ctaLink: 'https://www.jiomart.com/',
        },
      ],
    },
  ]
}
