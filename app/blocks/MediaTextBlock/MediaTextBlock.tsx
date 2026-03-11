'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Display,
  Headline,
  Title,
  Text,
  Label,
  Button,
  SurfaceProvider,
} from '@marcelinodzn/ds-react'
import { GridBlock, useGridCell } from '../../components/GridBlock'
import { BlockContainer, SPACING_VAR } from '../BlockContainer'
import { BlockReveal } from '../BlockReveal'
import { VideoWithControls } from '../../components/VideoWithControls'
import { StreamImage } from '../../components/StreamImage'
import { MEDIA_TEXT_SUBTITLE_BODY_STYLE, TYPOGRAPHY } from '../../lib/semantic-headline'
import { getSurfaceProviderProps, useBlockBackgroundColor } from '../../lib/block-surface'
import { EDGE_TO_EDGE_BREAKOUT, useEdgeToEdgeMediaStyles } from '../../lib/edge-to-edge'
import type { MediaTextBlockProps } from './MediaTextBlock.types'

const ASPECT_RATIOS: Record<string, string> = {
  '16:9': '16 / 9',
  '4:3': '4 / 3',
  '1:1': '1 / 1',
  '3:4': '3 / 4',
  '2:1': '2 / 1',
  auto: 'auto',
}

/** Card-style typography for image description (matches Large Carousel 2:1 card) */
const DESCRIPTION_TITLE_STYLE = {
  fontSize: 'var(--ds-typography-h5)',
  fontWeight: 'var(--ds-typography-weight-medium)',
  color: 'var(--ds-color-text-high)',
  lineHeight: 1.4,
} as const
const DESCRIPTION_BODY_STYLE = {
  fontSize: 'var(--ds-typography-label-s)',
  lineHeight: 1.4,
  color: 'var(--ds-color-text-low)',
  fontWeight: 'var(--ds-typography-weight-low)',
} as const

export function MediaTextBlock({
  size,
  variant,
  width,
  mediaStyle,
  emphasis,
  minimalBackgroundStyle,
  surfaceColour,
  spacing: _spacing,
  spacingTop: _spacingTop,
  spacingBottom: _spacingBottom,
  align,
  eyebrow,
  headline,
  subhead,
  body,
  descriptionTitle,
  descriptionBody,
  cta,
  ctaSecondary,
  media,
  imageSlot,
  imageState,
}: MediaTextBlockProps) {
  const router = useRouter()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = () => setPrefersReducedMotion(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const hasMedia = media?.src && media.src.trim() !== ''
  const isNarrow = width === 'M'
  const edgeStyles = useEdgeToEdgeMediaStyles()
  const isFullBleed = variant === 'full-bleed'
  const isEdgeToEdge = width === 'edgeToEdge'
  /** Edge to edge: no emphasis (ghost surface, no bold). */
  const surfaceProps = isEdgeToEdge
    ? { level: 0 as const, hasBoldBackground: false }
    : isFullBleed
      ? { level: 1 as const, hasBoldBackground: true }
      : getSurfaceProviderProps(emphasis)

  const handleCtaPress = (href: string) => {
    if (href.startsWith('/')) router.push(href)
    else window.location.href = href
  }

  /** Text alignment must match container alignment. When align is set, use it; otherwise default center. */
  const textAlign = (align === 'center' || align === 'left') ? align : 'center'

  /** Left = Default grid width. Center = M (title) / XS (body) for centered content. */
  const titleContentWidth = align === 'left' ? 'Default' : 'M'
  const bodyContentWidth =
    align === 'left'
      ? (variant === 'text-only' ? 'S' : 'Default')
      : 'XS'

  /** Text-only left: BlockContainers align to start of Default grid (no center margin). */
  const textOnlyLeftContainerStyle =
    variant === 'text-only' && align === 'left' ? { marginInline: 0 as const } : undefined

  const titleContent = (
    <BlockContainer contentWidth={titleContentWidth} style={{ width: '100%', ...textOnlyLeftContainerStyle }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-m)',
          alignItems: textAlign === 'center' ? 'center' : 'flex-start',
          textAlign,
          width: '100%',
        }}
      >
        {eyebrow && (
          <Label size="S" color="medium">
            {eyebrow}
          </Label>
        )}
        {size === 'hero' && <Display as="h1" style={{ textAlign, whiteSpace: 'pre-line' }}>{headline}</Display>}
        {size === 'feature' && (
          <Headline
            size="L"
            weight="high"
            as="h2"
            style={{
              fontSize:
                variant === 'text-only'
                  ? TYPOGRAPHY.h2
                  : textAlign === 'center' || variant === 'full-bleed'
                    ? TYPOGRAPHY.h1
                    : TYPOGRAPHY.h2,
              textAlign,
              whiteSpace: 'pre-line',
            }}
          >
            {headline}
          </Headline>
        )}
        {size === 'editorial' && <Title level={2} style={{ textAlign, whiteSpace: 'pre-line' }}>{headline}</Title>}
        {size !== 'hero' && subhead && (
          <Title
            level={3}
            style={{
              textAlign,
              ...MEDIA_TEXT_SUBTITLE_BODY_STYLE.subtitle,
            }}
          >
            {subhead}
          </Title>
        )}
      </div>
    </BlockContainer>
  )

  /** Stacked layout: optional text above image (eyebrow, title, subhead, body) + optional image description below (card-style). */
  const stackedBlockStyle = variant === 'centered-media-below' && align === 'left' ? { marginInline: 0 } : undefined
  const hasTextAbove = Boolean(eyebrow || headline || subhead || body)
  const hasTextBelow = Boolean(descriptionTitle || descriptionBody)
  const stackedTitleContent =
    variant === 'centered-media-below' ? (
      <BlockContainer contentWidth={titleContentWidth} style={{ width: '100%', ...stackedBlockStyle }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-m)',
            alignItems: textAlign === 'center' ? 'center' : 'flex-start',
            textAlign,
            width: '100%',
          }}
        >
          {eyebrow && (
            <Label size="S" color="medium">
              {eyebrow}
            </Label>
          )}
          {headline && (
            <>
              {size === 'hero' && <Display as="h1" style={{ textAlign, whiteSpace: 'pre-line' }}>{headline}</Display>}
              {size === 'feature' && (
                <Headline
                  size="L"
                  weight="high"
                  as="h2"
                  style={{
                    fontSize: TYPOGRAPHY.h2,
                    textAlign,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {headline}
                </Headline>
              )}
              {size === 'editorial' && (
                <Title level={2} style={{ textAlign, fontSize: TYPOGRAPHY.h3, whiteSpace: 'pre-line' }}>{headline}</Title>
              )}
            </>
          )}
          {size !== 'hero' && subhead && (
            <Title
              level={3}
              style={{
                textAlign,
                whiteSpace: 'pre-line',
                ...MEDIA_TEXT_SUBTITLE_BODY_STYLE.subtitle,
              }}
            >
              {subhead}
            </Title>
          )}
        </div>
      </BlockContainer>
    ) : null

  const bodyContent =
    (size !== 'hero' && body) || (cta || ctaSecondary) ? (
      <BlockContainer contentWidth={bodyContentWidth} style={{ width: '100%', ...(variant === 'centered-media-below' ? stackedBlockStyle : undefined), ...textOnlyLeftContainerStyle }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-l)',
            alignItems: textAlign === 'center' ? 'center' : 'flex-start',
            textAlign,
            width: '100%',
          }}
        >
          {size !== 'hero' && body && (
            <Text
              size={variant === 'text-only' ? 'S' : variant === 'centered-media-below' ? 'S' : 'M'}
              weight="low"
              as="p"
              color="medium"
              style={{
                textAlign,
                whiteSpace: 'pre-line',
                ...MEDIA_TEXT_SUBTITLE_BODY_STYLE.body,
              }}
            >
              {body}
            </Text>
          )}
          {(cta || ctaSecondary) && (
            <div style={{ display: 'flex', gap: 'var(--ds-spacing-s)', flexWrap: 'wrap', marginTop: 'var(--ds-spacing-l)' }}>
              {cta && (() => {
                const appearance = cta.appearance ?? 'primary'
                const isGhost = appearance === 'ghost'
                return (
                  <Button
                    appearance={isGhost ? 'secondary' : appearance}
                    contained={!isGhost}
                    size="S"
                    onPress={() => handleCtaPress(cta.href)}
                  >
                    {cta.label}
                  </Button>
                )
              })()}
              {ctaSecondary && (
                <Button appearance="secondary" contained={false} size="S" onPress={() => handleCtaPress(ctaSecondary.href)}>
                  {ctaSecondary.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </BlockContainer>
    ) : null

  const textContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: MEDIA_TEXT_SUBTITLE_BODY_STYLE.gap,
        alignItems: textAlign === 'center' ? 'center' : 'flex-start',
        paddingRight: MEDIA_TEXT_SUBTITLE_BODY_STYLE.paddingRight,
      }}
    >
      {titleContent}
      {bodyContent}
    </div>
  )

  const useStreamImage = imageState && imageSlot && media?.type === 'image'
  const isStackedEdgeToEdge = variant === 'centered-media-below' && width === 'edgeToEdge'
  const mediaContent = hasMedia && media && (() => {
    const rawRatio = media.aspectRatio ?? '16:9'
    const ratio = rawRatio
    const aspectRatio = ASPECT_RATIOS[ratio] ?? '16 / 9'
    const isVideo = media.type === 'video'
    /** Stacked edge-to-edge: no rounded corners. */
    const useBorderRadius = mediaStyle === 'contained' && !isStackedEdgeToEdge

    if (isVideo) {
      return (
        <div style={{ position: 'relative', width: '100%', aspectRatio: ratio === 'auto' ? undefined : aspectRatio, overflow: 'hidden', borderRadius: useBorderRadius ? 'var(--ds-radius-card-m)' : 0 }}>
          <VideoWithControls
            src={media.src}
            poster={media.poster}
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>
      )
    }

    if (useStreamImage) {
      return (
        <div style={{ position: 'relative', width: '100%', aspectRatio: ratio === 'auto' ? undefined : aspectRatio, overflow: 'hidden', borderRadius: useBorderRadius ? 'var(--ds-radius-card)' : 0 }}>
          <StreamImage
            slot={imageSlot}
            imageState={imageState}
            aspectRatio={aspectRatio.replace(/\s/g, '')}
          />
        </div>
      )
    }

    return (
      <div style={{ position: 'relative', width: '100%', aspectRatio: ratio === 'auto' ? undefined : aspectRatio, overflow: 'hidden', borderRadius: useBorderRadius ? 'var(--ds-radius-card)' : 0 }}>
        <Image
          src={media.src}
          alt={media.alt ?? ''}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    )
  })()

  /** Internal vertical padding for background colour: always Large (4xl) per spec. */
  const internalPaddingLarge = SPACING_VAR.large
  const cellMedia = useGridCell('Default')

  const bgColor = useBlockBackgroundColor(emphasis, surfaceColour)
  const useGradient =
    emphasis === 'minimal' && minimalBackgroundStyle === 'gradient'
  /** Edge to edge: no emphasis (no background colour). */
  const background = isEdgeToEdge
    ? undefined
    : bgColor
      ? useGradient
        ? `linear-gradient(to bottom, white 0%, ${bgColor} 100%)`
        : bgColor
      : undefined

  /** Full-width background band. Coloured padding: always Large (top and bottom) for all blocks. Capped at 1920px on large screens. */
  const blockBgWrapper = (children: ReactNode) =>
    background ? (
      <div style={{ ...EDGE_TO_EDGE_BREAKOUT }}>
        <div
          style={{
            ...edgeStyles.innerContainer,
            background,
            paddingBlockStart: internalPaddingLarge,
            paddingBlockEnd: internalPaddingLarge,
            minHeight: 1,
          }}
        >
          {children}
        </div>
      </div>
    ) : (
      children
    )

  if (isNarrow) {
    return blockBgWrapper(
      <BlockReveal>
        <SurfaceProvider {...surfaceProps}>
          <GridBlock as="section">
            <div style={{ ...cellMedia, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--ds-spacing-2xl)' }}>
              {titleContent}
              <BlockContainer contentWidth="Default" style={{ width: '100%' }}>
                {mediaContent}
              </BlockContainer>
              {bodyContent}
            </div>
          </GridBlock>
        </SurfaceProvider>
      </BlockReveal>
    )
  }

  if (variant === 'full-bleed' && hasMedia && media) {
    const ratio = media.aspectRatio ?? '16:9'
    const aspectRatio = ASPECT_RATIOS[ratio] ?? '16 / 9'
    const isVideo = media.type === 'video'
    const isOverlayContained = width === 'Default'

    if (isOverlayContained) {
      return blockBgWrapper(
        <BlockReveal>
          <SurfaceProvider {...surfaceProps}>
            <GridBlock as="section">
              <div style={{ ...cellMedia }}>
                <BlockContainer contentWidth="Default" style={{ width: '100%' }}>
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio,
                      overflow: 'hidden',
                      borderRadius: 'var(--ds-radius-card-m)',
                    }}
                  >
                    <div style={{ position: 'absolute', inset: 0 }}>
                      {isVideo ? (
                        <VideoWithControls
                          src={media.src}
                          poster={media.poster}
                          prefersReducedMotion={prefersReducedMotion}
                        />
                      ) : (
                        <Image src={media.src} alt={media.alt ?? ''} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 80vw" />
                      )}
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, var(--local-color-overlay-dark) 0%, transparent 60%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        paddingBlock: 'var(--ds-spacing-3xl)',
                        paddingInline: 0,
                      }}
                    >
                      {align === 'left' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-l)', alignItems: 'flex-start', paddingInlineStart: 'var(--ds-spacing-3xl)' }}>
                          {textContent}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-l)', alignItems: 'center', width: '100%' }}>
                          {textContent}
                        </div>
                      )}
                    </div>
                  </div>
                </BlockContainer>
              </div>
            </GridBlock>
          </SurfaceProvider>
        </BlockReveal>
      )
    }

    return blockBgWrapper(
      <BlockReveal>
        <SurfaceProvider {...surfaceProps}>
          <section style={{ position: 'relative', width: '100%', aspectRatio, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0 }}>
              {isVideo ? (
                <VideoWithControls
                  src={media.src}
                  poster={media.poster}
                  prefersReducedMotion={prefersReducedMotion}
                />
              ) : (
                <Image src={media.src} alt={media.alt ?? ''} fill style={{ objectFit: 'cover' }} sizes="100vw" />
              )}
            </div>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, var(--local-color-overlay-dark) 0%, transparent 60%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                paddingBlock: 'var(--ds-spacing-3xl)',
                paddingInline: 0,
              }}
            >
              {align === 'left' ? (
                <GridBlock as="div">
                  <div style={{ ...cellMedia, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-l)', alignItems: 'flex-start', paddingInlineStart: 'var(--ds-spacing-3xl)' }}>
                    {textContent}
                  </div>
                </GridBlock>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-l)', alignItems: 'center', width: '100%' }}>
                  {textContent}
                </div>
              )}
            </div>
          </section>
        </SurfaceProvider>
      </BlockReveal>
    )
  }

  if (variant === 'text-only') {
    const textOnlyAlignItems = textAlign === 'center' ? 'center' : 'flex-start'
    return blockBgWrapper(
      <BlockReveal>
        <SurfaceProvider {...surfaceProps}>
          <GridBlock as="section">
            <div style={{ ...cellMedia, display: 'flex', flexDirection: 'column', alignItems: textOnlyAlignItems, gap: 'var(--ds-spacing-l)' }}>
              {titleContent}
              {bodyContent}
            </div>
          </GridBlock>
        </SurfaceProvider>
      </BlockReveal>
    )
  }

  if (variant === 'centered-media-below' && hasMedia) {
    const stackedIsEdgeToEdge = width === 'edgeToEdge'
    const stackedAlignItems = align === 'center' ? 'center' : 'flex-start'
    const textAlignStacked = align ?? 'left'

    /** Text above image: eyebrow, title, subhead, body. */
    const stackedTextAbove = hasTextAbove && (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: stackedAlignItems,
          gap: 'var(--ds-spacing-l)',
        }}
      >
        {stackedTitleContent}
        {bodyContent}
      </div>
    )

    /** Image description below: card-style typography (h5 + label-s). Same width as 2:1 Card (BlockContainer S). */
    const stackedTextBelow = hasTextBelow ? (
      <BlockContainer
        contentWidth="S"
        style={{
          alignSelf: stackedAlignItems === 'center' ? 'center' : 'flex-start',
          ...(stackedAlignItems === 'flex-start' ? { marginInline: 0 } : {}),
          textAlign: textAlignStacked,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: stackedAlignItems === 'center' ? 'center' : 'flex-start',
            gap: 'var(--ds-spacing-m)',
            width: '100%',
            minWidth: 0,
          }}
        >
          {descriptionTitle ? (
            <p style={{ margin: 0, width: '100%', whiteSpace: 'pre-line', ...DESCRIPTION_TITLE_STYLE }}>
              {descriptionTitle}
            </p>
          ) : null}
          {descriptionBody ? (
            <p style={{ margin: 0, width: '100%', whiteSpace: 'pre-line', ...DESCRIPTION_BODY_STYLE }}>
              {descriptionBody}
            </p>
          ) : null}
        </div>
      </BlockContainer>
    ) : null

    const stackedMediaBlock = stackedIsEdgeToEdge ? (
      <div style={{ ...EDGE_TO_EDGE_BREAKOUT, alignSelf: 'flex-start' }}>
        <div style={edgeStyles.inner}>
          {mediaContent}
        </div>
      </div>
    ) : (
      <div style={{ width: '100%' }}>{mediaContent}</div>
    )

    const gridWrappedSection = (children: React.ReactNode) => (
      <GridBlock as="div">
        <div
          style={{
            ...cellMedia,
            display: 'flex',
            flexDirection: 'column',
            alignItems: stackedAlignItems,
            gap: 'var(--ds-spacing-l)',
          }}
        >
          {children}
        </div>
      </GridBlock>
    )

    return blockBgWrapper(
      <BlockReveal>
        <SurfaceProvider {...surfaceProps}>
          <section
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: stackedAlignItems,
              gap: 'var(--ds-spacing-l)',
            }}
          >
            {stackedIsEdgeToEdge ? (
              <>
                {stackedTextAbove &&
                  (align !== 'center'
                    ? gridWrappedSection(stackedTextAbove)
                    : stackedTextAbove)}
                {stackedMediaBlock}
                {hasTextBelow && gridWrappedSection(stackedTextBelow)}
              </>
            ) : (
              <GridBlock as="div">
                <div style={{ ...cellMedia }}>
                  <BlockContainer contentWidth="Default" style={{ width: '100%' }}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: stackedAlignItems,
                        gap: 'var(--ds-spacing-l)',
                      }}
                    >
                      {stackedTextAbove}
                      {stackedMediaBlock}
                      {stackedTextBelow}
                    </div>
                  </BlockContainer>
                </div>
              </GridBlock>
            )}
          </section>
        </SurfaceProvider>
      </BlockReveal>
    )
  }

  return blockBgWrapper(
    <BlockReveal>
      <SurfaceProvider {...surfaceProps}>
        <GridBlock as="section">
          <div style={{ ...cellMedia, display: 'flex', flexDirection: 'column', alignItems: derivedCentered ? 'center' : 'stretch', gap: 'var(--ds-spacing-l)' }}>
            {titleContent}
            {bodyContent}
          </div>
        </GridBlock>
      </SurfaceProvider>
    </BlockReveal>
  )
}
