'use client'

import React from 'react'
/**
 * Lab block renderer – renders blocks from Sanity lab page sections.
 * Media + Text 50/50 re-exports the production block from app/blocks.
 */

import {
  LabHeroBlock,
  LabCardGridBlock,
  LabMediaZoomOutOnScroll,
  LabFullBleedVerticalCarousel,
  LabCarouselBlock,
  LabRotatingMediaBlock,
  LabTopNavBlock,
  EditorialBlock,
  LabIconGridBlock,
  LabMediaTextBlock,
  LabProofPointsBlock,
  LabMediaTextAsymmetricBlock,
  LabMediaText5050Block,
  WidthCap,
  BlockShell,
  mapMediaText5050BlockProps,
} from '@design2code/block-library'
import type { BlockPattern, LabHeroBlockProps, MediaTextBlockProps } from '@design2code/block-library'
import { Headline, Text } from '@marcelinodzn/ds-react'
import { labStyleHeadlineVariantRail } from '@design2code/ds'
import { labHeadlinePresets, labTextPresets } from '@design2code/ds'

type LabBlock = {
  _type: string
  _key?: string
  [key: string]: unknown
}

function mapLabParagraphRowsFromBlock(block: LabBlock) {
  const raw = block.paragraphRows
  if (!Array.isArray(raw)) return []
  return (
    raw as {
      _key?: string
      title?: string
      body?: string
      linkText?: string
      linkUrl?: string
    }[]
  ).map((p) => ({
    _key: p._key,
    title: p.title,
    body: p.body,
    linkText: p.linkText,
    linkUrl: p.linkUrl,
  }))
}

/** Map production `mediaTextAsymmetric` document shape → lab asymmetric props (legacy / mixed lab data). */
function normalizeLegacyProductionAsymmetricForLab(block: LabBlock): {
  blockTitle: string | null
  variant: 'paragraphs' | 'faq' | 'links' | 'image'
  paragraphRows?: Array<{
    _key?: string
    title?: string | null
    body?: string | null
    linkText?: string | null
    linkUrl?: string | null
  }>
  items?: Array<{
    title?: string | null
    body?: string | null
    linkText?: string | null
    linkUrl?: string | null
    subtitle?: string | null
  }>
  mainImageSrc?: string
  imageAspectRatio?: '5:4' | '1:1' | '4:5'
  imageAlt?: string | null
} {
  const rawVariant = (block.variant as string) ?? 'textList'
  const blockTitle = (block.blockTitle as string | null) ?? null

  if (rawVariant === 'paragraphs') {
    return { blockTitle, variant: 'paragraphs', paragraphRows: mapLabParagraphRowsFromBlock(block) }
  }

  if (rawVariant === 'faq' || rawVariant === 'links') {
    const items = Array.isArray(block.items)
      ? (block.items as { title?: string; body?: string; linkText?: string; linkUrl?: string; subtitle?: string }[]).map(
          (i) => ({
            title: i.title,
            body: i.body,
            linkText: i.linkText,
            linkUrl: i.linkUrl,
            subtitle: i.subtitle,
          }),
        )
      : []
    return { blockTitle, variant: rawVariant, items }
  }

  if (rawVariant === 'image') {
    const mainImageRaw = block.image as string | undefined
    const mainImageSrc =
      typeof mainImageRaw === 'string' && mainImageRaw.trim().length > 0
        ? mainImageRaw.trim()
        : typeof block.imageUrl === 'string' && block.imageUrl.trim().length > 0
          ? (block.imageUrl as string).trim()
          : ''
    const ar = block.imageAspectRatio as string | undefined
    const imageAspectRatio =
      ar === '5:4' || ar === '1:1' || ar === '4:5' ? (ar as '5:4' | '1:1' | '4:5') : undefined
    return {
      blockTitle,
      variant: 'image',
      mainImageSrc,
      imageAspectRatio,
      imageAlt: (block.imageAlt as string | null) ?? null,
    }
  }

  if (rawVariant === 'textList' || rawVariant === 'longForm') {
    const paragraphRows =
      rawVariant === 'textList'
        ? (Array.isArray(block.items) ? block.items : []).map((it, i) => {
            const row = it as {
              _key?: string
              title?: string | null
              body?: string | null
              linkText?: string | null
              linkUrl?: string | null
            }
            return {
              _key: row._key ?? `legacy-tl-${i}`,
              title: row.title,
              body: row.body,
              linkText: row.linkText,
              linkUrl: row.linkUrl,
            }
          })
        : (Array.isArray(block.longFormParagraphs) ? block.longFormParagraphs : []).map(
            (p: { _key?: string; text?: string | null }, i) => ({
              _key: p._key ?? `legacy-lf-${i}`,
              title: undefined as string | undefined,
              body: p.text,
            }),
          )
    return { blockTitle, variant: 'paragraphs', paragraphRows }
  }

  return { blockTitle, variant: 'paragraphs', paragraphRows: [] }
}

function getBlockTypeTitle(_type: string): string {
  const titles: Record<string, string> = {
    hero: 'Hero',
    labHero: 'Hero',
    mediaTextStacked: 'Media + Text: Stacked',
    labMediaTextStacked: 'Media + Text: Stacked',
    mediaTextBlock: 'Media + Text: Stacked',
    mediaText5050: 'Media + Text: 50/50',
    labMediaText5050: 'Media + Text: 50/50',
    labCardGrid: 'Card grid',
    carousel: 'Carousel (responsive)',
    labCarousel: 'Carousel',
    fullBleedVerticalCarousel: 'Full bleed vertical carousel',
    labFullBleedVerticalCarousel: 'Full bleed vertical carousel',
    rotatingMedia: 'Rotating media',
    labRotatingMedia: 'Rotating media',
    iconGrid: 'Icon grid',
    labIconGrid: 'Icon grid',
    proofPoints: 'Proof points',
    labProofPoints: 'Proof points',
    mediaTextAsymmetric: 'Media + Text Asymmetric',
    labMediaTextAsymmetric: 'Media + Text Asymmetric',
    mediaZoomOutOnScroll: 'Media zoom out on scroll',
    labMediaZoomOutOnScroll: 'Media zoom out on scroll',
    topNavBlock: 'Top nav (mega menu)',
    editorialBlock: 'Editorial',
    labEditorialBlock: 'Editorial',
  }
  return titles[_type] ?? _type
}

/** Layout setting only – used as section title (h2) above each block. */
export function getBlockLayoutTitle(block: LabBlock): string {
  switch (block._type) {
    case 'hero':
    case 'labHero': {
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
                ? 'stacked'
                : containerLayout === 'contained'
                  ? 'Side by side (Contained)'
                  : 'Side by side (Edge to edge)'
      const parts = [layoutLabel]
      if (contentLayout === 'sidebyside' && anchor === 'bottom') parts.push('Top to bottom')
      if (hasVideo) parts.push('Video')
      return parts.join(' · ')
    }
    case 'fullBleedVerticalCarousel':
    case 'labFullBleedVerticalCarousel':
      return 'Full bleed'
    case 'rotatingMedia':
    case 'labRotatingMedia': {
      const v = (block.variant as string) ?? 'small'
      return v === 'combined' ? 'Combined' : v === 'large' ? 'Large' : 'Small'
    }
    case 'labCardGrid':
      return `${block.columns ?? '3'} columns`
    case 'mediaZoomOutOnScroll':
    case 'labMediaZoomOutOnScroll':
      return block.videoUrl ? 'With video' : 'Image only'
    case 'iconGrid':
    case 'labIconGrid': {
      const cols = block.columns as number | undefined
      return cols == null ? 'Auto columns' : `${cols} columns`
    }
    case 'proofPoints':
    case 'labProofPoints': {
      const v = (block.variant as string) ?? 'icon'
      return v === 'stat' ? 'Stat' : 'Icon'
    }
    case 'mediaText5050':
    case 'labMediaText5050': {
      const variant = (block.variant as string) ?? 'multiParagraph'
      const variantLabels: Record<string, string> = {
        singleParagraph: 'Single paragraph',
        multiParagraph: 'Multi paragraph',
        paragraphs: 'Paragraphs',
        accordion: 'Accordion',
      }
      const imagePosition = (block.imagePosition as string) ?? 'right'
      const layout =
        variant === 'paragraphs' && (block.paragraphColumnLayout as string) === 'single'
          ? ' · Single'
          : variant === 'paragraphs'
            ? ' · Multi'
            : ''
      return `${variantLabels[variant] ?? variant}${layout} · Image ${imagePosition}`
    }
    case 'mediaTextStacked':
    case 'labMediaTextStacked':
    case 'mediaTextBlock': {
      const rawTemplate = (block.template as string) ?? 'stacked'
      const template = (rawTemplate === 'SideBySide' || rawTemplate === 'sideBySide') ? 'stacked' : rawTemplate === 'MediaOverlay' ? 'overlay' : rawTemplate
      if (template === 'textOnly') return `Text only · Align ${block.alignment as string}`
      const mediaSize = block.mediaSize as string
      const sizeLabel = mediaSize === 'edgeToEdge' ? 'Edge to edge' : 'Contained'
      if (template === 'overlay') return `Overlay · ${sizeLabel} · Align ${block.alignment as string}`
      return `Stacked · ${sizeLabel} · Align ${block.alignment as string}`
    }
    case 'carousel':
    case 'labCarousel': {
      const size = (block.cardSize as string) ?? 'medium'
      return size === 'compact' ? 'Compact' : size === 'large' ? 'Large' : 'Medium'
    }
    case 'mediaTextAsymmetric': {
      const v = (block.variant as string) ?? 'textList'
      if (v === 'faq') return 'FAQ'
      if (v === 'links') return 'Links'
      if (v === 'longForm') return 'Long form'
      return 'Paragraphs'
    }
    case 'labMediaTextAsymmetric': {
      const v = (block.variant as string) ?? 'paragraphs'
      if (v === 'faq') return 'FAQ'
      if (v === 'links') return 'Links'
      if (v === 'image') return 'Image'
      if (v === 'paragraphs' && (block.paragraphLayout as string) === 'single') return 'Paragraphs · Single column'
      return 'Paragraphs · Sections'
    }
    case 'topNavBlock':
      return 'Mega menu'
    case 'editorialBlock':
    case 'labEditorialBlock':
      return 'Editorial'
    default:
      return getBlockTypeTitle(block._type)
  }
}

/** Other settings (emphasis, surface colour, counts) – used as subtitle (smaller font) under the title. */
export function getBlockOtherSettings(block: LabBlock): string {
  switch (block._type) {
    case 'hero':
    case 'labHero': {
      const surface = String(block.emphasis ?? 'bold')
      const surfaceLabel =
        surface === 'ghost' ? 'No colour' : (surface && typeof surface === 'string' ? surface.charAt(0).toUpperCase() + surface.slice(1) : 'Minimal')
      return `Emphasis: ${surfaceLabel} · Appearance: ${(block.appearance ?? block.surfaceColour) ?? ''}`
    }
    case 'fullBleedVerticalCarousel':
    case 'labFullBleedVerticalCarousel':
      return `Emphasis: ${block.emphasis ?? ''} · Appearance: ${(block.appearance ?? block.surfaceColour) ?? ''}`
    case 'rotatingMedia':
    case 'labRotatingMedia':
      return `Emphasis: ${block.emphasis ?? ''} · Appearance: ${(block.appearance ?? block.surfaceColour) ?? ''}`
    case 'labCardGrid':
      return `Emphasis: ${block.emphasis ?? ''} · Appearance: ${(block.appearance ?? block.surfaceColour) ?? ''} · ${Array.isArray(block.items) ? block.items.length : 0} card(s)`
    case 'mediaZoomOutOnScroll':
    case 'labMediaZoomOutOnScroll':
      return ''
    case 'iconGrid':
    case 'labIconGrid':
      return `Emphasis: ${block.emphasis ?? ''} · Appearance: ${(block.appearance ?? block.surfaceColour) ?? ''} · ${Array.isArray(block.items) ? block.items.length : 0} item(s)`
    case 'proofPoints':
    case 'labProofPoints':
      return `Emphasis: ${block.emphasis ?? ''} · Appearance: ${(block.appearance ?? block.surfaceColour) ?? ''} · ${Array.isArray(block.items) ? block.items.length : 0} item(s)`
    case 'mediaText5050':
      return `Emphasis: ${block.emphasis ?? ''} · Appearance: ${(block.appearance ?? block.surfaceColour) ?? ''} · ${Array.isArray(block.items) ? block.items.length : 0} item(s)`
    case 'labMediaText5050': {
      const v = (block.variant as string) ?? 'multiParagraph'
      const n =
        v === 'accordion'
          ? Array.isArray(block.accordionItems)
            ? block.accordionItems.length
            : 0
          : v === 'singleParagraph' || ((block.paragraphColumnLayout as string) === 'single')
            ? 1
            : Array.isArray(block.items)
              ? block.items.length
              : 0
      return `Emphasis: ${block.emphasis ?? ''} · Appearance: ${(block.appearance ?? block.surfaceColour) ?? ''} · ${n} section(s)`
    }
    case 'mediaTextStacked':
    case 'labMediaTextStacked':
    case 'mediaTextBlock':
      return `Emphasis: ${block.emphasis ?? ''} · Appearance: ${(block.appearance ?? block.surfaceColour) ?? ''}`
    case 'carousel':
    case 'labCarousel':
      return `Emphasis: ${block.emphasis ?? ''} · Appearance: ${(block.appearance ?? block.surfaceColour) ?? ''} · ${Array.isArray(block.items) ? block.items.length : 0} item(s)`
    case 'mediaTextAsymmetric': {
      const v = (block.variant as string) ?? 'textList'
      const n =
        v === 'longForm'
          ? Array.isArray(block.longFormParagraphs)
            ? block.longFormParagraphs.length
            : 0
          : Array.isArray(block.items)
            ? block.items.length
            : 0
      const label = v === 'longForm' ? 'paragraph(s)' : 'item(s)'
      return `Emphasis: ${block.emphasis ?? ''} · Appearance: ${(block.appearance ?? block.surfaceColour) ?? ''} · ${n} ${label}`
    }
    case 'labMediaTextAsymmetric': {
      const v = (block.variant as string) ?? 'paragraphs'
      if (v === 'image') {
        const ar = (block.imageAspectRatio as string) ?? '4:5'
        return `Emphasis: ${block.emphasis ?? ''} · Appearance: ${(block.appearance ?? block.surfaceColour) ?? ''} · ${ar} image`
      }
      const isSinglePara = v === 'paragraphs' && (block.paragraphLayout as string) === 'single'
      const n =
        v === 'paragraphs'
          ? isSinglePara
            ? 1
            : Array.isArray(block.paragraphRows)
              ? block.paragraphRows.length
              : 0
          : Array.isArray(block.items)
            ? block.items.length
            : 0
      const label =
        v === 'paragraphs' ? (isSinglePara ? 'column' : 'section(s)') : 'item(s)'
      return `Emphasis: ${block.emphasis ?? ''} · Appearance: ${(block.appearance ?? block.surfaceColour) ?? ''} · ${n} ${label}`
    }
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
  if (contentLayout === 'mediaoverlay' || template === 'mediaoverlay') {
    return 'overlay'
  }
  if ((block._type === 'hero' || block._type === 'labHero') && contentLayout === 'category') {
    return 'band'
  }
  /** Hero sideBySide contained → always contained, never band. Background constrained to grid width by ContainedShell. */
  if (
    (block._type === 'hero' || block._type === 'labHero') &&
    contentLayout === 'sidebyside' &&
    (block.containerLayout as string)?.toLowerCase?.() === 'contained'
  ) {
    return 'contained'
  }
  const emphasis = (block.emphasis as string)?.toLowerCase?.()
  const hasBand = emphasis && !['ghost', 'none'].includes(emphasis)
  const bandTypes = [
    'hero',
    'labHero',
    'mediaTextStacked',
    'labMediaTextStacked',
    'mediaTextBlock',
    'mediaText5050',
    'labMediaText5050',
    'carousel',
    'labCarousel',
    'labCardGrid',
    'cardGrid',
    'proofPoints',
    'labProofPoints',
    'iconGrid',
    'labIconGrid',
    'mediaTextAsymmetric',
    'labMediaTextAsymmetric',
    'fullBleedVerticalCarousel',
    'labFullBleedVerticalCarousel',
    'rotatingMedia',
    'labRotatingMedia',
    'editorialBlock',
    'labEditorialBlock',
  ]
  if (hasBand && bandTypes.includes(block._type)) {
    return 'band'
  }
  return 'contained'
}

function mapMediaTextBlock(block: LabBlock): MediaTextBlockProps {
  const rawTemplate = block.template as string
  /** Legacy: SideBySide is now mediaText5050; treat as Stacked. MediaOverlay → Overlay. */
  const template = (rawTemplate === 'SideBySide' || rawTemplate === 'sideBySide')
    ? 'stacked'
    : rawTemplate === 'MediaOverlay'
      ? 'overlay'
      : (rawTemplate ?? 'stacked')
  /** Same aspect ratio for Stacked and Overlay so contained media containers match (2:1). */
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

  const mediaSize = block.mediaSize as string
  /** Stacked and Overlay: edge to edge or contained based on mediaSize. */
  const width =
    (template === 'stacked' || template === 'overlay') && mediaSize === 'edgeToEdge'
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
    appearance: (block.appearance ?? block.surfaceColour) as MediaTextBlockProps['appearance'] | undefined,
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

function mapHeroBlockProps(block: LabBlock) {
  const contentLayout = (block.contentLayout as string) ?? 'stacked'
  const containerLayout = (block.containerLayout as string) ?? 'edgeToEdge'
  return {
    eyebrow: block.eyebrow as string | null,
    title: block.title as string | null,
    body: block.body as string | null,
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
    appearance: (block.appearance ?? block.surfaceColour) as LabHeroBlockProps['appearance'],
  }
}

type LabBlockRendererProps = {
  blocks: LabBlock[] | null | undefined
  /** When provided (e.g. block variant pages), use these as section titles instead of block type. */
  variantLabels?: string[]
  /** When true, render blocks without section headers/settings (e.g. lab overview). */
  clean?: boolean
  /** When true, Media + Text Asymmetric block links open in new tab. */
  asymmetricBlockOpenLinksInNewTab?: boolean
}

export function LabBlockRenderer({ blocks, variantLabels, clean, asymmetricBlockOpenLinksInNewTab }: LabBlockRendererProps) {
  if (!blocks?.length) return null

  const wrapSection = (content: React.ReactNode, block: LabBlock, i: number) => {
    const spacingTop =
      (block._type === 'hero' || block._type === 'labHero')
        ? undefined
        : (block.spacingTop ? normalizeSpacing(block.spacingTop) : block.spacing ? normalizeSpacing(block.spacing) : undefined) as BlockSpacingValue | undefined
    const spacingBottom = (block.spacingBottom ? normalizeSpacing(block.spacingBottom) : block.spacing ? normalizeSpacing(block.spacing) : undefined) as BlockSpacingValue | undefined
    const pattern = deriveLabPattern(block)
    const contentLayout = (block.contentLayout as string)?.toLowerCase?.()
    const isHeroCategory = (block._type === 'hero' || block._type === 'labHero') && contentLayout === 'category'
    const imageAnchor = (block.imageAnchor as string)?.toLowerCase?.()
    const isHeroTopToBottom = (block._type === 'hero' || block._type === 'labHero') && contentLayout === 'sidebyside' && imageAnchor === 'bottom'
    const emphasis = (block.emphasis as string)?.toLowerCase?.() as 'ghost' | 'minimal' | 'subtle' | 'bold' | undefined
    const shellEmphasis = isHeroCategory ? 'ghost' : emphasis
    const bandAppearance = ((block.appearance ?? block.surfaceColour) as string)?.toLowerCase?.() as
      | 'primary'
      | 'secondary'
      | 'sparkle'
      | 'neutral'
      | undefined
    const minimalBackgroundStyle = ((block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block') as 'block' | 'gradient'

    const blockContent = (
      <BlockShell
        pattern={pattern}
        spacingTop={spacingTop}
        spacingBottom={spacingBottom}
        emphasis={shellEmphasis}
        appearance={bandAppearance}
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
          <Headline
            size="S"
            as="h2"
            style={{ margin: 0, whiteSpace: 'pre-line', ...labStyleHeadlineVariantRail }}
            {...labHeadlinePresets.block}
          >
            {layoutTitle}
          </Headline>
          {otherSettings && (
            <Text as="p" style={{ margin: 0, whiteSpace: 'pre-line' }} {...labTextPresets.body}>
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
          case 'hero':
          case 'labHero': {
            const props = mapHeroBlockProps(block)
            return wrapSection(<LabHeroBlock {...props} />, block, i)
          }
          case 'mediaTextStacked':
          case 'labMediaTextStacked':
          case 'mediaTextBlock': {
            const mapped = mapMediaTextBlock(block)
            return wrapSection(<LabMediaTextBlock {...mapped} />, block, i)
          }
          case 'mediaText5050':
          case 'labMediaText5050': {
            const mapped = mapMediaText5050BlockProps(block)
            return wrapSection(<LabMediaText5050Block {...mapped} />, block, i)
          }
          case 'labCardGrid': {
            const cols = block.columns as string
            const items = (block.items ?? []) as import('./blocks/LabCardRenderer').LabCardItem[]
            return wrapSection(
              <LabCardGridBlock
                columns={parseInt(cols, 10) as 2 | 3 | 4}
                interaction={(block.interaction as 'information' | 'navigation') ?? 'information'}
                cardSurface={block.cardSurface as 'minimal' | 'subtle' | 'moderate' | 'bold' | 'inverted' | undefined}
                title={block.title as string}
                description={block.description as string | null | undefined}
                callToActions={block.callToActions as import('../../lib/lab/lab-block-framing-typography').LabBlockCallToAction[] | undefined}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                appearance={(block.appearance ?? block.surfaceColour) as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
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
              cardType: it.cardType ?? 'mediaTextBelow',
              title: it.title,
              description: it.description,
              image: it.image,
              video: it.video,
              link: it.link,
              ctaText: it.ctaText,
              aspectRatio: (it.aspectRatio as '4:5' | '8:5' | '2:1') ?? '4:5',
              imageSlot: it.imageSlot,
              backgroundColor: (it as { backgroundColor?: string | null }).backgroundColor,
            })) as import('./blocks/LabCardRenderer').LabCardItem[]
            return wrapSection(
              <LabCarouselBlock
                eyebrow={block.eyebrow as string | null | undefined}
                title={block.title as string}
                description={block.description as string | null | undefined}
                callToActions={block.callToActions as import('../../lib/lab/lab-block-framing-typography').LabBlockCallToAction[] | undefined}
                interaction={(block.interaction as 'information' | 'navigation') ?? 'information'}
                cardSurface={block.cardSurface as 'minimal' | 'subtle' | 'moderate' | 'bold' | 'inverted' | undefined}
                cardSize={(block.cardSize as 'compact' | 'medium' | 'large') ?? 'medium'}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                appearance={(block.appearance ?? block.surfaceColour) as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
                items={carouselItems}
              />,
              block,
              i,
            )
          }
          case 'fullBleedVerticalCarousel':
          case 'labFullBleedVerticalCarousel': {
            return wrapSection(
              <LabFullBleedVerticalCarousel
                title={block.title as string | null | undefined}
                description={block.description as string | null | undefined}
                callToActions={block.callToActions as import('../../lib/lab/lab-block-framing-typography').LabBlockCallToAction[] | undefined}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                appearance={(block.appearance ?? block.surfaceColour) as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
                items={block.items as { title?: string; description?: string; image?: string; video?: string }[]}
              />,
              block,
              i,
            )
          }
          case 'rotatingMedia':
          case 'labRotatingMedia': {
            return wrapSection(
              <LabRotatingMediaBlock
                title={block.title as string | null | undefined}
                description={block.description as string | null | undefined}
                callToActions={block.callToActions as import('../../lib/lab/lab-block-framing-typography').LabBlockCallToAction[] | undefined}
                variant={(block.variant as 'small' | 'large' | 'combined') ?? 'small'}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                appearance={(block.appearance ?? block.surfaceColour) as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
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
          case 'iconGrid':
          case 'labIconGrid': {
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
              <LabIconGridBlock
                title={block.title as string | null | undefined}
                description={block.description as string | null | undefined}
                callToActions={block.callToActions as import('../../lib/lab/lab-block-framing-typography').LabBlockCallToAction[] | undefined}
                items={items}
                columns={(block.columns as 3 | 4 | 5 | 6) ?? undefined}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                appearance={(block.appearance ?? block.surfaceColour) as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
              />,
              block,
              i,
            )
          }
          case 'proofPoints':
          case 'labProofPoints': {
            const ppSurf = String(block.emphasis ?? '').toLowerCase()
            const ppSurfValid = ppSurf && ['ghost', 'minimal', 'subtle', 'bold'].includes(ppSurf) ? ppSurf : undefined
            const ppAcc = String((block.appearance ?? block.surfaceColour) ?? '').toLowerCase()
            const ppAccValid = ppAcc && ['primary', 'secondary', 'sparkle', 'neutral'].includes(ppAcc) ? ppAcc : undefined
            const ppVariant = (block.variant as string)?.toLowerCase?.() === 'stat' ? 'stat' : 'icon'
            return wrapSection(
              <LabProofPointsBlock
                title={block.title as string | null}
                description={block.description as string | null | undefined}
                callToActions={block.callToActions as import('../../lib/lab/lab-block-framing-typography').LabBlockCallToAction[] | undefined}
                variant={ppVariant}
                emphasis={ppSurfValid as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                appearance={ppAccValid as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
                items={block.items as { title?: string; description?: string; icon?: string }[]}
              />,
              block,
              i,
            )
          }
          case 'mediaZoomOutOnScroll':
          case 'labMediaZoomOutOnScroll': {
            return wrapSection(
              <LabMediaZoomOutOnScroll
                title={block.title as string | null | undefined}
                description={block.description as string | null | undefined}
                callToActions={block.callToActions as import('../../lib/lab/lab-block-framing-typography').LabBlockCallToAction[] | undefined}
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
          case 'editorialBlock':
          case 'labEditorialBlock': {
            const textArea = block.textArea as { topLeft?: { column?: number; row?: number }; bottomRight?: { column?: number; row?: number } } | undefined
            const imageArea = block.imageArea as { topLeft?: { column?: number; row?: number }; bottomRight?: { column?: number; row?: number } } | undefined
            return wrapSection(
              <EditorialBlock
                headline={block.headline as string | null}
                description={block.description as string | null | undefined}
                callToActions={block.callToActions as import('../../lib/lab/lab-block-framing-typography').LabBlockCallToAction[] | undefined}
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
                appearance={(block.appearance ?? block.surfaceColour) as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
              />,
              block,
              i,
            )
          }
          case 'labMediaTextAsymmetric': {
            const paragraphRows = mapLabParagraphRowsFromBlock(block)
            const paragraphLayout =
              (block.paragraphLayout as string) === 'single' ? ('single' as const) : ('multi' as const)
            const asymmetricItems = Array.isArray(block.items)
              ? (block.items as { title?: string; body?: string; linkText?: string; linkUrl?: string; subtitle?: string }[]).map((j) => ({
                  title: j.title,
                  body: j.body,
                  linkText: j.linkText,
                  linkUrl: j.linkUrl,
                  subtitle: j.subtitle,
                }))
              : []
            const asymmetricSurf = String(block.emphasis ?? '').toLowerCase()
            const asymmetricSurfValid = asymmetricSurf && ['ghost', 'minimal', 'subtle', 'bold'].includes(asymmetricSurf) ? asymmetricSurf : undefined
            const asymmetricAcc = String((block.appearance ?? block.surfaceColour) ?? '').toLowerCase()
            const asymmetricAccValid = asymmetricAcc && ['primary', 'secondary', 'sparkle', 'neutral'].includes(asymmetricAcc) ? asymmetricAcc : undefined
            const mainImageRaw = block.image as string | null | undefined
            const mainImageSrc =
              typeof mainImageRaw === 'string' && mainImageRaw.trim().length > 0
                ? mainImageRaw.trim()
                : typeof block.imageUrl === 'string' && block.imageUrl.trim().length > 0
                  ? block.imageUrl.trim()
                  : ''
            const ar = block.imageAspectRatio as string | undefined
            const imageAspectRatio =
              ar === '5:4' || ar === '1:1' || ar === '4:5' ? (ar as '5:4' | '1:1' | '4:5') : undefined
            return wrapSection(
              <LabMediaTextAsymmetricBlock
                blockTitle={block.blockTitle as string | null}
                variant={(block.variant as 'paragraphs' | 'faq' | 'links' | 'image') ?? 'paragraphs'}
                paragraphLayout={paragraphLayout}
                singleColumnBody={(block.singleColumnBody as string | null) ?? null}
                paragraphRows={paragraphRows}
                items={asymmetricItems}
                mainImageSrc={mainImageSrc}
                imageAspectRatio={imageAspectRatio}
                imageAlt={(block.imageAlt as string | null) ?? null}
                size={(block.size as 'hero' | 'feature' | 'editorial') ?? 'feature'}
                emphasis={asymmetricSurfValid as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                appearance={asymmetricAccValid as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
                openLinksInNewTab={asymmetricBlockOpenLinksInNewTab}
              />,
              block,
              i,
            )
          }
          case 'mediaTextAsymmetric': {
            const normalized = normalizeLegacyProductionAsymmetricForLab(block)
            const asymmetricSurf = String(block.emphasis ?? '').toLowerCase()
            const asymmetricSurfValid = asymmetricSurf && ['ghost', 'minimal', 'subtle', 'bold'].includes(asymmetricSurf) ? asymmetricSurf : undefined
            const asymmetricAcc = String((block.appearance ?? block.surfaceColour) ?? '').toLowerCase()
            const asymmetricAccValid = asymmetricAcc && ['primary', 'secondary', 'sparkle', 'neutral'].includes(asymmetricAcc) ? asymmetricAcc : undefined
            return wrapSection(
              <LabMediaTextAsymmetricBlock
                blockTitle={normalized.blockTitle}
                variant={normalized.variant}
                paragraphLayout="multi"
                singleColumnBody={null}
                paragraphRows={normalized.paragraphRows}
                items={normalized.items}
                mainImageSrc={normalized.mainImageSrc}
                imageAspectRatio={normalized.imageAspectRatio}
                imageAlt={normalized.imageAlt}
                size={(block.size as 'hero' | 'feature' | 'editorial') ?? 'feature'}
                emphasis={asymmetricSurfValid as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                appearance={asymmetricAccValid as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
                openLinksInNewTab={asymmetricBlockOpenLinksInNewTab}
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
