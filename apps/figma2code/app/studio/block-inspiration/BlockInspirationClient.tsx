'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import {
  BLOCK_CATALOGUE,
  type BlockCatalogueEntry,
  type BlockCategory,
} from './block-catalogue'
import { studioPreviewColumn, studioTitleBlockBottom, studioToolInputColumn } from '../studio-ui'

const DOTCOM_BASE_URL = (
  process.env.NEXT_PUBLIC_DOTCOM_URL ?? 'http://localhost:3000'
).replace(/\/$/, '')

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

type PreviewSize = 'small' | 'medium' | 'large'

const PRESET_PREVIEW: Record<PreviewSize, { width: number; height: number }> = {
  small: { width: 360, height: 800 },
  medium: { width: 768, height: 800 },
  large: { width: 1440, height: 800 },
}

const MIN_WIDTH = 280
const MIN_HEIGHT = 400

function BlockListItem({
  entry,
  isSelected,
  onSelect,
}: {
  entry: BlockCatalogueEntry
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full max-w-[252px] mx-auto text-left rounded-xl p-2.5 transition-colors cursor-pointer border-none bg-transparent ${
        isSelected
          ? 'bg-primary-light ring-1 ring-primary/20'
          : 'hover:bg-gray-100'
      }`}
    >
      {entry.thumbnail ? (
        <div className="w-full aspect-[3/2] rounded-lg overflow-hidden bg-gray-100 mb-2 shadow-sm ring-1 ring-gray-200/80">
          <Image
            src={entry.thumbnail}
            alt={entry.name}
            width={252}
            height={168}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full aspect-[3/2] rounded-lg bg-gray-100 mb-2 flex items-center justify-center ring-1 ring-gray-200/60">
          <span className="text-xs text-gray-400">Preview</span>
        </div>
      )}
      <span className="text-sm font-medium text-gray-700 block px-0.5">{entry.name}</span>
      {entry.tier === 'lab' && (
        <span className="text-xs text-gray-500 block">Lab</span>
      )}
    </button>
  )
}

function BlockListPanel({
  selectedId,
  onSelect,
}: {
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden studio-scrollbar px-7 py-6">
      <div className={studioTitleBlockBottom}>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Jio Blocks
        </h1>
        <p className="text-sm text-gray-500 m-0">Browse all blocks. Click to preview.</p>
      </div>

      <div className="flex flex-col gap-6">
        {CATEGORY_ORDER.map((category) => {
          const blocks = blocksByCategory[category]
          if (blocks.length === 0) return null
          return (
            <div key={category}>
              <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                {category}
              </span>
              <div className="flex flex-col gap-3">
                {blocks.map((entry) => (
                  <BlockListItem
                    key={entry.id}
                    entry={entry}
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

  const maxW = Math.max(MIN_WIDTH, (maxContainer.width || 9999) - 70)
  const maxH = Math.max(MIN_HEIGHT, (maxContainer.height || 9999) - 54)

  const scaleX = maxW / previewWidth
  const scaleY = maxH / previewHeight
  const scale = Math.min(scaleX, scaleY, 1)
  const containerWidth = previewWidth * scale
  const containerHeight = previewHeight * scale
  const zoomPct = Math.round(scale * 100)

  useEffect(() => {
    const el = areaRef.current
    if (!el) return
    const update = () => setMaxContainer({ width: el.clientWidth, height: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [selectedEntry])

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
      setPreviewSizeState({
        width: resizeAxis === 'width' ? Math.max(MIN_WIDTH, dragStart.current.width + dx) : dragStart.current.width,
        height: resizeAxis === 'height' ? Math.max(MIN_HEIGHT, dragStart.current.height + dy) : dragStart.current.height,
      })
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
      <div className="h-full min-h-0 flex flex-col overflow-hidden bg-white">
        <div className="shrink-0 px-4 py-3 border-b border-gray-200">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</span>
        </div>
        <div className="flex-1 min-h-0 flex items-center justify-center p-8 bg-gray-50">
          <p className="text-sm text-gray-500 m-0">Select a block to preview.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full min-h-0 flex flex-col overflow-hidden bg-white">
      <div className="shrink-0 px-4 py-3 border-b border-gray-200 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Preview</span>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {(['small', 'medium', 'large'] as const).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => handlePresetClick(size)}
              className={`px-2.5 py-1 text-xs font-medium rounded border cursor-pointer transition-colors capitalize ${
                previewSize === size
                  ? 'text-gray-900 bg-gray-100 border-gray-200'
                  : 'text-gray-500 bg-transparent border-gray-200 hover:text-gray-600'
              }`}
            >
              {size}
            </button>
          ))}
          <span className="text-xs text-gray-500">{sizeLabel}</span>
        </div>
      </div>

      <div
        ref={areaRef}
        className="flex-1 min-h-0 min-w-0 overflow-auto flex justify-center items-start p-6 md:p-8 bg-gray-50"
      >
        <div
          className="relative overflow-hidden rounded-lg border border-gray-200 bg-white"
          style={{
            width: containerWidth,
            height: containerHeight,
            minWidth: MIN_WIDTH,
            minHeight: MIN_HEIGHT,
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.12)',
          }}
        >
          <div
            style={{
              width: previewWidth,
              height: previewHeight,
              transform: scale < 1 ? `scale(${scale})` : 'none',
              transformOrigin: 'top left',
              overflow: 'hidden',
            }}
          >
            <iframe
              src={`${DOTCOM_BASE_URL}/lab/${selectedEntry.labSlug}`}
              title={selectedEntry.name}
              width={previewWidth}
              height={previewHeight}
              style={{ border: 'none', display: 'block', width: previewWidth, height: previewHeight }}
            />
          </div>
          <div
            role="button"
            tabIndex={0}
            onMouseDown={handleResizeStart('width')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.preventDefault() }}
            className="absolute top-0 right-0 w-3 h-full cursor-ew-resize"
            aria-label="Resize width"
          />
          <div
            role="button"
            tabIndex={0}
            onMouseDown={handleResizeStart('height')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.preventDefault() }}
            className="absolute bottom-0 left-0 w-full h-3 cursor-ns-resize"
            aria-label="Resize height"
          />
        </div>
      </div>
    </div>
  )
}

export default function BlockInspirationClient() {
  const [selectedId, setSelectedId] = useState<string | null>(BLOCK_CATALOGUE[0]?.id ?? null)
  const [previewSize, setPreviewSize] = useState<PreviewSize>('large')

  const selectedEntry = selectedId
    ? BLOCK_CATALOGUE.find((e) => e.id === selectedId) ?? null
    : null

  return (
    <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
      <aside className={`${studioToolInputColumn} border-r border-gray-200 flex flex-col overflow-hidden bg-white`}>
        <BlockListPanel selectedId={selectedId} onSelect={setSelectedId} />
      </aside>
      <div className={studioPreviewColumn}>
        <BlockPreviewPanel
          selectedEntry={selectedEntry}
          previewSize={previewSize}
          onPreviewSizeChange={setPreviewSize}
        />
      </div>
    </div>
  )
}
