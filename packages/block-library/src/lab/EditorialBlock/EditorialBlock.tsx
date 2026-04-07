'use client'

/**
 * EditorialBlock — 12×6 grid composition for text + image.
 * Text and image placed independently, can overlap.
 * Lab only.
 *
 * Grid debugging: set NEXT_PUBLIC_DEBUG_EDITORIAL_GRID=true in .env.local
 */

import { useEffect, useRef, useState } from 'react'

const DEBUG_EDITORIAL_GRID = process.env.NEXT_PUBLIC_DEBUG_EDITORIAL_GRID === 'true'
import { useRouter } from 'next/navigation'
import { Display, Headline, Title, Text, Button, SurfaceProvider } from '@marcelinodzn/ds-react'
import { BlockSurfaceProvider, getSurfaceProviderProps } from '@design2code/ds'
import {
  useEdgeToEdgeMediaStyles,
  EDGE_TO_EDGE_CAPPED_RADIUS,
  EDGE_TO_EDGE_MAX_PX,
} from '@design2code/ds'
import { useGridBreakpoint } from '@design2code/ds'
import { Grid, useCell } from '../../components/blocks/Grid'
import { WidthCap } from '../../production/WidthCap'
import type { EditorialBlockProps } from './EditorialBlock.types'
import { labStyleEditorialTitleWeight } from '@design2code/ds'
import {
  labDisplayPreset,
  labHeadlinePresets,
  labTextPresets,
} from '@design2code/ds'
import { LabBlockFramingCallToActions } from '../../components/LabBlockFramingCallToActions'
import { labBlockFramingDescriptionStyle } from '../../lab-utils/lab-block-framing-typography'

function fromCorners(
  topLeft: { column?: number; row?: number } | null | undefined,
  bottomRight: { column?: number; row?: number } | null | undefined,
  defaults: { colStart: number; colSpan: number; rowStart: number; rowSpan: number }
) {
  const tlCol = topLeft?.column ?? defaults.colStart
  const tlRow = topLeft?.row ?? defaults.rowStart
  const brCol = bottomRight?.column ?? tlCol + defaults.colSpan - 1
  const brRow = bottomRight?.row ?? tlRow + defaults.rowSpan - 1
  const colStart = Math.min(tlCol, brCol)
  const colSpan = Math.max(1, Math.abs(brCol - tlCol) + 1)
  const rowStart = Math.min(tlRow, brRow)
  const rowSpan = Math.max(1, Math.abs(brRow - tlRow) + 1)
  return { colStart, colSpan, rowStart, rowSpan }
}

export function EditorialBlock({
  headline,
  description,
  callToActions,
  body,
  backgroundImage,
  backgroundImagePositionX,
  backgroundImagePositionY,
  image,
  videoUrl,
  ctaText,
  ctaLink,
  textTopLeft,
  textBottomRight,
  headlineSize = 'display',
  textAlign = 'left',
  textVerticalAlign = 'center',
  imageTopLeft,
  imageBottomRight,
  imageFit = 'contain',
  textInFront = true,
  rows = 6,
  emphasis = 'ghost',
  appearance,
}: EditorialBlockProps) {
  const router = useRouter()
  const { columns, isStacked } = useGridBreakpoint()
  const cell = useCell('XL')
  const containerRef = useRef<HTMLDivElement>(null)
  const [cellSize, setCellSize] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const surfaceProps = getSurfaceProviderProps(emphasis)
  const edgeStyles = useEdgeToEdgeMediaStyles()

  const rowsClamped = Math.min(16, Math.max(2, rows ?? 6))

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = () => setPrefersReducedMotion(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width
      setCellSize(width / 12)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const hasMedia = Boolean(image || videoUrl)
  const hasBackground = Boolean(backgroundImage)
  const textAlignStyle = textAlign === 'center' ? 'center' : 'left'
  const alignItems = textVerticalAlign === 'bottom' ? 'flex-end' : 'center'
  const objPos = 'center'

  const handleCtaPress = () => {
    if (ctaLink?.startsWith('/')) router.push(ctaLink)
    else if (ctaLink) window.location.href = ctaLink
  }

  const headlineComponent = headlineSize === 'display' ? (
    <Display as="h1" align={textAlignStyle} style={{ whiteSpace: 'pre-line', margin: 0 }} {...labDisplayPreset}>
      {headline}
    </Display>
  ) : headlineSize === 'headline' ? (
    <Headline size="L" as="h1" align={textAlignStyle} style={{ whiteSpace: 'pre-line', margin: 0 }} {...labHeadlinePresets.block}>
      {headline}
    </Headline>
  ) : (
    <Title
      level={2}
      style={{
        textAlign: textAlignStyle,
        whiteSpace: 'pre-line',
        margin: 0,
        ...labStyleEditorialTitleWeight,
      }}
    >
      {headline}
    </Title>
  )

  const textContent = (
    <SurfaceProvider {...surfaceProps}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: alignItems,
          justifyContent: textVerticalAlign === 'bottom' ? 'flex-end' : 'center',
          gap: 'var(--ds-spacing-m)',
          height: '100%',
        }}
      >
        {headline && headlineComponent}
        {description && String(description).trim().length > 0 && (
          <Text
            as="p"
            {...labTextPresets.framingIntro}
            style={{
              ...labBlockFramingDescriptionStyle,
              textAlign: textAlignStyle,
              maxWidth: '100%',
            }}
          >
            {description}
          </Text>
        )}
        {body && (
          <Text
            as="p"
            {...labTextPresets.body}
            style={{
              margin: 0,
              whiteSpace: 'pre-line',
              textAlign: textAlignStyle,
              maxWidth: '100%',
            }}
          >
            {body}
          </Text>
        )}
        {callToActions?.some((a) => (a?.label ?? '').toString().trim().length > 0) ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-spacing-m)', justifyContent: textAlignStyle === 'center' ? 'center' : 'flex-start' }}>
            <LabBlockFramingCallToActions actions={callToActions} />
          </div>
        ) : (
          ctaText &&
          ctaLink && (
            <Button size="M" appearance="primary" attention="high" onPress={handleCtaPress}>
              {ctaText}
            </Button>
          )
        )}
      </div>
    </SurfaceProvider>
  )

  const showVideo = hasMedia && videoUrl && !prefersReducedMotion
  const imageContent = (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {showVideo ? (
        <video
          src={videoUrl}
          poster={image ?? undefined}
          muted
          autoPlay
          loop
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: imageFit,
            objectPosition: objPos,
          }}
        />
      ) : image ? (
        <img
          src={image}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: imageFit,
            objectPosition: objPos,
          }}
        />
      ) : null}
    </div>
  )

  if (isStacked) {
    const isMobile = columns <= 4
    return (
      <section style={{ position: 'relative' }}>
        <BlockSurfaceProvider emphasis={emphasis} appearance={appearance} fullWidth={false}>
          {hasBackground && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                marginLeft: 'calc(50% - 50vw)',
                width: '100vw',
                maxWidth: `${EDGE_TO_EDGE_MAX_PX}px`,
                top: 0,
                bottom: 0,
                overflow: 'hidden',
                zIndex: 0,
                borderRadius: edgeStyles.isCapped ? EDGE_TO_EDGE_CAPPED_RADIUS : 0,
              }}
            >
              <img
                src={backgroundImage!}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: `${backgroundImagePositionX ?? 0}% ${backgroundImagePositionY ?? 50}%`,
                }}
              />
            </div>
          )}
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--ds-spacing-l)',
            }}
          >
            <WidthCap contentWidth="L">
              {textContent}
            </WidthCap>
            {hasMedia && (
              <WidthCap contentWidth="XL">
                <div
                  style={{
                    aspectRatio: isMobile ? '4/5' : '2/1',
                    width: '100%',
                    overflow: 'hidden',
                  }}
                >
                  {imageContent}
                </div>
              </WidthCap>
            )}
          </div>
        </BlockSurfaceProvider>
      </section>
    )
  }

  const cols = 12
  const blockHeight = cellSize * rowsClamped

  /**
   * Debug overlay: 1px red lines at column and row boundaries.
   * Editorial grid has 12 columns × rows, gap 0. Pattern repeats per cell.
   */
  const debugOverlayStyle: React.CSSProperties = DEBUG_EDITORIAL_GRID
    ? {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: `
          repeating-linear-gradient(
            to right,
            transparent 0,
            transparent calc(100% / 12 - 1px),
            rgba(255, 0, 0, 0.3) calc(100% / 12 - 1px),
            rgba(255, 0, 0, 0.3) calc(100% / 12)
          ),
          repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent calc(100% / ${rowsClamped} - 1px),
            rgba(255, 0, 0, 0.3) calc(100% / ${rowsClamped} - 1px),
            rgba(255, 0, 0, 0.3) calc(100% / ${rowsClamped})
          )
        `,
        zIndex: 3,
      }
    : {}

  const text = fromCorners(textTopLeft, textBottomRight, { colStart: 1, colSpan: 6, rowStart: 2, rowSpan: 3 })
  const img = fromCorners(imageTopLeft, imageBottomRight, { colStart: 5, colSpan: 8, rowStart: 1, rowSpan: 6 })
  const tColStart = Math.min(Math.max(1, text.colStart), cols)
  const tColSpan = Math.min(text.colSpan, cols - tColStart + 1)
  const tRowStart = Math.min(Math.max(1, text.rowStart), rowsClamped)
  const tRowSpan = Math.min(text.rowSpan, rowsClamped - tRowStart + 1)
  const iColStart = Math.min(Math.max(1, img.colStart), cols)
  const iColSpan = Math.min(img.colSpan, cols - iColStart + 1)
  const iRowStart = Math.min(Math.max(1, img.rowStart), rowsClamped)
  const iRowSpan = Math.min(img.rowSpan, rowsClamped - iRowStart + 1)

  const gridContent = (
    <div
      ref={containerRef}
      style={{
        ...cell,
        position: 'relative',
        width: '100%',
        height: blockHeight > 0 ? `${blockHeight}px` : undefined,
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridTemplateRows: cellSize > 0 ? `repeat(${rowsClamped}, ${cellSize}px)` : `repeat(${rowsClamped}, 1fr)`,
        gap: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          gridColumn: `${tColStart} / span ${tColSpan}`,
          gridRow: `${tRowStart} / span ${tRowSpan}`,
          zIndex: textInFront ? 2 : 1,
          position: 'relative',
          minHeight: 0,
          minWidth: 0,
        }}
      >
        {textContent}
      </div>
      {hasMedia && (
        <div
          style={{
            gridColumn: `${iColStart} / span ${iColSpan}`,
            gridRow: `${iRowStart} / span ${iRowSpan}`,
            zIndex: textInFront ? 1 : 2,
            position: 'relative',
            minHeight: 0,
            minWidth: 0,
          }}
        >
          {imageContent}
        </div>
      )}
      {DEBUG_EDITORIAL_GRID && <div aria-hidden style={debugOverlayStyle} />}
    </div>
  )

  return (
    <section style={{ position: 'relative' }}>
      <BlockSurfaceProvider emphasis={emphasis} appearance={appearance} fullWidth={false}>
        {hasBackground && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              marginLeft: 'calc(50% - 50vw)',
              width: '100vw',
              maxWidth: `${EDGE_TO_EDGE_MAX_PX}px`,
              top: 0,
              bottom: 0,
              overflow: 'hidden',
              zIndex: 0,
              borderRadius: edgeStyles.isCapped ? EDGE_TO_EDGE_CAPPED_RADIUS : 0,
            }}
          >
            <img
              src={backgroundImage!}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: `${backgroundImagePositionX ?? 0}% ${backgroundImagePositionY ?? 50}%`,
              }}
            />
          </div>
        )}
        <Grid as="div" style={{ position: 'relative', zIndex: 1 }}>
          {gridContent}
        </Grid>
      </BlockSurfaceProvider>
    </section>
  )
}
