'use client'

import { useRef, useState, useEffect } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createTransition } from '@marcelinodzn/ds-tokens'
import { Headline, Button, Icon, SurfaceProvider, IcChevronLeft, IcChevronRight } from '@marcelinodzn/ds-react'
import { getHeadlineSize, getHeadlineFontSize, normalizeHeadingLevel } from '../lib/semantic-headline'
import { GridBlock, useGridCell } from '../components/GridBlock'
import { BlockContainer } from './BlockContainer'
import { useCarouselReveal } from '../lib/use-carousel-reveal'
import { VideoWithControls } from '../components/VideoWithControls'

type CarouselItem = {
  title?: string | null
  description?: string | null
  image?: string | null
  video?: string | null
  link?: string | null
  ctaText?: string | null
  aspectRatio?: '4:5' | '8:5' | '2:1'
}

type CarouselCardSize = 'compact' | 'large'

type CarouselBlockProps = {
  title?: string | null
  titleLevel?: 'h2' | 'h3' | 'h4'
  cardSize?: CarouselCardSize
  items?: CarouselItem[] | null
}

const GAP = 'var(--ds-spacing-l)'

const CARD_SIZE_CONFIG = {
  /** Compact: 3 cols, 4:5 = 1 slot (3 cards), 8:5 = 2 slots. 2:1 falls back to 8:5. */
  compact: {
    cols: 3,
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
  /** Large: 1 card per view, 8 cols. Supports 2:1 and 8:5. */
  large: {
    cols: 1,
    getSlots: () => 1,
    getSlotWidthCss: () => '100cqw',
    getImageHeight4_5: () => 'auto',
    getScrollAmount: (viewportW: number, gapPx: number) => viewportW + gapPx,
  },
} as const

function Card({
  item,
  prefersReducedMotion,
  cardSize,
  imageHeight4_5,
}: {
  item: CarouselItem
  prefersReducedMotion: boolean
  cardSize: CarouselCardSize
  imageHeight4_5: string
}) {
  const router = useRouter()

  const handleCtaPress = (href: string) => {
    if (href.startsWith('/')) router.push(href)
    else window.location.href = href
  }

  const hasVideo = item.video && typeof item.video === 'string' && item.video.trim() !== ''
  const hasImage = item.image && typeof item.image === 'string' && item.image.trim() !== ''

  const isLarge = cardSize === 'large'
  // Large: 2:1 and 8:5. Compact: 4:5 and 8:5 only (2:1 falls back to 8:5).
  const effectiveRatio = isLarge
    ? (item.aspectRatio === '2:1' ? '2:1' : '8:5')
    : (item.aspectRatio === '2:1' ? '8:5' : (item.aspectRatio ?? '4:5'))
  const imageContainerStyle =
    isLarge
      ? { aspectRatio: effectiveRatio === '2:1' ? '2/1' : '8/5' }
      : effectiveRatio === '8:5'
        ? { height: imageHeight4_5 }
        : { aspectRatio: '4/5' as const }

  const imageBlock = (
    <div
      className="carousel-card-inner"
      style={{
        position: 'relative',
        width: '100%',
        ...imageContainerStyle,
      }}
    >
      {hasVideo ? (
        <VideoWithControls
          src={item.video!}
          poster={hasImage ? item.image : null}
          prefersReducedMotion={prefersReducedMotion}
        />
      ) : hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image!}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 'inherit',
          }}
        />
      ) : null}
    </div>
  )

  const textContent = (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        width: '100%',
        paddingRight: 'var(--ds-spacing-l)',
        paddingBottom: 'var(--ds-spacing-l)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-xs)',
      }}
    >
      {(item.title || item.description) && (
        <p
          style={{
            margin: 0,
            width: '100%',
            fontSize: 'var(--ds-typography-label-s)',
            lineHeight: 1.4,
          }}
        >
          {item.title && (
            <span style={{ color: 'var(--ds-color-text-high)', fontWeight: 'var(--ds-typography-weight-high)' }}>
              {item.title}
            </span>
          )}
          {item.title && item.description && ' '}
          {item.description && (
            <span style={{ color: 'var(--ds-color-text-low)', fontWeight: 'var(--ds-typography-weight-low)' }}>
              {item.description}
            </span>
          )}
        </p>
      )}
      {item.ctaText && item.link && (
        <Button
          appearance="primary"
          size="S"
          attention="low"
          onPress={() => handleCtaPress(item.link!)}
          style={{ alignSelf: 'flex-start' }}
        >
          {item.ctaText}
        </Button>
      )}
    </div>
  )

  const textBlock = (item.title || item.description || (item.ctaText && item.link))
    ? isLarge
      ? (
          <BlockContainer contentWidth="editorial" style={{ flex: 1, minWidth: 0, minHeight: 0, width: '100%', marginInline: 0, textAlign: 'left' }}>
            {textContent}
          </BlockContainer>
        )
      : textContent
    : null

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: GAP,
        width: '100%',
        height: '100%',
        minHeight: 0,
      }}
    >
      {item.link && item.link.trim() !== '' && !item.ctaText ? (
        <Link href={item.link.trim()} style={{ textDecoration: 'none', color: 'inherit', display: 'block', flexShrink: 0 }}>
          {imageBlock}
        </Link>
      ) : (
        <div style={{ flexShrink: 0 }}>{imageBlock}</div>
      )}
      {textBlock}
    </div>
  )

  return content
}

export function CarouselBlock({
  title,
  titleLevel = 'h2',
  cardSize = 'compact',
  items,
}: CarouselBlockProps) {
  const level = normalizeHeadingLevel(titleLevel)
  const cellContainer = useGridCell('default')
  const config = CARD_SIZE_CONFIG[cardSize]
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = () => setPrefersReducedMotion(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const items_ = items?.filter((i) => i?.title || i?.image || i?.video) ?? []
  const { ref: revealRef, isVisible: isCardVisible, containerVisible } = useCarouselReveal(items_.length)
  if (items_.length === 0) return null

  const updateScrollBounds = () => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return
    const max = Math.max(0, track.offsetWidth - viewport.clientWidth)
    setMaxScroll(max)
    setScrollPosition((prev) => Math.min(prev, max))
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
  }, [items_])

  const canScrollLeft = maxScroll > 0 && scrollPosition > 0
  const canScrollRight = maxScroll > 0 && scrollPosition < maxScroll - 0.5

  const scroll = (dir: 'left' | 'right') => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return
    const gapPx = parseFloat(getComputedStyle(track).gap) || 0
    const scrollAmount = config.getScrollAmount(viewport.clientWidth, gapPx)
    const next = dir === 'left' ? scrollPosition - scrollAmount : scrollPosition + scrollAmount
    const clamped = Math.max(0, Math.min(maxScroll, next))
    setScrollPosition(clamped)
  }

  const motionLevel = prefersReducedMotion ? 'subtle' : 'moderate'
  const trackStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'stretch',
    gap: GAP,
    paddingBlock: 'var(--ds-spacing-s)',
    width: 'max-content',
    minWidth: '100%',
    transform: `translateX(-${scrollPosition}px)`,
    transition: prefersReducedMotion ? 'none' : createTransition('transform', 'l', 'transition', motionLevel),
  }

  const viewportStyle: CSSProperties = {
    width: '100%',
    minWidth: 0,
    overflow: 'visible',
    paddingBlock: 'var(--ds-spacing-s)',
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
            paddingBlock: 'var(--ds-spacing-2xl)',
            overflow: 'visible',
          }}
        >
          {title && (
            <BlockContainer contentWidth="narrow" style={{ width: '100%' }}>
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
          <BlockContainer contentWidth="default" className="card-block-carousel" style={{ width: '100%', overflow: 'visible' }}>
          <div style={{ overflow: 'visible' }}>
          <div ref={viewportRef} style={viewportStyle}>
            <div ref={trackRef} style={trackStyle}>
              {items_.map((item, i) => {
                const slots = cardSize === 'large' ? 1 : config.getSlots(item.aspectRatio)
                const cardVisible = isCardVisible(i)
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
                  <div key={i} className="carousel-card" style={wrapperStyle}>
                    <Card
                      item={item}
                      prefersReducedMotion={prefersReducedMotion}
                      cardSize={cardSize}
                      imageHeight4_5={config.getImageHeight4_5()}
                    />
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
            <Button
              single
              appearance="primary"
              attention="medium"
              size="XS"
              aria-label="Previous cards"
              onPress={() => scroll('left')}
              isDisabled={!canScrollLeft}
              content={<Icon asset={<IcChevronLeft />} size="S" />}
            />
            <Button
              single
              appearance="primary"
              attention="medium"
              size="XS"
              aria-label="Next cards"
              onPress={() => scroll('right')}
              isDisabled={!canScrollRight}
              content={<Icon asset={<IcChevronRight />} size="S" />}
            />
          </div>
        </div>
        </BlockContainer>
        </div>
      </GridBlock>
    </SurfaceProvider>
  )
}
