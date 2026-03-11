'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { getMotionDurationCSS, getMotionEasing, createTransition } from '@marcelinodzn/ds-tokens'
import { Headline, Text, SurfaceProvider } from '@marcelinodzn/ds-react'
import { useCarouselReveal } from '../../lib/use-carousel-reveal'
import { BlockContainer } from '../../blocks/BlockContainer'
import { BlockSurfaceProvider } from '../../lib/block-surface'

type CarouselItem = {
  title?: string | null
  description?: string | null
  image?: string | null
  video?: string | null
}

type FullBleedVerticalCarouselProps = {
  surface?: 'ghost' | 'minimal' | 'subtle' | 'bold'
  items?: CarouselItem[] | null
}

const ITEM_VH = 100

function MediaLayer({ item }: { item: CarouselItem }) {
  if (item?.video && typeof item.video === 'string' && item.video.trim() !== '') {
    return (
      <video
        src={item.video}
        autoPlay
        muted
        loop
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    )
  }
  if (item?.image && typeof item.image === 'string' && item.image.trim() !== '') {
    return (
      <Image
        src={item.image}
        alt=""
        fill
        sizes="100vw"
        style={{ objectFit: 'cover' }}
        priority
      />
    )
  }
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, var(--ds-color-background-subtle) 0%, var(--ds-color-surface-bold) 100%)',
      }}
    />
  )
}

/**
 * Full-bleed vertical carousel:
 * 1. Container becomes sticky when its top reaches viewport top
 * 2. While sticky, images show in a fixed overlay; text scrolls; when item text crosses top, fade to next image
 * 3. When last item's text center reaches viewport center, container unsticks
 */
export function FullBleedVerticalCarousel({ surface = 'ghost', items }: FullBleedVerticalCarouselProps) {
  const items_ = items?.filter((i) => i?.title || i?.description) ?? []
  const n = items_.length
  const { ref: revealRef, isVisible: isItemVisible, containerVisible } = useCarouselReveal(n)
  const containerRef = useRef<HTMLDivElement>(null)
  const textRefs = useRef<(HTMLDivElement | null)[]>([])

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = () => setPrefersReducedMotion(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const [imageIndex, setImageIndex] = useState(0)
  const [prevImageIndex, setPrevImageIndex] = useState(0)
  const prevImageIndexRef = useRef(0)
  const [isSticky, setIsSticky] = useState(false)

  if (n === 0) return null

  const heightVh = n * ITEM_VH

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onScroll = () => {
      const { top, bottom } = el.getBoundingClientRect()
      const vh = window.innerHeight

      if (top > 0) {
        setIsSticky(false)
        setImageIndex(0)
        return
      }

      if (bottom <= 0) {
        setIsSticky(false)
        prevImageIndexRef.current = 0
        setPrevImageIndex(0)
        return
      }

      const scrollIntoCarousel = -top
      const itemIndex = Math.min(Math.floor(scrollIntoCarousel / vh), n - 1)
      const textEl = textRefs.current[itemIndex]
      const textPastTop = textEl && textEl.getBoundingClientRect().top <= 0
      const imageIndexNew =
        textPastTop && itemIndex < n - 1 ? itemIndex + 1 : itemIndex

      if (imageIndexNew !== prevImageIndexRef.current) {
        setPrevImageIndex(prevImageIndexRef.current)
        prevImageIndexRef.current = imageIndexNew
      }
      setImageIndex(imageIndexNew)

      const lastText = textRefs.current[n - 1]
      const lastTextRect = lastText?.getBoundingClientRect()
      const lastItemReachedCenter =
        imageIndexNew === n - 1 &&
        lastTextRect &&
        lastTextRect.top + lastTextRect.height / 2 <= vh / 2

      setIsSticky(!lastItemReachedCenter)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [n])

  const showOverlay = isSticky
  const textShadow = showOverlay ? '0 1px 2px var(--local-color-shadow-overlay)' : 'none'

  const level = prefersReducedMotion ? 'subtle' : 'moderate'
  const titleTransition = prefersReducedMotion
    ? undefined
    : createTransition(['opacity', 'transform'], 'xl', 'entrance', level)
  const itemTransition = prefersReducedMotion
    ? undefined
    : createTransition(['opacity', 'transform'], 'xl', 'entrance', level)

  return (
    <BlockSurfaceProvider blockSurface={surface} fullWidth>
    <section ref={revealRef} style={{ marginTop: 'var(--ds-spacing-2xl)' }}>
      <style>{`
        @keyframes carouselFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <div
        ref={containerRef}
        style={{
          position: isSticky ? 'sticky' : 'relative',
          top: isSticky ? 0 : undefined,
          height: `${heightVh}vh`,
        }}
      >
        {showOverlay && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1,
              pointerEvents: 'none',
              isolation: 'isolate',
            }}
          >
            <div style={{ position: 'absolute', inset: 0 }}>
              <MediaLayer item={items_[prevImageIndex]} />
            </div>
            <div
              key={imageIndex}
              style={{
                position: 'absolute',
                inset: 0,
                animation: prefersReducedMotion ? 'none' : `carouselFade ${getMotionDurationCSS('l', level)} ${getMotionEasing('entrance', level)}`,
                transition: prefersReducedMotion ? 'none' : undefined,
              }}
            >
              <MediaLayer item={items_[imageIndex]} />
            </div>
          </div>
        )}

        {items_.map((item, i) => {
          const itemVisible = isItemVisible(i)
          return (
            <div
              key={i}
              style={{
                position: 'relative',
                zIndex: 1,
                height: `${ITEM_VH}vh`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'visible',
                opacity: itemVisible ? 1 : 0,
                transform: itemVisible ? 'translateY(0)' : 'translateY(var(--ds-spacing-xl))',
                transition: itemTransition,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 0,
                  visibility: showOverlay ? 'hidden' : 'visible',
                  pointerEvents: showOverlay ? 'none' : 'auto',
                }}
              >
                <MediaLayer item={item} />
              </div>
              <div
                ref={(el) => { textRefs.current[i] = el }}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: 'var(--ds-spacing-4xl) var(--ds-grid-margin)',
                  textAlign: 'center',
                  maxWidth: 'calc(var(--ds-breakpoint-desktop) - var(--ds-grid-margin) * 2)',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <SurfaceProvider level={1} hasBoldBackground={showOverlay}>
                  {item.title && (
                    <BlockContainer contentWidth="Default" style={{ width: '100%', marginBottom: 'var(--ds-spacing-s)' }}>
                      <Headline
                        size="L"
                        weight="high"
                        as="h2"
                        style={{
                          textShadow,
                          whiteSpace: 'pre-line',
                          opacity: containerVisible ? 1 : 0,
                          transform: containerVisible ? 'translateY(0)' : 'translateY(var(--ds-spacing-xl))',
                          transition: titleTransition,
                        }}
                      >
                        {item.title}
                      </Headline>
                    </BlockContainer>
                  )}
                  {item.description && (
                    <BlockContainer contentWidth="XS" style={{ width: '100%' }}>
                      <Text
                        size="M"
                        weight="low"
                        as="p"
                        style={{
                          textShadow,
                          margin: 0,
                          lineHeight: 1.5,
                          textAlign: 'center',
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {item.description}
                      </Text>
                    </BlockContainer>
                  )}
                </SurfaceProvider>
              </div>
            </div>
          )
        })}
      </div>
    </section>
    </BlockSurfaceProvider>
  )
}
