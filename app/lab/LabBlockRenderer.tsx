'use client'

import React from 'react'
/**
 * Lab block renderer – renders blocks from Sanity lab page sections.
 * Hero, FullBleedVerticalCarousel, RotatingMedia, MediaZoomOutOnScroll.
 */

import {
  IconGridBlock,
  MediaZoomOutOnScroll,
  FullBleedVerticalCarousel,
  RotatingMediaBlock,
  MediaText5050Block,
} from './blocks'
import { HeroBlock, MediaTextBlock, CardGridBlock, CarouselBlock, ProofPointsBlock, ListBlock } from '../blocks'
import type { HeroBlockProps } from '../blocks/HeroBlock'
import type { MediaTextBlockProps, MediaText5050BlockProps } from '../blocks'

type LabBlock = {
  _type: string
  _key?: string
  [key: string]: unknown
}

function getBlockTypeTitle(_type: string): string {
  const titles: Record<string, string> = {
    hero: 'Hero',
    mediaTextBlock: 'Media + Text stacked',
    mediaText5050: 'Media + Text 50/50',
    cardGrid: 'Card grid',
    carousel: 'Carousel',
    fullBleedVerticalCarousel: 'Full bleed vertical carousel',
    rotatingMedia: 'Rotating media',
    labGridBlockCard: 'Card grid (lab)',
    iconGrid: 'Icon grid',
    proofPoints: 'Proof points',
    list: 'List',
    mediaZoomOutOnScroll: 'Media zoom out on scroll',
  }
  return titles[_type] ?? _type
}

export function getBlockSettings(block: LabBlock): string {
  switch (block._type) {
    case 'hero': {
      const contentLayout = ((block.contentLayout as string) ?? 'sideBySide').toLowerCase()
      const containerLayout = (block.containerLayout as string) ?? (block.layout as string) ?? 'edgeToEdge'
      const surface = (block.blockSurface as string) ?? 'bold'
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
      const surfaceLabel =
        contentLayout === 'category'
          ? 'Background'
          : contentLayout === 'mediaoverlay'
            ? 'Bold'
            : surface === 'ghost'
            ? 'No colour'
            : surface.charAt(0).toUpperCase() + surface.slice(1)
      const parts = [layoutLabel, surfaceLabel]
      if (contentLayout === 'sidebyside' && anchor === 'bottom') parts.push('Top to bottom')
      if (hasVideo) parts.push('Video')
      return parts.join(' · ')
    }
    case 'fullBleedVerticalCarousel':
      return `Surface: ${(block.surface as string) ?? 'ghost'}`
    case 'rotatingMedia':
      return `Variant: ${(block.variant as string) ?? 'small'} · Surface: ${(block.surface as string) ?? 'ghost'}`
    case 'labGridBlockCard':
      return `Columns: ${(block.columns as string) ?? '3'} · Surface: ${(block.blockSurface as string) ?? 'ghost'} · Accent: ${(block.blockAccent as string) ?? 'primary'}`
    case 'mediaZoomOutOnScroll':
      return block.videoUrl ? 'With video' : 'Image only'
    case 'iconGrid':
      return `Items: ${Array.isArray(block.items) ? block.items.length : 0} · Columns: ${(block.columns as number) ?? 'auto'}`
    case 'proofPoints':
      return `Variant: ${(block.variant as string) ?? 'icon'} · Surface: ${(block.surface as string) ?? 'ghost'} · Items: ${Array.isArray(block.items) ? block.items.length : 0}`
    case 'mediaText5050': {
      const variant = (block.variant as string) ?? 'paragraphs'
      const variantLabels: Record<string, string> = {
        paragraphs: 'Paragraphs',
        accordion: 'Accordion',
      }
      const imagePosition = (block.imagePosition as string) ?? 'right'
      const itemCount = Array.isArray(block.items) ? block.items.length : 0
      return `Variant: ${variantLabels[variant] ?? variant} · Items: ${itemCount} · Image ${imagePosition}`
    }
    case 'mediaTextBlock': {
      const rawTemplate = (block.template as string) ?? 'Stacked'
      /** Legacy: SideBySide is now mediaText5050; treat as Stacked for display. */
      const template = (rawTemplate === 'SideBySide' || rawTemplate === 'sideBySide') ? 'Stacked' : rawTemplate
      const bg = (block.blockBackground as string) ?? 'ghost'
      const parts = [`Template: ${template}`, `Background: ${bg}`]
      if (template === 'HeroOverlay') {
        parts.push(`Align: ${(block.overlayAlignment as string) ?? 'left'}`)
      }
      if (template === 'Stacked') {
        parts.push(`Image: ${(block.stackImagePosition as string) ?? 'top'}`)
        parts.push(`Width: ${(block.mediaSize as string) ?? 'default'}`)
        const mediaSize = (block.mediaSize as string) ?? 'default'
        if (mediaSize !== 'edgeToEdge') {
          parts.push(`Text align: ${(block.stackAlignment as string) ?? 'left'}`)
        }
      }
      return parts.join(' · ')
    }
    case 'cardGrid':
      return `Columns: ${(block.columns as string) ?? '4'} · Surface: ${(block.surface as string) ?? 'ghost'}`
    case 'carousel':
      return `Card size: ${(block.cardSize as string) ?? 'medium'} · Surface: ${(block.surface as string) ?? 'ghost'}`
    case 'list':
      return `Variant: ${(block.listVariant as string) ?? 'textList'} · Surface: ${(block.blockSurface as string) ?? 'ghost'} · Items: ${Array.isArray(block.items) ? block.items.length : 0}`
    default:
      return ''
  }
}

type BlockSpacingValue = 'none' | 'medium' | 'large'
function normalizeSpacing(v: unknown): BlockSpacingValue {
  const s = (v as string)?.toLowerCase?.()
  if (s === 'small') return 'none'
  if (s === 'none' || s === 'medium' || s === 'large') return s
  return 'large'
}

function mapMediaTextBlock(block: LabBlock): MediaTextBlockProps {
  const rawTemplate = block.template as string
  /** Legacy: SideBySide is now mediaText5050; treat as Stacked. */
  const template = (rawTemplate === 'SideBySide' || rawTemplate === 'sideBySide') ? 'Stacked' : (rawTemplate ?? 'Stacked')
  const mediaSize = block.mediaSize as string
  const imageAspectRatio =
    template === 'Stacked'
      ? '2:1'
      : template === 'HeroOverlay'
        ? '16:9'
        : '16:9'

  const variantMap: Record<string, MediaTextBlockProps['variant']> = {
    HeroOverlay: 'full-bleed',
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

  const bulletList = block.bulletList as string[] | undefined
  const bulletListFiltered = Array.isArray(bulletList) ? bulletList.filter((b): b is string => typeof b === 'string').slice(0, 6) : undefined

  const rawAlign = (() => {
    if (template === 'TextOnly') return block.textOnlyAlignment as string
    if (template === 'Stacked') {
      if (mediaSize === 'edgeToEdge') return 'center'
      return block.stackAlignment as string
    }
    if (template === 'HeroOverlay') return block.overlayAlignment as string
    return block.align as string
  })()
  const alignSource =
    rawAlign?.toLowerCase() === 'center'
      ? 'center'
      : rawAlign?.toLowerCase() === 'left'
        ? 'left'
        : undefined

  const width =
    (template === 'Stacked' || template === 'HeroOverlay') && mediaSize === 'edgeToEdge'
      ? 'edgeToEdge'
      : 'Default'

  return {
    size: 'feature',
    headline: (block.title as string) ?? '',
    eyebrow: block.eyebrow as string | undefined,
    subhead: block.subhead as string | undefined,
    body: block.body as string | undefined,
    bulletList: bulletListFiltered ?? [],
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
    blockBackground: block.blockBackground as MediaTextBlockProps['blockBackground'],
    minimalBackgroundStyle: block.minimalBackgroundStyle as 'block' | 'gradient' | undefined,
    blockAccent: block.blockAccent as MediaTextBlockProps['blockAccent'] | undefined,
    spacing: normalizeSpacing(block.spacing) as MediaTextBlockProps['spacing'],
    spacingTop: block.spacingTop ? (normalizeSpacing(block.spacingTop) as MediaTextBlockProps['spacingTop']) : undefined,
    spacingBottom: block.spacingBottom ? (normalizeSpacing(block.spacingBottom) as MediaTextBlockProps['spacingBottom']) : undefined,
    width,
    align: alignSource === 'center' || alignSource === 'left' ? alignSource : undefined,
    mediaStyle: 'contained',
    stackImagePosition: (block.stackImagePosition as 'top' | 'bottom') ?? 'top',
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
  const aspectRatio = ((block.imageAspectRatio as string) || '4:3') as '16:9' | '4:3' | '1:1' | '3:4' | '2:1' | 'auto'
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
    blockBackground: block.blockBackground as MediaText5050BlockProps['blockBackground'],
    minimalBackgroundStyle: (block.minimalBackgroundStyle as 'block' | 'gradient') ?? 'block',
    blockAccent: block.blockAccent as MediaText5050BlockProps['blockAccent'],
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
  const overlayHeight = 'band' as const
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
    contentLayout: (['stacked', 'sideBySide', 'category', 'mediaOverlay', 'textOnly'].includes(contentLayout) ? contentLayout : 'stacked') as HeroBlockProps['contentLayout'],
    overlayHeight: overlayHeight as HeroBlockProps['overlayHeight'],
    containerLayout: (containerLayout === 'contained' ? 'contained' : 'edgeToEdge') as HeroBlockProps['containerLayout'],
    imageAnchor: ((block.imageAnchor as string) === 'bottom' ? 'bottom' : 'center') as HeroBlockProps['imageAnchor'],
    textAlign: ((block.textAlign as string) === 'center' ? 'center' : 'left') as HeroBlockProps['textAlign'],
    blockSurface: ((block.blockSurface as string) ?? 'minimal') as HeroBlockProps['blockSurface'],
    blockAccent: ((block.blockAccent as string) ?? 'primary') as HeroBlockProps['blockAccent'],
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
    if (clean) return <React.Fragment key={block._key}>{content}</React.Fragment>
    const sectionTitle = variantLabels?.[i] ?? getBlockTypeTitle(block._type)
    const settings = getBlockSettings(block)
    return (
      <section key={block._key} style={{ marginBottom: 'var(--ds-spacing-4xl)' }}>
        <h2 style={{ fontSize: 'var(--ds-typography-h4)', fontWeight: 'var(--ds-typography-weight-medium)', marginBottom: 'var(--ds-spacing-xs)' }}>
          {sectionTitle}
        </h2>
        <p style={{ fontSize: 'var(--ds-typography-body-xs)', color: 'var(--ds-color-text-low)', margin: 0, marginBottom: 'var(--ds-spacing-l)' }}>
          {settings}
        </p>
        {content}
      </section>
    )
  }

  return (
    <>
      {blocks.map((block, i) => {
        switch (block._type) {
          case 'hero': {
            const props = mapHeroBlockProps(block)
            return wrapSection(<HeroBlock {...props} />, block, i)
          }
          case 'mediaTextBlock': {
            const mapped = mapMediaTextBlock(block)
            return wrapSection(<MediaTextBlock {...mapped} />, block, i)
          }
          case 'mediaText5050': {
            const mapped = mapMediaText5050Block(block)
            return wrapSection(<MediaText5050Block {...mapped} />, block, i)
          }
          case 'cardGrid': {
            const cols = block.columns as string
            const items = ((block.items as Record<string, unknown>[]) ?? []).map((i) => ({
              ...i,
              _type: (i._type as 'cardGridItem' | 'textOnColourCardItem') ?? 'cardGridItem',
              title: (i.title as string) ?? '',
              cardStyle: i.cardStyle as string,
              surface: i.surface as string,
            })) as import('../blocks/CardGridBlock/CardGridBlock.types').CardGridBlockItem[]
            return wrapSection(
              <CardGridBlock
                columns={parseInt(cols, 10) as 2 | 3 | 4}
                title={block.title as string}
                blockSurface={(block.surface as 'ghost' | 'minimal' | 'subtle' | 'bold') ?? 'ghost'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                blockAccent={(block.blockAccent as 'primary' | 'secondary' | 'neutral') ?? 'primary'}
                items={items}
              />,
              block,
              i,
            )
          }
          case 'carousel': {
            const carouselItems = ((block.items ?? []) as { cardType?: string; title?: string; description?: string; image?: string; video?: string; link?: string; ctaText?: string; aspectRatio?: '4:5' | '8:5' | '2:1'; imageSlot?: string }[]).map((it) => ({
              ...it,
              cardType: (it.cardType as 'media' | 'text-on-colour') ?? 'media',
              aspectRatio: it.aspectRatio as '4:5' | '8:5' | '2:1',
            }))
            return wrapSection(
              <CarouselBlock
                title={block.title as string}
                cardSize={(block.cardSize as 'compact' | 'medium' | 'large') ?? 'medium'}
                surface={(block.surface as 'ghost' | 'minimal' | 'subtle' | 'bold') ?? 'ghost'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                blockAccent={(block.blockAccent as 'primary' | 'secondary' | 'neutral') ?? 'primary'}
                items={carouselItems}
              />,
              block,
              i,
            )
          }
          case 'fullBleedVerticalCarousel': {
            return wrapSection(
              <FullBleedVerticalCarousel
                surface={(block.surface as 'ghost' | 'minimal' | 'subtle' | 'bold') ?? 'ghost'}
                items={block.items as { title?: string; description?: string; image?: string; video?: string }[]}
              />,
              block,
              i,
            )
          }
          case 'rotatingMedia': {
            return wrapSection(
              <RotatingMediaBlock
                variant={(block.variant as 'small' | 'large' | 'combined') ?? 'small'}
                surface={(block.surface as 'ghost' | 'minimal' | 'subtle' | 'bold') ?? 'ghost'}
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
          case 'labGridBlockCard': {
            const cards = Array.isArray(block.cards) ? block.cards : []
            const items = cards.map((c: LabBlock) => ({
              _type: 'textOnColourCardItem' as const,
              _key: c._key,
              size: 'small' as const,
              icon: c.icon as string | undefined,
              iconImage: c.iconImage as string | undefined,
              title: (c.title as string) ?? '',
              description: c.description as string | undefined,
              callToActionButtons: (c.callToActionButtons as { label: string; link?: string; style?: string }[] | undefined)?.map((btn) => ({
                _key: (btn as { _key?: string })._key,
                label: btn.label,
                link: btn.link,
                style: (btn.style === 'filled' || btn.style === 'outlined' ? btn.style : 'filled') as 'filled' | 'outlined',
              })),
              features: c.features as string[] | undefined,
              backgroundColor: (c.backgroundColor === 'primary' || c.backgroundColor === 'secondary' || c.backgroundColor === 'tertiary' ? c.backgroundColor : 'primary') as 'primary' | 'secondary' | 'tertiary',
            }))
            return wrapSection(
              <CardGridBlock
                columns={(parseInt((block.columns as string) || '3', 10) || 3) as 2 | 3 | 4}
                title={block.sectionTitle as string | null}
                blockSurface={(block.blockSurface as 'ghost' | 'minimal' | 'subtle' | 'bold') ?? 'ghost'}
                blockAccent={(block.blockAccent as 'primary' | 'secondary' | 'neutral') ?? 'primary'}
                items={items}
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
              />,
              block,
              i,
            )
          }
          case 'proofPoints': {
            const ppSurf = (block.surface as string)?.toLowerCase?.()
            const ppSurfValid = ppSurf && ['ghost', 'minimal', 'subtle', 'bold'].includes(ppSurf) ? ppSurf : 'ghost'
            const ppAcc = (block.blockAccent as string)?.toLowerCase?.()
            const ppAccValid = ppAcc && ['primary', 'secondary', 'neutral'].includes(ppAcc) ? ppAcc : 'primary'
            const ppVariant = (block.variant as string)?.toLowerCase?.() === 'stat' ? 'stat' : 'icon'
            return wrapSection(
              <ProofPointsBlock
                title={block.title as string | null}
                variant={ppVariant}
                blockSurface={ppSurfValid as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                blockAccent={ppAccValid as 'primary' | 'secondary' | 'neutral'}
                items={block.items as { title?: string; description?: string; icon?: string }[]}
              />,
              block,
              i,
            )
          }
          case 'mediaZoomOutOnScroll': {
            return wrapSection(
              <MediaZoomOutOnScroll
                image={(block.image as string) || '/placeholder-preview.svg'}
                videoUrl={block.videoUrl as string | null}
                alt={block.alt as string | null}
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
            const listSurf = (block.blockSurface as string)?.toLowerCase?.()
            const listSurfValid = listSurf && ['ghost', 'minimal', 'subtle', 'bold'].includes(listSurf) ? listSurf : 'ghost'
            const listAcc = (block.blockAccent as string)?.toLowerCase?.()
            const listAccValid = listAcc && ['primary', 'secondary', 'neutral'].includes(listAcc) ? listAcc : 'primary'
            return wrapSection(
              <ListBlock
                blockTitle={block.blockTitle as string | null}
                listVariant={(block.listVariant as 'textList' | 'faq' | 'links') ?? 'textList'}
                items={listItems}
                size={(block.size as 'hero' | 'feature' | 'editorial') ?? 'feature'}
                blockSurface={listSurfValid as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                blockAccent={listAccValid as 'primary' | 'secondary' | 'neutral'}
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
