'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Headline, Text, Label } from '@marcelinodzn/ds-react'
import styles from './block-inspiration.module.css'
import { useGridBreakpoint } from '../../../lib/utils/use-grid-breakpoint'
import {
  BLOCK_CATALOGUE,
  type BlockCatalogueEntry,
  type BlockCategory,
} from './block-catalogue'

const grey = {
  border: 'rgba(0, 0, 0, 0.06)',
  label: 'rgba(0, 0, 0, 0.65)',
  secondary: 'rgba(0, 0, 0, 0.48)',
}

type PreviewSize = 'small' | 'medium' | 'large'

const CATEGORY_ORDER: BlockCategory[] = [
  'Page titles',
  'Section titles',
  'Content blocks',
  'Carousels',
  'Navigation',
]

const blocksByCategory = CATEGORY_ORDER.reduce(
  (acc, cat) => {
    acc[cat] = BLOCK_CATALOGUE.filter((e) => e.category === cat)
    return acc
  },
  {} as Record<BlockCategory, BlockCatalogueEntry[]>
)

export type ThumbnailsMap = Record<string, string>

function BlockListItem({
  entry,
  thumbnailUrl,
  isSelected,
  onSelect,
}: {
  entry: BlockCatalogueEntry
  thumbnailUrl?: string | null
  isSelected: boolean
  onSelect: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--ds-spacing-xs)',
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect()
          }
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-spacing-xs)',
          cursor: 'pointer',
          border: isSelected || isHovered ? `1px solid ${grey.border}` : '1px solid transparent',
          boxShadow: isSelected || isHovered ? '0 2px 8px rgba(0, 0, 0, 0.06)' : undefined,
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 120,
            overflow: 'hidden',
            pointerEvents: 'none',
            background: thumbnailUrl ? undefined : 'var(--ds-color-background-minimal)',
            borderRadius: 'var(--ds-radius-s)',
          }}
        >
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={entry.name}
              width={280}
              height={180}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{ transform: 'scale(0.4)', transformOrigin: 'top center' }}>
              <entry.Preview />
            </div>
          )}
        </div>
      </div>
      <Text
        size="XS"
        weight="low"
        color="high"
        as="span"
        style={{
          fontSize: 'var(--ds-typography-body-xs)',
          fontWeight: 'var(--ds-typography-weight-medium)',
          color: 'var(--ds-color-text-high)',
        }}
      >
        {entry.name}
      </Text>
      {entry.tier === 'lab' && (
        <Label size="XS" weight="low" color="low" as="span">
          Lab
        </Label>
      )}
    </div>
  )
}

function BlockListPanel({
  selectedId,
  onSelect,
  thumbnailsMap,
}: {
  selectedId: string | null
  onSelect: (id: string) => void
  thumbnailsMap: ThumbnailsMap
}) {
  return (
    <div
      className={styles.listScroll}
      style={{
        flex: '1 1 0',
        minHeight: 0,
        overflowX: 'hidden',
        overflowY: 'auto',
        padding: 'var(--ds-spacing-2xl)',
      }}
    >
      <Headline
        level={2}
        as="h1"
        style={{
          margin: 0,
          marginBottom: 'var(--ds-spacing-xl)',
          fontWeight: 'var(--ds-typography-weight-medium)',
          color: 'var(--ds-color-text-high)',
          letterSpacing: '-0.02em',
        }}
      >
        Block Inspiration
      </Headline>
      <Text
        style={{
          margin: 0,
          marginBottom: 'var(--ds-spacing-xl)',
          fontSize: 'var(--ds-typography-body-xs)',
          fontWeight: 'var(--ds-typography-weight-low)',
          color: grey.secondary,
          lineHeight: 1.5,
        }}
      >
        Browse all blocks. Click to preview.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-spacing-xl)' }}>
        {CATEGORY_ORDER.map((category) => {
          const blocks = blocksByCategory[category]
          if (blocks.length === 0) return null
          return (
            <div key={category}>
              <Text
                as="span"
                style={{
                  display: 'block',
                  marginBottom: 'var(--ds-spacing-m)',
                  fontSize: 'var(--ds-typography-label-s)',
                  fontWeight: 'var(--ds-typography-weight-medium)',
                  color: 'var(--ds-color-text-high)',
                  letterSpacing: '0.02em',
                }}
              >
                {category}
              </Text>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--ds-spacing-l)',
                }}
              >
                {blocks.map((entry) => (
                  <BlockListItem
                    key={entry.id}
                    entry={entry}
                    thumbnailUrl={thumbnailsMap[entry.id]}
                    isSelected={selectedId === entry.id}
                    onSelect={() => onSelect(entry.id)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Preview width (logical) per preset. Height is 800 for small/medium, 560 visible for large (1440×800 at 70%). */
const PRESET_PREVIEW: Record<PreviewSize, { width: number; height: number }> = {
  small: { width: 360, height: 800 },
  medium: { width: 768, height: 800 },
  large: { width: 1440, height: 800 },
}

const PREVIEW_SHADOW = '0 12px 48px rgba(0, 0, 0, 0.15)'
const MIN_WIDTH = 280
const MIN_HEIGHT = 400
const PADDING_XL = 35
const PADDING_M = 19

function BlockPreviewPanel({
  selectedEntry,
  previewSize,
  onPreviewSizeChange,
}: {
  selectedEntry: BlockCatalogueEntry | null
  previewSize: PreviewSize
  onPreviewSizeChange: (size: PreviewSize) => void
}) {
  const [previewSizeState, setPreviewSizeState] = useState<{ width: number; height: number } | null>(null)
  const [resizeAxis, setResizeAxis] = useState<'width' | 'height' | null>(null)
  const [maxContainer, setMaxContainer] = useState({ width: 0, height: 0 })
  const areaRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef({ x: 0, y: 0, width: 0, height: 0 })

  const preset = PRESET_PREVIEW[previewSize]
  const previewWidth = previewSizeState?.width ?? preset.width
  const previewHeight = previewSizeState?.height ?? preset.height

  const paddingH = PADDING_XL * 2
  const paddingV = PADDING_XL + PADDING_M
  const maxW = Math.max(MIN_WIDTH, (maxContainer.width || 9999) - paddingH)
  const maxH = Math.max(MIN_HEIGHT, (maxContainer.height || 9999) - paddingV)

  const scaleX = maxW / previewWidth
  const scaleY = maxH / previewHeight
  const scale = Math.min(scaleX, scaleY, 1)
  const containerWidth = previewWidth * scale
  const containerHeight = previewHeight * scale
  const zoomPct = Math.round(scale * 100)

  const iframeWidth = previewWidth
  const iframeHeight = previewHeight

  useEffect(() => {
    const el = areaRef.current
    if (!el) return
    const update = () => {
      setMaxContainer({ width: el.clientWidth, height: el.clientHeight })
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const handlePresetClick = (size: PreviewSize) => {
    onPreviewSizeChange(size)
    setPreviewSizeState(null)
  }

  const handleResizeStart = (axis: 'width' | 'height') => (e: React.MouseEvent) => {
    e.preventDefault()
    setResizeAxis(axis)
    dragStart.current = { x: e.clientX, y: e.clientY, width: previewWidth, height: previewHeight }
  }

  useEffect(() => {
    if (!resizeAxis) return
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      const newWidth = resizeAxis === 'width'
        ? Math.max(MIN_WIDTH, dragStart.current.width + dx)
        : dragStart.current.width
      const newHeight = resizeAxis === 'height'
        ? Math.max(MIN_HEIGHT, dragStart.current.height + dy)
        : dragStart.current.height
      setPreviewSizeState({ width: newWidth, height: newHeight })
    }
    const onUp = () => setResizeAxis(null)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [resizeAxis])

  const sizeLabel = zoomPct < 100
    ? `${Math.round(previewWidth)}px ${zoomPct}%`
    : `${Math.round(previewWidth)}px`

  if (!selectedEntry) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--ds-spacing-2xl)',
        }}
      >
        <Text
          style={{
            fontSize: 'var(--ds-typography-label-s)',
            fontWeight: 'var(--ds-typography-weight-low)',
            color: grey.secondary,
          }}
        >
          Select a block to preview.
        </Text>
      </div>
    )
  }

  const labUrl = `/lab/${selectedEntry.labSlug}`

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-spacing-xs)',
          padding: 'var(--ds-spacing-m)',
          borderBottom: `1px solid ${grey.border}`,
        }}
      >
        {(['small', 'medium', 'large'] as const).map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => handlePresetClick(size)}
            style={{
              padding: 'var(--ds-spacing-2xs) var(--ds-spacing-s)',
              fontSize: '11px',
              fontWeight: 'var(--ds-typography-weight-medium)',
              color: previewSize === size ? 'var(--ds-color-text-high)' : grey.secondary,
              background: previewSize === size ? 'var(--ds-color-background-subtle)' : 'transparent',
              border: `1px solid ${grey.border}`,
              borderRadius: 'var(--ds-radius-s)',
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {size}
          </button>
        ))}
        <Text
          size="XS"
          as="span"
          style={{
            marginLeft: 'var(--ds-spacing-xs)',
            color: grey.secondary,
            fontSize: 'var(--ds-typography-body-xs)',
          }}
        >
          {sizeLabel}
        </Text>
      </div>

      <div
        ref={areaRef}
        style={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: 'var(--ds-spacing-xl)',
          paddingBottom: 'var(--ds-spacing-m)',
          background: 'var(--ds-color-background-minimal)',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: containerWidth,
            height: containerHeight,
            minWidth: MIN_WIDTH,
            minHeight: MIN_HEIGHT,
            boxShadow: PREVIEW_SHADOW,
            borderRadius: 'var(--ds-radius-m)',
            border: `1px solid ${grey.border}`,
            overflow: 'hidden',
            background: 'var(--ds-color-background-minimal)',
          }}
        >
          <div
            style={{
              width: iframeWidth,
              height: iframeHeight,
              transform: scale < 1 ? `scale(${scale})` : 'none',
              transformOrigin: 'top left',
            }}
          >
            <iframe
              src={labUrl}
              title={`${selectedEntry.name} – Lab (${previewSize})`}
              style={{
                width: iframeWidth,
                height: iframeHeight,
                border: 'none',
                display: 'block',
              }}
            />
          </div>
          <div
            role="button"
            tabIndex={0}
            onMouseDown={handleResizeStart('width')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') e.preventDefault()
            }}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 12,
              height: '100%',
              cursor: 'ew-resize',
            }}
            aria-label="Resize width"
          />
          <div
            role="button"
            tabIndex={0}
            onMouseDown={handleResizeStart('height')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') e.preventDefault()
            }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: 12,
              cursor: 'ns-resize',
            }}
            aria-label="Resize height"
          />
        </div>
      </div>
    </div>
  )
}

export default function BlockInspirationClient({ thumbnailsMap }: { thumbnailsMap: ThumbnailsMap }) {
  const { columns, gridMaxWidth } = useGridBreakpoint()
  const [selectedId, setSelectedId] = useState<string | null>(BLOCK_CATALOGUE[0]?.id ?? null)
  const [previewSize, setPreviewSize] = useState<PreviewSize>('large')

  const isSideBySide = columns >= 8

  const selectedEntry = selectedId
    ? BLOCK_CATALOGUE.find((e) => e.id === selectedId) ?? null
    : null

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        maxWidth: gridMaxWidth ?? undefined,
        marginInline: gridMaxWidth ? 'auto' : undefined,
        paddingLeft: 'var(--ds-grid-margin)',
        paddingRight: 0,
        width: '100%',
        boxSizing: 'border-box',
        borderRight: `1px solid ${grey.border}`,
      }}
    >
      <main
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: isSideBySide ? 'row' : 'column',
          overflow: 'hidden',
        }}
      >
        <aside
          style={{
            width: isSideBySide ? 280 : undefined,
            flex: isSideBySide ? '0 0 280px' : '1 1 0',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: `1px solid ${grey.border}`,
            borderRight: isSideBySide ? `1px solid ${grey.border}` : undefined,
            overflow: 'hidden',
            background: 'var(--ds-color-background-minimal)',
          }}
        >
          <BlockListPanel
            selectedId={selectedId}
            onSelect={setSelectedId}
            thumbnailsMap={thumbnailsMap}
          />
        </aside>
        <div
          style={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflow: 'hidden',
            background: 'var(--ds-color-background-minimal)',
          }}
        >
          <BlockPreviewPanel
            selectedEntry={selectedEntry}
            previewSize={previewSize}
            onPreviewSizeChange={setPreviewSize}
          />
        </div>
      </main>
    </div>
  )
}
