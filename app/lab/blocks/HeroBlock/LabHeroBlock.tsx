'use client'

/**
 * Lab Hero block – separate from production HeroBlock.
 * Edit this file for lab experiments. Production HeroBlock (app/blocks/HeroBlock.tsx) is unchanged.
 * Merge to production when ready.
 *
 * contentLayout: stacked | sideBySide | category | mediaOverlay | textOnly
 * emphasis: ghost, minimal, subtle, bold
 */

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Display, Headline, Text, Button, SurfaceProvider } from '@marcelinodzn/ds-react'
import { Grid } from '../../../components/blocks/Grid'
import { WidthCap } from '../../../blocks/WidthCap'
import { useHeroStaggeredReveal } from '../../../../lib/utils/use-hero-staggered-reveal'
import { StreamImage } from '../../../components/blocks/StreamImage'
import { getSurfaceProviderProps, useBlockBackgroundColor } from '../../../../lib/utils/block-surface'
import { useGridBreakpoint, getAspectRatioForBreakpoint } from '../../../../lib/utils/use-grid-breakpoint'
import { EDGE_TO_EDGE_BREAKOUT, useEdgeToEdgeMediaStyles } from '../../../../lib/utils/edge-to-edge'
import { TYPOGRAPHY, HERO_BODY_STYLE } from '../../../../lib/utils/semantic-headline'
import type { ImageSlotState } from '../../../hooks/useImageStream'

const IMAGE_ASPECT_RATIO_SIDE_BY_SIDE = '5 / 4'
const MEDIA_OVERLAY_ASPECT_RATIO = '2 / 1'

export type LabHeroContentLayout = 'stacked' | 'sideBySide' | 'category' | 'mediaOverlay' | 'textOnly' | 'fullscreen'
export type LabHeroContainerLayout = 'edgeToEdge' | 'contained'
export type LabHeroImageAnchor = 'center' | 'bottom'
export type LabHeroTextAlign = 'left' | 'center'
export type LabHeroEmphasis = 'ghost' | 'minimal' | 'subtle' | 'bold'
export type LabHeroSurfaceColour = 'primary' | 'secondary' | 'sparkle' | 'neutral'

export type LabHeroBlockProps = {
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
  contentLayout?: LabHeroContentLayout | null
  containerLayout?: LabHeroContainerLayout | null
  imageAnchor?: LabHeroImageAnchor | null
  textAlign?: LabHeroTextAlign | null
  emphasis?: LabHeroEmphasis | null
  surfaceColour?: LabHeroSurfaceColour | null
}

export function LabHeroBlock({
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
}: LabHeroBlockProps) {
  const router = useRouter()
  const { columns, isMobile, isTablet, isStacked, isDesktop } = useGridBreakpoint()
  const edgeStyles = useEdgeToEdgeMediaStyles()
  const { ref: revealRef, getRevealStyle, prefersReducedMotion } = useHeroStaggeredReveal(4)
  const categorySectionRef = useRef<HTMLElement>(null)
  const categoryMediaRef = useRef<HTMLDivElement>(null)
  const [categoryBoldHeight, setCategoryBoldHeight] = useState<number | null>(null)

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

  const effectiveSurface: LabHeroEmphasis =
    isMediaOverlay || isCategory ? 'bold' : (emphasis as LabHeroEmphasis)
  const effectiveAccent: LabHeroSurfaceColour = surfaceColour as LabHeroSurfaceColour

  const surfaceProps = getSurfaceProviderProps(effectiveSurface)
  const bgColor = useBlockBackgroundColor(effectiveSurface, effectiveAccent)
  const resolvedBoldColor =
    effectiveSurface === 'bold' ? (bgColor ?? 'var(--ds-color-block-background-bold)') : undefined

  const headlineMarginBottom = subheadline ? 'var(--ds-spacing-s)' : (ctaText || cta2Text) ? 'var(--ds-spacing-xl)' : 0
  const subheadlineMarginBottom = (ctaText || cta2Text) ? 'var(--ds-spacing-xl)' : 0
  const headlineFontSizeCentered = isMobile ? TYPOGRAPHY.h3 : isTablet ? TYPOGRAPHY.h2 : TYPOGRAPHY.h1
  const textContentCentered = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      <div style={getRevealStyle(0)}>
        <WidthCap contentWidth="L">
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
          <WidthCap contentWidth="L">
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
        {(productName || headline) && textContentCentered}
      </section>
    )
  }

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
        {/* Background spans full viewport (100vw); content below stays capped via edgeStyles.inner */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: bgHeight,
            background: boldBg,
            zIndex: 0,
          }}
        />
        <div style={{ ...edgeStyles.inner, position: 'relative', boxSizing: 'border-box' }}>
          <SurfaceProvider level={1} hasBoldBackground={true}>
            <div style={{ position: 'relative', zIndex: 1, paddingBlock: 'var(--ds-spacing-4xl)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-m)' }}>
                {(productName || headline) && textContentCentered}
                <div style={getRevealStyle(3)}>
                  <WidthCap contentWidth="L" style={{ marginTop: 'var(--ds-spacing-xl)' }}>
                    <div
                      ref={categoryMediaRef}
                      style={{ aspectRatio: getAspectRatioForBreakpoint('2:1', columns).replace(':', ' / '), overflow: 'hidden', borderRadius: 'var(--ds-radius-card-m)' }}
                    >
                      {mediaElement}
                    </div>
                  </WidthCap>
                </div>
              </div>
            </div>
          </SurfaceProvider>
        </div>
      </div>
    )
  }

  if (isStackedLayout) {
    return (
      <section ref={revealRef}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-m)' }}>
          {(productName || headline) && textContentCentered}
          <div style={getRevealStyle(3)}>
            <WidthCap contentWidth="XL" style={{ marginTop: 'var(--ds-spacing-xl)' }}>
              <div style={{ aspectRatio: getAspectRatioForBreakpoint('2:1', columns).replace(':', ' / '), overflow: 'hidden', borderRadius: 'var(--ds-radius-card-m)' }}>
                {mediaElement}
              </div>
            </WidthCap>
          </div>
        </div>
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

    /** On mobile: break out of overlay into stacked (media above, text below). Layout rules §5. */
    if (isStacked) {
      const stackedAspectRatio = getAspectRatioForBreakpoint('2:1', columns).replace(':', ' / ')
      return (
        <div style={EDGE_TO_EDGE_BREAKOUT}>
          <div style={edgeStyles.inner}>
            <section ref={revealRef} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div
                style={{
                  position: 'relative',
                  aspectRatio: stackedAspectRatio,
                  minHeight: 320,
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', inset: 0, background: mediaSrc ? undefined : 'var(--ds-color-background-subtle)' }}>
                  {mediaElement}
                </div>
              </div>
              <SurfaceProvider level={1} hasBoldBackground={true}>
                <Grid
                  as="div"
                  style={{
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
                      gap: 0,
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

    /** Desktop/tablet: overlay (Base + Gradient + Float). Layout rules §5. */
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
    width: '100%',
    ...(isTopToBottom ? { flex: '1 1 auto' } : {}),
    ...(!isTopToBottom ? { flexShrink: 0 } : {}),
    ...(isTopToBottom && isDesktop ? { justifyContent: 'flex-start' } : {}),
    ...(!isTopToBottom && imageAnchor === 'bottom' ? { justifyContent: 'flex-end' } : {}),
    ...(isContained ? { padding: 0 } : {}),
  }

  const imageContainerStyle: React.CSSProperties = isTopToBottom
    ? {
        position: 'relative' as const,
        overflow: 'hidden',
        width: '100%',
        aspectRatio: '1 / 1',
        minHeight: '100%',
      }
    : {
        position: 'relative' as const,
        aspectRatio: imageAspect,
        overflow: 'hidden',
        width: '100%',
        borderRadius: (isContained || isEdgeToEdge) ? 'var(--ds-radius-card-m)' : 0,
      }

  const imageContent = (
    <div style={{ ...imageWrapperStyle, ...getRevealStyle(3) }}>
      <div style={imageContainerStyle}>
        {mediaElement}
      </div>
    </div>
  )

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
    ...(isTopToBottom ? { flex: '1 1 auto' } : {}),
    ...(!isImageColumn ? { justifyContent: 'center' as const } : {}),
    ...(isImageColumn && imageColumnPullsToBottom && imageColumnPullAmount ? { marginBottom: `calc(-1 * ${imageColumnPullAmount})` } : {}),
  })

  const gridAlignItems = isTopToBottom ? 'stretch' : (isStacked ? 'stretch' : 'center')

  /** Breathing room between columns via cell padding (never override Grid gap). */
  const cellPaddingInline = isEdgeToEdge ? 'var(--ds-spacing-xl)' : isContained ? 'var(--ds-spacing-2xl)' : undefined

  /** Two cells: text 6 cols, image 6 cols (12-col grid); or 4 cols each (8-col grid). */
  const halfSpan = columns >= 12 ? 6 : 4
  const textCellStyle = {
    gridColumn: `1 / span ${halfSpan}` as const,
    paddingInlineEnd: cellPaddingInline,
    ...(isTopToBottom ? { paddingBlock: 'var(--ds-spacing-3xl)' } : {}),
  }
  const imageCellStyle = {
    gridColumn: `${halfSpan + 1} / span ${halfSpan}` as const,
    paddingInlineStart: isContained ? 0 : cellPaddingInline,
  }

  const containedPadding = isContained
    ? {
        paddingInlineStart: 'var(--ds-spacing-3xl)',
        paddingInlineEnd: 'var(--ds-spacing-3xl)',
      }
    : {}

  const sideBySideContent = isStacked ? (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-xl)' }}>
      <WidthCap contentWidth="L">{textContentSideBySide}</WidthCap>
      <WidthCap contentWidth="XL">{imageContent}</WidthCap>
    </section>
  ) : (
    <Grid
      as="section"
      style={{
        alignItems: gridAlignItems,
        ...containedPadding,
      }}
    >
      <div style={{ ...textCellStyle, ...columnStyle(false) }}>{textContentSideBySide}</div>
      <div style={{ ...imageCellStyle, ...columnStyle(true) }}>{imageContent}</div>
    </Grid>
  )

  if (isEdgeToEdge) {
    const useBoldHalfHeight = effectiveSurface === 'bold'
    const content = (
      <div ref={revealRef} style={{ position: 'relative', zIndex: 1 }}>
        {sideBySideContent}
      </div>
    )
    return (
      <div style={{ ...EDGE_TO_EDGE_BREAKOUT, position: 'relative', boxSizing: 'border-box' }}>
        <div style={{ ...edgeStyles.inner, position: 'relative', boxSizing: 'border-box' }}>
          {useBoldHalfHeight && (
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
          )}
          {useBoldHalfHeight ? (
            <SurfaceProvider level={1} hasBoldBackground={true}>{content}</SurfaceProvider>
          ) : (
            content
          )}
        </div>
      </div>
    )
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
      <div style={{ position: 'relative', zIndex: 1 }}>{sideBySideContent}</div>
    </div>
  ) : (
    sideBySideContent
  )

  return (
    <div ref={revealRef}>
      <SurfaceProvider {...surfaceProps}>
        {containedContent}
      </SurfaceProvider>
    </div>
  )
}
