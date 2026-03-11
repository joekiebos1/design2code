'use client'

/**
 * Lab: HeroColour – Unified hero with three layouts
 *
 * contentLayout: stacked | sideBySide | mediaOverlay
 * - stacked: text above, image below (centered)
 * - sideBySide: text left, image right (containerLayout, imageAnchor)
 * - mediaOverlay: image as background, content overlaid (textAlign)
 *
 * blockSurface (ghost, minimal, subtle, bold) applies at surface level.
 */

import { useRouter } from 'next/navigation'
import { Display, Headline, Text, Button, SurfaceProvider } from '@marcelinodzn/ds-react'
import { GridBlock, useGridCell } from '../../../components/GridBlock'
import { BlockContainer } from '../../../blocks/BlockContainer'
import { useGridBreakpoint } from '../../../lib/use-grid-breakpoint'
import { useHeroStaggeredReveal } from '../../../lib/use-hero-staggered-reveal'
import { BlockSurfaceProvider, getSurfaceProviderProps, useBlockBackgroundColor } from '../../../lib/block-surface'
import { TYPOGRAPHY, HERO_BODY_STYLE } from '../../../lib/semantic-headline'
import type { HeroColourProps } from './HeroColour.types'

const IMAGE_ASPECT_RATIO = '2 / 1'
const MEDIA_OVERLAY_ASPECT_RATIO = '2 / 1'

export function HeroColour({
  productName,
  headline,
  subheadline,
  ctaText,
  ctaLink,
  cta2Text,
  cta2Link,
  image,
  videoUrl,
  contentLayout = 'sideBySide',
  containerLayout = 'edgeToEdge',
  imageAnchor = 'center',
  textAlign = 'left',
  blockSurface = 'ghost',
  blockAccent = 'primary',
}: HeroColourProps) {
  const router = useRouter()
  const { columns } = useGridBreakpoint()
  const { ref: revealRef, getRevealStyle, prefersReducedMotion } = useHeroStaggeredReveal(4)

  const isStackedLayout = contentLayout === 'stacked'
  const isMediaOverlay = contentLayout === 'mediaOverlay'
  const isStacked = columns < 8
  const cell = useGridCell('Wide')
  const isEdgeToEdge = containerLayout === 'edgeToEdge'
  const isContained = containerLayout === 'contained'
  /** Top to bottom: no Ghost (force minimal). */
  const effectiveSurface = imageAnchor === 'bottom' && blockSurface === 'ghost' ? 'minimal' : blockSurface
  const surfaceProps = getSurfaceProviderProps(effectiveSurface)
  const bgColor = useBlockBackgroundColor(effectiveSurface, blockAccent)

  const handleCtaPress = (href: string) => {
    if (href.startsWith('/')) router.push(href)
    else window.location.href = href
  }

  const hasVideoUrl = Boolean(videoUrl?.trim())
  const isVideo = hasVideoUrl && !prefersReducedMotion
  const mediaSrc = videoUrl?.trim() || image
  const showVideo = isVideo && mediaSrc
  const imgOrPosterSrc = hasVideoUrl && prefersReducedMotion ? image : mediaSrc

  const mediaElement = showVideo ? (
    <video
      src={mediaSrc}
      autoPlay
      muted
      loop
      playsInline
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  ) : imgOrPosterSrc ? (
    <img src={imgOrPosterSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  ) : (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--ds-color-background-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text size="M" weight="medium" color="low" as="span">
        Image
      </Text>
    </div>
  )

  if (isStackedLayout) {
    return (
      <BlockSurfaceProvider blockSurface={blockSurface} blockAccent={blockAccent} fullWidth>
        <section ref={revealRef} style={{ width: '100%' }}>
          <GridBlock as="div">
            <div style={{ ...cell, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {(productName || headline) && (
                <div style={getRevealStyle(0)}>
                  <BlockContainer contentWidth="Default">
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                      {productName && <Text size="L" weight="high" align="center" as="span" style={{ marginBottom: 'var(--ds-spacing-m)' }}>{productName}</Text>}
                      {headline && <Display size="L" as="h1" align="center" style={{ lineHeight: 1.1, whiteSpace: 'pre-line', marginBottom: subheadline ? 'var(--ds-spacing-s)' : (ctaText || cta2Text) ? 'var(--ds-spacing-xl)' : 0 }}>{headline}</Display>}
                    </div>
                  </BlockContainer>
                </div>
              )}
              {subheadline && (
                <div style={getRevealStyle(1)}>
                  <BlockContainer contentWidth="XS">
                    <Text align="center" as="p" style={{ margin: 0, marginBottom: (ctaText || cta2Text) ? 'var(--ds-spacing-xl)' : 0, textAlign: 'center', whiteSpace: 'pre-line', ...HERO_BODY_STYLE }}>{subheadline}</Text>
                  </BlockContainer>
                </div>
              )}
              {(ctaText || cta2Text) && (
                <div style={getRevealStyle(2)}>
                  <BlockContainer contentWidth="Default">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-m)', justifyContent: 'center' }}>
                      {ctaText && ctaLink && <Button appearance="primary" size="M" attention="high" onPress={() => handleCtaPress(ctaLink)}>{ctaText}</Button>}
                      {cta2Text && cta2Link && <Button appearance="primary" size="M" attention="medium" onPress={() => handleCtaPress(cta2Link)}>{cta2Text}</Button>}
                    </div>
                  </BlockContainer>
                </div>
              )}
              <div style={getRevealStyle(3)}>
                <BlockContainer contentWidth="Wide" style={{ marginTop: 'var(--ds-spacing-xl)' }}>
                  <div style={{ aspectRatio: '2 / 1', overflow: 'hidden', borderRadius: 'var(--ds-radius-card-m)' }}>
                    {mediaElement}
                  </div>
                </BlockContainer>
              </div>
            </div>
          </GridBlock>
        </section>
      </BlockSurfaceProvider>
    )
  }

  if (isMediaOverlay) {
    return (
      <section
        ref={revealRef}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: MEDIA_OVERLAY_ASPECT_RATIO,
          minHeight: 320,
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: mediaSrc ? undefined : 'var(--ds-color-background-subtle)' }}>
          {mediaElement}
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, color-mix(in srgb, var(--ds-color-neutral-bold) 70%, transparent) 0%, color-mix(in srgb, var(--ds-color-neutral-bold) 30%, transparent) 50%, transparent 100%)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
        <SurfaceProvider level={0} hasBoldBackground={true}>
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: textAlign === 'center' ? 'center' : 'flex-start',
              justifyContent: 'center',
              padding: 'var(--ds-spacing-3xl) var(--ds-spacing-xl)',
            }}
          >
            <GridBlock as="div">
              <div style={{ ...cell, maxWidth: textAlign === 'center' ? 'min(100%, 42rem)' : undefined }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: (textAlign ?? 'left') === 'center' ? 'center' : 'flex-start',
                    textAlign: textAlign ?? 'left',
                    gap: 0,
                  }}
                >
                  <div style={getRevealStyle(0)}>
                    {productName && <Text size="L" weight="high" as="span" style={{ marginBottom: 'var(--ds-spacing-m)' }}>{productName}</Text>}
                    {headline && <Headline size="L" weight="high" as="h1" style={{ lineHeight: 1.1, fontSize: textAlign === 'left' ? TYPOGRAPHY.h2 : TYPOGRAPHY.h1, whiteSpace: 'pre-line', marginBottom: subheadline ? 'var(--ds-spacing-s)' : (ctaText || cta2Text) ? 'var(--ds-spacing-xl)' : 0 }}>{headline}</Headline>}
                  </div>
                  {subheadline && (
                    <div style={getRevealStyle(1)}>
                      <Text as="p" weight="low" style={{ margin: 0, marginBottom: (ctaText || cta2Text) ? 'var(--ds-spacing-xl)' : 0, opacity: 0.95, whiteSpace: 'pre-line', ...HERO_BODY_STYLE }}>
                        {subheadline}
                      </Text>
                    </div>
                  )}
                  {(ctaText || cta2Text) && (
                    <div style={getRevealStyle(2)}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-m)', justifyContent: textAlign === 'center' ? 'center' : 'flex-start' }}>
                        {ctaText && ctaLink && <Button appearance="primary" size="M" attention="high" onPress={() => handleCtaPress(ctaLink)}>{ctaText}</Button>}
                        {cta2Text && cta2Link && <Button appearance="primary" size="M" attention="medium" onPress={() => handleCtaPress(cta2Link)}>{cta2Text}</Button>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GridBlock>
          </div>
        </SurfaceProvider>
      </section>
    )
  }

  const imageAspect = isStacked ? '2 / 1' : IMAGE_ASPECT_RATIO
  const isTopToBottom = imageAnchor === 'bottom' && !isStacked
  const alignTextToGridStart = isEdgeToEdge || effectiveSurface === 'ghost'

  const textContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingBlockStart: 'var(--ds-spacing-xl)',
        paddingBlockEnd: 'var(--ds-spacing-xl)',
        paddingInlineStart: alignTextToGridStart ? 0 : 'var(--ds-spacing-2xl)',
        paddingInlineEnd: 'var(--ds-spacing-2xl)',
      }}
    >
      <div style={getRevealStyle(0)}>
        {productName && <Text size="L" weight="high" as="span" style={{ marginBottom: 'var(--ds-spacing-m)' }}>{productName}</Text>}
        {headline && <Headline size="L" weight="high" as="h1" style={{ lineHeight: 1.1, fontSize: TYPOGRAPHY.h2, marginBottom: 'var(--ds-spacing-s)' }}>{headline}</Headline>}
      </div>
      {subheadline && (
        <div style={getRevealStyle(1)}>
          <Text as="p" weight="low" style={{ margin: 0, marginBottom: 'var(--ds-spacing-xl)', opacity: 0.95, whiteSpace: 'pre-line', ...HERO_BODY_STYLE }}>
            {subheadline}
          </Text>
        </div>
      )}
      {(ctaText || cta2Text) && (
        <div style={getRevealStyle(2)}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-m)' }}>
            {ctaText && ctaLink && <Button appearance="primary" size="M" attention="high" onPress={() => handleCtaPress(ctaLink)}>{ctaText}</Button>}
            {cta2Text && cta2Link && <Button appearance="primary" size="M" attention="medium" onPress={() => handleCtaPress(cta2Link)}>{cta2Text}</Button>}
          </div>
        </div>
      )}
    </div>
  )

  const imageWrapperStyle: import('react').CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    ...(isTopToBottom ? { flex: 1 } : {}),
    ...(isContained ? { padding: 'var(--ds-spacing-l)', ...(imageAnchor === 'bottom' ? { paddingBlockEnd: 0 } : {}) } : {}),
  }

  const imageContainerStyle: React.CSSProperties = isTopToBottom
    ? { position: 'relative', height: '100%', minHeight: 0, overflow: 'hidden' }
    : { position: 'relative', aspectRatio: imageAspect, overflow: 'hidden', borderRadius: 'var(--ds-radius-card-m)' }

  const imageContent = (
    <div style={{ ...imageWrapperStyle, ...getRevealStyle(3) }}>
      <div style={imageContainerStyle}>
        {mediaElement}
      </div>
    </div>
  )

  const imageColumnPullsToBottom = imageAnchor === 'bottom' && !isStacked && (isEdgeToEdge ? effectiveSurface !== 'ghost' : isContained)
  const imageColumnPullAmount = isEdgeToEdge ? 'var(--ds-spacing-4xl)' : isContained ? 'var(--ds-spacing-3xl)' : null

  const columnStyle = (isImageColumn: boolean) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: 0,
    ...(!isImageColumn ? { justifyContent: 'center' as const } : {}),
    ...(isImageColumn && imageColumnPullsToBottom && imageColumnPullAmount ? { marginBottom: `calc(-1 * ${imageColumnPullAmount})` } : {}),
  })

  const gridGap = isEdgeToEdge ? 'var(--ds-spacing-2xl)' : isContained ? 'var(--ds-spacing-3xl)' : 0
  const gridAlignItems = isEdgeToEdge ? (isStacked ? 'stretch' : 'center') : 'stretch'

  const gridStyle = {
    ...cell,
    display: 'grid',
    gridTemplateColumns: isStacked ? '1fr' : '1fr 1fr',
    gap: gridGap,
    alignItems: gridAlignItems,
    ...(isContained && bgColor ? { background: bgColor } : {}),
    ...(isContained ? { paddingBlock: 'var(--ds-spacing-3xl)', paddingInlineStart: 'var(--ds-spacing-3xl)', paddingInlineEnd: 'var(--ds-spacing-3xl)' } : {}),
  }

  const gridContent = (
    <div style={gridStyle}>
      <div style={columnStyle(false)}>{textContent}</div>
      <div style={columnStyle(true)}>{imageContent}</div>
    </div>
  )

  if (isEdgeToEdge) {
    return (
      <BlockSurfaceProvider blockSurface={effectiveSurface} blockAccent={blockAccent} fullWidth>
        <div ref={revealRef}>
          <GridBlock as="section">{gridContent}</GridBlock>
        </div>
      </BlockSurfaceProvider>
    )
  }

  return (
    <SurfaceProvider {...surfaceProps}>
      <div ref={revealRef}>
        <GridBlock as="section">{gridContent}</GridBlock>
      </div>
    </SurfaceProvider>
  )
}
