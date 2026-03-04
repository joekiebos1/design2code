import {
  HeroBlock,
  MediaTextBlock,
  CardGridBlock,
  FullBleedVerticalCarousel,
  CarouselBlock,
  ProofPointsBlock,
  RotatingMediaBlock,
  BlockContainer,
} from '../blocks'
import type { MediaTextBlockProps } from '../blocks'

type Block = {
  _type: string
  _key?: string
  spacing?: 'small' | 'medium' | 'large'
  spacingTop?: 'small' | 'medium' | 'large'
  spacingBottom?: 'small' | 'medium' | 'large'
  [key: string]: unknown
}

function mapMediaTextBlock(block: Block): MediaTextBlockProps {
  const template = (block.template as string) ?? 'SideBySide'
  const imagePosition = (block.imagePosition as string) ?? 'right'
  const contentWidth = (block.contentWidth as string) ?? 'Default'
  const imageAspectRatio = (block.imageAspectRatio as string) ?? '4:3'

  const sideBySide = imagePosition === 'left' ? 'media-left' : 'media-right'
  const variantMap: Record<string, MediaTextBlockProps['variant']> = {
    SideBySide: sideBySide,
    HeroOverlay: 'full-bleed',
    Stacked: 'centered-media-below',
    TextOnly: 'text-only',
  }
  const variant = variantMap[template] ?? sideBySide

  const aspectRatioMap: Record<string, NonNullable<MediaTextBlockProps['media']>['aspectRatio']> = {
    '16:7': '16:9',
    '21:9': '16:9',
    '16:9': '16:9',
    '4:3': '4:3',
    '3:4': '3:4',
    '1:1': '1:1',
  }
  const aspectRatio = aspectRatioMap[imageAspectRatio] ?? '16:9'

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

  const alignSource =
    (block.align as 'left' | 'center' | undefined) ??
    (template === 'HeroOverlay' ? (block.overlayAlignment as 'left' | 'center' | undefined) : undefined) ??
    (template === 'Stacked' ? (block.stackAlignment as 'left' | 'center' | undefined) : undefined)

  return {
    headline: (block.title as string) ?? '',
    eyebrow: block.eyebrow as string | undefined,
    subhead: block.subhead as string | undefined,
    body: block.body as string | undefined,
    bulletList: bulletListFiltered?.length ? bulletListFiltered : undefined,
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
    size: (block.size as MediaTextBlockProps['size']) ?? 'feature',
    mediaStyle: (block.mediaStyle as MediaTextBlockProps['mediaStyle']) ?? 'contained',
    blockBackground: (block.blockBackground as MediaTextBlockProps['blockBackground']) ?? 'ghost',
    spacing: (block.spacing as MediaTextBlockProps['spacing']) ?? 'large',
    spacingTop: (block.spacingTop as MediaTextBlockProps['spacingTop']) ?? undefined,
    spacingBottom: (block.spacingBottom as MediaTextBlockProps['spacingBottom']) ?? undefined,
    width: (() => {
      if (contentWidth === 'edgeToEdge' || contentWidth === 'full') return 'edgeToEdge'
      const map: Record<string, MediaTextBlockProps['width']> = {
        XS: 'XS', S: 'S', M: 'M', Default: 'Default', Wide: 'Wide',
        narrow: 'M', editorial: 'XS', default: 'Default', wide: 'Wide',
        // Legacy mapping
        L: 'M', XL: 'Default', '2XL': 'Wide',
      }
      return map[contentWidth] ?? 'Default'
    })(),
    align: alignSource === 'center' || alignSource === 'left' ? alignSource : undefined,
  }
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
        let content: React.ReactNode = null
        switch (block._type) {
          case 'hero':
            content = (
              <HeroBlock
                key={block._key || block._type}
                variant={(block.variant as 'category' | 'product' | 'ghost' | 'fullscreen') ?? 'category'}
                productName={block.productName as string}
                headline={block.headline as string}
                subheadline={block.subheadline as string}
                ctaText={block.ctaText as string}
                ctaLink={block.ctaLink as string}
                cta2Text={block.cta2Text as string}
                cta2Link={block.cta2Link as string}
                image={block.image as string}
              />
            )
            break
          case 'mediaTextBlock':
            content = (
              <MediaTextBlock key={block._key || block._type} {...mapMediaTextBlock(block)} />
            )
            break
          case 'cardGrid':
            content = (
              <CardGridBlock
                key={block._key || block._type}
                columns={(parseInt(block.columns as string, 10) || 3) as 2 | 3 | 4}
                title={block.title as string}
                titleLevel={(block.titleLevel as 'h2' | 'h3' | 'h4') ?? 'h2'}
                items={(block.items as { cardStyle?: string; title?: string; description?: string; image?: string; video?: string; ctaText?: string; ctaLink?: string; surface?: string }[])?.map((i) => ({
                  cardStyle: (i.cardStyle as 'image-above' | 'text-on-colour' | 'text-on-image') ?? 'image-above',
                  title: i.title ?? '',
                  description: i.description,
                  image: i.image,
                  video: i.video,
                  ctaText: i.ctaText,
                  ctaLink: i.ctaLink,
                  surface: (i.surface as 'subtle' | 'bold') ?? 'bold',
                }))}
              />
            )
            break
          case 'fullBleedVerticalCarousel':
            content = (
              <FullBleedVerticalCarousel
                key={block._key || block._type}
                items={block.items as { title?: string; description?: string; image?: string; video?: string }[]}
              />
            )
            break
          case 'carousel':
            content = (
              <CarouselBlock
                key={block._key || block._type}
                title={block.title as string}
                titleLevel={(block.titleLevel as 'h2' | 'h3' | 'h4') ?? 'h2'}
                variant={(block.variant as 'featured' | 'informative') ?? 'informative'}
                cardSize={(block.cardSize as 'compact' | 'large' | 'large-4x5') ?? 'compact'}
                items={block.items as { title?: string; description?: string; image?: string; video?: string; link?: string; ctaText?: string; aspectRatio?: '4:5' | '8:5' | '2:1' }[]}
              />
            )
            break
          case 'proofPoints':
            content = (
              <ProofPointsBlock
                key={block._key || block._type}
                title={block.title as string}
                titleLevel={(block.titleLevel as 'h2' | 'h3' | 'h4') ?? 'h2'}
                items={block.items as { title?: string; description?: string; icon?: string }[]}
              />
            )
            break
          case 'rotatingMedia':
            content = (
              <RotatingMediaBlock
                key={block._key || block._type}
                variant={(block.variant as 'small' | 'large' | 'combined') ?? 'small'}
                surface={(block.surface as 'ghost' | 'minimal' | 'subtle' | 'bold') ?? 'ghost'}
                items={(block.items as { image?: string; title?: string; label?: string }[])?.map((i) => ({
                  image: i.image ?? '',
                  title: i.title,
                  label: i.label,
                }))}
              />
            )
            break
          default:
            return null
        }
        if (!content) return null
        const fallbackSpacing = (block.spacing as 'small' | 'medium' | 'large') ?? 'large'
        const spacingTop = (block.spacingTop as 'small' | 'medium' | 'large') ?? fallbackSpacing
        const spacingBottom = (block.spacingBottom as 'small' | 'medium' | 'large') ?? fallbackSpacing
        const blockBg = block.blockBackground as string | undefined
        const hasColouredBackground = Boolean(
          block._type === 'mediaTextBlock' &&
            blockBg &&
            !['ghost', 'none'].includes(blockBg)
        )
        const isOverflow =
          block._type === 'mediaTextBlock' && block.mediaStyle === 'overflow'
        return (
          <BlockContainer
            key={block._key || block._type}
            contentWidth="full"
            spacingTop={spacingTop}
            spacingBottom={spacingBottom}
            hasColouredBackground={hasColouredBackground}
            spacingOnlyOnContent={isOverflow}
            style={{ overflow: 'visible' }}
          >
            {content}
          </BlockContainer>
        )
      })}
    </div>
  )
}
