import {
  HeroBlock,
  MediaTextBlock,
  MediaText5050Block,
  CardGridBlock,
  CarouselBlock,
  ProofPointsBlock,
  IconGridBlock,
  ListBlock,
  BlockShell,
} from '../../blocks'
import type { BlockPattern } from '../../blocks/BlockShell'
import type { MediaTextBlockProps, MediaText5050BlockProps } from '../../blocks'
import type { ImageSlotState } from '../../hooks/useImageStream'

type BlockSpacingValue = 'none' | 'medium' | 'large'

type Block = {
  _type: string
  _key?: string
  spacing?: BlockSpacingValue | string
  spacingTop?: BlockSpacingValue | string
  spacingBottom?: BlockSpacingValue | string
  [key: string]: unknown
}

/** Normalize spacing: none, medium, large. Backwards compat: small -> none. */
function normalizeSpacing(v: unknown): BlockSpacingValue {
  const s = (v as string)?.toLowerCase?.()
  if (s === 'small') return 'none'
  if (s === 'none' || s === 'medium' || s === 'large') return s
  return 'large'
}

/** Derive block pattern from block data. Band | Overlay | Contained. */
function derivePattern(block: Block): BlockPattern {
  const contentLayout = (block.contentLayout as string)?.toLowerCase?.()
  const template = (block.template as string)?.toLowerCase?.()
  if (contentLayout === 'mediaoverlay' || contentLayout === 'fullscreen' || template === 'mediaoverlay') {
    return 'overlay'
  }
  /** Hero category has its own background layout (half-height); block handles it. */
  if (block._type === 'hero' && contentLayout === 'category') {
    return 'contained'
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
  const bandTypes = ['hero', 'mediaTextStacked', 'mediaTextBlock', 'mediaText5050', 'carousel', 'cardGrid', 'proofPoints', 'iconGrid', 'list']
  if (hasBand && bandTypes.includes(block._type)) {
    return 'band'
  }
  return 'contained'
}

/** Map mediaText5050 block to items array. Supports new structure (items) and legacy (singleParagraph, accordionItems, paragraphItems). */
function mapMediaText5050Items(block: Block): { subtitle?: string; body?: string }[] {
  const items = Array.isArray(block.items)
    ? (block.items as { subtitle?: string; body?: string }[]).map((i) => ({
        subtitle: (i.subtitle as string) ?? '',
        body: (i.body as string) ?? '',
      }))
    : []
  if (items.length > 0) return items
  // Legacy: singleParagraph
  const headline = block.headline as string | undefined
  const body = block.body as string | undefined
  if (block.variant === 'singleParagraph' && (headline || body)) {
    return [{ subtitle: headline ?? '', body: body ?? '' }]
  }
  // Legacy: accordionItems (title → subtitle)
  const accordionItems = Array.isArray(block.accordionItems)
    ? (block.accordionItems as { title?: string; body?: string }[]).map((i) => ({
        subtitle: (i.title as string) ?? '',
        body: (i.body as string) ?? '',
      }))
    : []
  if (accordionItems.length > 0) return accordionItems
  // Legacy: paragraphItems (headline → subtitle)
  const paragraphItems = Array.isArray(block.paragraphItems)
    ? (block.paragraphItems as { headline?: string; body?: string }[]).map((i) => ({
        subtitle: (i.headline as string) ?? '',
        body: (i.body as string) ?? '',
      }))
    : []
  return paragraphItems
}

function mapMediaTextBlock(block: Block): MediaTextBlockProps {
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

  const mediaSize = (block.mediaSize as string) ?? 'edgeToEdge'
  /** Stacked and Overlay: edge to edge or contained based on mediaSize. */
  const width =
    (template === 'Stacked' || template === 'Overlay') && mediaSize === 'edgeToEdge'
      ? 'edgeToEdge'
      : 'Default'

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
    spacingTop: block.spacingTop ? normalizeSpacing(block.spacingTop) as MediaTextBlockProps['spacingTop'] : undefined,
    spacingBottom: block.spacingBottom ? normalizeSpacing(block.spacingBottom) as MediaTextBlockProps['spacingBottom'] : undefined,
    width,
    align: alignSource === 'center' || alignSource === 'left' ? alignSource : undefined,
    mediaStyle: 'contained',
    descriptionTitle: block.descriptionTitle as string | undefined,
    descriptionBody: block.descriptionBody as string | undefined,
  }
}

type BlockRendererProps = {
  blocks: Block[] | unknown[] | null | undefined
  /** When provided (JioKarna preview), blocks use StreamImage for progressive loading. */
  images?: Record<string, ImageSlotState>
}

export function BlockRenderer({ blocks, images }: BlockRendererProps) {
  if (!blocks?.length) return null

  const blocks_ = blocks as Block[]
  return (
    <div className="block-stack">
      {blocks_.map((block) => {
        const spacingTop =
          block._type === 'hero'
            ? undefined
            : (block.spacingTop ? normalizeSpacing(block.spacingTop) : block.spacing ? normalizeSpacing(block.spacing) : undefined) as BlockSpacingValue | undefined
        const spacingBottom = (block.spacingBottom ? normalizeSpacing(block.spacingBottom) : block.spacing ? normalizeSpacing(block.spacing) : undefined) as BlockSpacingValue | undefined

        let content: React.ReactNode = null
        switch (block._type) {
          case 'hero': {
            const contentLayout = block.contentLayout as 'stacked' | 'sideBySide' | 'mediaOverlay' | 'textOnly' | 'fullscreen' | undefined
            const emphasis = block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold' | undefined
            const surfaceColour = block.surfaceColour as 'primary' | 'secondary' | 'sparkle' | 'neutral' | undefined
            const containerLayout = block.containerLayout as 'edgeToEdge' | 'contained' | undefined
            const imageAnchor = block.imageAnchor as 'center' | 'bottom' | undefined
            const textAlign = block.textAlign as 'left' | 'center' | undefined
            const imageSlot = block.imageSlot as string | undefined
            const imageState = imageSlot && images?.[imageSlot] ? images[imageSlot] : undefined
            content = (
              <HeroBlock
                key={block._key || block._type}
                productName={block.productName as string}
                headline={block.headline as string}
                subheadline={block.subheadline as string}
                ctaText={block.ctaText as string}
                ctaLink={block.ctaLink as string}
                cta2Text={block.cta2Text as string}
                cta2Link={block.cta2Link as string}
                image={block.image as string}
                videoUrl={block.videoUrl as string}
                imageSlot={imageSlot}
                imageState={imageState}
                contentLayout={contentLayout}
                containerLayout={containerLayout}
                imageAnchor={imageAnchor}
                textAlign={textAlign}
                emphasis={emphasis}
                surfaceColour={surfaceColour}
              />
            )
          }
            break
          case 'mediaText5050': {
            const imageUrl = block.image as string | undefined
            const videoUrl = block.video as string | undefined
            const hasVideo = videoUrl && typeof videoUrl === 'string' && videoUrl.trim() !== ''
            const hasImage = imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== ''
            const aspectRatio = (block.imageAspectRatio as string) || undefined
            const media =
              hasVideo
                ? { type: 'video' as const, src: videoUrl!, poster: hasImage ? imageUrl : undefined, alt: '', aspectRatio: aspectRatio as '5:4' | '1:1' | '4:5' }
                : hasImage
                  ? { type: 'image' as const, src: imageUrl!, alt: '', aspectRatio: aspectRatio as '5:4' | '1:1' | '4:5' }
                  : undefined
            const items = mapMediaText5050Items(block)
            const imageSlot = block.imageSlot as string | undefined
            const imageState = imageSlot && images?.[imageSlot] ? images[imageSlot] : undefined
            const rawVariant = block.variant as string
            const variant: MediaText5050BlockProps['variant'] =
              rawVariant === 'accordion' ? 'accordion' : 'paragraphs'
            const props: MediaText5050BlockProps = {
              variant,
              imagePosition: (block.imagePosition as 'left' | 'right') ?? 'right',
              emphasis: block.emphasis as MediaText5050BlockProps['emphasis'],
              minimalBackgroundStyle: (block.minimalBackgroundStyle as 'block' | 'gradient') ?? 'block',
              surfaceColour: block.surfaceColour as MediaText5050BlockProps['surfaceColour'],
              spacingTop: block.spacingTop ? normalizeSpacing(block.spacingTop) as MediaText5050BlockProps['spacingTop'] : undefined,
              spacingBottom: block.spacingBottom ? normalizeSpacing(block.spacingBottom) as MediaText5050BlockProps['spacingBottom'] : undefined,
              headline: block.headline as string | undefined,
              items,
              media,
              imageSlot,
              imageState,
            }
            content = (
              <MediaText5050Block
                key={block._key || block._type}
                {...props}
              />
            )
          }
            break
          case 'mediaTextStacked':
          case 'mediaTextBlock': {
            const mapped = mapMediaTextBlock(block)
            const imageSlot = block.imageSlot as string | undefined
            const imageState = imageSlot && images?.[imageSlot] ? images[imageSlot] : undefined
            content = (
              <MediaTextBlock
                key={block._key || block._type}
                {...mapped}
                imageSlot={imageSlot}
                imageState={imageState}
              />
            )
          }
            break
          case 'cardGrid': {
            const cols = block.columns as string
            content = (
              <CardGridBlock
                key={block._key || block._type}
                columns={parseInt(cols, 10) as 2 | 3 | 4}
                title={block.title as string}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                surfaceColour={block.surfaceColour as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
                items={((block.items as Record<string, unknown>[]) ?? []).map((i) => ({
                  ...i,
                  _type: (i._type as 'cardGridItem' | 'textOnColourCardItem') ?? 'cardGridItem',
                  title: (i.title as string) ?? '',
                  cardStyle: (i.cardStyle as string),
                  surface: (i.surface as string),
                })) as import('../../blocks/CardGridBlock/CardGridBlock.types').CardGridBlockItem[]}
                images={images}
              />
            )
          }
            break
          case 'carousel': {
            content = (
              <CarouselBlock
                key={block._key || block._type}
                title={block.title as string}
                cardSize={block.cardSize as 'compact' | 'medium' | 'large'}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                surfaceColour={block.surfaceColour as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
                items={((block.items ?? []) as { cardType?: string; title?: string; description?: string; image?: string; video?: string; link?: string; ctaText?: string; aspectRatio?: '4:5' | '8:5' | '2:1'; imageSlot?: string }[]).map((it) => ({
                  ...it,
                  cardType: it.cardType as 'media' | 'text-on-colour',
                  aspectRatio: it.aspectRatio as '4:5' | '8:5' | '2:1',
                }))}
                images={images}
              />
            )
          }
            break
          case 'proofPoints': {
            content = (
              <ProofPointsBlock
                key={block._key || block._type}
                title={block.title as string}
                variant={block.variant as 'icon' | 'stat'}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                surfaceColour={block.surfaceColour as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
                items={block.items as { title?: string; description?: string; icon?: string }[]}
              />
            )
          }
            break
          case 'iconGrid': {
            const SPECTRUMS = ['indigo', 'sky', 'pink', 'gold', 'red', 'purple', 'mint', 'violet', 'marigold', 'green', 'crimson', 'orange'] as const
            const items = Array.isArray(block.items)
              ? (block.items as { title?: string; body?: string; icon?: string; accentColor?: string; spectrum?: string }[]).map((i) => ({
                  title: (i.title as string) ?? '',
                  body: i.body as string | undefined,
                  icon: i.icon as string,
                  accentColor: i.accentColor as 'primary' | 'secondary' | 'tertiary' | 'positive' | 'neutral',
                  spectrum: i.spectrum && SPECTRUMS.includes(i.spectrum as (typeof SPECTRUMS)[number]) ? (i.spectrum as (typeof SPECTRUMS)[number]) : undefined,
                }))
              : []
            content = (
              <IconGridBlock
                key={block._key || block._type}
                items={items}
                columns={block.columns as 3 | 4 | 5 | 6 | undefined}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                surfaceColour={block.surfaceColour as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
              />
            )
          }
            break
          case 'list': {
            const listItems = Array.isArray(block.items)
              ? (block.items as { title?: string; body?: string; linkText?: string; linkUrl?: string; subtitle?: string }[]).map((i) => ({
                  title: i.title as string | undefined,
                  body: i.body as string | undefined,
                  linkText: i.linkText as string | undefined,
                  linkUrl: i.linkUrl as string | undefined,
                  subtitle: i.subtitle as string | undefined,
                }))
              : []
            content = (
              <ListBlock
                key={block._key || block._type}
                blockTitle={block.blockTitle as string}
                listVariant={(block.listVariant as 'textList' | 'faq' | 'links') ?? 'textList'}
                items={listItems}
                size={(block.size as 'hero' | 'feature' | 'editorial') ?? 'feature'}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                surfaceColour={block.surfaceColour as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
              />
            )
          }
            break
          default:
            return null
        }
        if (!content) return null
        const pattern = derivePattern(block)
        const contentLayout = (block.contentLayout as string)?.toLowerCase?.()
        const isHeroCategory = block._type === 'hero' && contentLayout === 'category'
        const emphasis = block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold' | undefined
        const shellEmphasis = isHeroCategory ? 'ghost' : emphasis
        const surfaceColour = block.surfaceColour as 'primary' | 'secondary' | 'sparkle' | 'neutral' | undefined
        const minimalBackgroundStyle = (block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'
        return (
          <BlockShell
            key={block._key || block._type}
            pattern={pattern}
            spacingTop={spacingTop}
            spacingBottom={spacingBottom}
            emphasis={shellEmphasis}
            surfaceColour={surfaceColour}
            minimalBackgroundStyle={minimalBackgroundStyle}
            style={{ overflow: 'visible' }}
          >
            {content}
          </BlockShell>
        )
      })}
    </div>
  )
}
