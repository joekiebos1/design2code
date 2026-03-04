'use client'

/**
 * RotatingMediaBlock — auto-rotating media carousel
 *
 * Variants:
 * - small: 2 rows × 4 cols, 8 compact cards visible
 * - large: single large card spanning 8 columns, cycles through items
 * - combined: one large card (8 cols) + small cards carousel (4 cols)
 *
 * Behavior: Media auto-rotates right-to-left. On hover: pause smoothly, show Play overlay. Click Play to resume.
 */

import { useState, useEffect } from 'react'
import { createTransition } from '@marcelinodzn/ds-tokens'
import { Button, Icon, SurfaceProvider } from '@marcelinodzn/ds-react'
import { GridBlock, useGridCell } from '../../components/GridBlock'
import { BlockContainer } from '../BlockContainer'
import type { RotatingMediaBlockProps, RotatingMediaItem } from './RotatingMediaBlock.types'

const IcPlay = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M8 5v14l11-7z" />
  </svg>
)

const GAP = 'var(--ds-spacing-m)'
const CARD_RADIUS = 'var(--ds-radius-card)'
const ANIMATION_DURATION = 40

function MediaCard({
  item,
  aspectRatio = '16/9',
}: {
  item: RotatingMediaItem
  aspectRatio?: string
}) {
  const hasImage = item.image && item.image.trim() !== ''
  if (!hasImage) return null

  return (
    <div
      style={{
        position: 'relative',
        aspectRatio,
        overflow: 'hidden',
        borderRadius: CARD_RADIUS,
        background: 'var(--ds-color-background-subtle)',
        flexShrink: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.image}
        alt={item.title ?? ''}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: 'inherit',
        }}
      />
    </div>
  )
}

function PlayOverlay({
  visible,
  onResume,
}: {
  visible: boolean
  onResume: () => void
}) {
  if (!visible) return null
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--local-color-shadow-overlay)',
        borderRadius: CARD_RADIUS,
        opacity: visible ? 1 : 0,
        transition: createTransition('opacity', 'm', 'transition', 'subtle'),
        zIndex: 1,
      }}
    >
      <Button
        single
        appearance="primary"
        attention="high"
        size="L"
        aria-label="Resume rotation"
        onPress={onResume}
        content={<Icon asset={<IcPlay />} size="L" appearance="secondary" tinted />}
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
        }}
      />
    </div>
  )
}

function SmallCarousel({
  items,
  isPaused,
  prefersReducedMotion,
  onPause,
  onResume,
}: {
  items: RotatingMediaItem[]
  isPaused: boolean
  prefersReducedMotion: boolean
  onPause: () => void
  onResume: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const showOverlay = isHovered && isPaused
  const duplicatedItems = [...items, ...items]

  return (
    <div
      onMouseEnter={() => {
        setIsHovered(true)
        onPause()
      }}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        containerType: 'inline-size',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateRows: '1fr 1fr',
          gridAutoFlow: 'column',
          gridAutoColumns: '12.5%',
          gap: GAP,
          width: '200%',
          animation: prefersReducedMotion ? 'none' : `rotating-media-scroll ${ANIMATION_DURATION}s linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {duplicatedItems.map((item, i) => (
          <MediaCard key={i} item={item} />
        ))}
      </div>
      <PlayOverlay visible={showOverlay} onResume={onResume} />
    </div>
  )
}

function LargeCarousel({
  items,
  isPaused,
  prefersReducedMotion,
  onPause,
  onResume,
}: {
  items: RotatingMediaItem[]
  isPaused: boolean
  prefersReducedMotion: boolean
  onPause: () => void
  onResume: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const showOverlay = isHovered && isPaused
  const duplicatedItems = [...items, ...items]

  return (
    <div
      onMouseEnter={() => {
        setIsHovered(true)
        onPause()
      }}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes rotating-media-scroll-large {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
      <div
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: GAP,
          width: '200%',
          animation: prefersReducedMotion ? 'none' : `rotating-media-scroll-large ${ANIMATION_DURATION}s linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {duplicatedItems.map((item, i) => (
          <div key={i} style={{ flex: '0 0 calc(50% - var(--ds-spacing-m) / 2)', minWidth: 0 }}>
            <MediaCard item={item} aspectRatio="16/9" />
          </div>
        ))}
      </div>
      <PlayOverlay visible={showOverlay} onResume={onResume} />
    </div>
  )
}

function CombinedLayout({
  items,
  isPaused,
  prefersReducedMotion,
  onPause,
  onResume,
}: {
  items: RotatingMediaItem[]
  isPaused: boolean
  prefersReducedMotion: boolean
  onPause: () => void
  onResume: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const showOverlay = isHovered && isPaused
  const largeItem = items[0]
  const smallItems = items.slice(1)
  const duplicatedSmall = smallItems.length > 0 ? [...smallItems, ...smallItems] : []

  return (
    <div
      onMouseEnter={() => {
        setIsHovered(true)
        onPause()
      }}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: GAP,
        width: '100%',
        minHeight: 200,
      }}
    >
      {largeItem && (
        <div style={{ gridRow: '1 / span 2', position: 'relative' }}>
          <MediaCard item={largeItem} aspectRatio="16/9" />
          {showOverlay && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--local-color-shadow-overlay)',
                borderRadius: CARD_RADIUS,
                zIndex: 1,
              }}
            >
              <Button
                single
                appearance="primary"
                attention="high"
                size="L"
                aria-label="Resume rotation"
                onPress={onResume}
                content={<Icon asset={<IcPlay />} size="L" appearance="secondary" tinted />}
                style={{ width: 56, height: 56, borderRadius: '50%' }}
              />
            </div>
          )}
        </div>
      )}
      <div
        style={{
          gridRow: '1 / span 2',
          position: 'relative',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateRows: '1fr 1fr',
          gridAutoFlow: 'column',
          gridAutoColumns: '50%',
          gap: GAP,
          width: duplicatedSmall.length > 0 ? '200%' : '100%',
          animation:
            prefersReducedMotion || duplicatedSmall.length === 0
              ? 'none'
              : `rotating-media-scroll ${ANIMATION_DURATION}s linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {duplicatedSmall.map((item, i) => (
          <MediaCard key={i} item={item} />
        ))}
      </div>
    </div>
  )
}

export function RotatingMediaBlock({
  variant = 'small',
  items,
  surface = 'ghost',
}: RotatingMediaBlockProps) {
  const cell = useGridCell('Wide')
  const [isPaused, setIsPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = () => setPrefersReducedMotion(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const items_ = items?.filter((i) => i?.image?.trim()) ?? []
  if (items_.length === 0) return null

  const surfaceLevel = surface === 'ghost' ? 0 : 1
  const hasBoldBackground = surface === 'bold'
  const handlePause = () => setIsPaused(true)
  const handleResume = () => setIsPaused(false)
  const effectivePaused = isPaused || prefersReducedMotion

  return (
    <SurfaceProvider level={surfaceLevel} hasBoldBackground={hasBoldBackground}>
      <style>{`
        @keyframes rotating-media-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes rotating-media-scroll-large {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
      <GridBlock as="section">
        <div
          style={{
            ...cell,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <BlockContainer contentWidth="Wide" style={{ width: '100%', overflow: 'hidden' }}>
            <div style={{ width: '100%' }}>
              {variant === 'small' && (
                <SmallCarousel
                  items={items_}
                  isPaused={effectivePaused}
                  prefersReducedMotion={prefersReducedMotion}
                  onPause={handlePause}
                  onResume={handleResume}
                />
              )}
              {variant === 'large' && (
                <LargeCarousel
                  items={items_}
                  isPaused={effectivePaused}
                  prefersReducedMotion={prefersReducedMotion}
                  onPause={handlePause}
                  onResume={handleResume}
                />
              )}
              {variant === 'combined' && (
                <CombinedLayout
                  items={items_}
                  isPaused={effectivePaused}
                  prefersReducedMotion={prefersReducedMotion}
                  onPause={handlePause}
                  onResume={handleResume}
                />
              )}
            </div>
          </BlockContainer>
        </div>
      </GridBlock>
    </SurfaceProvider>
  )
}
