'use client'

import { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { ContentDsProvider } from '@design2code/ds'
import { BlockRenderer } from '../BlockRenderer'
import { briefToBlocks } from '../../lib/briefToBlocks'
import {
  updateField,
  updateCtaLabel,
  updateItemField,
  addItem,
  removeItem,
  pinImage,
  reorderSections,
  swapComponent,
} from '../../lib/briefEditor'
import type { PageBrief, Section, BlockOptions } from '../../lib/types'

// ─── Types ──────────────────────────────────────────────────────────────────

type EditablePreviewProps = {
  brief: PageBrief
  imageUrls: string[]
  videoUrls: string[]
  onBriefUpdate: (brief: PageBrief) => void
  /** Canvas zoom level — applied to page content only, not the overlay rings/buttons. Default 1. */
  scale?: number
}

type MoveButtonsState = {
  isFirst: boolean
  isLast: boolean
} | null

type FocusedBlockState = {
  sectionIdx: number
  sectionName: string
} | null

// ─── Ring colour palette ──────────────────────────────────────────────────────

type ElType = 'block' | 'image' | 'text'

const RING: Record<ElType, { hover: string; parent: string; sel: string }> = {
  block: { hover: 'rgba(79,70,229,0.6)',  parent: 'rgba(79,70,229,0.22)',  sel: '#4f46e5' }, // indigo
  image: { hover: 'rgba(14,165,233,0.6)', parent: 'rgba(14,165,233,0.22)', sel: '#0ea5e9' }, // sky
  text:  { hover: 'rgba(16,185,129,0.6)', parent: 'rgba(16,185,129,0.22)', sel: '#10b981' }, // emerald
}

// ─── Panel constants ─────────────────────────────────────────────────────────

/** Blocks that show the side panel when selected. */
const PANEL_BLOCKS = new Set(['mediaTextStacked', 'cardGrid', 'carousel', 'mediaText5050'])

/** The three swappable Engage block types shown in the "Choose block" section. */
const CHANGE_BLOCK_COMPONENTS = ['mediaTextStacked', 'carousel', 'cardGrid']

const BLOCK_LABELS: Record<string, string> = {
  mediaTextStacked:    'Media & Text',
  mediaText5050:       '50/50 Split',
  mediaTextAsymmetric: 'FAQ',
  cardGrid:            'Card Grid',
  carousel:            'Carousel',
  proofPoints:         'Proof Points',
  hero:                'Hero',
}

const EMPHASIS_OPTIONS: { value: string; label: string }[] = [
  { value: 'ghost',   label: 'Ghost' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'subtle',  label: 'Subtle' },
  { value: 'bold',    label: 'Bold' },
]

const PANEL_WIDTH = 320

// ─── Data sets ───────────────────────────────────────────────────────────────

const ITEM_BLOCKS = new Set(['cardGrid', 'carousel', 'proofPoints', 'mediaTextAsymmetric', 'mediaText5050'])

const ITEM_LABEL: Record<string, string> = {
  cardGrid:            'card',
  carousel:            'item',
  proofPoints:         'point',
  mediaTextAsymmetric: 'question',
  mediaText5050:       'item',
}

const IMAGE_BLOCKS = new Set(['hero', 'mediaTextStacked', 'mediaText5050', 'mediaTextAsymmetric', 'cardGrid', 'carousel'])

const isDraggableSection = (s: Section) => s.component !== 'hero' && s.narrativeRole !== 'resolve'

// ─── Layers panel data ────────────────────────────────────────────────────────

/** Display label for item sub-layers in the layers panel. */
const LAYER_ITEM_LABEL: Record<string, string> = {
  cardGrid:            'Card',
  carousel:            'Card',
  proofPoints:         'Point',
  mediaTextAsymmetric: 'Question',
  mediaText5050:       'Item',
}

type LayerType = 'heading' | 'media' | 'item'
type LayerSelection = { sectionName: string; layerType: LayerType; itemIndex?: number }
type SubLayer = { type: LayerType; label: string; itemIndex?: number }

type PanelLayer =
  | { type: 'block' }
  | { type: 'heading' }
  | { type: 'media' }
  | { type: 'item'; itemIndex: number }

function getSubLayers(section: Section): SubLayer[] {
  const layers: SubLayer[] = [{ type: 'heading', label: 'Heading' }]
  if (ITEM_BLOCKS.has(section.component)) {
    const items = Array.isArray(section.contentSlots.items) ? section.contentSlots.items : []
    const lbl = LAYER_ITEM_LABEL[section.component] ?? 'Item'
    items.forEach((_, i) => layers.push({ type: 'item', label: `${lbl} ${i + 1}`, itemIndex: i }))
  } else if (IMAGE_BLOCKS.has(section.component)) {
    layers.push({ type: 'media', label: 'Media' })
  }
  return layers
}

// ─── Variant config ───────────────────────────────────────────────────────────

type VariantConfig = {
  key: string
  label: string       // section title
  rowLabel: string    // row label inside the section
  control: 'select' | 'segmented'
  options: Array<{ value: string; label: string }>
  currentValue: (opts: BlockOptions) => string
}

// Variant options restricted per page template.
// 'product-page' covers both hardware and app/software product pages.
function getVariantConfigs(component: string, template?: string | null): VariantConfig[] {
  const isProductPage = template === 'product-page'

  switch (component) {
    case 'mediaTextStacked':
      return [
        {
          key: 'template', label: 'Template', rowLabel: 'Style', control: 'select',
          options: isProductPage
            ? [{ value: 'stacked', label: 'Stacked' }, { value: 'textOnly', label: 'Text only' }]
            : [{ value: 'stacked', label: 'Stacked' }, { value: 'textOnly', label: 'Text only' }, { value: 'overlay', label: 'Overlay' }],
          currentValue: opts => (opts.template as string) ?? 'stacked',
        },
        {
          key: 'alignment', label: 'Alignment', rowLabel: 'Align', control: 'segmented',
          options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }],
          currentValue: opts => (opts.alignment as string) ?? 'left',
        },
      ]
    case 'carousel':
      return [
        {
          key: 'cardSize', label: 'Card size', rowLabel: 'Size', control: 'select',
          options: isProductPage
            ? [{ value: 'compact', label: 'Compact' }]
            : [{ value: 'compact', label: 'Compact' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }],
          currentValue: opts => (opts.cardSize as string) ?? 'compact',
        },
      ]
    case 'cardGrid':
      return [
        {
          key: 'columns', label: 'Columns', rowLabel: 'Count', control: 'segmented',
          options: isProductPage
            ? [{ value: '3', label: '3' }, { value: '4', label: '4' }]
            : [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }],
          currentValue: opts => String(opts.columns ?? 3),
        },
      ]
    case 'mediaText5050':
      return [
        {
          key: 'variant', label: 'Layout', rowLabel: 'Style', control: 'select',
          options: [{ value: 'paragraphs', label: 'Paragraphs' }, { value: 'accordion', label: 'Accordion' }],
          currentValue: opts => (opts.variant as string) ?? 'paragraphs',
        },
        {
          key: 'imagePosition', label: 'Image side', rowLabel: 'Side', control: 'segmented',
          options: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }],
          currentValue: opts => (opts.imagePosition as string) ?? 'right',
        },
      ]
    default:
      return []
  }
}

// ─── DOM helpers ──────────────────────────────────────────────────────────

function findLeafByText(container: HTMLElement, text: string): HTMLElement | null {
  if (!text.trim()) return null
  const t = text.trim()
  const candidates = container.querySelectorAll<HTMLElement>('h1,h2,h3,h4,p,span')
  for (const el of Array.from(candidates)) {
    if (el.contentEditable === 'true') continue
    if (el.querySelector('h1,h2,h3,h4,p,div,ul,ol')) continue
    if (el.textContent?.trim() === t) return el
  }
  return null
}

function makeEditable(
  el: HTMLElement,
  original: string,
  onCommit: (val: string) => void,
  signal: AbortSignal,
) {
  el.contentEditable = 'true'
  el.style.cursor = 'text'

  const onBlur = () => {
    const val = el.textContent?.trim() ?? ''
    if (val !== original.trim()) onCommit(val)
  }
  const onKeyDown = (e: Event) => {
    const ke = e as KeyboardEvent
    if (ke.key === 'Enter' && !ke.shiftKey) { ke.preventDefault(); el.blur() }
    if (ke.key === 'Escape') { el.textContent = original; el.blur() }
  }

  el.addEventListener('blur',    onBlur,    { signal })
  el.addEventListener('keydown', onKeyDown, { signal })
}

// ─── Apply edit affordances (text fields only — image swap lives in panel) ───

function applyBlockAffordances(
  blockEl: HTMLElement,
  section: Section,
  onFieldUpdate: (field: string, value: string) => void,
  onItemFieldUpdate: (itemIndex: number, field: string, value: string) => void,
  signal: AbortSignal,
) {
  const slots = section.contentSlots

  const textFields: Array<{ key: string; val: string | null | undefined }> = [
    { key: 'headline', val: slots.headline },
    { key: 'subhead',  val: slots.subhead },
    { key: 'body',     val: slots.body },
    { key: 'eyebrow',  val: slots.eyebrow },
  ]

  const ctaLabel = typeof slots.cta === 'string' ? slots.cta : slots.cta?.label
  if (ctaLabel) textFields.push({ key: 'ctaLabel', val: ctaLabel })

  for (const { key, val } of textFields) {
    if (!val) continue
    const el = findLeafByText(blockEl, val)
    if (!el) continue
    makeEditable(el, val, (v) => onFieldUpdate(key, v), signal)
  }

  const items = Array.isArray(slots.items) ? slots.items as Record<string, unknown>[] : []
  items.forEach((item, i) => {
    const titleVal = (item.title ?? item.subtitle) as string | undefined
    const bodyVal  = (item.description ?? item.body) as string | undefined
    const titleKey = item.subtitle != null ? 'subtitle' : 'title'
    const bodyKey  = item.body != null ? 'body' : 'description'

    if (titleVal) {
      const el = findLeafByText(blockEl, titleVal)
      if (el) makeEditable(el, titleVal, (v) => onItemFieldUpdate(i, titleKey, v), signal)
    }
    if (bodyVal) {
      const el = findLeafByText(blockEl, bodyVal)
      if (el) makeEditable(el, bodyVal, (v) => onItemFieldUpdate(i, bodyKey, v), signal)
    }
  })
}

// ─── Per-component text field config ─────────────────────────────────────────
// Defines which contentSlots text fields each component exposes in the panel.
// Fields are shown even when null — allowing the user to add or clear them freely.

type TextField = { key: 'headline' | 'subhead' | 'body' | 'eyebrow' | 'cta'; label: string }

const COMPONENT_TEXT_FIELDS: Record<string, TextField[]> = {
  hero: [
    { key: 'eyebrow',  label: 'Eyebrow' },
    { key: 'headline', label: 'Headline' },
    { key: 'subhead',  label: 'Subhead' },
    { key: 'body',     label: 'Body' },
    { key: 'cta',      label: 'CTA label' },
  ],
  mediaTextStacked: [
    { key: 'eyebrow',  label: 'Eyebrow' },
    { key: 'headline', label: 'Headline' },
    { key: 'subhead',  label: 'Subhead' },
    { key: 'body',     label: 'Body' },
    { key: 'cta',      label: 'CTA label' },
  ],
  mediaText5050:       [{ key: 'headline', label: 'Headline' }],
  mediaTextAsymmetric: [{ key: 'headline', label: 'Headline' }],
  cardGrid:            [{ key: 'headline', label: 'Headline' }],
  carousel:            [{ key: 'headline', label: 'Headline' }, { key: 'subhead', label: 'Subhead' }],
  proofPoints:         [{ key: 'headline', label: 'Headline' }],
}

const ITEM_TEXT_FIELDS: Record<string, Array<{ key: string; label: string }>> = {
  cardGrid:            [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description' }],
  carousel:            [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description' }],
  proofPoints:         [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description' }],
  mediaText5050:       [{ key: 'subtitle', label: 'Question' }, { key: 'body', label: 'Answer' }],
  mediaTextAsymmetric: [{ key: 'title', label: 'Question' }, { key: 'body', label: 'Answer' }],
}

// ─── Panel text field ─────────────────────────────────────────────────────────

/** Inline text field used inside a PanelRow — shows value truncated or "Add..." placeholder. */
function PanelTextField({
  value, onChange,
}: {
  value: string | null | undefined
  onChange: (val: string | null) => void
}) {
  const [draft, setDraft] = useState(value ?? '')
  useEffect(() => { setDraft(value ?? '') }, [value])
  const hasValue = !!(value?.trim())

  return (
    <>
      <input
        type="text"
        value={draft}
        placeholder="Add..."
        onChange={e => setDraft(e.target.value)}
        onBlur={() => {
          const next = draft.trim() === '' ? null : draft.trim()
          if (next !== (value ?? null)) onChange(next)
        }}
        onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }}
        className="flex-1 h-8 px-3 bg-gray-100 rounded-lg text-xs font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-primary min-w-0"
      />
      <button
        onClick={() => { if (hasValue) { onChange(null); setDraft('') } }}
        className={[
          'shrink-0 size-8 bg-gray-100 rounded-lg flex items-center justify-center transition-colors cursor-pointer',
          hasValue ? 'text-gray-400 hover:text-red-500' : 'text-gray-300',
        ].join(' ')}
      >
        {hasValue ? <IconTrash /> : <IconPlus />}
      </button>
    </>
  )
}

// ─── Chevron SVGs ────────────────────────────────────────────────────────────

function ChevronUp() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 15 12 9 18 15" />
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function IconChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function IconChevronDown12() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

// ─── Panel icons ─────────────────────────────────────────────────────────────

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function IconChevronSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

// ─── Panel sub-components ────────────────────────────────────────────────────

/** Section with a top divider and section title. */
function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mx-5 h-px bg-gray-100" />
      <p className="px-5 pt-3 pb-2 text-xs font-medium text-gray-900">{title}</p>
      <div className="px-5 pb-4 flex flex-col gap-[9px]">{children}</div>
    </div>
  )
}

/** A single label + control row, 32px tall. */
function PanelRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center h-8">
      <span className="shrink-0 w-[130px] pl-5 text-xs font-medium text-gray-500 truncate">{label}</span>
      <div className="flex flex-1 items-center gap-1.5 min-w-0">{children}</div>
    </div>
  )
}

/** Native select styled as a flat pill. */
function PanelSelect({ value, options, onChange }: {
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (v: string) => void
}) {
  return (
    <div className="relative flex-1 min-w-0">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-8 pl-3 pr-7 bg-gray-100 rounded-lg text-xs font-medium text-gray-900 appearance-none cursor-pointer outline-none focus:ring-1 focus:ring-primary"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <IconChevronSmall />
      </span>
    </div>
  )
}

/** Segmented pill control (e.g. 2 | 3 | 4). */
function PanelSegmented({ value, options, onChange }: {
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-1 h-8 bg-gray-100 rounded-lg p-0.5 gap-px">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={[
            'flex-1 rounded-md text-xs transition-colors cursor-pointer',
            o.value === value
              ? 'bg-white font-semibold text-secondary-text shadow-sm'
              : 'font-medium text-gray-500 hover:text-gray-700',
          ].join(' ')}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ─── Layers panel ────────────────────────────────────────────────────────────

function LayerBlockRow({
  section, locked, expanded, activeLayer, moveButtons, onSelect, onSelectLayer, onMove,
}: {
  section: Section
  locked: boolean
  expanded: boolean
  activeLayer: PanelLayer | null
  moveButtons: MoveButtonsState
  onSelect: () => void
  onSelectLayer: (layer: LayerSelection) => void
  onMove: (dir: 'up' | 'down') => void
}) {
  const subLayers  = expanded ? getSubLayers(section) : []
  const label      = BLOCK_LABELS[section.component] ?? section.component
  const isHero     = section.component === 'hero'
  const hasExpand  = !locked

  if (expanded) {
    return (
      <div className="px-5 py-0.5">
        {/* Outer container — indigo-minimal background wraps header + sub-layers */}
        <div className="rounded-[8px] bg-[#f3f4ff] overflow-hidden">
          {/* Header row — indigo-subtle highlight */}
          <div
            onClick={onSelect}
            className="h-8 flex items-center gap-2 pl-2 pr-2 cursor-pointer select-none rounded-[8px] bg-[#e7e9ff]"
          >
            <span className="shrink-0 w-4 h-4 flex items-center justify-center text-[#4f46e5]">
              <IconChevronDown12 />
            </span>
            <span className="flex-1 text-[12px] font-medium text-[#24262b] truncate">{label}</span>
            {/* Move buttons */}
            {moveButtons && (
              <div className="flex shrink-0" onClick={e => e.stopPropagation()}>
                <button
                  disabled={moveButtons.isFirst}
                  onClick={() => onMove('up')}
                  title="Move up"
                  className="w-5 h-5 flex items-center justify-center text-[#696d76] hover:text-[#24262b] disabled:opacity-30 disabled:cursor-default cursor-pointer"
                ><ChevronUp /></button>
                <button
                  disabled={moveButtons.isLast}
                  onClick={() => onMove('down')}
                  title="Move down"
                  className="w-5 h-5 flex items-center justify-center text-[#696d76] hover:text-[#24262b] disabled:opacity-30 disabled:cursor-default cursor-pointer"
                ><ChevronDown /></button>
              </div>
            )}
          </div>
          {/* Sub-layers */}
          {subLayers.length > 0 && (
            <div className="py-1">
              {subLayers.map((layer, i) => {
                const isActive =
                  (layer.type === 'heading' && activeLayer?.type === 'heading') ||
                  (layer.type === 'media'   && activeLayer?.type === 'media')   ||
                  (layer.type === 'item'    && activeLayer?.type === 'item' && layer.itemIndex === activeLayer.itemIndex)
                return (
                  <div
                    key={i}
                    onClick={() => onSelectLayer({ sectionName: section.sectionName, layerType: layer.type, itemIndex: layer.itemIndex })}
                    className={[
                      'h-[30px] flex items-center text-[12px] font-medium cursor-pointer select-none',
                      'mx-1 rounded-[6px] pl-10 pr-3',
                      isActive
                        ? 'bg-[#e7e9ff] text-[#24262b]'
                        : 'text-[#696d76] hover:bg-[#e7e9ff]/60',
                    ].join(' ')}
                  >
                    {layer.label}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Collapsed ─────────────────────────────────────────────────────────────
  return (
    <div className="px-5 py-0.5">
      <div
        onClick={onSelect}
        className="h-8 flex items-center gap-2 cursor-pointer select-none rounded-[8px] hover:bg-[#f5f5f6] group"
        style={{ paddingLeft: isHero ? 12 : 8, paddingRight: 8 }}
      >
        {/* Chevron / indent slot */}
        {!isHero && (
          <span className="shrink-0 w-4 h-4 flex items-center justify-center text-[#a5a8ad] group-hover:text-[#696d76]">
            {hasExpand ? <IconChevronRight /> : null}
          </span>
        )}
        <span className="flex-1 text-[12px] font-medium text-[#24262b] truncate">{label}</span>
        {locked && (
          <span className="shrink-0 text-[#a5a8ad]"><IconLock /></span>
        )}
      </div>
    </div>
  )
}

function LayersPanel({
  pageName, sections, expandedSectionName, activeLayer, moveButtons,
  onSelectBlock, onSelectLayer, onMove,
}: {
  pageName: string
  sections: Section[]
  expandedSectionName: string | null
  activeLayer: PanelLayer | null
  moveButtons: MoveButtonsState
  onSelectBlock: (sectionName: string) => void
  onSelectLayer: (layer: LayerSelection) => void
  onMove: (dir: 'up' | 'down') => void
}) {
  const sorted         = [...sections].sort((a, b) => a.order - b.order)
  const setupSections  = sorted.filter(s => s.component === 'hero')
  const engageSections = sorted.filter(s => s.component !== 'hero' && s.narrativeRole !== 'resolve')
  const resolveSections= sorted.filter(s => s.narrativeRole === 'resolve')

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 shrink-0">
        <p className="text-[17px] font-bold tracking-[-0.34px] text-[#24262b] leading-snug">{pageName}</p>
      </div>
      <div className="h-px bg-[#ebebeb] mx-5 shrink-0" />

      {/* Layer list */}
      <div className="flex-1 overflow-y-auto studio-scrollbar py-2">

        {/* ── Setup (Hero — locked) ───────────────────────────────────────── */}
        {setupSections.map(s => (
          <LayerBlockRow
            key={s.sectionName} section={s} locked
            expanded={expandedSectionName === s.sectionName}
            activeLayer={expandedSectionName === s.sectionName ? activeLayer : null}
            moveButtons={null}
            onSelect={() => onSelectBlock(s.sectionName)}
            onSelectLayer={onSelectLayer} onMove={onMove}
          />
        ))}

        {/* Section divider */}
        {setupSections.length > 0 && engageSections.length > 0 && (
          <div className="h-px bg-[#ebebeb] mx-5 my-3" />
        )}

        {/* ── Engage (moveable) ──────────────────────────────────────────── */}
        {engageSections.map(s => (
          <LayerBlockRow
            key={s.sectionName} section={s} locked={false}
            expanded={expandedSectionName === s.sectionName}
            activeLayer={expandedSectionName === s.sectionName ? activeLayer : null}
            moveButtons={expandedSectionName === s.sectionName ? moveButtons : null}
            onSelect={() => onSelectBlock(s.sectionName)}
            onSelectLayer={onSelectLayer} onMove={onMove}
          />
        ))}

        {/* Add… row */}
        <div className="px-5 py-0.5">
          <div className="h-8 flex items-center gap-2 pl-2 pr-2 rounded-[8px] bg-[#f5f5f6] cursor-pointer select-none hover:bg-[#ebebeb] group">
            <span className="shrink-0 w-4 h-4 flex items-center justify-center text-[#a5a8ad] group-hover:text-[#696d76]">
              {/* empty slot — mirrors chevron indent */}
            </span>
            <span className="flex-1 text-[12px] font-medium text-[#a5a8ad] group-hover:text-[#696d76]">Add...</span>
            <span className="shrink-0 text-[#a5a8ad] group-hover:text-[#696d76]"><IconPlus /></span>
          </div>
        </div>

        {/* Section divider */}
        {engageSections.length > 0 && resolveSections.length > 0 && (
          <div className="h-px bg-[#ebebeb] mx-5 my-3" />
        )}

        {/* ── Resolve (locked) ───────────────────────────────────────────── */}
        {resolveSections.map(s => (
          <LayerBlockRow
            key={s.sectionName} section={s} locked
            expanded={expandedSectionName === s.sectionName}
            activeLayer={expandedSectionName === s.sectionName ? activeLayer : null}
            moveButtons={null}
            onSelect={() => onSelectBlock(s.sectionName)}
            onSelectLayer={onSelectLayer} onMove={onMove}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function EditablePreview({ brief, imageUrls, videoUrls, onBriefUpdate, scale = 1 }: EditablePreviewProps) {
  const wrapperRef         = useRef<HTMLDivElement>(null)
  const containerRef       = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const panelRef       = useRef<HTMLDivElement>(null)
  const layersPanelRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController>(new AbortController())
  const hoverRingRef       = useRef<HTMLDivElement>(null)
  const blockHoverRingRef  = useRef<HTMLDivElement>(null)
  const selectionRingRef   = useRef<HTMLDivElement>(null)
  const selectedElRef      = useRef<HTMLElement | null>(null)
  const hoverElRef         = useRef<HTMLElement | null>(null)
  const hideHoverTimer     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const selectedSectionNameRef = useRef<string | null>(null)
  const selectedElTypeRef      = useRef<ElType>('block')
  const pendingCenterSectionRef   = useRef<string | null>(null)
  const isProgrammaticScrollRef   = useRef(false)
  const programmaticScrollTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  /** Live snapshot of block DOM elements, updated at the start of every interaction effect. */
  const blockElsRef = useRef<HTMLElement[]>([])

  // Canvas bounding rect — drives fixed overlay positions
  const [canvasPos, setCanvasPos] = useState<{ left: number; right: number } | null>(null)
  // Top position for fixed overlays — set when a block is centered
  const [panelTop, setPanelTop] = useState<number>(0)

  const [moveButtons,  setMoveButtons]  = useState<MoveButtonsState>(null)
  const [focusedBlock, setFocusedBlock] = useState<FocusedBlockState>(null)
  const [panelLayer,   setPanelLayer]   = useState<PanelLayer>({ type: 'block' })

  const blocks = useMemo(
    () => briefToBlocks(brief, imageUrls, videoUrls),
    [brief, imageUrls, videoUrls],
  )

  const sections = useMemo(
    () => [...brief.sections].sort((a, b) => a.order - b.order),
    [brief],
  )

  const update = useCallback((updatedBrief: PageBrief) => {
    onBriefUpdate(updatedBrief)
  }, [onBriefUpdate])

  // ── Derived panel data ────────────────────────────────────────────────────

  const focusedSection = focusedBlock ? sections[focusedBlock.sectionIdx] : null
  // Show panel for every selected block (all blocks get at least title + image picker if applicable).
  const showPanel      = !!focusedSection

  const currentEmphasis = focusedSection?.blockOptions?.emphasis ?? 'ghost'


  // ── Scroll so block TOP aligns with panel top ────────────────────────────
  // Uses the same offsetTop traversal as ring-positioning (pre-zoom natural units,
  // then × scale for visual pixels) so the result is immune to scroll state,
  // CSS zoom quirks, and getBoundingClientRect timing issues.
  //
  // Layout:  scrollEl  ›  [flex + paddingTop:50vh]  ›  wrapperRef (relative)
  //                                                      ›  [zoom:scale div]
  //                                                           ›  blockEl
  //
  // isProgrammaticScrollRef stays true until scrollend fires (or 2 s fallback)
  // so the scroll-deselect listener never fires during a long smooth scroll.

  const centerBlock = useCallback((blockEl: HTMLElement) => {
    const scrollEl = scrollContainerRef.current
    const wrapper  = wrapperRef.current
    if (!scrollEl || !wrapper) return

    // Walk blockEl → wrapperRef (pre-zoom natural px, mirrors ring logic)
    let blockNatural = 0
    let curr: HTMLElement | null = blockEl
    while (curr && curr !== wrapper) {
      blockNatural += curr.offsetTop
      curr = curr.offsetParent as HTMLElement | null
    }
    const blockVisual = blockNatural * scale  // apply zoom → visual px

    // Walk wrapperRef → scrollEl (real px, includes the 50vh flex padding)
    let wrapperOffset = 0
    curr = wrapper
    while (curr && curr !== scrollEl) {
      wrapperOffset += curr.offsetTop
      curr = curr.offsetParent as HTMLElement | null
    }

    const targetScrollTop = Math.max(0, wrapperOffset + blockVisual - 8)

    // Mark programmatic scroll — kept true until scroll actually ends
    if (programmaticScrollTimer.current) clearTimeout(programmaticScrollTimer.current)
    isProgrammaticScrollRef.current = true

    const clearFlag = () => {
      isProgrammaticScrollRef.current = false
      if (programmaticScrollTimer.current) {
        clearTimeout(programmaticScrollTimer.current)
        programmaticScrollTimer.current = null
      }
    }

    // scrollend fires when smooth scroll is truly finished (Chrome 114+, FF 109+)
    scrollEl.addEventListener('scrollend', clearFlag, { once: true })
    // 2 s fallback for older browsers / instant scroll
    programmaticScrollTimer.current = setTimeout(() => {
      scrollEl.removeEventListener('scrollend', clearFlag)
      isProgrammaticScrollRef.current = false
    }, 2000)

    scrollEl.scrollTo({ top: targetScrollTop, behavior: 'smooth' })
  }, [scale])

  // ── Re-center after block reorder ────────────────────────────────────────
  useEffect(() => {
    const sectionName = pendingCenterSectionRef.current
    if (!sectionName) return
    pendingCenterSectionRef.current = null

    const container = containerRef.current
    if (!container) return
    const blockStack = container.querySelector('.block-stack')
    if (!blockStack) return
    const blockEls = Array.from(blockStack.children) as HTMLElement[]
    const idx = blocks.findIndex(b => b._key.includes(`-${sectionName}-`))
    const blockEl = idx !== -1 ? blockEls[idx] : null
    if (blockEl) centerBlock(blockEl)
  }, [blocks, centerBlock])

  // ── Move block up / down ──────────────────────────────────────────────────

  const handleMove = useCallback((direction: 'up' | 'down') => {
    const sectionName = selectedSectionNameRef.current
    if (!sectionName) return

    const draggableList = sections.filter(isDraggableSection)
    const idx = draggableList.findIndex(s => s.sectionName === sectionName)
    if (idx === -1) return

    const target = direction === 'up' ? idx - 1 : idx + 1
    if (target < 0 || target >= draggableList.length) return

    const reordered = [...draggableList]
    const [moved] = reordered.splice(idx, 1)
    reordered.splice(target, 0, moved)

    const allNonResolve = [...sections]
      .sort((a, b) => a.order - b.order)
      .filter(s => s.narrativeRole !== 'resolve')
    let di = 0
    const newOrder = allNonResolve.map(s =>
      isDraggableSection(s) ? reordered[di++].sectionName : s.sectionName
    )

    pendingCenterSectionRef.current = sectionName
    update(reorderSections(brief, newOrder))
  }, [sections, brief, update])

  // ── Emphasis update ───────────────────────────────────────────────────────

  const handleEmphasis = useCallback((sectionName: string, emphasis: string) => {
    update({
      ...brief,
      sections: brief.sections.map(s =>
        s.sectionName === sectionName
          ? { ...s, blockOptions: { ...(s.blockOptions ?? {}), emphasis: emphasis as never } }
          : s
      ),
    })
  }, [brief, update])

  // ── Variant update ────────────────────────────────────────────────────────

  const handleVariantUpdate = useCallback((sectionName: string, key: string, value: string) => {
    update({
      ...brief,
      sections: brief.sections.map(s =>
        s.sectionName === sectionName
          ? { ...s, blockOptions: { ...(s.blockOptions ?? {}), [key]: key === 'columns' ? Number(value) : value } }
          : s
      ),
    })
  }, [brief, update])

  // ── Swap block component ──────────────────────────────────────────────────

  const handleSwapComponent = useCallback((sectionName: string, newComponent: string) => {
    update(swapComponent(brief, sectionName, newComponent))
  }, [brief, update])

  // ── Compute move button state ─────────────────────────────────────────────

  const computeMoveButtons = useCallback((sectionName: string): MoveButtonsState => {
    const draggableList = sections.filter(isDraggableSection)
    const idx = draggableList.findIndex(s => s.sectionName === sectionName)
    if (idx === -1) return null
    return { isFirst: idx === 0, isLast: idx === draggableList.length - 1 }
  }, [sections])

  // ── Select a block imperatively (used by the layers panel) ────────────────

  const selectBlockOnCanvas = useCallback((sectionName: string) => {
    const sIdx = sections.findIndex(s => s.sectionName === sectionName)
    if (sIdx === -1) return

    // ── Always update React state first so panel + layer expansion respond ──
    selectedSectionNameRef.current = sectionName
    selectedElTypeRef.current      = 'block'
    setFocusedBlock({ sectionIdx: sIdx, sectionName })
    setMoveButtons(computeMoveButtons(sectionName))
    setPanelLayer({ type: 'block' })

    // ── DOM: ring + dim (best-effort; fall back to live query if ref stale) ──
    const wrapper        = wrapperRef.current
    const selRing        = selectionRingRef.current
    const hoverRing      = hoverRingRef.current
    const blockHoverRing = blockHoverRingRef.current
    const container      = containerRef.current
    if (!wrapper || !selRing || !hoverRing || !blockHoverRing || !container) return

    // Use cached ref if populated; otherwise query live DOM
    const blockEls: HTMLElement[] = blockElsRef.current.length > 0
      ? blockElsRef.current
      : (() => {
          const bs = container.querySelector('.block-stack')
          const els = bs ? Array.from(bs.children) as HTMLElement[] : []
          blockElsRef.current = els
          return els
        })()

    const blockEl = blockEls[sIdx] ?? null
    if (!blockEl) return

    // Position selection ring
    let top = 0, left = 0
    let curr: HTMLElement | null = blockEl
    while (curr && curr !== wrapper) {
      top  += curr.offsetTop
      left += curr.offsetLeft
      curr  = curr.offsetParent as HTMLElement | null
    }
    selRing.style.top          = `${Math.round(top  * scale)}px`
    selRing.style.left         = `${Math.round(left * scale)}px`
    selRing.style.width        = `${Math.round(blockEl.offsetWidth  * scale)}px`
    selRing.style.height       = `${Math.round(blockEl.offsetHeight * scale)}px`
    selRing.style.outlineColor = RING.block.sel
    selRing.style.opacity      = '1'

    hoverRing.style.opacity      = '0'
    blockHoverRing.style.opacity = '0'

    blockEls.forEach(b => b.removeAttribute('data-selected'))
    blockEl.dataset.selected   = 'true'
    wrapper.dataset.hasSelection = 'true'
    selectedElRef.current = blockEl

    centerBlock(blockEl)
  }, [sections, scale, computeMoveButtons, centerBlock])

  // ── Layer selection (sub-layer within expanded block) ─────────────────────
  const handleLayerSelect = useCallback((layer: LayerSelection) => {
    // Ensure the parent block is selected (ring + dim + panel visible)
    selectBlockOnCanvas(layer.sectionName)
    // Then switch to the correct panel view
    if (layer.layerType === 'heading') {
      setPanelLayer({ type: 'heading' })
    } else if (layer.layerType === 'media') {
      setPanelLayer({ type: 'media' })
    } else if (layer.layerType === 'item' && layer.itemIndex !== undefined) {
      setPanelLayer({ type: 'item', itemIndex: layer.itemIndex })
    }
  }, [selectBlockOnCanvas])

  // ── Track canvas position + panel top for fixed overlays ────────────────
  // panelTop = scrollContainer.top + 8px — measured from DOM so it stays
  // correct regardless of header/toolbar height changes or window resize.

  useEffect(() => {
    const update = () => {
      const el       = wrapperRef.current
      const scrollEl = scrollContainerRef.current
      if (!el || !scrollEl) return
      const r  = el.getBoundingClientRect()
      const sr = scrollEl.getBoundingClientRect()
      setCanvasPos({ left: r.left, right: r.right })
      setPanelTop(sr.top + 8)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // ── Main interactions effect ──────────────────────────────────────────────

  useEffect(() => {
    const wrapper        = wrapperRef.current
    const container      = containerRef.current
    const hoverRing      = hoverRingRef.current
    const blockHoverRing = blockHoverRingRef.current
    const selRing        = selectionRingRef.current
    if (!wrapper || !container || !hoverRing || !blockHoverRing || !selRing) return

    const active = document.activeElement as HTMLElement | null
    if (container.contains(active) && active?.contentEditable === 'true') return

    abortRef.current.abort()
    abortRef.current = new AbortController()
    const { signal } = abortRef.current

    const blockStack = container.querySelector('.block-stack')
    const blockEls   = blockStack ? Array.from(blockStack.children) as HTMLElement[] : []
    blockElsRef.current = blockEls

    // ── Ring helpers ──────────────────────────────────────────────────────

    const getElType = (el: HTMLElement): ElType => {
      if (el.tagName === 'IMG') return 'image'
      if (el.contentEditable === 'true') return 'text'
      return 'block'
    }

    const positionRing = (ring: HTMLDivElement, el: HTMLElement, color: string, expand = 0) => {
      let top = 0, left = 0
      let curr: HTMLElement | null = el
      while (curr && curr !== wrapper) {
        top  += curr.offsetTop
        left += curr.offsetLeft
        curr  = curr.offsetParent as HTMLElement | null
      }
      ring.style.top         = `${Math.round(top  * scale) - expand}px`
      ring.style.left        = `${Math.round(left * scale) - expand}px`
      ring.style.width       = `${Math.round(el.offsetWidth  * scale) + expand * 2}px`
      ring.style.height      = `${Math.round(el.offsetHeight * scale) + expand * 2}px`
      ring.style.outlineColor = color
      ring.style.opacity     = '1'
    }

    const hideHoverRing = () => {
      hoverRing.style.opacity      = '0'
      blockHoverRing.style.opacity = '0'
      hoverElRef.current = null
    }

    const applyBlockDim = (selectedEl: HTMLElement) => {
      blockEls.forEach(b => b.removeAttribute('data-selected'))
      selectedEl.dataset.selected = 'true'
      wrapper.dataset.hasSelection = 'true'
    }

    const removeBlockDim = () => {
      blockEls.forEach(b => b.removeAttribute('data-selected'))
      wrapper.removeAttribute('data-has-selection')
    }

    const hideSelectionRing = () => {
      selRing.style.opacity = '0'
      selectedElRef.current = null
      selectedSectionNameRef.current = null
      setMoveButtons(null)
      setFocusedBlock(null)
      setPanelLayer({ type: 'block' })
      removeBlockDim()
    }

    // Re-sync ring + panel after blocks re-render (e.g. after a move / emphasis change)
    const prevSectionName = selectedSectionNameRef.current
    if (prevSectionName) {
      const sIdx    = sections.findIndex(s => s.sectionName === prevSectionName)
      const blockEl = sIdx !== -1 ? blockEls[sIdx] : null
      if (blockEl) {
        positionRing(selRing, blockEl, RING[selectedElTypeRef.current].sel)
        selectedElRef.current = blockEl
        setMoveButtons(computeMoveButtons(prevSectionName))
        setFocusedBlock({ sectionIdx: sIdx, sectionName: prevSectionName })
        applyBlockDim(blockEl)
      } else {
        hideSelectionRing()
      }
    }

    // ── Priority-based target resolution ───────────────────────────────────
    // Walk up from click target looking for large images — DS components often set
    // pointer-events:none on <img>, so e.target lands on a parent element.

    const findInteractiveEl = (target: HTMLElement): HTMLElement | null => {
      let el: HTMLElement | null = target
      while (el && el !== container) {
        if (el.tagName === 'IMG') {
          const r = el.getBoundingClientRect()
          if (r.width > 64 || r.height > 64) return el
        }
        if (el.contentEditable === 'true') return el
        el = el.parentElement
      }
      return blockEls.find(b => b === target || b.contains(target)) ?? null
    }

    // ── Hover ring ────────────────────────────────────────────────────────

    container.addEventListener('mouseover', (e: Event) => {
      const target = e.target as HTMLElement
      if (hideHoverTimer.current) { clearTimeout(hideHoverTimer.current); hideHoverTimer.current = null }

      const el = findInteractiveEl(target)
      if (el) {
        hoverElRef.current = el
        if (el === selectedElRef.current) {
          hideHoverRing()
          return
        }

        const type = getElType(el)
        positionRing(hoverRing, el, RING[type].hover)

        if (type === 'image') {
          const parentBlock = blockEls.find(b => b.contains(el))
          if (parentBlock && parentBlock !== el) {
            positionRing(blockHoverRing, parentBlock, RING.block.parent)
          } else {
            blockHoverRing.style.opacity = '0'
          }
        } else {
          blockHoverRing.style.opacity = '0'
        }
      } else {
        hideHoverTimer.current = setTimeout(hideHoverRing, 60)
      }
    }, { signal })

    container.addEventListener('mouseleave', () => {
      hideHoverTimer.current = setTimeout(hideHoverRing, 60)
    }, { signal })

    // ── Click → selection ring + panel ───────────────────────────────────

    container.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement
      const el = findInteractiveEl(target)
      if (!el) return

      const clickedType = getElType(el)
      selectedElRef.current    = el
      selectedElTypeRef.current = clickedType
      positionRing(selRing, el, RING[clickedType].sel)
      hideHoverRing()

      // Find the parent block element for any click target
      const parentBlock = blockEls.find(b => b === el || b.contains(el))

      // Image click → show image picker in panel
      if (el.tagName === 'IMG') {
        if (parentBlock) {
          const parentIdx = blockEls.indexOf(parentBlock)
          if (parentIdx !== -1 && sections[parentIdx] && IMAGE_BLOCKS.has(sections[parentIdx].component)) {
            const sectionName = sections[parentIdx].sectionName
            selectedSectionNameRef.current = sectionName
            setFocusedBlock({ sectionIdx: parentIdx, sectionName })
            setPanelLayer({ type: 'media' })
            setMoveButtons(null)
            applyBlockDim(parentBlock)
            centerBlock(parentBlock)
            return
          }
        }
        return
      }

      // Block click → block panel
      if (parentBlock) {
        const blockIdx  = blockEls.indexOf(parentBlock)
        const sectionName = sections[blockIdx]?.sectionName
        if (sectionName) {
          selectedSectionNameRef.current = sectionName
          setMoveButtons(computeMoveButtons(sectionName))
          setFocusedBlock({ sectionIdx: blockIdx, sectionName })
          applyBlockDim(parentBlock)
          centerBlock(parentBlock)
          return
        }
      }

      selectedSectionNameRef.current = null
      setMoveButtons(null)
      setFocusedBlock(null)
      removeBlockDim()
    }, { signal })

    // ── Deselect on outside click ─────────────────────────────────────────
    // Use mousedown so the check fires before React processes the click,
    // eliminating any race between the deselect and selectBlockOnCanvas.

    document.addEventListener('mousedown', (e: Event) => {
      const t = e.target as Node
      if (
        !wrapperRef.current?.contains(t) &&
        !panelRef.current?.contains(t) &&
        !layersPanelRef.current?.contains(t)
      ) {
        hideSelectionRing()
      }
    }, { signal })

    // ── Escape ────────────────────────────────────────────────────────────

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hideSelectionRing()
        hideHoverRing()
        const focused = document.activeElement as HTMLElement | null
        if (focused?.contentEditable === 'true') focused.blur()
      }
    }, { signal })

    // ── Deselect on user scroll ───────────────────────────────────────

    scrollContainerRef.current?.addEventListener('scroll', () => {
      if (isProgrammaticScrollRef.current) return
      if (!selectedElRef.current) return
      hideSelectionRing()
      hideHoverRing()
    }, { signal, passive: true })

    // ── Edit affordances ──────────────────────────────────────────────────

    sections.forEach((section, i) => {
      const blockEl = blockEls[i]
      if (!blockEl) return

      applyBlockAffordances(
        blockEl,
        section,
        (field, value) => {
          if (field === 'ctaLabel') {
            update(updateCtaLabel(brief, section.sectionName, value))
          } else {
            update(updateField(brief, section.sectionName, field as 'headline'|'body'|'subhead'|'eyebrow', value))
          }
        },
        (itemIndex, field, value) => {
          update(updateItemField(brief, section.sectionName, itemIndex, field, value))
        },
        signal,
      )
    })

    return () => {
      abortRef.current.abort()
      if (hideHoverTimer.current) { clearTimeout(hideHoverTimer.current); hideHoverTimer.current = null }
      hoverRing.style.opacity      = '0'
      blockHoverRing.style.opacity = '0'
      selRing.style.opacity        = '0'
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks])

  // ─── Render ────────────────────────────────────────────────────────────────

  const selected = !!focusedBlock

  return (
    // Root — relative so fixed children are visually contained within the canvas area
    <div className="flex-1 min-h-0 relative overflow-hidden">

      {/* ── Scrollable canvas ──────────────────────────────────────────────── */}
      <div ref={scrollContainerRef} className="absolute inset-0 overflow-y-auto">
        <div className="flex justify-center items-start" style={{ paddingTop: '50vh', paddingBottom: '50vh' }}>
          <div ref={wrapperRef} className="p2c-editor-canvas relative">

            {/* 1440px page at zoom scale */}
            <div style={{ width: 1440, background: '#fff', overflow: 'hidden', ...(scale !== 1 ? { zoom: scale } : {}) }}>
              <ContentDsProvider>
                <div ref={containerRef}>
                  <BlockRenderer blocks={blocks} />
                </div>
              </ContentDsProvider>
            </div>

            {/* Rings — absolute inside wrapperRef */}
            <div ref={blockHoverRingRef} style={{ position:'absolute', pointerEvents:'none', zIndex:9996, outline:'2px solid transparent', outlineOffset:'-1px', opacity:0, transition:'opacity 0.2s ease', top:0, left:0 }} />
            <div ref={hoverRingRef}      style={{ position:'absolute', pointerEvents:'none', zIndex:9998, outline:'2px solid transparent', outlineOffset:'-1px', opacity:0, transition:'opacity 0.2s ease', top:0, left:0 }} />
            <div ref={selectionRingRef}  style={{ position:'absolute', pointerEvents:'none', zIndex:9999, outline:'2px solid transparent', outlineOffset:'-1px', opacity:0, transition:'opacity 0.25s ease', top:0, left:0 }} />
          </div>
        </div>
      </div>

      {/* ── Layers panel — fixed left of canvas, always visible ───────────── */}
      {canvasPos && panelTop > 0 && (
        <div
          ref={layersPanelRef}
          style={{
            position: 'fixed',
            top: panelTop,
            left: Math.max(0, canvasPos.left - 328),
            width: 320,
            height: `calc(100vh - ${panelTop + 8}px)`,
            zIndex: 100,
          }}
          className="rounded-xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <LayersPanel
            pageName={brief.meta.pageName}
            sections={sections}
            expandedSectionName={focusedBlock?.sectionName ?? null}
            activeLayer={panelLayer}
            moveButtons={moveButtons}
            onSelectBlock={selectBlockOnCanvas}
            onSelectLayer={handleLayerSelect}
            onMove={handleMove}
          />
        </div>
      )}

      {/* ── Editor panel overlay — fixed right of canvas ───────────────────── */}
      {canvasPos && panelTop > 0 && (
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            top: panelTop,
            left: canvasPos.right + 8,
            width: PANEL_WIDTH,
            maxHeight: `calc(100vh - ${panelTop + 8}px)`,
            overflowY: 'auto',
            opacity: selected ? 1 : 0,
            pointerEvents: selected ? 'auto' : 'none',
            transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 100,
          }}
          className="bg-white rounded-xl font-sans studio-scrollbar"
          onClick={e => e.stopPropagation()}
        >
          {showPanel && focusedSection && (
            <>
              {/* Header */}
              <div className="px-5 pt-5 pb-4">
                <p className="text-[17px] font-bold tracking-tight text-gray-900 leading-snug">
                  {panelLayer.type === 'heading' ? 'Heading'
                    : panelLayer.type === 'media' ? 'Media'
                    : panelLayer.type === 'item' ? `${LAYER_ITEM_LABEL[focusedSection.component] ?? 'Item'} ${panelLayer.itemIndex + 1}`
                    : (BLOCK_LABELS[focusedSection.component] ?? focusedSection.component)}
                </p>
              </div>

              {/* ── BLOCK layer ─────────────────────────────────────────────── */}
              {panelLayer.type === 'block' && (
                <>
                  {/* Block type */}
                  {CHANGE_BLOCK_COMPONENTS.includes(focusedSection.component) && (
                    <PanelSection title="Block">
                      <PanelRow label="Type">
                        <PanelSelect
                          value={focusedSection.component}
                          options={CHANGE_BLOCK_COMPONENTS.map(c => ({ value: c, label: BLOCK_LABELS[c] ?? c }))}
                          onChange={v => handleSwapComponent(focusedSection.sectionName, v)}
                        />
                      </PanelRow>
                    </PanelSection>
                  )}

                  {/* Emphasis */}
                  {PANEL_BLOCKS.has(focusedSection.component) && (
                    <PanelSection title="Emphasis">
                      <PanelRow label="Type">
                        <PanelSelect
                          value={currentEmphasis}
                          options={EMPHASIS_OPTIONS}
                          onChange={v => handleEmphasis(focusedSection.sectionName, v)}
                        />
                      </PanelRow>
                    </PanelSection>
                  )}

                  {/* Variant controls */}
                  {getVariantConfigs(focusedSection.component, brief.meta.template).map(config => {
                    const currentVal = config.currentValue(focusedSection.blockOptions ?? {})
                    return (
                      <PanelSection key={config.key} title={config.label}>
                        <PanelRow label={config.rowLabel}>
                          {config.control === 'segmented'
                            ? <PanelSegmented value={currentVal} options={config.options} onChange={v => handleVariantUpdate(focusedSection.sectionName, config.key, v)} />
                            : <PanelSelect    value={currentVal} options={config.options} onChange={v => handleVariantUpdate(focusedSection.sectionName, config.key, v)} />
                          }
                        </PanelRow>
                      </PanelSection>
                    )
                  })}

                  {/* Items list — management (add / remove) */}
                  {ITEM_BLOCKS.has(focusedSection.component) && (() => {
                    const items = Array.isArray(focusedSection.contentSlots.items)
                      ? focusedSection.contentSlots.items as Record<string, unknown>[] : []
                    const itemLabel = ITEM_LABEL[focusedSection.component] ?? 'item'
                    const sectionTitle = itemLabel.charAt(0).toUpperCase() + itemLabel.slice(1) + 's'
                    return (
                      <PanelSection title={sectionTitle}>
                        {items.map((item, i) => {
                          const title = String(item.title ?? item.subtitle ?? item.description ?? `${itemLabel} ${i + 1}`)
                          const rowLabel = `${itemLabel.charAt(0).toUpperCase() + itemLabel.slice(1)} ${i + 1}`
                          return (
                            <PanelRow key={i} label={rowLabel}>
                              <span className="flex-1 h-8 px-3 bg-gray-100 rounded-lg flex items-center text-xs font-medium text-gray-900 truncate min-w-0">
                                {title}
                              </span>
                              <button
                                onClick={() => update(removeItem(brief, focusedSection.sectionName, i))}
                                className="shrink-0 size-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                              >
                                <IconTrash />
                              </button>
                            </PanelRow>
                          )
                        })}
                        <PanelRow label="">
                          <button
                            onClick={() => update(addItem(brief, focusedSection.sectionName))}
                            className="flex-1 h-8 bg-gray-100 rounded-lg flex items-center px-3 gap-2 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                          >
                            <span className="flex-1 text-left">Add...</span>
                            <IconPlus />
                          </button>
                        </PanelRow>
                      </PanelSection>
                    )
                  })()}
                </>
              )}

              {/* ── HEADING layer ───────────────────────────────────────────── */}
              {panelLayer.type === 'heading' && (() => {
                const textFields = COMPONENT_TEXT_FIELDS[focusedSection.component]
                const slots = focusedSection.contentSlots
                const ctaLabel = typeof slots.cta === 'string' ? slots.cta : (slots.cta?.label ?? null)
                if (!textFields?.length) {
                  return (
                    <div className="px-5 pb-5 text-xs text-gray-400">No text fields for this block type.</div>
                  )
                }
                return (
                  <PanelSection title="Text">
                    {textFields.map(({ key, label }) => {
                      const val = key === 'cta' ? ctaLabel : (slots[key as keyof typeof slots] as string | null | undefined ?? null)
                      return (
                        <PanelRow key={key} label={label}>
                          <PanelTextField
                            value={val}
                            onChange={v => {
                              if (key === 'cta') {
                                update(updateCtaLabel(brief, focusedSection.sectionName, v))
                              } else {
                                update(updateField(brief, focusedSection.sectionName, key as 'headline' | 'subhead' | 'body' | 'eyebrow', v))
                              }
                            }}
                          />
                        </PanelRow>
                      )
                    })}
                  </PanelSection>
                )
              })()}

              {/* ── MEDIA layer ─────────────────────────────────────────────── */}
              {panelLayer.type === 'media' && (
                <PanelSection title="Image">
                  {imageUrls.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1.5">
                      {imageUrls.map((url, i) => (
                        <button key={i}
                          onClick={e => { e.stopPropagation(); update(pinImage(brief, focusedSection.sectionName, url)); setPanelLayer({ type: 'block' }) }}
                          className="p-0 border-2 border-transparent rounded hover:border-primary overflow-hidden aspect-square bg-transparent cursor-pointer transition-colors">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="w-full h-full object-cover block" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">No images available.</p>
                  )}
                </PanelSection>
              )}

              {/* ── ITEM layer ──────────────────────────────────────────────── */}
              {panelLayer.type === 'item' && (() => {
                const items = Array.isArray(focusedSection.contentSlots.items)
                  ? focusedSection.contentSlots.items as Record<string, unknown>[] : []
                const item = items[panelLayer.itemIndex]
                const fields = ITEM_TEXT_FIELDS[focusedSection.component] ?? []
                if (!item) return <div className="px-5 pb-5 text-xs text-gray-400">Item not found.</div>
                return (
                  <PanelSection title="Content">
                    {fields.map(({ key, label }) => (
                      <PanelRow key={key} label={label}>
                        <PanelTextField
                          value={(item[key] as string | null | undefined) ?? null}
                          onChange={v => update(updateItemField(brief, focusedSection.sectionName, panelLayer.itemIndex, key, v ?? ''))}
                        />
                      </PanelRow>
                    ))}
                  </PanelSection>
                )
              })()}
            </>
          )}
        </div>
      )}
    </div>
  )
}
