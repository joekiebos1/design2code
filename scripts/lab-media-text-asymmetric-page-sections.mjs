/**
 * Lab block page: /lab/media-text-asymmetric
 * Variants: paragraphs (+ continuation), FAQ, links, image (portrait + landscape).
 */

/** @param {(i: number) => string | null} getAsset @param {(id: string | null) => object | undefined} imageRef */
export function buildMediaTextAsymmetricLabPageSections(getAsset, imageRef) {
  const img = (i) => imageRef(getAsset(i))

  return [
    {
      _type: 'mediaTextStacked',
      _key: 'mta-lab-intro',
      template: 'TextOnly',
      alignment: 'center',
      emphasis: 'ghost',
      surfaceColour: 'primary',
      spacingTop: 'large',
      spacingBottom: 'medium',
      title: 'Media + Text Asymmetric (Lab)',
      body: 'Patterns below: single-column paragraphs, multi-section paragraphs (with continuation), FAQ accordion, link list, and image column (two aspect ratios). Open Sanity → Lab block page → Media + Text Asymmetric to edit.',
    },
    {
      _type: 'labMediaTextAsymmetric',
      _key: 'mta-paragraphs-single',
      blockTitle: 'Single column',
      variant: 'paragraphs',
      paragraphLayout: 'single',
      emphasis: 'minimal',
      surfaceColour: 'secondary',
      spacingTop: 'medium',
      spacingBottom: 'large',
      singleColumnBody:
        'Choose Single in Paragraph layout for one main text column without per-section titles. Use Multi when you need repeated section title + body blocks with the same typography throughout.',
    },
    {
      _type: 'labMediaTextAsymmetric',
      _key: 'mta-paragraphs',
      blockTitle: 'Multi — sections',
      variant: 'paragraphs',
      paragraphLayout: 'multi',
      emphasis: 'minimal',
      surfaceColour: 'secondary',
      spacingTop: 'medium',
      spacingBottom: 'large',
      paragraphRows: [
        {
          _type: 'labMediaTextAsymmetricParagraphRow',
          _key: 'p1',
          title: 'First section',
          body: 'Multi layout: optional section titles use one style; body text uses one style for every row. Optional text links are supported per section.',
          linkText: 'Example link',
          linkUrl: '#',
        },
        {
          _type: 'labMediaTextAsymmetricParagraphRow',
          _key: 'p2',
          title: 'Second section',
          body: 'The next block has no rail title—it continues under this same left label, which is the recommended way to split a long story without repeating the heading.',
          linkText: 'Read more',
          linkUrl: '#',
        },
      ],
    },
    {
      _type: 'labMediaTextAsymmetric',
      _key: 'mta-paragraphs-cont',
      variant: 'paragraphs',
      paragraphLayout: 'multi',
      emphasis: 'minimal',
      surfaceColour: 'secondary',
      spacingTop: 'none',
      spacingBottom: 'large',
      paragraphRows: [
        {
          _type: 'labMediaTextAsymmetricParagraphRow',
          _key: 'pc1',
          title: 'Continuation row',
          body: 'This block intentionally leaves Rail title empty so copy flows in one column under “Multi — sections”. Pair spacing: Padding above = none.',
        },
      ],
    },
    {
      _type: 'labMediaTextAsymmetric',
      _key: 'mta-faq',
      blockTitle: 'FAQ · accordion',
      variant: 'faq',
      emphasis: 'subtle',
      surfaceColour: 'primary',
      spacingTop: 'large',
      spacingBottom: 'large',
      items: [
        {
          _type: 'mediaTextAsymmetricItem',
          _key: 'fq1',
          title: 'When does accordion vs paragraphs?',
          body: 'Choose FAQ when each item is a short question and a supporting answer. Use paragraphs when you want free-form sections and optional inline links.',
        },
        {
          _type: 'mediaTextAsymmetricItem',
          _key: 'fq2',
          title: 'Can the rail title stay empty?',
          body: 'Yes. Omit the rail title on follow-up blocks so the layout continues the previous column title—useful for long reads split across multiple Sanity entries.',
        },
        {
          _type: 'mediaTextAsymmetricItem',
          _key: 'fq3',
          title: 'Which surfaces work best?',
          body: 'Ghost and minimal suit dense text; subtle and bold add band emphasis. Match neighbouring blocks for rhythm.',
        },
      ],
    },
    {
      _type: 'labMediaTextAsymmetric',
      _key: 'mta-links',
      blockTitle: 'Links pattern',
      variant: 'links',
      emphasis: 'ghost',
      surfaceColour: 'neutral',
      spacingTop: 'large',
      spacingBottom: 'large',
      items: [
        { _type: 'mediaTextAsymmetricItem', _key: 'lk1', subtitle: 'Lab: Hero', linkUrl: '/lab/hero' },
        { _type: 'mediaTextAsymmetricItem', _key: 'lk2', subtitle: 'Lab: Media + Text 50/50', linkUrl: '/lab/media-text-5050' },
        { _type: 'mediaTextAsymmetricItem', _key: 'lk3', subtitle: 'Lab: Card grid', linkUrl: '/lab/card-grid' },
        { _type: 'mediaTextAsymmetricItem', _key: 'lk4', subtitle: 'Lab: Proof points', linkUrl: '/lab/proof-points' },
      ],
    },
    {
      _type: 'labMediaTextAsymmetric',
      _key: 'mta-image-portrait',
      blockTitle: 'Image · 4:5',
      variant: 'image',
      imageAspectRatio: '4:5',
      image: img(0),
      imageAlt: 'Lab demo — portrait asymmetric image',
      emphasis: 'minimal',
      surfaceColour: 'primary',
      spacingTop: 'large',
      spacingBottom: 'large',
    },
    {
      _type: 'labMediaTextAsymmetric',
      _key: 'mta-image-landscape',
      blockTitle: 'Image · 5:4',
      variant: 'image',
      imageAspectRatio: '5:4',
      image: img(1),
      imageAlt: 'Lab demo — landscape asymmetric image',
      emphasis: 'ghost',
      surfaceColour: 'secondary',
      spacingTop: 'large',
      spacingBottom: 'large',
    },
  ]
}
