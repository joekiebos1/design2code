import {
  HeroBlock,
  MediaTextBlock,
  MediaText5050Block,
  CardGridBlock,
  CarouselBlock,
  ProofPointsBlock,
  IconGridBlock,
  MediaTextAsymmetricBlock,
  BlockShell,
  normalizeBlockSpacing,
  mapMediaTextBlock,
  mapMediaText5050BlockProps,
  mapMediaTextAsymmetricBlockProps,
} from '@design2code/block-library'
import type { BlockPattern } from '@design2code/block-library'
import type { ImageSlotState } from '@design2code/block-library'

type BlockSpacingValue = 'none' | 'medium' | 'large'

type Block = {
  _type: string
  _key?: string
  spacing?: BlockSpacingValue | string
  spacingTop?: BlockSpacingValue | string
  spacingBottom?: BlockSpacingValue | string
  [key: string]: unknown
}

/** Derive block pattern from block data. Band | Overlay | Contained. */
function derivePattern(block: Block): BlockPattern {
  const contentLayout = (block.contentLayout as string)?.toLowerCase?.()
  const template = (block.template as string)?.toLowerCase?.()
  if (contentLayout === 'mediaoverlay' || template === 'mediaoverlay') {
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
  const bandTypes = ['hero', 'mediaTextStacked', 'mediaText5050', 'carousel', 'cardGrid', 'proofPoints', 'iconGrid', 'mediaTextAsymmetric']
  if (hasBand && bandTypes.includes(block._type)) {
    return 'band'
  }
  return 'contained'
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
      {blocks_.map((raw) => {
        const block = raw as Block
        const spacingTop =
          block._type === 'hero'
            ? undefined
            : (block.spacingTop ? normalizeBlockSpacing(block.spacingTop) : block.spacing ? normalizeBlockSpacing(block.spacing) : undefined) as BlockSpacingValue | undefined
        const spacingBottom = (block.spacingBottom ? normalizeBlockSpacing(block.spacingBottom) : block.spacing ? normalizeBlockSpacing(block.spacing) : undefined) as BlockSpacingValue | undefined

        let content: React.ReactNode = null
        switch (block._type) {
          case 'hero': {
            const contentLayout = block.contentLayout as
              | 'stacked'
              | 'sideBySide'
              | 'category'
              | 'mediaOverlay'
              | 'textOnly'
              | undefined
            const emphasis = block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold' | undefined
            const appearance = (block.appearance ?? block.surfaceColour) as
              | 'primary'
              | 'secondary'
              | 'sparkle'
              | 'neutral'
              | undefined
            const containerLayout = block.containerLayout as 'edgeToEdge' | 'contained' | undefined
            const imageAnchor = block.imageAnchor as 'center' | 'bottom' | undefined
            const textAlign = block.textAlign as 'left' | 'center' | undefined
            const imageSlot = block.imageSlot as string | undefined
            const imageState = imageSlot && images?.[imageSlot] ? images[imageSlot] : undefined
            content = (
              <HeroBlock
                key={block._key || block._type}
                eyebrow={block.eyebrow as string}
                title={block.title as string}
                body={block.body as string}
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
                appearance={appearance}
              />
            )
          }
            break
          case 'mediaText5050': {
            const props = mapMediaText5050BlockProps(block, images ?? undefined)
            content = (
              <MediaText5050Block
                key={block._key || block._type}
                {...props}
              />
            )
          }
            break
          case 'mediaTextStacked': {
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
                interaction={(block.interaction as 'information' | 'navigation') ?? 'information'}
                title={block.title as string}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                appearance={(block.appearance ?? block.surfaceColour) as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
                items={((block.items as Record<string, unknown>[]) ?? []).map((i) => ({
                  ...i,
                  _type: (i._type as 'cardGridItem') ?? 'cardGridItem',
                  title: (i.title as string) ?? '',
                })) as import('@design2code/block-library').CardGridBlockItem[]}
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
                description={block.description as string | null | undefined}
                callToActions={block.callToActions as import('@design2code/block-library').LabBlockCallToAction[] | null | undefined}
                interaction={(block.interaction as 'information' | 'navigation') ?? 'information'}
                cardSize={block.cardSize as 'compact' | 'medium' | 'large'}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                appearance={(block.appearance ?? block.surfaceColour) as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
                items={((block.items ?? []) as {
                  cardType?: string
                  title?: string
                  description?: string
                  image?: string
                  video?: string
                  link?: string
                  ctaText?: string
                  aspectRatio?: '4:5' | '8:5' | '2:1'
                  imageSlot?: string
                  backgroundColor?: string | null
                }[]).map((it) => ({
                  ...it,
                  cardType: (it.cardType ?? 'mediaTextBelow') as 'mediaTextBelow' | 'colourFeatured',
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
                description={block.description as string | null | undefined}
                callToActions={block.callToActions as import('@design2code/block-library').LabBlockCallToAction[] | null | undefined}
                variant={block.variant as 'icon' | 'stat'}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                appearance={(block.appearance ?? block.surfaceColour) as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
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
                title={block.title as string | null | undefined}
                description={block.description as string | null | undefined}
                callToActions={block.callToActions as import('@design2code/block-library').LabBlockCallToAction[] | null | undefined}
                items={items}
                columns={block.columns as 3 | 4 | 5 | 6 | undefined}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                appearance={(block.appearance ?? block.surfaceColour) as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
              />
            )
          }
            break
          case 'mediaTextAsymmetric': {
            const asymProps = mapMediaTextAsymmetricBlockProps(block)
            content = (
              <MediaTextAsymmetricBlock
                key={block._key || block._type}
                {...asymProps}
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
        const appearance = (block.appearance ?? block.surfaceColour) as
          | 'primary'
          | 'secondary'
          | 'sparkle'
          | 'neutral'
          | undefined
        const minimalBackgroundStyle = (block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'
        return (
          <BlockShell
            key={block._key || block._type}
            pattern={pattern}
            spacingTop={spacingTop}
            spacingBottom={spacingBottom}
            emphasis={shellEmphasis}
            appearance={appearance}
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
