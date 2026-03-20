'use client'

import React from 'react'
/**
 * Lab block renderer – renders blocks from Sanity lab page sections.
 * Hero, FullBleedVerticalCarousel, RotatingMedia, MediaZoomOutOnScroll.
 */

import {
  LabHeroBlock,
  LabCardGridBlock,
  LabMediaZoomOutOnScroll,
  LabFullBleedVerticalCarousel,
  LabCarouselBlock,
  LabRotatingMediaBlock,
  LabMediaText5050Block,
  LabTopNavBlock,
  EditorialBlock,
} from './blocks'
import { Headline, Text } from '@marcelinodzn/ds-react'
import { WidthCap } from '../blocks/WidthCap'
import { MediaTextBlock, ProofPointsBlock, ListBlock, IconGridBlock, BlockShell } from '../blocks'
import type { BlockPattern } from '../blocks/BlockShell'
import type { LabHeroBlockProps } from './blocks/HeroBlock/LabHeroBlock'
import type { MediaTextBlockProps, MediaText5050BlockProps } from '../blocks'

type LabBlock = {
  _type: string
  _key?: string
  [key: string]: unknown
}

function getBlockTypeTitle(_type: string): string {
  const titles: Record<string, string> = {
    hero: 'Hero',
    mediaTextStacked: 'Media + Text: Stacked',
    mediaTextBlock: 'Media + Text: Stacked',
    mediaText5050: 'Media + Text: 50/50',
    labCardGrid: 'Card grid',
    carousel: 'Carousel (responsive)',
    fullBleedVerticalCarousel: 'Full bleed vertical carousel',
    rotatingMedia: 'Rotating media',
    iconGrid: 'Icon grid',
    proofPoints: 'Proof points',
    list: 'List',
    mediaZoomOutOnScroll: 'Media zoom out on scroll',
    topNavBlock: 'Top nav (mega menu)',
    editorialBlock: 'Editorial',
  }
  return titles[_type] ?? _type
}

/** Layout setting only – used as section title (h2) above each block. */
export function getBlockLayoutTitle(block: LabBlock): string {
  switch (block._type) {
    case 'hero': {
      const contentLayout = ((block.contentLayout as string) ?? 'sideBySide').toLowerCase()
      const containerLayout = (block.containerLayout as string) ?? (block.layout as string) ?? 'edgeToEdge'
      const anchor = (block.imageAnchor as string) ?? 'center'
      const textAlign = (block.textAlign as string) ?? 'left'
      const hasVideo = Boolean((block.videoUrl as string)?.trim())
      const layoutLabel =
        contentLayout === 'category'
          ? 'Category'
          : contentLayout === 'mediaoverlay'
            ? `Media overlay (band, ${textAlign})`
            : contentLayout === 'textonly'
              ? 'Text only'
              : contentLayout === 'stacked'
                ? 'Stacked'
                : containerLayout === 'contained'
                  ? 'Side by side (Contained)'
                  : 'Side by side (Edge to edge)'
      const parts = [layoutLabel]
      if (contentLayout === 'sidebyside' && anchor === 'bottom') parts.push('Top to bottom')
      if (hasVideo) parts.push('Video')
      return parts.join(' · ')
    }
    case 'fullBleedVerticalCarousel':
      return 'Full bleed'
    case 'rotatingMedia': {
      const v = (block.variant as string) ?? 'small'
      return v === 'combined' ? 'Combined' : v === 'large' ? 'Large' : 'Small'
    }
    case 'labCardGrid':
      return `${block.columns ?? '3'} columns`
    case 'mediaZoomOutOnScroll':
      return block.videoUrl ? 'With video' : 'Image only'
    case 'iconGrid': {
      const cols = block.columns as number | undefined
      return cols == null ? 'Auto columns' : `${cols} columns`
    }
    case 'proofPoints': {
      const v = (block.variant as string) ?? 'icon'
      return v === 'stat' ? 'Stat' : 'Icon'
    }
    case 'mediaText5050': {
      const variant = (block.variant as string) ?? 'paragraphs'
      const variantLabels: Record<string, string> = { paragraphs: 'Paragraphs', accordion: 'Accordion' }
      const imagePosition = (block.imagePosition as string) ?? 'right'
      return `${variantLabels[variant] ?? variant} · Image ${imagePosition}`
    }
    case 'mediaTextStacked':
    case 'mediaTextBlock': {
      const rawTemplate = (block.template as string) ?? 'Stacked'
      const template = (rawTemplate === 'SideBySide' || rawTemplate === 'sideBySide') ? 'Stacked' : rawTemplate === 'MediaOverlay' ? 'Overlay' : rawTemplate
      if (template === 'TextOnly') return `Text only · Align ${block.alignment as string}`
      const mediaSize = block.mediaSize as string
      const sizeLabel = mediaSize === 'edgeToEdge' ? 'Edge to edge' : 'Contained'
      if (template === 'Overlay') return `Overlay · ${sizeLabel} · Align ${block.alignment as string}`
      return `Stacked · ${sizeLabel} · Align ${block.alignment as string}`
    }
    case 'carousel':
    case 'labCarousel': {
      const size = (block.cardSize as string) ?? 'medium'
      return size === 'compact' ? 'Compact' : size === 'large' ? 'Large' : 'Medium'
    }
    case 'list': {
      const v = (block.listVariant as string) ?? 'textList'
      return v === 'faq' ? 'FAQ' : v === 'links' ? 'Links' : 'Text list'
    }
    case 'topNavBlock':
      return 'Mega menu'
    case 'editorialBlock':
      return 'Editorial'
    default:
      return getBlockTypeTitle(block._type)
  }
}

/** Other settings (emphasis, surface colour, counts) – used as subtitle (smaller font) under the title. */
export function getBlockOtherSettings(block: LabBlock): string {
  switch (block._type) {
    case 'hero': {
      const surface = String(block.emphasis ?? 'bold')
      const surfaceLabel =
        surface === 'ghost' ? 'No colour' : (surface && typeof surface === 'string' ? surface.charAt(0).toUpperCase() + surface.slice(1) : 'Minimal')
      return `Emphasis: ${surfaceLabel} · Surface colour: ${block.surfaceColour ?? ''}`
    }
    case 'fullBleedVerticalCarousel':
      return `Emphasis: ${block.emphasis ?? ''} · Surface colour: ${block.surfaceColour ?? ''}`
    case 'rotatingMedia':
      return `Emphasis: ${block.emphasis ?? ''} · Surface colour: ${block.surfaceColour ?? ''}`
    case 'labCardGrid':
      return `Emphasis: ${block.emphasis ?? ''} · Surface colour: ${block.surfaceColour ?? ''} · ${Array.isArray(block.items) ? block.items.length : 0} card(s)`
    case 'mediaZoomOutOnScroll':
      return ''
    case 'iconGrid':
      return `Emphasis: ${block.emphasis ?? ''} · Surface colour: ${block.surfaceColour ?? ''} · ${Array.isArray(block.items) ? block.items.length : 0} item(s)`
    case 'proofPoints':
      return `Emphasis: ${block.emphasis ?? ''} · Surface colour: ${block.surfaceColour ?? ''} · ${Array.isArray(block.items) ? block.items.length : 0} item(s)`
    case 'mediaText5050':
      return `Emphasis: ${block.emphasis ?? ''} · Surface colour: ${block.surfaceColour ?? ''} · ${Array.isArray(block.items) ? block.items.length : 0} item(s)`
    case 'mediaTextStacked':
    case 'mediaTextBlock':
      return `Emphasis: ${block.emphasis ?? ''} · Surface colour: ${block.surfaceColour ?? ''}`
    case 'carousel':
      return `Emphasis: ${block.emphasis ?? ''} · Surface colour: ${block.surfaceColour ?? ''} · ${Array.isArray(block.items) ? block.items.length : 0} item(s)`
    case 'list':
      return `Emphasis: ${block.emphasis ?? ''} · Surface colour: ${block.surfaceColour ?? ''} · ${Array.isArray(block.items) ? block.items.length : 0} item(s)`
    case 'topNavBlock':
      return 'L1/L2/L3 navigation'
    default:
      return ''
  }
}

/** @deprecated Use getBlockLayoutTitle + getBlockOtherSettings. Kept for LabBlockPageClient variant count. */
export function getBlockSettings(block: LabBlock): string {
  const layout = getBlockLayoutTitle(block)
  const other = getBlockOtherSettings(block)
  return other ? `${layout} · ${other}` : layout
}

type BlockSpacingValue = 'none' | 'medium' | 'large'
function normalizeSpacing(v: unknown): BlockSpacingValue {
  const s = (v as string)?.toLowerCase?.()
  if (s === 'small') return 'none'
  if (s === 'none' || s === 'medium' || s === 'large') return s
  return 'large'
}

/** Derive block pattern for Lab blocks. Band | Overlay | Contained. */
function deriveLabPattern(block: LabBlock): BlockPattern {
  const contentLayout = (block.contentLayout as string)?.toLowerCase?.()
  const template = (block.template as string)?.toLowerCase?.()
  if (contentLayout === 'mediaoverlay' || contentLayout === 'fullscreen' || template === 'mediaoverlay') {
    return 'overlay'
  }
  if (block._type === 'hero' && contentLayout === 'category') {
    return 'band'
  }
  /** Hero sideBySide contained → always contained, never band. Background constrained to grid width by ContainedShell. */
  if (
    block._type === 'hero' &&
    contentLayout === 'sidebyside' &&
    (block.containerLayout as string)?.toLowerCase?.() === 'contained'
  ) {
    return 'contained'
  }
  const emphasis = (block.emphasis as string)?.toLowerCase?.()
  const hasBand = emphasis && !['ghost', 'none'].includes(emphasis)
  const bandTypes = ['hero', 'mediaTextStacked', 'mediaTextBlock', 'mediaText5050', 'carousel', 'labCarousel', 'labCardGrid', 'cardGrid', 'proofPoints', 'iconGrid', 'list', 'fullBleedVerticalCarousel', 'rotatingMedia', 'editorialBlock']
  if (hasBand && bandTypes.includes(block._type)) {
    return 'band'
  }
  return 'contained'
}

function mapMediaTextBlock(block: LabBlock): MediaTextBlockProps {
  const rawTemplate = block.template as string
  /** Legacy: SideBySide is now mediaText5050; treat as Stacked. MediaOverlay → Overlay. */
  const template = (rawTemplate === 'SideBySide' || rawTemplate === 'sideBySide')
    ? 'Stacked'
    : rawTemplate === 'MediaOverlay'
      ? 'Overlay'
      : (rawTemplate ?? 'Stacked')
  /** Same aspect ratio for Stacked and Overlay so contained media containers match (2:1). */
  const imageAspectRatio = '2:1'

  const variantMap: Record<string, MediaTextBlockProps['variant']> = {
    Overlay: 'full-bleed',
    Stacked: 'centered-media-below',
    TextOnly: 'text-only',
  }
  /** Legacy: SideBySide is now mediaText5050; fall back to Stacked. */
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
    if (template === 'TextOnly') return block.textOnlyAlignment as string
    if (template === 'Stacked') return block.stackAlignment as string
    if (template === 'Overlay') return block.overlayAlignment as string
    return block.align as string
  })()
  const alignSource =
    rawAlign?.toLowerCase() === 'center'
      ? 'center'
      : rawAlign?.toLowerCase() === 'left'
        ? 'left'
        : undefined

  const mediaSize = block.mediaSize as string
  /** Stacked and Overlay: edge to edge or contained based on mediaSize. */
  const width =
    (template === 'Stacked' || template === 'Overlay') && mediaSize === 'edgeToEdge'
      ? 'edgeToEdge'
      : 'L'

  return {
    size: 'feature',
    headline: (block.title as string) ?? '',
    eyebrow: block.eyebrow as string | undefined,
    subhead: block.subhead as string | undefined,
    body: block.body as string | undefined,
    cta:
      block.ctaText && block.ctaLink
        ? { label: block.ctaText as string, href: block.ctaLink as string }
        : undefined,
    ctaSecondary:
      block.cta2Text && block.cta2Link
        ? { label: block.cta2Text as string, href: block.cta2Link as string }
        : undefined,
    media,
    variant,
    emphasis: block.emphasis as MediaTextBlockProps['emphasis'],
    minimalBackgroundStyle: block.minimalBackgroundStyle as 'block' | 'gradient' | undefined,
    surfaceColour: block.surfaceColour as MediaTextBlockProps['surfaceColour'] | undefined,
    spacing: normalizeSpacing(block.spacing) as MediaTextBlockProps['spacing'],
    spacingTop: block.spacingTop ? (normalizeSpacing(block.spacingTop) as MediaTextBlockProps['spacingTop']) : undefined,
    spacingBottom: block.spacingBottom ? (normalizeSpacing(block.spacingBottom) as MediaTextBlockProps['spacingBottom']) : undefined,
    width,
    align: alignSource === 'center' || alignSource === 'left' ? alignSource : undefined,
    mediaStyle: 'contained',
    descriptionTitle: block.descriptionTitle as string | undefined,
    descriptionBody: block.descriptionBody as string | undefined,
  }
}

function mapMediaText5050Items(block: LabBlock): { subtitle?: string; body?: string }[] {
  const items = Array.isArray(block.items)
    ? (block.items as { subtitle?: string; body?: string }[]).map((i) => ({
        subtitle: (i.subtitle as string) ?? '',
        body: (i.body as string) ?? '',
      }))
    : []
  if (items.length > 0) return items
  if (block.variant === 'singleParagraph' && (block.headline || block.body)) {
    return [{ subtitle: (block.headline as string) ?? '', body: (block.body as string) ?? '' }]
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

function mapMediaText5050Block(block: LabBlock): MediaText5050BlockProps {
  const imageUrl = block.image as string | undefined
  const videoUrl = block.video as string | undefined
  const hasVideo = videoUrl && typeof videoUrl === 'string' && videoUrl.trim() !== ''
  const hasImage = imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== ''
  const rawAspectRatio = (block.imageAspectRatio as string) || undefined
  const aspectRatio = rawAspectRatio && ['5:4', '1:1', '4:5'].includes(rawAspectRatio)
    ? (rawAspectRatio as '5:4' | '1:1' | '4:5')
    : undefined
  const media =
    hasVideo
      ? { type: 'video' as const, src: videoUrl!, poster: hasImage ? imageUrl : undefined, alt: '', aspectRatio }
      : hasImage
        ? { type: 'image' as const, src: imageUrl!, alt: '', aspectRatio }
        : undefined
  const rawVariant = block.variant as string
  const variant: MediaText5050BlockProps['variant'] =
    rawVariant === 'accordion' ? 'accordion' : 'paragraphs'
  return {
    variant,
    imagePosition: (block.imagePosition as 'left' | 'right') ?? 'right',
    emphasis: block.emphasis as MediaText5050BlockProps['emphasis'],
    minimalBackgroundStyle: (block.minimalBackgroundStyle as 'block' | 'gradient') ?? 'block',
    surfaceColour: block.surfaceColour as MediaText5050BlockProps['surfaceColour'],
    spacingTop: block.spacingTop ? (normalizeSpacing(block.spacingTop) as MediaText5050BlockProps['spacingTop']) : undefined,
    spacingBottom: block.spacingBottom ? (normalizeSpacing(block.spacingBottom) as MediaText5050BlockProps['spacingBottom']) : undefined,
    headline: block.headline as string | undefined,
    items: mapMediaText5050Items(block),
    media,
  }
}

function mapHeroBlockProps(block: LabBlock) {
  const rawContentLayout = (block.contentLayout as string) ?? 'stacked'
  const contentLayout = rawContentLayout === 'fullscreen' ? 'mediaOverlay' : rawContentLayout
  const containerLayout = (block.containerLayout as string) ?? 'edgeToEdge'
  return {
    productName: block.productName as string | null,
    headline: block.headline as string | null,
    subheadline: block.subheadline as string | null,
    ctaText: block.ctaText as string | null,
    ctaLink: block.ctaLink as string | null,
    cta2Text: block.cta2Text as string | null,
    cta2Link: block.cta2Link as string | null,
    image: block.image as string | null,
    videoUrl: block.videoUrl as string | null,
    contentLayout: (['stacked', 'sideBySide', 'category', 'mediaOverlay', 'textOnly'].includes(contentLayout) ? contentLayout : 'stacked') as LabHeroBlockProps['contentLayout'],
    containerLayout: (containerLayout === 'contained' ? 'contained' : 'edgeToEdge') as LabHeroBlockProps['containerLayout'],
    imageAnchor: ((block.imageAnchor as string) === 'bottom' ? 'bottom' : 'center') as LabHeroBlockProps['imageAnchor'],
    textAlign: ((block.textAlign as string) === 'center' ? 'center' : 'left') as LabHeroBlockProps['textAlign'],
    emphasis: block.emphasis as LabHeroBlockProps['emphasis'],
    surfaceColour: block.surfaceColour as LabHeroBlockProps['surfaceColour'],
  }
}

type LabBlockRendererProps = {
  blocks: LabBlock[] | null | undefined
  /** When provided (e.g. block variant pages), use these as section titles instead of block type. */
  variantLabels?: string[]
  /** When true, render blocks without section headers/settings (e.g. lab overview). */
  clean?: boolean
  /** When true, List block links open in new tab. */
  listBlockOpenLinksInNewTab?: boolean
}

export function LabBlockRenderer({ blocks, variantLabels, clean, listBlockOpenLinksInNewTab }: LabBlockRendererProps) {
  if (!blocks?.length) return null

  const wrapSection = (content: React.ReactNode, block: LabBlock, i: number) => {
    const spacingTop =
      block._type === 'hero'
        ? undefined
        : (block.spacingTop ? normalizeSpacing(block.spacingTop) : block.spacing ? normalizeSpacing(block.spacing) : undefined) as BlockSpacingValue | undefined
    const spacingBottom = (block.spacingBottom ? normalizeSpacing(block.spacingBottom) : block.spacing ? normalizeSpacing(block.spacing) : undefined) as BlockSpacingValue | undefined
    const pattern = deriveLabPattern(block)
    const contentLayout = (block.contentLayout as string)?.toLowerCase?.()
    const isHeroCategory = block._type === 'hero' && contentLayout === 'category'
    const imageAnchor = (block.imageAnchor as string)?.toLowerCase?.()
    const isHeroTopToBottom = block._type === 'hero' && contentLayout === 'sidebyside' && imageAnchor === 'bottom'
    const emphasis = (block.emphasis as string)?.toLowerCase?.() as 'ghost' | 'minimal' | 'subtle' | 'bold' | undefined
    const shellEmphasis = isHeroCategory ? 'ghost' : emphasis
    const surfaceColour = (block.surfaceColour as string)?.toLowerCase?.() as 'primary' | 'secondary' | 'sparkle' | 'neutral' | undefined
    const minimalBackgroundStyle = ((block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block') as 'block' | 'gradient'

    const blockContent = (
      <BlockShell
        pattern={pattern}
        spacingTop={spacingTop}
        spacingBottom={spacingBottom}
        emphasis={shellEmphasis}
        surfaceColour={surfaceColour}
        minimalBackgroundStyle={minimalBackgroundStyle}
        flushTop={isHeroTopToBottom}
        flushBottom={isHeroTopToBottom}
        style={{ overflow: 'visible' }}
      >
        {content}
      </BlockShell>
    )

    if (clean) return <React.Fragment key={block._key}>{blockContent}</React.Fragment>
    const layoutTitle = variantLabels?.[i] ?? getBlockLayoutTitle(block)
    const otherSettings = getBlockOtherSettings(block)
    const helperInfo = (
      <WidthCap contentWidth="L" style={{ marginBottom: 'var(--ds-spacing-l)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-2xs)', alignItems: 'flex-start' }}>
          <Headline size="S" weight="high" as="h2" style={{ margin: 0, fontSize: 'var(--ds-typography-h3)', whiteSpace: 'pre-line' }}>
            {layoutTitle}
          </Headline>
          {otherSettings && (
            <Text size="S" weight="low" color="low" as="p" style={{ margin: 0, whiteSpace: 'pre-line' }}>
              {otherSettings}
            </Text>
          )}
        </div>
      </WidthCap>
    )
    return (
      <section key={block._key}>
        {helperInfo}
        {blockContent}
      </section>
    )
  }

  return (
    <>
      {blocks.map((block, i) => {
        switch (block._type) {
          case 'hero': {
            const props = mapHeroBlockProps(block)
            return wrapSection(<LabHeroBlock {...props} />, block, i)
          }
          case 'mediaTextStacked':
          case 'mediaTextBlock': {
            const mapped = mapMediaTextBlock(block)
            return wrapSection(<MediaTextBlock {...mapped} />, block, i)
          }
          case 'mediaText5050': {
            const mapped = mapMediaText5050Block(block)
            return wrapSection(<LabMediaText5050Block {...mapped} />, block, i)
          }
          case 'labCardGrid': {
            const cols = block.columns as string
            const items = (block.items ?? []) as import('./blocks/LabCardRenderer').LabCardItem[]
            return wrapSection(
              <LabCardGridBlock
                columns={parseInt(cols, 10) as 2 | 3 | 4}
                title={block.title as string}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                surfaceColour={block.surfaceColour as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
                items={items}
              />,
              block,
              i,
            )
          }
          case 'labCarousel':
          case 'carousel': {
            const rawItems = (block.items ?? []) as { cardType?: string; title?: string; description?: string; image?: string; video?: string; link?: string; ctaText?: string; aspectRatio?: string; imageSlot?: string }[]
            const carouselItems = rawItems.map((it) => ({
              _type: 'labCardItem' as const,
              cardType: (it.cardType === 'text-on-colour' ? 'text-on-colour' : 'media-description-below') as 'media-description-below' | 'text-on-colour',
              title: it.title,
              description: it.description,
              image: it.image,
              video: it.video,
              link: it.link,
              ctaText: it.ctaText,
              aspectRatio: (it.aspectRatio as '4:5' | '8:5' | '2:1') ?? '4:5',
              imageSlot: it.imageSlot,
            })) as import('./blocks/LabCardRenderer').LabCardItem[]
            return wrapSection(
              <LabCarouselBlock
                title={block.title as string}
                cardSize={(block.cardSize as 'compact' | 'medium' | 'large') ?? 'medium'}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                surfaceColour={block.surfaceColour as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
                items={carouselItems}
              />,
              block,
              i,
            )
          }
          case 'fullBleedVerticalCarousel': {
            return wrapSection(
              <LabFullBleedVerticalCarousel
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                surfaceColour={block.surfaceColour as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
                items={block.items as { title?: string; description?: string; image?: string; video?: string }[]}
              />,
              block,
              i,
            )
          }
          case 'rotatingMedia': {
            return wrapSection(
              <LabRotatingMediaBlock
                variant={(block.variant as 'small' | 'large' | 'combined') ?? 'small'}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                surfaceColour={block.surfaceColour as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
                items={(block.items as { image?: string; title?: string; label?: string }[]).map((i) => ({
                  image: i.image ?? '/placeholder-preview.svg',
                  title: i.title,
                  label: i.label,
                }))}
              />,
              block,
              i,
            )
          }
          case 'iconGrid': {
            const SPECTRUMS = ['indigo', 'sky', 'pink', 'gold', 'red', 'purple', 'mint', 'violet', 'marigold', 'green', 'crimson', 'orange'] as const
            const items = Array.isArray(block.items)
              ? (block.items as { title?: string; body?: string; icon?: string; accentColor?: string; spectrum?: string }[]).map((i) => ({
                  title: (i.title as string) ?? '',
                  body: i.body as string | undefined,
                  icon: (i.icon as string) ?? 'IcGlobe',
                  accentColor: (i.accentColor === 'primary' || i.accentColor === 'secondary' || i.accentColor === 'tertiary' || i.accentColor === 'positive' || i.accentColor === 'neutral' ? i.accentColor : 'primary') as 'primary' | 'secondary' | 'tertiary' | 'positive' | 'neutral',
                  spectrum: i.spectrum && SPECTRUMS.includes(i.spectrum as (typeof SPECTRUMS)[number]) ? (i.spectrum as (typeof SPECTRUMS)[number]) : undefined,
                }))
              : []
            return wrapSection(
              <IconGridBlock
                items={items}
                columns={(block.columns as 3 | 4 | 5 | 6) ?? undefined}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                surfaceColour={block.surfaceColour as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
              />,
              block,
              i,
            )
          }
          case 'proofPoints': {
            const ppSurf = String(block.emphasis ?? '').toLowerCase()
            const ppSurfValid = ppSurf && ['ghost', 'minimal', 'subtle', 'bold'].includes(ppSurf) ? ppSurf : undefined
            const ppAcc = String(block.surfaceColour ?? '').toLowerCase()
            const ppAccValid = ppAcc && ['primary', 'secondary', 'sparkle', 'neutral'].includes(ppAcc) ? ppAcc : undefined
            const ppVariant = (block.variant as string)?.toLowerCase?.() === 'stat' ? 'stat' : 'icon'
            return wrapSection(
              <ProofPointsBlock
                title={block.title as string | null}
                variant={ppVariant}
                emphasis={ppSurfValid as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                surfaceColour={ppAccValid as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
                items={block.items as { title?: string; description?: string; icon?: string }[]}
              />,
              block,
              i,
            )
          }
          case 'mediaZoomOutOnScroll': {
            return wrapSection(
              <LabMediaZoomOutOnScroll
                image={(block.image as string) || '/placeholder-preview.svg'}
                videoUrl={block.videoUrl as string | null}
                alt={block.alt as string | null}
              />,
              block,
              i,
            )
          }
          case 'topNavBlock': {
            return wrapSection(<LabTopNavBlock />, block, i)
          }
          case 'editorialBlock': {
            const textArea = block.textArea as { topLeft?: { column?: number; row?: number }; bottomRight?: { column?: number; row?: number } } | undefined
            const imageArea = block.imageArea as { topLeft?: { column?: number; row?: number }; bottomRight?: { column?: number; row?: number } } | undefined
            return wrapSection(
              <EditorialBlock
                headline={block.headline as string | null}
                body={block.body as string | null}
                backgroundImage={block.backgroundImage as string | null}
                backgroundImagePositionX={block.backgroundImagePositionX as number | null}
                backgroundImagePositionY={block.backgroundImagePositionY as number | null}
                image={block.image as string | null}
                videoUrl={block.videoUrl as string | null}
                ctaText={block.ctaText as string | null}
                ctaLink={block.ctaLink as string | null}
                textTopLeft={textArea?.topLeft}
                textBottomRight={textArea?.bottomRight}
                headlineSize={block.headlineSize as 'display' | 'headline' | 'title' | undefined}
                textAlign={block.textAlign as 'left' | 'center' | undefined}
                textVerticalAlign={block.textVerticalAlign as 'center' | 'bottom' | undefined}
                imageTopLeft={imageArea?.topLeft}
                imageBottomRight={imageArea?.bottomRight}
                imageFit={(block.imageFit as 'cover' | 'contain') ?? 'contain'}
                textInFront={block.textInFront as boolean | undefined}
                rows={block.rows as number | undefined}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                surfaceColour={block.surfaceColour as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
              />,
              block,
              i,
            )
          }
          case 'list': {
            const listItems = Array.isArray(block.items)
              ? (block.items as { title?: string; body?: string; linkText?: string; linkUrl?: string; subtitle?: string }[]).map((i) => ({
                  title: i.title,
                  body: i.body,
                  linkText: i.linkText,
                  linkUrl: i.linkUrl,
                  subtitle: i.subtitle,
                }))
              : []
            const listSurf = String(block.emphasis ?? '').toLowerCase()
            const listSurfValid = listSurf && ['ghost', 'minimal', 'subtle', 'bold'].includes(listSurf) ? listSurf : undefined
            const listAcc = String(block.surfaceColour ?? '').toLowerCase()
            const listAccValid = listAcc && ['primary', 'secondary', 'sparkle', 'neutral'].includes(listAcc) ? listAcc : undefined
            return wrapSection(
              <ListBlock
                blockTitle={block.blockTitle as string | null}
                listVariant={(block.listVariant as 'textList' | 'faq' | 'links') ?? 'textList'}
                items={listItems}
                size={(block.size as 'hero' | 'feature' | 'editorial') ?? 'feature'}
                emphasis={listSurfValid as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                surfaceColour={listAccValid as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
                openLinksInNewTab={listBlockOpenLinksInNewTab}
              />,
              block,
              i,
            )
          }
          default:
            return null
        }
      })}
    </>
  )
}
