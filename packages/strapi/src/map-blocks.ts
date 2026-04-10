import { resolveStrapiMediaUrl } from './media'

const COMPONENT_TO_TYPE: Record<string, string> = {
  'blocks.hero': 'hero',
  'blocks.card-grid': 'cardGrid',
  'blocks.media-text-stacked': 'mediaTextStacked',
  'blocks.media-text-block': 'mediaTextStacked',
  'blocks.media-text-5050': 'mediaText5050',
  'blocks.carousel': 'carousel',
  'blocks.proof-points': 'proofPoints',
  'blocks.icon-grid': 'iconGrid',
  'blocks.media-text-asymmetric': 'mediaTextAsymmetric',
  'blocks.full-bleed-vertical-carousel': 'fullBleedVerticalCarousel',
  'blocks.rotating-media': 'rotatingMedia',
  'blocks.editorial-block': 'editorialBlock',
}

export type BlockRendererSection = Record<string, unknown> & {
  _type: string
  _key?: string
}

/** Flatten Strapi dynamic-zone blocks into the shape BlockRenderer expects (Sanity-like `_type`). */
export function mapStrapiDynamicZoneToSections(
  baseUrl: string,
  blocks: unknown
): BlockRendererSection[] {
  if (!Array.isArray(blocks)) return []
  return blocks.map((raw, index) => mapOneBlock(baseUrl, raw, index))
}

function mapOneBlock(baseUrl: string, raw: unknown, index: number): BlockRendererSection {
  if (!raw || typeof raw !== 'object') {
    return { _type: 'unknown', _key: `b${index}` }
  }
  const o = raw as Record<string, unknown>
  const component = String(o.__component ?? '')
  const _type = COMPONENT_TO_TYPE[component] ?? component.replace(/^blocks\./, '')
  const id = o.id ?? o.documentId ?? index
  const _key = typeof id === 'string' || typeof id === 'number' ? String(id) : `b${index}`

  if (_type === 'hero') {
    return {
      _type: 'hero',
      _key,
      contentLayout: o.contentLayout,
      containerLayout: o.containerLayout,
      imageAnchor: o.imageAnchor,
      textAlign: o.textAlign,
      theme: o.theme,
      emphasis: o.emphasis,
      appearance: o.appearance,
      spacingTop: o.spacingTop,
      spacingBottom: o.spacingBottom,
      eyebrow: o.eyebrow,
      title: o.title,
      body: o.body,
      ctaText: o.ctaText,
      ctaLink: o.ctaLink,
      cta2Text: o.cta2Text,
      cta2Link: o.cta2Link,
      image: resolveStrapiMediaUrl(baseUrl, o.image, o.imageUrl as string | null),
      videoUrl: resolveStrapiMediaUrl(baseUrl, o.video, o.videoUrl as string | null),
    }
  }

  if (_type === 'mediaTextStacked') {
    return {
      _type,
      _key,
      spacingTop: o.spacingTop,
      spacingBottom: o.spacingBottom,
      template: o.template,
      mediaSize: o.mediaSize,
      alignment: o.alignment,
      overlayAlignment: o.overlayAlignment,
      textOnlyAlignment: o.textOnlyAlignment,
      stackAlignment: o.stackAlignment,
      theme: o.theme,
      appearance: o.appearance,
      emphasis: o.emphasis,
      minimalBackgroundStyle: o.minimalBackgroundStyle,
      eyebrow: o.eyebrow,
      title: o.title,
      subhead: o.subhead,
      body: o.body,
      descriptionTitle: o.descriptionTitle,
      descriptionBody: o.descriptionBody,
      stackedMediaWidth: o.stackedMediaWidth,
      imageAspectRatio: o.imageAspectRatio,
      imagePosition: o.imagePosition,
      ctaText: o.ctaText,
      ctaLink: o.ctaLink,
      cta2Text: o.cta2Text,
      cta2Link: o.cta2Link,
      image: resolveStrapiMediaUrl(baseUrl, o.image, o.imageUrl as string | null),
      video: resolveStrapiMediaUrl(baseUrl, o.video, o.videoUrl as string | null),
    }
  }

  if (_type === 'cardGrid') {
    return {
      _type: 'cardGrid',
      _key,
      spacingTop: o.spacingTop,
      spacingBottom: o.spacingBottom,
      interaction: o.interaction,
      columns: o.columns,
      cardSurface: o.cardSurface,
      title: o.title,
      description: o.description,
      callToActions: mapCallToActions(o.callToActions),
      emphasis: o.emphasis,
      minimalBackgroundStyle: o.minimalBackgroundStyle,
      appearance: o.appearance,
      items: mapItems(baseUrl, o.items, mapCardItem.bind(null, baseUrl)),
    }
  }

  if (_type === 'mediaText5050') {
    return {
      _type: 'mediaText5050',
      _key,
      spacingTop: o.spacingTop,
      spacingBottom: o.spacingBottom,
      headline: o.headline,
      description: o.description,
      callToActions: mapCallToActions(o.callToActions),
      variant: o.variant,
      paragraphColumnLayout: o.paragraphColumnLayout,
      singleSubtitle: o.singleSubtitle,
      singleBody: o.singleBody,
      imagePosition: o.imagePosition,
      headingAlignment: o.headingAlignment,
      blockFramingAlignment: o.blockFramingAlignment,
      items: mapItems(baseUrl, o.items, (item) => ({
        _key: String(item.id ?? Math.random()),
        subtitle: item.subtitle,
        body: item.body,
      })),
      accordionItems: mapItems(baseUrl, o.accordionItems, (item) => ({
        _key: String(item.id ?? Math.random()),
        subtitle: item.subtitle,
        body: item.body,
        image: resolveStrapiMediaUrl(baseUrl, item.image, item.imageUrl as string | null),
        video: resolveStrapiMediaUrl(baseUrl, item.video, item.videoUrl as string | null),
      })),
      image: resolveStrapiMediaUrl(baseUrl, o.image, o.imageUrl as string | null),
      video: resolveStrapiMediaUrl(baseUrl, o.video, o.videoUrl as string | null),
      imageAspectRatio: o.imageAspectRatio,
      emphasis: o.emphasis,
      minimalBackgroundStyle: o.minimalBackgroundStyle,
      appearance: o.appearance,
    }
  }

  if (_type === 'carousel') {
    return {
      _type: 'carousel',
      _key,
      spacingTop: o.spacingTop,
      spacingBottom: o.spacingBottom,
      interaction: o.interaction,
      cardSurface: o.cardSurface,
      eyebrow: o.eyebrow,
      title: o.title,
      description: o.description,
      callToActions: mapCallToActions(o.callToActions),
      cardSize: o.cardSize,
      emphasis: o.emphasis,
      minimalBackgroundStyle: o.minimalBackgroundStyle,
      appearance: o.appearance,
      items: mapItems(baseUrl, o.items, mapCardItem.bind(null, baseUrl)),
    }
  }

  if (_type === 'proofPoints') {
    return {
      _type: 'proofPoints',
      _key,
      spacingTop: o.spacingTop,
      spacingBottom: o.spacingBottom,
      title: o.title,
      description: o.description,
      callToActions: mapCallToActions(o.callToActions),
      variant: o.variant,
      emphasis: o.emphasis,
      minimalBackgroundStyle: o.minimalBackgroundStyle,
      appearance: o.appearance,
      items: mapItems(baseUrl, o.items, (item) => ({
        _key: String(item.id ?? Math.random()),
        title: item.title,
        description: item.description,
        icon: item.icon,
      })),
    }
  }

  if (_type === 'iconGrid') {
    return {
      _type: 'iconGrid',
      _key,
      spacingTop: o.spacingTop,
      spacingBottom: o.spacingBottom,
      title: o.title,
      description: o.description,
      callToActions: mapCallToActions(o.callToActions),
      emphasis: o.emphasis,
      appearance: o.appearance,
      minimalBackgroundStyle: o.minimalBackgroundStyle,
      columns: o.columns,
      items: mapItems(baseUrl, o.items, (item) => ({
        _key: String(item.id ?? Math.random()),
        title: item.title,
        body: item.body,
        icon: item.icon,
        accentColor: item.accentColor,
        spectrum: item.spectrum,
      })),
    }
  }

  if (_type === 'mediaTextAsymmetric') {
    return {
      _type: 'mediaTextAsymmetric',
      _key,
      spacingTop: o.spacingTop,
      spacingBottom: o.spacingBottom,
      blockTitle: o.blockTitle,
      description: o.description,
      callToActions: mapCallToActions(o.callToActions),
      variant: o.variant,
      paragraphLayout: o.paragraphLayout,
      singleColumnBody: o.singleColumnBody,
      longFormParagraphs: mapItems(baseUrl, o.longFormParagraphs, (item) => ({
        _key: String(item.id ?? Math.random()),
        text: item.text,
        bodyTypography: item.bodyTypography,
      })),
      emphasis: o.emphasis,
      minimalBackgroundStyle: o.minimalBackgroundStyle,
      appearance: o.appearance,
      imageAspectRatio: o.imageAspectRatio,
      imageAlt: o.imageAlt,
      image: resolveStrapiMediaUrl(baseUrl, o.image, o.imageUrl as string | null),
      paragraphRows: mapItems(baseUrl, o.paragraphRows, (item) => ({
        _key: String(item.id ?? Math.random()),
        title: item.title,
        body: item.body,
        bodyTypography: item.bodyTypography,
        linkText: item.linkText,
        linkUrl: item.linkUrl,
      })),
      items: mapItems(baseUrl, o.items, (item) => ({
        _key: String(item.id ?? Math.random()),
        title: item.title,
        body: item.body,
        subtitle: item.subtitle,
        linkText: item.linkText,
        linkUrl: item.linkUrl,
      })),
    }
  }

  return { _type, _key, ...stripStrapiMeta(o) }
}

function mapCardItem(baseUrl: string, item: Record<string, unknown>) {
  return {
    _key: String(item.id ?? item.documentId ?? Math.random()),
    cardType: item.cardType,
    title: item.title,
    description: item.description,
    backgroundColor: item.backgroundColor,
    image: resolveStrapiMediaUrl(baseUrl, item.image, item.imageUrl as string | null),
    video: resolveStrapiMediaUrl(baseUrl, item.video, item.videoUrl as string | null),
    ctaText: item.ctaText,
    ctaLink: item.ctaLink,
    link: item.link,
    aspectRatio: item.aspectRatio,
    icon: item.icon,
    iconImage: item.iconImage,
  }
}

function mapItems<T>(
  _baseUrl: string,
  raw: unknown,
  mapper: (item: Record<string, unknown>) => T
): T[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
    .map(mapper)
}

function mapCallToActions(raw: unknown): { _key: string; label: string; link: string; style?: string }[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
    .map((item) => ({
      _key: String(item.id ?? Math.random()),
      label: String(item.label ?? ''),
      link: String(item.link ?? ''),
      style: item.style as string | undefined,
    }))
}

function stripStrapiMeta(o: Record<string, unknown>): Record<string, unknown> {
  const { __component: _c, id: _i, documentId: _d, ...rest } = o
  return rest
}
