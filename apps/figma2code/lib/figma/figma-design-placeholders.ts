import type { FigmaMappedSanityBlockType } from './figma-block-map'
import type { FigmaImportedContent } from './figma-import-types'

type ImageRef = { _type: 'image'; asset: { _type: 'reference'; _ref: string } }

export type FigmaDesignPlaceholderCtx = {
  assetId: string
  imageRef: (id: string) => ImageRef
  newKey: () => string
}

const DS = {
  theme: 'MyJio' as const,
  emphasis: 'minimal' as const,
  appearance: 'primary' as const,
}

/**
 * Merge Figma-derived `{ _type, …variant }` with minimal valid fields so Sanity accepts the document.
 * Authors replace placeholder copy and media from the design.
 * Pass `imported` when text was extracted from the Figma REST API.
 */
export function expandFigmaSectionForSanity(
  shape: { _type: FigmaMappedSanityBlockType } & Record<string, unknown>,
  sectionKey: string,
  ctx: FigmaDesignPlaceholderCtx,
  imported?: FigmaImportedContent,
): Record<string, unknown> {
  const img = ctx.imageRef(ctx.assetId)
  const k = ctx.newKey

  switch (shape._type) {
    case 'hero': {
      const contentLayout = (shape.contentLayout as string | undefined) ?? 'stacked'
      const h = imported?.hero
      return {
        ...shape,
        _type: 'hero',
        _key: sectionKey,
        spacingBottom: 'large',
        title: h?.title ?? 'Title',
        ...(h?.eyebrow != null && h.eyebrow !== '' ? { eyebrow: h.eyebrow } : {}),
        ...(h?.body != null && h.body !== '' ? { body: h.body } : {}),
        ...(h?.ctaText != null && h.ctaText !== '' ? { ctaText: h.ctaText } : {}),
        ...(h?.cta2Text != null && h.cta2Text !== '' ? { cta2Text: h.cta2Text } : {}),
        theme: DS.theme,
        ...(contentLayout === 'category' || contentLayout === 'mediaOverlay'
          ? {}
          : { emphasis: DS.emphasis, appearance: DS.appearance }),
      }
    }
    case 'carousel': {
      const c = imported?.carousel
      const cardData = c?.items?.length ? c.items : [{ title: 'Card title', description: 'Replace with Figma content.' }]
      const eyebrow = c?.eyebrow?.trim()
      const mainTitle = c?.title?.trim()
      const sectionTitle =
        eyebrow && mainTitle
          ? `${eyebrow}\n${mainTitle}`
          : mainTitle || eyebrow || 'Carousel'
      const cardTypeFor = (it: (typeof cardData)[0]) =>
        it.cardType === 'colourFeatured' ? ('colourFeatured' as const) : ('mediaTextBelow' as const)
      return {
        ...shape,
        _type: 'carousel',
        _key: sectionKey,
        spacingTop: 'large',
        spacingBottom: 'large',
        title: sectionTitle,
        ...(c?.description != null && String(c.description).trim() !== ''
          ? { description: c.description }
          : {}),
        ...(c?.cardSize ? { cardSize: c.cardSize } : {}),
        ...(c?.callToActions?.length
          ? {
              callToActions: c.callToActions.map((a) => ({
                _key: k(),
                label: a.label,
                ...(a.link ? { link: a.link } : {}),
                style: 'filled' as const,
              })),
            }
          : {}),
        theme: DS.theme,
        emphasis: DS.emphasis,
        appearance: DS.appearance,
        items: cardData.map((it) => ({
          _type: 'cardItem' as const,
          _key: k(),
          cardType: cardTypeFor(it),
          ...(it.aspectRatio ? { aspectRatio: it.aspectRatio } : {}),
          title: it.title,
          description: it.description ?? '',
          ...(cardTypeFor(it) === 'colourFeatured'
            ? { backgroundColor: (it as { backgroundColor?: string }).backgroundColor ?? 'primary-bold' }
            : { image: img }),
          ...(it.ctaText ? { ctaText: it.ctaText } : {}),
          ...(it.link ? { link: it.link } : {}),
        })),
      }
    }
    case 'mediaText5050': {
      const variant = (shape.variant as string | undefined) ?? 'paragraphs'
      const m = imported?.mediaText5050
      const defaultItems = [
        {
          _type: 'mediaText5050Item' as const,
          _key: k(),
          subtitle: 'Section title',
          body: 'Body — replace from design.',
        },
      ]
      const paragraphItems =
        m?.items?.length && variant === 'paragraphs'
          ? m.items.map((it) => ({
              _type: 'mediaText5050Item' as const,
              _key: k(),
              subtitle: it.subtitle ?? 'Section title',
              body: it.body ?? '',
            }))
          : defaultItems
      const accordionItems =
        m?.items?.length && variant === 'accordion'
          ? m.items.map((it) => ({
              _type: 'mediaText5050AccordionItem' as const,
              _key: k(),
              subtitle: it.subtitle ?? 'Panel title',
              body: it.body ?? '',
              image: img,
            }))
          : [
              {
                _type: 'mediaText5050AccordionItem' as const,
                _key: k(),
                subtitle: 'Panel title',
                body: 'Panel body — replace from design.',
                image: img,
              },
            ]
      return {
        ...shape,
        _type: 'mediaText5050',
        _key: sectionKey,
        variant,
        ...(variant === 'paragraphs' ? { paragraphColumnLayout: 'multi' as const } : {}),
        spacingTop: 'large',
        spacingBottom: 'large',
        headline: m?.headline ?? 'Media + text',
        theme: DS.theme,
        emphasis: DS.emphasis,
        appearance: DS.appearance,
        imageAspectRatio: '5:4',
        ...(variant === 'paragraphs'
          ? {
              items: paragraphItems,
              image: img,
            }
          : {
              accordionItems,
            }),
      }
    }
    case 'mediaTextStacked': {
      const template = (shape.template as string | undefined) ?? 'stacked'
      return {
        ...shape,
        _type: 'mediaTextStacked',
        _key: sectionKey,
        template,
        spacingTop: 'large',
        spacingBottom: 'large',
        title: 'Title',
        body: 'Body — replace from design.',
        theme: DS.theme,
        emphasis: DS.emphasis,
        appearance: DS.appearance,
        ...(template === 'textOnly'
          ? { alignment: 'left' }
          : {
              mediaSize: 'default',
              alignment: 'left',
              image: img,
            }),
      }
    }
    case 'cardGrid': {
      return {
        ...shape,
        _type: 'cardGrid',
        _key: sectionKey,
        columns: (shape.columns as string | undefined) ?? '3',
        spacingTop: 'large',
        spacingBottom: 'large',
        title: 'Card grid',
        theme: DS.theme,
        emphasis: DS.emphasis,
        appearance: DS.appearance,
        items: [
          {
            _type: 'cardGridItem',
            _key: k(),
            cardType: 'mediaTextBelow',
            title: 'Card title',
            description: 'Description — replace from design.',
            image: img,
          },
        ],
      }
    }
    case 'proofPoints': {
      return {
        ...shape,
        _type: 'proofPoints',
        _key: sectionKey,
        spacingTop: 'large',
        spacingBottom: 'large',
        title: 'Proof points',
        theme: DS.theme,
        emphasis: DS.emphasis,
        appearance: DS.appearance,
        items: [
          {
            _key: k(),
            title: 'Point one',
            description: 'Supporting line',
            icon: 'IcCheckboxOn',
          },
        ],
      }
    }
    case 'iconGrid': {
      return {
        ...shape,
        _type: 'iconGrid',
        _key: sectionKey,
        spacingTop: 'large',
        spacingBottom: 'large',
        theme: DS.theme,
        emphasis: DS.emphasis,
        appearance: DS.appearance,
        items: [
          {
            _type: 'iconGridItem',
            _key: k(),
            title: 'Item title',
            body: 'Short body — replace from design.',
            icon: 'IcGlobe',
            accentColor: 'primary',
          },
        ],
      }
    }
    case 'mediaTextAsymmetric': {
      const variant = (shape.variant as string | undefined) ?? 'paragraphs'
      const base = {
        ...shape,
        _type: 'mediaTextAsymmetric',
        _key: sectionKey,
        variant,
        blockTitle: 'Block title',
        spacingTop: 'large',
        spacingBottom: 'large',
        theme: DS.theme,
        emphasis: DS.emphasis,
        appearance: DS.appearance,
      }
      if (variant === 'paragraphs') {
        return {
          ...base,
          paragraphRows: [
            {
              _type: 'mediaTextAsymmetricParagraphRow',
              _key: k(),
              body: 'Paragraph — replace from design.',
              bodyTypography: 'regular',
            },
          ],
        }
      }
      if (variant === 'longForm') {
        return {
          ...base,
          longFormParagraphs: [
            {
              _type: 'mediaTextAsymmetricParagraph',
              _key: k(),
              text: 'Long-form paragraph — replace from design.',
              bodyTypography: 'regular',
            },
          ],
        }
      }
      if (variant === 'image') {
        return {
          ...base,
          imageAspectRatio: '4:5',
          image: img,
          imageAlt: 'Describe image from Figma',
        }
      }
      return {
        ...base,
        items: [
          {
            _type: 'mediaTextAsymmetricItem',
            _key: k(),
            title: 'Item title',
            body: 'Item body — replace from design.',
          },
        ],
      }
    }
  }
  const _exhaustive: never = shape._type
  throw new Error(`Unhandled block type: ${String(_exhaustive)}`)
}
