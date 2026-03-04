'use client'

/**
 * CarouselBlock — two variants for Jio:
 *
 * **Variant A: Featured** (buttons on sides)
 * - Intent: Feature product highlights in a large, rich way
 * - Content: Short videos or striking images for key features at a glance
 * - Placement: Top or body of page only, never at bottom
 * - Constraints: Large 2:1 cards only, Default width
 *
 * **Variant B: Informative** (buttons below)
 * - Intent: Inform, educate, showcase detailed functionality, or create an overview of items that link to other sections
 * - Content: More detailed, less impactful, more informative
 * - Placement: Anywhere on page, including bottom
 * - Constraints: Card shapes 4:5 and 8:5
 */

import { useRef, useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { createTransition } from '@marcelinodzn/ds-tokens'
import { Headline, Button, Icon, SurfaceProvider, IcChevronLeft, IcChevronRight } from '@marcelinodzn/ds-react'
import { getHeadlineSize, getHeadlineFontSize, normalizeHeadingLevel } from '../lib/semantic-headline'
import { GridBlock, useGridCell } from '../components/GridBlock'
import { BlockContainer } from './BlockContainer'
import { useCarouselReveal } from '../lib/use-carousel-reveal'
import { MediaCard, TextOnColourCard } from '../components/Cards'

type CarouselItem = {
  cardType?: 'media' | 'text-on-colour' | null
  title?: string | null
  description?: string | null
  image?: string | null
  video?: string | null
  link?: string | null
  ctaText?: string | null
  aspectRatio?: '4:5' | '8:5' | '2:1'
}

type CarouselCardSize = 'compact' | 'large' | 'large-4x5'

type CarouselVariant = 'featured' | 'informative'

type CarouselBlockProps = {
  title?: string | null
  titleLevel?: 'h2' | 'h3' | 'h4'
  variant?: CarouselVariant
  cardSize?: CarouselCardSize
  items?: CarouselItem[] | null
}

const GAP = 'var(--ds-spacing-l)'

/** Faded opacity for non-center cards in large carousel (DS: no opacity token; use semantic value) */
const LARGE_CAROUSEL_FADED_OPACITY = 0.5

const CARD_SIZE_CONFIG = {
  /** Compact: 3 cols, 4:5 = 1 slot (3 cards), 8:5 = 2 slots. 2:1 falls back to 8:5. Media and coloured container interchangeable. */
  compact: {
    cols: 3,
    contentWidth: 'Default' as const,
    getSlots: (ratio?: '4:5' | '8:5' | '2:1') => (ratio === '8:5' || ratio === '2:1' ? 2 : 1),
    getSlotWidthCss: (slots: number) => {
      const colWidth = `calc((100cqw - 2 * ${GAP}) / 3)`
      return slots === 1 ? colWidth : `calc(${colWidth} * 2 + ${GAP})`
    },
    getImageHeight4_5: () =>
      `calc(((100cqw - 2 * ${GAP}) / 3) * 5 / 4)`,
    getScrollAmount: (viewportW: number, gapPx: number) =>
      (viewportW - 2 * gapPx) / 3 + gapPx,
  },
  /** Large 2:1: 1 card per view, Default width. 2:1 only. */
  large: {
    cols: 1,
    contentWidth: 'Default' as const,
    getSlots: () => 1,
    getSlotWidthCss: () => '100cqw',
    getImageHeight4_5: () => 'auto',
    getScrollAmount: (viewportW: number, gapPx: number) => viewportW + gapPx,
  },
  /** Large 4:5: 2 cards per view, S width each (Wide container). 4:5 only — 8:5 would be too large. */
  'large-4x5': {
    cols: 2,
    contentWidth: 'Wide' as const,
    getSlots: () => 1,
    getSlotWidthCss: () => `calc((100cqw - ${GAP}) / 2)`,
    getImageHeight4_5: () => `calc(((100cqw - ${GAP}) / 2) * 5 / 4)`,
    getScrollAmount: (viewportW: number, gapPx: number) =>
      (viewportW - gapPx) / 2 + gapPx,
  },
} as const

const MOBILE_BREAKPOINT = 768

function NavButton({
  direction,
  disabled,
  onPress,
  size = 'XS',
}: {
  direction: 'left' | 'right'
  disabled: boolean
  onPress: () => void
  size?: 'XS' | 'S'
}) {
  const iconSize = size === 'XS' ? 'S' : 'M'
  return (
    <Button
      single
      appearance="primary"
      attention="medium"
      size={size}
      aria-label={direction === 'left' ? 'Previous cards' : 'Next cards'}
      onPress={onPress}
      isDisabled={disabled}
      content={
        direction === 'left'
          ? <Icon asset={<IcChevronLeft />} size={iconSize} />
          : <Icon asset={<IcChevronRight />} size={iconSize} />
      }
    />
  )
}

export function CarouselBlock({
  title,
  titleLevel = 'h2',
  variant = 'informative',
  cardSize = 'compact',
  items,
}: CarouselBlockProps) {
  const level = normalizeHeadingLevel(titleLevel)
  const cellContainer = useGridCell('Default')
  const config = CARD_SIZE_CONFIG[cardSize] ?? CARD_SIZE_CONFIG.compact
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isJumping, setIsJumping] = useState(false)
  const infiniteInitializedRef = useRef(false)

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = () => setPrefersReducedMotion(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(typeof window !== 'undefined' && window.innerWidth < MOBILE_BREAKPOINT)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const items_ = items?.filter((i) => i?.title || i?.image || i?.video) ?? []
  const isLargeCarousel = cardSize === 'large' || cardSize === 'large-4x5'
  const isLargeFeatured = isLargeCarousel && variant === 'featured' && !isMobile

  /** Reset infinite init when switching away from large featured (e.g. mobile) */
  useEffect(() => {
    if (!isLargeFeatured) infiniteInitializedRef.current = false
  }, [isLargeFeatured])
  const { ref: revealRef, isVisible: isCardVisible, containerVisible } = useCarouselReveal(
    isLargeFeatured ? items_.length + 2 : items_.length
  )
  if (items_.length === 0) return null

  /** For large featured: infinite items [last, ...all, first] */
  const displayItems: CarouselItem[] = isLargeFeatured && items_.length > 1
    ? [items_[items_.length - 1]!, ...items_, items_[0]!]
    : items_

  /** One card step in px (card width + gap) for large carousel pagination */
  const getCardStepPx = (): number => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return 0
    const gapPx = parseFloat(getComputedStyle(track).gap) || 0
    return config.getScrollAmount(viewport.clientWidth, gapPx)
  }

  const updateScrollBounds = () => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return
    const max = Math.max(0, track.offsetWidth - viewport.clientWidth)
    setMaxScroll(max)
    if (!isLargeFeatured) {
      setScrollPosition((prev) => Math.min(prev, max))
    } else if (items_.length > 1 && !infiniteInitializedRef.current) {
      const cardStep = getCardStepPx()
      if (cardStep > 0) {
        infiniteInitializedRef.current = true
        setScrollPosition(cardStep)
      }
    }
  }

  useEffect(() => {
    updateScrollBounds()
    window.addEventListener('resize', updateScrollBounds)
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return () => { window.removeEventListener('resize', updateScrollBounds) }
    const ro = new ResizeObserver(updateScrollBounds)
    ro.observe(viewport)
    ro.observe(track)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', updateScrollBounds)
    }
  }, [items_, displayItems, isLargeFeatured])

  /** Compact: clamp scroll to [0, maxScroll] when bounds change (e.g. resize) */
  useEffect(() => {
    if (!isLargeFeatured && maxScroll >= 0) {
      setScrollPosition((prev) => Math.max(0, Math.min(maxScroll, prev)))
    }
  }, [isLargeFeatured, maxScroll])

  const n = items_.length
  const cardStepPx = getCardStepPx()
  /** Compact: finite scroll — disable nav at boundaries. Large featured: infinite, always allow when n > 1. */
  const canScrollLeft = isLargeFeatured ? n > 1 : maxScroll > 0 && scrollPosition > 1
  const canScrollRight = isLargeFeatured ? n > 1 : maxScroll > 0 && scrollPosition < maxScroll - 1

  const scroll = (dir: 'left' | 'right') => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return
    const gapPx = parseFloat(getComputedStyle(track).gap) || 0
    const scrollAmount = config.getScrollAmount(viewport.clientWidth, gapPx)
    const next = dir === 'left' ? scrollPosition - scrollAmount : scrollPosition + scrollAmount

    if (isLargeFeatured && n > 1) {
      /** Infinite: scroll by exactly one card, jump at boundaries */
      if (dir === 'right' && next >= (n + 1) * cardStepPx) {
        setIsJumping(true)
        setScrollPosition(cardStepPx)
        requestAnimationFrame(() => requestAnimationFrame(() => setIsJumping(false)))
      } else if (dir === 'left' && next < 0) {
        setIsJumping(true)
        setScrollPosition(n * cardStepPx)
        requestAnimationFrame(() => requestAnimationFrame(() => setIsJumping(false)))
      } else {
        setScrollPosition(next)
      }
    } else {
      const clamped = Math.max(0, Math.min(maxScroll, next))
      setScrollPosition(clamped)
    }
  }

  const motionLevel = prefersReducedMotion ? 'subtle' : 'moderate'
  const trackStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: GAP,
    width: 'max-content',
    minWidth: '100%',
    transform: `translateX(-${scrollPosition}px)`,
    transition: isJumping || prefersReducedMotion ? 'none' : createTransition('transform', 'l', 'transition', motionLevel),
  }

  /** Center card index for large featured (0-based in displayItems); used for faded-side effect */
  const centerIndex =
    isLargeFeatured && cardStepPx > 0
      ? Math.min(displayItems.length - 1, Math.max(0, Math.round(scrollPosition / cardStepPx)))
      : 0

  /** Clip overflow: compact = finite scroll stops at boundaries; large featured = one card visible, centered. */
  const viewportStyle: CSSProperties = {
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
    containerType: 'inline-size',
  }

  const titleTransition = prefersReducedMotion
    ? undefined
    : createTransition(['opacity', 'transform'], 'xl', 'entrance', motionLevel)
  const cardTransition = prefersReducedMotion
    ? undefined
    : createTransition(['opacity', 'transform'], 'xl', 'entrance', motionLevel)

  return (
    <SurfaceProvider level={0}>
      <GridBlock as="section">
        <div
          ref={revealRef}
          style={{
            ...cellContainer,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--ds-spacing-xl)',
            overflow: 'visible',
          }}
        >
          {title && (
            <BlockContainer contentWidth="Default" style={{ width: '100%' }}>
              <Headline
                size={getHeadlineSize(level)}
                weight="high"
                as={level}
                align="center"
                style={{
                  margin: 0,
                  fontSize: getHeadlineFontSize(level),
                  opacity: containerVisible ? 1 : 0,
                  transform: containerVisible ? 'translateY(0)' : 'translateY(var(--ds-spacing-xl))',
                  transition: titleTransition,
                }}
              >
                {title}
              </Headline>
            </BlockContainer>
          )}
          <BlockContainer contentWidth={config.contentWidth ?? 'Default'} className="card-block-carousel" style={{ width: '100%', overflow: 'visible' }}>
            {variant === 'featured' && !isMobile ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 'var(--ds-spacing-m)',
                  }}
                >
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    <NavButton
                      direction="left"
                      disabled={!canScrollLeft}
                      onPress={() => scroll('left')}
                      size="S"
                    />
                  </div>
                  <div ref={viewportRef} style={{ ...viewportStyle, flex: 1, minWidth: 0 }}>
                    <div ref={trackRef} style={trackStyle}>
                      {displayItems.map((item, i) => {
                        const slots = (cardSize === 'large' || cardSize === 'large-4x5') ? 1 : config.getSlots(item.aspectRatio)
                        const cardVisible = isCardVisible(i)
                        const useTextOnColour = item.cardType === 'text-on-colour'
                        const textCardAspectRatio = cardSize === 'large-4x5' ? '4:5' : cardSize === 'large' ? '2:1' : (item.aspectRatio === '8:5' || item.aspectRatio === '2:1') ? '8:5' : '4:5'
                        const isCenter = isLargeFeatured && i === centerIndex
                        const cardOpacity = isLargeFeatured
                          ? (isCenter ? 1 : LARGE_CAROUSEL_FADED_OPACITY)
                          : (cardVisible ? 1 : 0)
                        const wrapperTransition = isLargeFeatured
                          ? (prefersReducedMotion ? undefined : createTransition(['opacity', 'transform'], 'l', 'transition', motionLevel))
                          : cardTransition
                        const wrapperStyle: CSSProperties = {
                          flex: `0 0 ${config.getSlotWidthCss(slots)}`,
                          minWidth: 0,
                          minHeight: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                          opacity: cardOpacity,
                          transform: cardVisible ? 'translateY(0)' : 'translateY(var(--ds-spacing-xl))',
                          transition: wrapperTransition ?? undefined,
                        }
                        return (
                          <div
                            key={i}
                            className="carousel-card"
                            style={wrapperStyle}
                          >
                            {useTextOnColour ? (
                              <TextOnColourCard
                                title={item.title}
                                description={item.description}
                                surface="subtle"
                                size={cardSize === 'compact' ? 'compact' : 'large'}
                                aspectRatio={textCardAspectRatio}
                              />
                            ) : (
                              <MediaCard
                                title={item.title}
                                description={item.description}
                                image={item.image}
                                video={item.video}
                                link={item.link}
                                ctaText={item.ctaText}
                                aspectRatio={cardSize === 'large-4x5' ? '4:5' : cardSize === 'large' ? '2:1' : item.aspectRatio}
                                prefersReducedMotion={prefersReducedMotion}
                                config={{
                                  layout: cardSize,
                                  imageHeight4_5: config.getImageHeight4_5(),
                                }}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    <NavButton
                      direction="right"
                      disabled={!canScrollRight}
                      onPress={() => scroll('right')}
                      size="S"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div ref={viewportRef} style={viewportStyle}>
                    <div ref={trackRef} style={trackStyle}>
                      {displayItems.map((item, i) => {
                        const slots = (cardSize === 'large' || cardSize === 'large-4x5') ? 1 : config.getSlots(item.aspectRatio)
                        const cardVisible = isCardVisible(i)
                        const useTextOnColour = item.cardType === 'text-on-colour'
                        const textCardAspectRatio = cardSize === 'large-4x5' ? '4:5' : cardSize === 'large' ? '2:1' : (item.aspectRatio === '8:5' || item.aspectRatio === '2:1') ? '8:5' : '4:5'
                        const wrapperStyle: CSSProperties = {
                          flex: `0 0 ${config.getSlotWidthCss(slots)}`,
                          minWidth: 0,
                          minHeight: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                          opacity: cardVisible ? 1 : 0,
                          transform: cardVisible ? 'translateY(0)' : 'translateY(var(--ds-spacing-xl))',
                          transition: cardTransition,
                        }
                        return (
                          <div
                            key={i}
                            className="carousel-card"
                            style={wrapperStyle}
                          >
                            {useTextOnColour ? (
                              <TextOnColourCard
                                title={item.title}
                                description={item.description}
                                surface="subtle"
                                size={cardSize === 'compact' ? 'compact' : 'large'}
                                aspectRatio={textCardAspectRatio}
                              />
                            ) : (
                              <MediaCard
                                title={item.title}
                                description={item.description}
                                image={item.image}
                                video={item.video}
                                link={item.link}
                                ctaText={item.ctaText}
                                aspectRatio={cardSize === 'large-4x5' ? '4:5' : cardSize === 'large' ? '2:1' : item.aspectRatio}
                                prefersReducedMotion={prefersReducedMotion}
                                config={{
                                  layout: cardSize,
                                  imageHeight4_5: config.getImageHeight4_5(),
                                }}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 'var(--ds-spacing-m)',
                      marginTop: 'var(--ds-spacing-l)',
                    }}
                  >
                    <NavButton
                      direction="left"
                      disabled={!canScrollLeft}
                      onPress={() => scroll('left')}
                      size="XS"
                    />
                    <NavButton
                      direction="right"
                      disabled={!canScrollRight}
                      onPress={() => scroll('right')}
                      size="XS"
                    />
                  </div>
                </>
              )}
          </BlockContainer>
        </div>
      </GridBlock>
    </SurfaceProvider>
  )
}
