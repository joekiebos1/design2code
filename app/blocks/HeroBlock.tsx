'use client'

/**
 * Unified Hero block.
 *
 * contentLayout: stacked | sideBySide | category | mediaOverlay | textOnly
 * - stacked: text above, image below (centered). No Bold.
 * - sideBySide: text left, image right (containerLayout, imageAnchor). No Bold.
 * - category: same layout as stacked (text first, media below, center aligned). Background colour spans to halfway the media.
 * - mediaOverlay: image as background, content overlaid. Always Bold, no accent. Full width, no side padding.
 * - textOnly: centered text, no media. No Bold.
 *
 * emphasis: ghost, minimal, subtle, bold. Category and mediaOverlay use Bold by default (option hidden).
 * Supports StreamImage (imageSlot, imageState) for AI-generated images.
 */

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Display, Headline, Text, Button, SurfaceProvider } from '@marcelinodzn/ds-react'
import { Grid, useCell } from '../components/blocks/Grid'
import { WidthCap } from './WidthCap'
import { useHeroStaggeredReveal } from '../../lib/utils/use-hero-staggered-reveal'
import { StreamImage } from '../components/blocks/StreamImage'
import { getSurfaceProviderProps, useBlockBackgroundColor } from '../../lib/utils/block-surface'
import { useGridBreakpoint } from '../../lib/utils/use-grid-breakpoint'
import { EDGE_TO_EDGE_BREAKOUT, EDGE_TO_EDGE_CAPPED_RADIUS, useEdgeToEdgeMediaStyles } from '../../lib/utils/edge-to-edge'
import { TYPOGRAPHY, HERO_BODY_STYLE } from '../../lib/utils/semantic-headline'
import type { ImageSlotState } from '../hooks/useImageStream'

/** Side-by-side (non–top-to-bottom) on large screens. Stacked/category use 2:1. */
const IMAGE_ASPECT_RATIO_SIDE_BY_SIDE = '5 / 4'
const MEDIA_OVERLAY_ASPECT_RATIO = '2 / 1'

export type HeroContentLayout = 'stacked' | 'sideBySide' | 'category' | 'mediaOverlay' | 'textOnly' | 'fullscreen'
export type HeroContainerLayout = 'edgeToEdge' | 'contained'
export type HeroImageAnchor = 'center' | 'bottom'
export type HeroTextAlign = 'left' | 'center'
export type HeroEmphasis = 'ghost' | 'minimal' | 'subtle' | 'bold'
export type HeroSurfaceColour = 'primary' | 'secondary' | 'sparkle' | 'neutral'

export type HeroBlockProps = {
  productName?: string | null
  headline?: string | null
  subheadline?: string | null
  ctaText?: string | null
  ctaLink?: string | null
  cta2Text?: string | null
  cta2Link?: string | null
  image?: string | null
  videoUrl?: string | null
  imageSlot?: string | null
  imageState?: ImageSlotState | null
  contentLayout?: HeroContentLayout | null
  containerLayout?: HeroContainerLayout | null
  imageAnchor?: HeroImageAnchor | null
  textAlign?: HeroTextAlign | null
  emphasis?: HeroEmphasis | null
  surfaceColour?: HeroSurfaceColour | null
}

export function HeroBlock({
  productName,
  headline,
  subheadline,
  ctaText,
  ctaLink,
  cta2Text,
  cta2Link,
  image,
  videoUrl,
  imageSlot,
  imageState,
  contentLayout,
  containerLayout,
  imageAnchor,
  textAlign,
  emphasis,
  surfaceColour,
}: HeroBlockProps) {
  const router = useRouter()
  const { columns, isMobile, isTablet, isStacked, isDesktop } = useGridBreakpoint()
  const cell = useCell('Wide')
  const edgeStyles = useEdgeToEdgeMediaStyles()
  const { ref: revealRef, getRevealStyle, prefersReducedMotion } = useHeroStaggeredReveal(4)
  const categorySectionRef = useRef<HTMLElement>(null)
  const categoryMediaRef = useRef<HTMLDivElement>(null)
  const [categoryBoldHeight, setCategoryBoldHeight] = useState<number | null>(null)

  /** Category: measure media to set bold background height to halfway the media. */
  useEffect(() => {
    if (contentLayout !== 'category') return
    const mediaEl = categoryMediaRef.current
    const sectionEl = categorySectionRef.current
    if (!mediaEl || !sectionEl) return
    const update = () => {
      const mediaRect = mediaEl.getBoundingClientRect()
      const sectionRect = sectionEl.getBoundingClientRect()
      const topFromSection = mediaRect.top - sectionRect.top
      setCategoryBoldHeight(topFromSection + mediaRect.height / 2)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(mediaEl)
    return () => ro.disconnect()
  }, [contentLayout])

  const useStreamImage = imageState && imageSlot
  const hasVideoUrl = Boolean(videoUrl?.trim())
  const isVideo = hasVideoUrl && !prefersReducedMotion
  const mediaSrc = videoUrl?.trim() || (useStreamImage && imageState.ready ? imageState.url : image)
  const showVideo = isVideo && mediaSrc
  const imgOrPosterSrc = hasVideoUrl && prefersReducedMotion ? image : mediaSrc

  const handleCtaPress = (href: string) => {
    if (href.startsWith('/')) router.push(href)
    else window.location.href = href
  }

  const mediaElement = showVideo ? (
    <video
      src={mediaSrc}
      autoPlay
      muted
      loop
      playsInline
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  ) : useStreamImage ? (
    <StreamImage slot={imageSlot} imageState={imageState} fill style={{ borderRadius: 'inherit' }} />
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

  const isStackedLayout = contentLayout === 'stacked'
  const isTextOnly = contentLayout === 'textOnly'
  const isMediaOverlay = contentLayout === 'mediaOverlay' || contentLayout === 'fullscreen'
  const isCategory = contentLayout === 'category'
  const isEdgeToEdge = isCategory ? false : containerLayout === 'edgeToEdge'
  const isContained = isCategory ? true : containerLayout === 'contained'

  /** Category and mediaOverlay: Bold (option hidden). All other variants: use emphasis from props. */
  const effectiveSurface: HeroEmphasis =
    isMediaOverlay || isCategory ? 'bold' : (emphasis as HeroEmphasis)
  const effectiveAccent: HeroSurfaceColour = surfaceColour as HeroSurfaceColour

  const surfaceProps = getSurfaceProviderProps(effectiveSurface)
  const bgColor = useBlockBackgroundColor(effectiveSurface, effectiveAccent)
  /** Fallback when tokenContext unavailable (e.g. outside DsProvider). Uses DS-generated variable. */
  const resolvedBoldColor =
    effectiveSurface === 'bold' ? (bgColor ?? 'var(--ds-color-block-background-bold)') : undefined

  const headlineMarginBottom = subheadline ? 'var(--ds-spacing-s)' : (ctaText || cta2Text) ? 'var(--ds-spacing-xl)' : 0
  const subheadlineMarginBottom = (ctaText || cta2Text) ? 'var(--ds-spacing-xl)' : 0
  const headlineFontSizeCentered = isMobile ? TYPOGRAPHY.h3 : isTablet ? TYPOGRAPHY.h2 : TYPOGRAPHY.h1
  const textContentCentered = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      <div style={getRevealStyle(0)}>
        <WidthCap contentWidth="Default">
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
            {productName && <Text size="L" weight="high" align="center" as="span" style={{ marginBottom: 'var(--ds-spacing-m)', fontSize: isMobile ? 'var(--ds-typography-label-s)' : HERO_BODY_STYLE.fontSize, lineHeight: HERO_BODY_STYLE.lineHeight }}>{productName}</Text>}
            {headline && <Display size="L" as="h1" align="center" style={{ lineHeight: 1.1, whiteSpace: 'pre-line', marginBottom: headlineMarginBottom, fontSize: headlineFontSizeCentered }}>{headline}</Display>}
          </div>
        </WidthCap>
      </div>
      {subheadline && (
        <div style={getRevealStyle(1)}>
          <WidthCap contentWidth="XS">
            <Text align="center" as="p" style={{ margin: 0, marginBottom: subheadlineMarginBottom, textAlign: 'center', whiteSpace: 'pre-line', fontSize: isMobile ? 'var(--ds-typography-label-s)' : HERO_BODY_STYLE.fontSize, fontWeight: HERO_BODY_STYLE.fontWeight, lineHeight: HERO_BODY_STYLE.lineHeight }}>{subheadline}</Text>
          </WidthCap>
        </div>
      )}
      {(ctaText || cta2Text) && (
        <div style={getRevealStyle(2)}>
          <WidthCap contentWidth="Default">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-m)', justifyContent: 'center' }}>
              {ctaText && ctaLink && <Button appearance="primary" size="M" attention="high" onPress={() => handleCtaPress(ctaLink)}>{ctaText}</Button>}
              {cta2Text && cta2Link && <Button appearance="primary" size="M" attention="medium" onPress={() => handleCtaPress(cta2Link)}>{cta2Text}</Button>}
            </div>
          </WidthCap>
        </div>
      )}
    </div>
  )

  const textAlignProp = (a: 'left' | 'center') => (a === 'center' ? 'center' as const : 'start' as const)
  const textContentOverlay = (align: 'left' | 'center') => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        textAlign: align,
        gap: 0,
      }}
    >
      <div style={getRevealStyle(0)}>
        {productName && <Text size="L" weight="high" align={textAlignProp(align)} as="span" style={{ marginBottom: 'var(--ds-spacing-m)', fontSize: isMobile ? 'var(--ds-typography-label-s)' : HERO_BODY_STYLE.fontSize, lineHeight: HERO_BODY_STYLE.lineHeight }}>{productName}</Text>}
        {headline && <Headline size="L" weight="high" align={textAlignProp(align)} as="h1" style={{ lineHeight: 1.1, fontSize: headlineFontSizeCentered, whiteSpace: 'pre-line', marginBottom: headlineMarginBottom }}>{headline}</Headline>}
      </div>
      {subheadline && (
        <div style={getRevealStyle(1)}>
          <Text align={textAlignProp(align)} as="p" weight="low" style={{ margin: 0, marginBottom: subheadlineMarginBottom, opacity: 0.95, whiteSpace: 'pre-line', fontSize: isMobile ? 'var(--ds-typography-label-s)' : HERO_BODY_STYLE.fontSize, fontWeight: HERO_BODY_STYLE.fontWeight, lineHeight: HERO_BODY_STYLE.lineHeight }}>
            {subheadline}
          </Text>
        </div>
      )}
      {(ctaText || cta2Text) && (
        <div style={getRevealStyle(2)}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-m)', justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
            {ctaText && ctaLink && <Button appearance="primary" size="M" attention="high" onPress={() => handleCtaPress(ctaLink)}>{ctaText}</Button>}
            {cta2Text && cta2Link && <Button appearance="primary" size="M" attention="medium" onPress={() => handleCtaPress(cta2Link)}>{cta2Text}</Button>}
          </div>
        </div>
      )}
    </div>
  )

  const textContentSideBySide = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingBlockStart: 'var(--ds-spacing-xl)',
        paddingBlockEnd: 'var(--ds-spacing-xl)',
        paddingInlineStart: (isEdgeToEdge || effectiveSurface === 'ghost') ? 0 : 'var(--ds-spacing-2xl)',
        paddingInlineEnd: 'var(--ds-spacing-2xl)',
      }}
    >
      <div style={getRevealStyle(0)}>
        {productName && <Text size="L" weight="high" as="span" style={{ marginBottom: 'var(--ds-spacing-m)', fontSize: isMobile ? 'var(--ds-typography-label-s)' : HERO_BODY_STYLE.fontSize, lineHeight: HERO_BODY_STYLE.lineHeight }}>{productName}</Text>}
        {headline && <Headline size="L" weight="high" as="h1" style={{ lineHeight: 1.1, fontSize: isMobile ? TYPOGRAPHY.h3 : (isContained || isTablet) ? TYPOGRAPHY.h2 : TYPOGRAPHY.h1, marginBottom: 'var(--ds-spacing-s)' }}>{headline}</Headline>}
      </div>
      {subheadline && (
        <div style={getRevealStyle(1)}>
          <Text as="p" weight="low" style={{ margin: 0, marginBottom: 'var(--ds-spacing-xl)', opacity: 0.95, whiteSpace: 'pre-line', fontSize: isMobile ? 'var(--ds-typography-label-s)' : HERO_BODY_STYLE.fontSize, fontWeight: HERO_BODY_STYLE.fontWeight, lineHeight: HERO_BODY_STYLE.lineHeight }}>
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

  const gradientOverlay = (
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
  )

  if (isTextOnly) {
    return (
      <section ref={revealRef}>
        <Grid as="div">
          <div style={{ ...cell, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-m)' }}>
            {(productName || headline) && textContentCentered}
          </div>
        </Grid>
      </section>
    )
  }

  /** Category: same layout as Stacked (text first, media below, center aligned). Two containers: wrapper for all elements, and a coloured background container that spans to half the media height. Uses Background functional colour (placeholder until DS adds fifth colour). Capped at 1920px on large screens. */
  if (isCategory) {
    const boldBg = 'var(--ds-color-background-functional, #200066)'
    const bgHeight = categoryBoldHeight ?? 320
    return (
      <div
        ref={(el) => {
          revealRef.current = el
          ;(categorySectionRef as React.MutableRefObject<HTMLElement | null>).current = el
        }}
        style={{ ...EDGE_TO_EDGE_BREAKOUT, position: 'relative', boxSizing: 'border-box' }}
      >
        <div style={{ ...edgeStyles.inner, position: 'relative', boxSizing: 'border-box' }}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: bgHeight,
              background: boldBg,
              zIndex: 0,
              ...(edgeStyles.isCapped
                ? {
                    borderBottomLeftRadius: EDGE_TO_EDGE_CAPPED_RADIUS,
                    borderBottomRightRadius: EDGE_TO_EDGE_CAPPED_RADIUS,
                  }
                : {}),
            }}
          />
          <SurfaceProvider level={1} hasBoldBackground={true}>
            <div style={{ position: 'relative', zIndex: 1, paddingBlock: 'var(--ds-spacing-4xl)' }}>
              <Grid as="section">
                <div style={{ ...cell, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-m)' }}>
                  {(productName || headline) && textContentCentered}
                  <div style={getRevealStyle(3)}>
                    <WidthCap contentWidth="Default" style={{ marginTop: 'var(--ds-spacing-xl)' }}>
                      <div
                        ref={categoryMediaRef}
                        style={{ aspectRatio: '2 / 1', overflow: 'hidden', borderRadius: 'var(--ds-radius-card-m)' }}
                      >
                        {mediaElement}
                      </div>
                    </WidthCap>
                  </div>
                </div>
              </Grid>
            </div>
          </SurfaceProvider>
        </div>
      </div>
    )
  }

  if (isStackedLayout) {
    return (
      <section ref={revealRef}>
        <Grid as="div">
          <div style={{ ...cell, display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-m)' }}>
            {(productName || headline) && textContentCentered}
            <div style={getRevealStyle(3)}>
              <WidthCap contentWidth="Wide" style={{ marginTop: 'var(--ds-spacing-xl)' }}>
                <div style={{ aspectRatio: isMobile ? '4 / 5' : '2 / 1', overflow: 'hidden', borderRadius: 'var(--ds-radius-card-m)' }}>
                  {mediaElement}
                </div>
              </WidthCap>
            </div>
          </div>
        </Grid>
      </section>
    )
  }

  if (isMediaOverlay) {
    const align = textAlign ?? 'left'
    const isCenter = align === 'center'
    /** Overlay content aligned to grid. Span 6 on 12-col, 4 on 8-col, full on 4-col. */
    const span = columns >= 12 ? 6 : columns >= 8 ? 4 : 4
    const start = isCenter && columns >= 8 ? Math.floor((columns - span) / 2) + 1 : 1
    const overlayCell = { gridColumn: `${start} / span ${span}` as const }
    return (
      <div style={EDGE_TO_EDGE_BREAKOUT}>
        <div style={edgeStyles.inner}>
          <section
            ref={revealRef}
            style={{
              position: 'relative',
              aspectRatio: MEDIA_OVERLAY_ASPECT_RATIO,
              minHeight: 320,
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: mediaSrc ? undefined : 'var(--ds-color-background-subtle)' }}>
              {mediaElement}
            </div>
            {gradientOverlay}
            <SurfaceProvider level={0} hasBoldBackground={true}>
              <Grid
                as="div"
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 2,
                  alignContent: 'center',
                  paddingBlock: 'var(--ds-spacing-3xl)',
                }}
              >
                <div
                  style={{
                    ...overlayCell,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isCenter ? 'center' : 'flex-start',
                    justifyContent: 'center',
                    paddingInlineStart: isCenter ? 0 : 'var(--ds-spacing-3xl)',
                    paddingInlineEnd: isCenter ? 0 : 'var(--ds-spacing-3xl)',
                  }}
                >
                  {textContentOverlay(align)}
                </div>
              </Grid>
            </SurfaceProvider>
          </section>
        </div>
      </div>
    )
  }

  const imageAspect = isStacked ? '2 / 1' : IMAGE_ASPECT_RATIO_SIDE_BY_SIDE
  const isTopToBottom = imageAnchor === 'bottom' && !isStacked

  const imageWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    ...(isTopToBottom ? { flex: 1 } : {}),
    ...(isTopToBottom && isDesktop ? { justifyContent: 'flex-end' } : {}),
    ...(!isTopToBottom && imageAnchor === 'bottom' ? { justifyContent: 'flex-end' } : {}),
    ...(isContained && !isTopToBottom ? { padding: 'var(--ds-spacing-l)' } : {}),
    ...(isContained && isTopToBottom ? { padding: 0 } : {}),
  }

  const imageContainerStyle: React.CSSProperties = isTopToBottom
    ? {
        position: 'relative' as const,
        overflow: 'hidden',
        /** Desktop: 1:1 aspect ratio. Mobile/tablet: fill column height. Top-to-bottom: media never has rounded corners. */
        ...(isDesktop ? { aspectRatio: '1 / 1' } : { height: '100%', minHeight: 0 }),
      }
    : {
        position: 'relative' as const,
        aspectRatio: imageAspect,
        overflow: 'hidden',
        /** Contained: media rounded always. Edge-to-edge (non top-to-bottom): rounded when capped. */
        borderRadius: (isContained || (isEdgeToEdge && edgeStyles.isCapped)) ? 'var(--ds-radius-card-m)' : 0,
      }

  const imageContent = (
    <div style={{ ...imageWrapperStyle, ...getRevealStyle(3) }}>
      <div style={imageContainerStyle}>
        {mediaElement}
      </div>
    </div>
  )

  /** Pull image below grid only when there is bottom padding to pull into. Skip top-to-bottom (causes overlap on scroll). */
  const imageColumnPullsToBottom =
    imageAnchor === 'bottom' &&
    !isStacked &&
    !isTopToBottom &&
    isEdgeToEdge &&
    effectiveSurface !== 'ghost'
  const imageColumnPullAmount = isEdgeToEdge ? 'var(--ds-spacing-4xl)' : null

  const columnStyle = (isImageColumn: boolean) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: 0,
    ...(!isImageColumn ? { justifyContent: 'center' as const } : {}),
    ...(isImageColumn && imageColumnPullsToBottom && imageColumnPullAmount ? { marginBottom: `calc(-1 * ${imageColumnPullAmount})` } : {}),
  })

  const gridGap = isEdgeToEdge ? 'var(--ds-spacing-2xl)' : isContained ? 'var(--ds-spacing-3xl)' : 0
  /** Top-to-bottom: stretch columns so text centers vertically. Otherwise: center for edge-to-edge. */
  const gridAlignItems = isTopToBottom ? 'stretch' : (isEdgeToEdge ? (isStacked ? 'stretch' : 'center') : 'stretch')

  const gridStyle = {
    ...cell,
    display: 'grid',
    gridTemplateColumns: isStacked ? '1fr' : '1fr 1fr',
    gap: gridGap,
    alignItems: gridAlignItems,
    ...(isContained && bgColor && effectiveSurface !== 'bold' ? { background: bgColor } : {}),
    ...(isContained
      ? {
          paddingBlock: isTopToBottom ? 0 : 'var(--ds-spacing-3xl)',
          paddingInlineStart: 'var(--ds-spacing-3xl)',
          paddingInlineEnd: 'var(--ds-spacing-3xl)',
        }
      : {}),
  }

  const gridContent = (
    <div style={gridStyle}>
      <div style={columnStyle(false)}>{textContentSideBySide}</div>
      <div style={columnStyle(true)}>{imageContent}</div>
    </div>
  )

  if (isEdgeToEdge) {
    const useBoldHalfHeight = effectiveSurface === 'bold'
    const content = (
      <div ref={revealRef} style={{ position: 'relative', zIndex: 1 }}>
        <Grid as="section">{gridContent}</Grid>
      </div>
    )
    if (useBoldHalfHeight) {
      return (
        <div style={{ ...EDGE_TO_EDGE_BREAKOUT, position: 'relative', boxSizing: 'border-box' }}>
          <div ref={revealRef} style={{ ...edgeStyles.inner, position: 'relative', boxSizing: 'border-box' }}>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: resolvedBoldColor,
                zIndex: 0,
              }}
            />
            <SurfaceProvider level={1} hasBoldBackground={true}>
              {content}
            </SurfaceProvider>
          </div>
        </div>
      )
    }
    /** Top-to-bottom = no padding. Contained = has padding. Edge-to-edge + center = has padding. */
    return content
  }

  const useBoldHalfHeight = effectiveSurface === 'bold' && resolvedBoldColor
  const containedContent = useBoldHalfHeight ? (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          minHeight: 100,
          background: resolvedBoldColor,
          zIndex: 0,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Grid as="section">{gridContent}</Grid>
      </div>
    </div>
  ) : (
    <Grid as="section">{gridContent}</Grid>
  )

  return (
    <div ref={revealRef}>
      <SurfaceProvider {...surfaceProps}>
        {containedContent}
      </SurfaceProvider>
    </div>
  )
}
