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
import { useGridBreakpoint } from '../../lib/use-grid-breakpoint'
import { BlockContainer, SPACING_VAR } from '../BlockContainer'
import { BlockReveal } from '../BlockReveal'
import { VideoWithControls } from '../../components/VideoWithControls'
import { StreamImage } from '../../components/StreamImage'
import { MEDIA_TEXT_SUBTITLE_BODY_STYLE, SUBHEAD_STYLE, TYPOGRAPHY } from '../../lib/semantic-headline'
import { getSurfaceProviderProps, useBlockBackgroundColor } from '../../lib/block-surface'
import type { MediaTextBlockProps } from './MediaTextBlock.types'

const ASPECT_RATIOS: Record<string, string> = {
  '16:9': '16 / 9',
  '4:3': '4 / 3',
  '1:1': '1 / 1',
  '3:4': '3 / 4',
  '2:1': '2 / 1',
  auto: 'auto',
}

export function MediaTextBlock({
  size,
  variant,
  stackImagePosition = 'top',
  width,
  mediaStyle,
  blockBackground,
  minimalBackgroundStyle,
  blockAccent,
  spacing,
  spacingTop,
  spacingBottom,
  align,
  eyebrow,
  headline,
  subhead,
  body,
  bulletList,
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
  const isFullBleed = variant === 'full-bleed'
  const isEdgeToEdge = width === 'edgeToEdge'
  /** Edge to edge: no emphasis (ghost surface, no bold). */
  const surfaceProps = isEdgeToEdge
    ? { level: 0 as const, hasBoldBackground: false }
    : isFullBleed
      ? { level: 1 as const, hasBoldBackground: true }
      : getSurfaceProviderProps(blockBackground)

  const handleCtaPress = (href: string) => {
    if (href.startsWith('/')) router.push(href)
    else window.location.href = href
  }

  const bullets = bulletList.slice(0, 6)

  const derivedCentered =
    isNarrow ||
    variant === 'centered-media-below' ||
    variant === 'text-only' ||
    !hasMedia
  const textAlign = align ?? (derivedCentered ? 'center' : 'left')

  /** Titles: M (8 cols). Body: XS (4 cols) or S (6 cols) for text-only left. 50/50 blocks use Default. */
  const titleContentWidth = derivedCentered ? 'M' : 'Default'
  const bodyContentWidth =
    variant === 'text-only' && align === 'left'
      ? 'S'
      : derivedCentered
        ? 'XS'
        : 'Default'

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

  /** Stacked layout: all text (headline, subhead, body) together – either above or below media per stackImagePosition.
   * When image on top: headline renders as subtitle (smaller, lighter). */
  const stackedBlockStyle = variant === 'centered-media-below' && align === 'left' ? { marginInline: 0 } : undefined
  const headlineAsSubtitle = variant === 'centered-media-below' && stackImagePosition === 'top'
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
          {headlineAsSubtitle ? (
            <Title
              level={3}
              as="h2"
              style={{
                textAlign,
                whiteSpace: 'pre-line',
                ...MEDIA_TEXT_SUBTITLE_BODY_STYLE.subtitle,
              }}
            >
              {headline}
            </Title>
          ) : (
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
    (size !== 'hero' && (body || bullets.length > 0)) || (cta || ctaSecondary) ? (
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
          {size !== 'hero' && bullets.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: textAlign === 'center' ? 0 : 'var(--ds-spacing-l)', listStyle: 'disc', listStylePosition: textAlign === 'center' ? 'inside' : 'outside', textAlign }}>
              {bullets.map((item, i) => (
                <li key={i} style={{ marginBottom: i < bullets.length - 1 ? 'var(--ds-spacing-xs)' : 0 }}>
                  <Text
                    size={variant === 'text-only' || variant === 'centered-media-below' ? 'S' : 'M'}
                    weight="low"
                    as="span"
                    color="medium"
                    style={{ whiteSpace: 'pre-line', ...MEDIA_TEXT_SUBTITLE_BODY_STYLE.body }}
                  >
                    {item}
                  </Text>
                </li>
              ))}
            </ul>
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
  const paddingBlockStart = SPACING_VAR[(spacingTop ?? spacing) as keyof typeof SPACING_VAR] ?? SPACING_VAR.large
  const paddingBlockEnd = SPACING_VAR[(spacingBottom ?? spacing) as keyof typeof SPACING_VAR] ?? SPACING_VAR.large
  const cellMedia = useGridCell('Default')
  const { columns } = useGridBreakpoint()
  const isStacked = columns < 8

  const bgColor = useBlockBackgroundColor(blockBackground, blockAccent)
  const useGradient =
    blockBackground === 'minimal' && minimalBackgroundStyle === 'gradient'
  /** Edge to edge: no emphasis (no background colour). */
  const background = isEdgeToEdge
    ? undefined
    : bgColor
      ? useGradient
        ? `linear-gradient(to bottom, white 0%, ${bgColor} 100%)`
        : bgColor
      : undefined

  /** Full-width background band. Coloured padding: always Large (top and bottom) for all blocks. */
  const blockBgWrapper = (children: ReactNode) =>
    background ? (
      <>
        <div
          style={{
            width: '100vw',
            maxWidth: '100vw',
            marginLeft: 'calc(50% - 50vw)',
            marginRight: 'calc(50% - 50vw)',
            background,
            boxSizing: 'border-box',
            paddingBlockStart: internalPaddingLarge,
            paddingBlockEnd: internalPaddingLarge,
            minHeight: 1,
          }}
        >
          {children}
        </div>
      </>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-l)', alignItems: 'center' }}>
                {textContent}
              </div>
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
    const imageOnTop = stackImagePosition === 'top'
    const stackedTextContent = (
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
    const stackedMediaBlock = stackedIsEdgeToEdge ? (
      <div
        style={{
          width: '100vw',
          position: 'relative' as const,
          left: 0,
          marginLeft: 0,
          paddingLeft: 0,
          boxSizing: 'border-box',
          alignSelf: 'flex-start',
        }}
      >
        {mediaContent}
      </div>
    ) : (
      <div style={{ width: '100%' }}>{mediaContent}</div>
    )
    const gridWrappedText = (
      <GridBlock as="div">
        <div
          style={{
            ...cellMedia,
            display: 'flex',
            flexDirection: 'column',
            alignItems: stackedIsEdgeToEdge ? 'center' : stackedAlignItems,
            gap: 'var(--ds-spacing-l)',
          }}
        >
          {stackedTextContent}
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
              alignItems: stackedIsEdgeToEdge ? 'center' : stackedAlignItems,
              gap: 'var(--ds-spacing-2xl)',
            }}
          >
            {stackedIsEdgeToEdge ? (
              imageOnTop ? (
                <>
                  {stackedMediaBlock}
                  {gridWrappedText}
                </>
              ) : (
                <>
                  {gridWrappedText}
                  {stackedMediaBlock}
                </>
              )
            ) : (
              <BlockContainer contentWidth="Default" style={{ width: '100%' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: stackedAlignItems,
                    gap: 'var(--ds-spacing-2xl)',
                  }}
                >
                  {imageOnTop ? (
                    <>
                      {stackedMediaBlock}
                      {stackedTextContent}
                    </>
                  ) : (
                    <>
                      {stackedTextContent}
                      {stackedMediaBlock}
                    </>
                  )}
                </div>
              </BlockContainer>
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
