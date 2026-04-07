/**
 * Shared mapping from CMS block shapes → MediaTextBlock / MediaText5050 props.
 * Used by BlockRenderer and LabBlockRenderer.
 */

import type {
  MediaTextBlockProps,
  MediaText5050BlockProps,
  MediaTextAsymmetricBlockProps,
} from '../production'
import type { ImageSlotState } from './image-slot-state'

export type BlockLike = Record<string, unknown>

export type BlockSpacingValue = 'none' | 'medium' | 'large'

/** Normalize spacing: none, medium, large. Backwards compat: small -> none. */
export function normalizeBlockSpacing(v: unknown): BlockSpacingValue {
  const s = (v as string)?.toLowerCase?.()
  if (s === 'small') return 'none'
  if (s === 'none' || s === 'medium' || s === 'large') return s
  return 'large'
}

/** Map mediaText5050 block to items array. Supports items + legacy shapes. */
export function mapMediaText5050Items(block: BlockLike): { subtitle?: string; body?: string }[] {
  const items = Array.isArray(block.items)
    ? (block.items as { subtitle?: string; body?: string }[]).map((i) => ({
        subtitle: (i.subtitle as string) ?? '',
        body: (i.body as string) ?? '',
      }))
    : []
  if (items.length > 0) return items
  const headline = block.headline as string | undefined
  const body = block.body as string | undefined
  if (block.variant === 'singleParagraph' && (headline || body)) {
    return [{ subtitle: headline ?? '', body: body ?? '' }]
  }
  const accordionItems = Array.isArray(block.accordionItems)
    ? (block.accordionItems as { title?: string; body?: string }[]).map((i) => ({
        subtitle: (i.title as string) ?? '',
        body: (i.body as string) ?? '',
      }))
    : []
  if (accordionItems.length > 0) return accordionItems
  const paragraphItems = Array.isArray(block.paragraphItems)
    ? (block.paragraphItems as { headline?: string; body?: string }[]).map((i) => ({
        subtitle: (i.headline as string) ?? '',
        body: (i.body as string) ?? '',
      }))
    : []
  return paragraphItems
}

export function mapMediaTextBlock(block: BlockLike): MediaTextBlockProps {
  const rawTemplate = block.template as string
  const template =
    rawTemplate === 'SideBySide' || rawTemplate === 'sideBySide'
      ? 'stacked'
      : rawTemplate === 'MediaOverlay'
        ? 'overlay'
        : (rawTemplate ?? 'stacked')
  const imageAspectRatio = '2:1'

  const variantMap: Record<string, MediaTextBlockProps['variant']> = {
    overlay: 'full-bleed',
    stacked: 'centered-media-below',
    textOnly: 'text-only',
  }
  const variant = variantMap[template] ?? 'centered-media-below'

  const aspectRatioMap: Record<string, NonNullable<MediaTextBlockProps['media']>['aspectRatio']> = {
    '16:7': '16:9',
    '21:9': '16:9',
    '16:9': '16:9',
    '4:3': '4:3',
    '3:4': '3:4',
    '1:1': '1:1',
    '2:1': '2:1' as const,
  }
  const aspectRatio = aspectRatioMap[imageAspectRatio]

  const imageUrl = block.image as string | undefined
  const videoUrl = block.video as string | undefined
  const hasVideo = videoUrl && typeof videoUrl === 'string' && videoUrl.trim() !== ''
  const hasImage = imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== ''
  const media =
    hasVideo
      ? { type: 'video' as const, src: videoUrl!, poster: hasImage ? imageUrl : undefined, alt: '', aspectRatio }
      : hasImage
        ? { type: 'image' as const, src: imageUrl!, alt: '', aspectRatio }
        : undefined

  const rawAlign = (() => {
    const a = block.alignment as string
    if (a) return a
    if (template === 'textOnly') return block.textOnlyAlignment as string
    if (template === 'stacked') return block.stackAlignment as string
    if (template === 'overlay') return block.overlayAlignment as string
    return block.align as string
  })()
  const alignSource =
    rawAlign?.toLowerCase() === 'center'
      ? 'center'
      : rawAlign?.toLowerCase() === 'left'
        ? 'left'
        : undefined

  const mediaSize = (block.mediaSize as string) ?? 'edgeToEdge'
  const width =
    (template === 'stacked' || template === 'overlay') && mediaSize === 'edgeToEdge'
      ? 'edgeToEdge'
      : 'L'

  return {
    size: 'feature',
    headline: typeof block.title === 'string' ? block.title : '',
    eyebrow: typeof block.eyebrow === 'string' ? block.eyebrow : undefined,
    subhead: typeof block.subhead === 'string' ? block.subhead : undefined,
    body: typeof block.body === 'string' ? block.body : undefined,
    cta:
      typeof block.ctaText === 'string' && block.ctaText && typeof block.ctaLink === 'string' && block.ctaLink
        ? { label: block.ctaText, href: block.ctaLink }
        : undefined,
    ctaSecondary:
      typeof block.cta2Text === 'string' && block.cta2Text && typeof block.cta2Link === 'string' && block.cta2Link
        ? { label: block.cta2Text, href: block.cta2Link }
        : undefined,
    media,
    variant,
    emphasis: block.emphasis as MediaTextBlockProps['emphasis'],
    minimalBackgroundStyle: block.minimalBackgroundStyle as 'block' | 'gradient' | undefined,
    appearance: (block.appearance ?? block.surfaceColour) as MediaTextBlockProps['appearance'] | undefined,
    spacing: normalizeBlockSpacing(block.spacing) as MediaTextBlockProps['spacing'],
    spacingTop: block.spacingTop
      ? (normalizeBlockSpacing(block.spacingTop) as MediaTextBlockProps['spacingTop'])
      : undefined,
    spacingBottom: block.spacingBottom
      ? (normalizeBlockSpacing(block.spacingBottom) as MediaTextBlockProps['spacingBottom'])
      : undefined,
    width,
    align: alignSource === 'center' || alignSource === 'left' ? alignSource : undefined,
    mediaStyle: 'contained',
    descriptionTitle: block.descriptionTitle as string | undefined,
    descriptionBody: block.descriptionBody as string | undefined,
  }
}

export function mapMediaTextAsymmetricBlockProps(
  block: BlockLike,
  openLinksInNewTab?: boolean,
): MediaTextAsymmetricBlockProps {
  const asymmetricItems = Array.isArray(block.items)
    ? (block.items as { title?: string; body?: string; linkText?: string; linkUrl?: string; subtitle?: string }[]).map(
        (i) => ({
          title: i.title as string | undefined,
          body: i.body as string | undefined,
          linkText: i.linkText as string | undefined,
          linkUrl: i.linkUrl as string | undefined,
          subtitle: i.subtitle as string | undefined,
        }),
      )
    : []
  const longFormParagraphsRaw = block.longFormParagraphs
  const longFormParagraphs = Array.isArray(longFormParagraphsRaw)
    ? longFormParagraphsRaw.map((p: { _key?: string; text?: string; bodyTypography?: string }) => ({
        _key: p._key,
        text: p.text,
        bodyTypography: p.bodyTypography === 'large' ? ('large' as const) : ('regular' as const),
      }))
    : []
  const paragraphRowsRaw = block.paragraphRows
  const paragraphRows = Array.isArray(paragraphRowsRaw)
    ? paragraphRowsRaw.map(
        (p: {
          _key?: string
          title?: string
          body?: string
          bodyTypography?: string
          linkText?: string
          linkUrl?: string
        }) => ({
          _key: p._key,
          title: p.title,
          body: p.body,
          bodyTypography: p.bodyTypography === 'large' ? ('large' as const) : ('regular' as const),
          linkText: p.linkText,
          linkUrl: p.linkUrl,
        }),
      )
    : []
  const mainImageRaw = block.image as string | undefined
  const mainImageSrc =
    typeof mainImageRaw === 'string' && mainImageRaw.trim().length > 0
      ? mainImageRaw.trim()
      : typeof block.imageUrl === 'string' && block.imageUrl.trim().length > 0
        ? (block.imageUrl as string).trim()
        : ''
  const ar = block.imageAspectRatio as string | undefined
  const imageAspectRatio =
    ar === '5:4' || ar === '1:1' || ar === '4:5' ? ar : undefined
  const rawVariant = (block.variant as string) ?? 'textList'
  const variant: MediaTextAsymmetricBlockProps['variant'] =
    rawVariant === 'paragraphs'
      ? 'paragraphs'
      : rawVariant === 'faq'
        ? 'faq'
        : rawVariant === 'links'
          ? 'links'
          : rawVariant === 'longForm'
            ? 'longForm'
            : rawVariant === 'image'
              ? 'image'
              : 'textList'

  const rawBlockTitle = block.blockTitle
  const blockTitleProp =
    typeof rawBlockTitle === 'string' && rawBlockTitle.trim().length > 0 ? rawBlockTitle.trim() : undefined

  return {
    ...(blockTitleProp !== undefined ? { blockTitle: blockTitleProp } : {}),
    variant,
    longFormParagraphs,
    paragraphRows,
    items: asymmetricItems,
    mainImageSrc: mainImageSrc || undefined,
    imageAspectRatio,
    imageAlt: (block.imageAlt as string | null) ?? null,
    size: (block.size as MediaTextAsymmetricBlockProps['size']) ?? 'feature',
    emphasis: block.emphasis as MediaTextAsymmetricBlockProps['emphasis'],
    minimalBackgroundStyle:
      (block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block',
    appearance: (block.appearance ?? block.surfaceColour) as MediaTextAsymmetricBlockProps['appearance'],
    openLinksInNewTab,
  }
}

function resolveMediaText5050MediaFromFields(fields: {
  image?: string
  video?: string
  imageAspectRatio?: string
}): MediaText5050BlockProps['media'] {
  const imageUrl = fields.image
  const videoUrl = fields.video
  const hasVideo = videoUrl && typeof videoUrl === 'string' && videoUrl.trim() !== ''
  const hasImage = imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== ''
  const rawAspectRatio = fields.imageAspectRatio || undefined
  const aspectRatio =
    rawAspectRatio && ['5:4', '1:1', '4:5'].includes(rawAspectRatio)
      ? (rawAspectRatio as '5:4' | '1:1' | '4:5')
      : undefined
  if (hasVideo)
    return {
      type: 'video',
      src: videoUrl!,
      poster: hasImage ? imageUrl : undefined,
      alt: '',
      aspectRatio,
    }
  if (hasImage) return { type: 'image', src: imageUrl!, alt: '', aspectRatio }
  return undefined
}

export function mapMediaText5050BlockProps(
  block: BlockLike,
  images?: Record<string, ImageSlotState> | null,
): MediaText5050BlockProps {
  const imageSlot = block.imageSlot as string | undefined
  const imageState = imageSlot && images?.[imageSlot] ? images[imageSlot] : undefined
  const rawVariant = block.variant as string
  const variant: MediaText5050BlockProps['variant'] =
    rawVariant === 'singleParagraph' || rawVariant === 'multiParagraph' || rawVariant === 'accordion'
      ? rawVariant
      : rawVariant === 'paragraphs'
        ? 'paragraphs'
        : 'multiParagraph'
  const rawHeadingAlign = (block.headingAlignment ?? block.blockFramingAlignment) as string | undefined
  const headingAlignment: MediaText5050BlockProps['headingAlignment'] =
    rawHeadingAlign === 'center' ? 'center' : 'left'
  const rawCtas = Array.isArray(block.callToActions) ? block.callToActions : null
  const callToActions =
    rawCtas && rawCtas.length > 0
      ? (rawCtas as MediaText5050BlockProps['callToActions'])!.slice(0, 1)
      : null

  const base: Pick<
    MediaText5050BlockProps,
    | 'imagePosition'
    | 'headingAlignment'
    | 'emphasis'
    | 'minimalBackgroundStyle'
    | 'appearance'
    | 'spacingTop'
    | 'spacingBottom'
    | 'headline'
    | 'description'
    | 'callToActions'
    | 'imageSlot'
    | 'imageState'
  > = {
    imagePosition: (block.imagePosition as 'left' | 'right') ?? 'right',
    headingAlignment,
    emphasis: block.emphasis as MediaText5050BlockProps['emphasis'],
    minimalBackgroundStyle: (block.minimalBackgroundStyle as 'block' | 'gradient') ?? 'block',
    appearance: (block.appearance ?? block.surfaceColour) as MediaText5050BlockProps['appearance'],
    spacingTop: block.spacingTop
      ? (normalizeBlockSpacing(block.spacingTop) as MediaText5050BlockProps['spacingTop'])
      : undefined,
    spacingBottom: block.spacingBottom
      ? (normalizeBlockSpacing(block.spacingBottom) as MediaText5050BlockProps['spacingBottom'])
      : undefined,
    headline: block.headline as string | undefined,
    description: block.description as string | null | undefined,
    callToActions,
    imageSlot,
    imageState,
  }

  if (variant === 'accordion') {
    const rawAccordion = Array.isArray(block.accordionItems) ? block.accordionItems : []
    const sharedAspect = block.imageAspectRatio as string | undefined
    if (rawAccordion.length > 0) {
      const accordionItems = (
        rawAccordion as { subtitle?: string; body?: string; image?: string; video?: string }[]
      ).map((row) => ({
        subtitle: (row.subtitle as string) ?? '',
        body: (row.body as string) ?? '',
        media: resolveMediaText5050MediaFromFields({
          image: row.image,
          video: row.video,
          imageAspectRatio: sharedAspect,
        }),
      }))
      return {
        ...base,
        variant: 'accordion',
        accordionItems,
        paragraphColumnLayout: undefined,
        items: undefined,
        singleSubtitle: undefined,
        singleBody: undefined,
        media: undefined,
      }
    }
    const legacyItems = mapMediaText5050Items(block)
    const accordionItems = legacyItems.map((row) => ({
      subtitle: row.subtitle ?? '',
      body: row.body ?? '',
    }))
    const media = resolveMediaText5050MediaFromFields({
      image: block.image as string | undefined,
      video: block.video as string | undefined,
      imageAspectRatio: block.imageAspectRatio as string | undefined,
    })
    return {
      ...base,
      variant: 'accordion',
      accordionItems,
      paragraphColumnLayout: undefined,
      items: undefined,
      singleSubtitle: undefined,
      singleBody: undefined,
      media,
    }
  }

  const isSingle = variant === 'singleParagraph' ||
    (variant === 'paragraphs' && (block.paragraphColumnLayout as string) === 'single')

  const media = resolveMediaText5050MediaFromFields({
    image: block.image as string | undefined,
    video: block.video as string | undefined,
    imageAspectRatio: block.imageAspectRatio as string | undefined,
  })

  if (isSingle) {
    let singleSubtitle = (block.singleSubtitle as string) ?? ''
    let singleBody = (block.singleBody as string) ?? ''
    if (!singleSubtitle && !singleBody) {
      const first = Array.isArray(block.items) ? block.items[0] : undefined
      if (first && typeof first === 'object') {
        singleSubtitle = ((first as { subtitle?: string }).subtitle as string) ?? ''
        singleBody = ((first as { body?: string }).body as string) ?? ''
      }
    }
    return {
      ...base,
      variant: 'singleParagraph' as const,
      paragraphColumnLayout: 'single' as const,
      singleSubtitle,
      singleBody,
      items: [],
      accordionItems: undefined,
      media,
    }
  }

  const itemsRaw = Array.isArray(block.items) ? block.items : []
  const items = (itemsRaw as { subtitle?: string; body?: string }[]).map((i) => ({
    subtitle: (i.subtitle as string) ?? '',
    body: (i.body as string) ?? '',
  }))
  return {
    ...base,
    variant: 'multiParagraph' as const,
    paragraphColumnLayout: 'multi' as const,
    items,
    singleSubtitle: undefined,
    singleBody: undefined,
    accordionItems: undefined,
    media,
  }
}
