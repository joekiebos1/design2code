import React from 'react'
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

function previewCtasToLab(
  ctas: { label?: string; link?: string }[] | null | undefined
): { label: string; link?: string | null; style?: 'filled' | 'outlined' | null }[] | undefined {
  if (ctas == null) return undefined
  const out = ctas.filter((c): c is { label: string; link?: string } => Boolean(c.label))
  return out.length ? out : undefined
}

function DebugBlock({ blockType, sectionName }: { blockType: string; sectionName?: string }) {
  return (
    <div style={{
      padding: '32px',
      background: 'repeating-linear-gradient(45deg,#f7f7f7 0,#f7f7f7 10px,#fff 10px,#fff 20px)',
      border: '1.5px dashed #d0d0d0',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      fontFamily: 'monospace',
      fontSize: 13,
      color: '#888',
    }}>
      <span style={{ background: '#222', color: '#fff', padding: '3px 8px', borderRadius: 4, fontWeight: 600, letterSpacing: '0.02em' }}>
        {blockType}
      </span>
      {sectionName && <span>{sectionName}</span>}
    </div>
  )
}

type BoundaryProps = { blockType: string; sectionName?: string; children: React.ReactNode }
type BoundaryState = { error: Error | null }

class BlockErrorBoundary extends React.Component<BoundaryProps, BoundaryState> {
  constructor(props: BoundaryProps) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error }
  }
  render() {
    if (this.state.error) {
      console.warn(`[BlockRenderer] ${this.props.blockType} threw:`, this.state.error.message)
      return <DebugBlock blockType={this.props.blockType} sectionName={this.props.sectionName} />
    }
    return this.props.children
  }
}

type BlockSpacingValue = 'none' | 'medium' | 'large'

type Block = {
  _type: string
  _key?: string
  spacing?: BlockSpacingValue | string
  spacingTop?: BlockSpacingValue | string
  spacingBottom?: BlockSpacingValue | string
  [key: string]: unknown
}

function derivePattern(block: Block): BlockPattern {
  const contentLayout = (block.contentLayout as string)?.toLowerCase?.()
  const template = (block.template as string)?.toLowerCase?.()
  if (contentLayout === 'mediaoverlay' || template === 'mediaoverlay') return 'overlay'
  if (block._type === 'hero' && contentLayout === 'category') return 'contained'
  if (
    block._type === 'hero' &&
    contentLayout === 'sidebyside' &&
    (block.containerLayout as string)?.toLowerCase?.() === 'contained'
  ) return 'contained'
  const emphasis = (block.emphasis as string)?.toLowerCase?.()
  const hasBand = emphasis && !['ghost', 'none'].includes(emphasis)
  const bandTypes = ['hero', 'mediaTextStacked', 'mediaTextBlock', 'mediaText5050', 'carousel', 'cardGrid', 'proofPoints', 'iconGrid', 'mediaTextAsymmetric']
  if (hasBand && bandTypes.includes(block._type)) return 'band'
  return 'contained'
}

type BlockRendererProps = {
  blocks: Block[] | unknown[] | null | undefined
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  if (!blocks?.length) return null

  const blocks_ = blocks as Block[]
  return (
    <div className="block-stack">
      {blocks_.map((block) => {
        const spacingTop =
          block._type === 'hero'
            ? undefined
            : (block.spacingTop ? normalizeBlockSpacing(block.spacingTop as string) : block.spacing ? normalizeBlockSpacing(block.spacing as string) : undefined) as BlockSpacingValue | undefined
        const spacingBottom = (block.spacingBottom ? normalizeBlockSpacing(block.spacingBottom as string) : block.spacing ? normalizeBlockSpacing(block.spacing as string) : undefined) as BlockSpacingValue | undefined

        let content: React.ReactNode = null
        switch (block._type) {
          case 'hero': {
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
                contentLayout={block.contentLayout as 'stacked' | 'sideBySide' | 'category' | 'mediaOverlay' | 'textOnly' | undefined}
                containerLayout={block.containerLayout as 'edgeToEdge' | 'contained' | undefined}
                imageAnchor={block.imageAnchor as 'center' | 'bottom' | undefined}
                textAlign={block.textAlign as 'left' | 'center' | undefined}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold' | undefined}
                appearance={(block.appearance ?? block.surfaceColour) as 'primary' | 'secondary' | 'sparkle' | 'neutral' | undefined}
              />
            )
            break
          }
          case 'mediaText5050': {
            const props = mapMediaText5050BlockProps(block)
            content = <MediaText5050Block key={block._key || block._type} {...props} />
            break
          }
          case 'mediaTextStacked':
          case 'mediaTextBlock': {
            const mapped = mapMediaTextBlock(block)
            content = (
              <MediaTextBlock
                key={block._key || block._type}
                {...mapped}
              />
            )
            break
          }
          case 'cardGrid': {
            content = (
              <CardGridBlock
                key={block._key || block._type}
                columns={parseInt(block.columns as string, 10) as 2 | 3 | 4}
                title={block.title as string}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                appearance={(block.appearance ?? block.surfaceColour) as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
                items={((block.items as Record<string, unknown>[]) ?? []).map((i) => ({
                  ...i,
                  _type: (i._type as 'cardGridItem') ?? 'cardGridItem',
                  title: (i.title as string) ?? '',
                })) as Parameters<typeof CardGridBlock>[0]['items']}
              />
            )
            break
          }
          case 'carousel': {
            content = (
              <CarouselBlock
                key={block._key || block._type}
                title={block.title as string}
                description={block.description as string | null | undefined}
                callToActions={previewCtasToLab(block.callToActions as { label?: string; link?: string }[] | null | undefined)}
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
                  backgroundColor?: string | null
                }[]).map((it) => ({
                  ...it,
                  cardType: (it.cardType ?? 'mediaTextBelow') as 'mediaTextBelow' | 'colourFeatured',
                  aspectRatio: it.aspectRatio as '4:5' | '8:5' | '2:1',
                }))}
              />
            )
            break
          }
          case 'proofPoints': {
            content = (
              <ProofPointsBlock
                key={block._key || block._type}
                title={block.title as string}
                description={block.description as string | null | undefined}
                callToActions={previewCtasToLab(block.callToActions as { label?: string; link?: string }[] | null | undefined)}
                variant={block.variant as 'icon' | 'stat'}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                appearance={(block.appearance ?? block.surfaceColour) as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
                items={block.items as { title?: string; description?: string; icon?: string }[]}
              />
            )
            break
          }
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
                callToActions={previewCtasToLab(block.callToActions as { label?: string; link?: string }[] | null | undefined)}
                items={items}
                columns={block.columns as 3 | 4 | 5 | 6 | undefined}
                emphasis={block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold'}
                minimalBackgroundStyle={(block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'}
                appearance={(block.appearance ?? block.surfaceColour) as 'primary' | 'secondary' | 'sparkle' | 'neutral'}
              />
            )
            break
          }
          case 'mediaTextAsymmetric': {
            const asymProps = mapMediaTextAsymmetricBlockProps(block)
            content = <MediaTextAsymmetricBlock key={block._key || block._type} {...asymProps} />
            break
          }
          default:
            return (
              <DebugBlock
                key={block._key as string || block._type}
                blockType={block._type}
                sectionName={block.sectionName as string | undefined}
              />
            )
        }

        if (!content) return null
        const pattern = derivePattern(block)
        const contentLayout = (block.contentLayout as string)?.toLowerCase?.()
        const isHeroCategory = block._type === 'hero' && contentLayout === 'category'
        const emphasis = block.emphasis as 'ghost' | 'minimal' | 'subtle' | 'bold' | undefined
        const appearance = (block.appearance ?? block.surfaceColour) as 'primary' | 'secondary' | 'sparkle' | 'neutral' | undefined
        const minimalBackgroundStyle = (block.minimalBackgroundStyle as string)?.toLowerCase?.() === 'gradient' ? 'gradient' : 'block'

        return (
          <BlockErrorBoundary
            key={block._key as string || block._type}
            blockType={block._type}
            sectionName={block.sectionName as string | undefined}
          >
            <BlockShell
              pattern={pattern}
              spacingTop={spacingTop}
              spacingBottom={spacingBottom}
              emphasis={isHeroCategory ? 'ghost' : emphasis}
              appearance={appearance}
              minimalBackgroundStyle={minimalBackgroundStyle}
              style={{ overflow: 'visible' }}
            >
              {content}
            </BlockShell>
          </BlockErrorBoundary>
        )
      })}
    </div>
  )
}
