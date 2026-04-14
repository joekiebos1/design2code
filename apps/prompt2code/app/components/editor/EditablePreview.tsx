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
  pinImage,
  reorderSections,
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
  top: number
  left: number
  width: number
  height: number
  isFirst: boolean
  isLast: boolean
} | null

type FocusedBlockState = {
  sectionIdx: number
  sectionName: string
} | null

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

// ─── Variant config ───────────────────────────────────────────────────────────

type VariantConfig = {
  key: string
  label: string
  options: Array<{ value: string; label: string }>
  currentValue: (opts: BlockOptions) => string
}

function getVariantConfigs(component: string): VariantConfig[] {
  switch (component) {
    case 'mediaTextStacked':
      return [
        {
          key: 'template', label: 'Template',
          options: [{ value: 'stacked', label: 'Stacked' }, { value: 'textOnly', label: 'Text only' }, { value: 'overlay', label: 'Overlay' }],
          currentValue: opts => (opts.template as string) ?? 'stacked',
        },
        {
          key: 'alignment', label: 'Align',
          options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }],
          currentValue: opts => (opts.alignment as string) ?? 'left',
        },
      ]
    case 'carousel':
      return [
        {
          key: 'cardSize', label: 'Card size',
          options: [{ value: 'compact', label: 'Compact' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }],
          currentValue: opts => (opts.cardSize as string) ?? 'compact',
        },
      ]
    case 'cardGrid':
      return [
        {
          key: 'columns', label: 'Columns',
          options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }],
          currentValue: opts => String(opts.columns ?? 3),
        },
      ]
    case 'mediaText5050':
      return [
        {
          key: 'variant', label: 'Layout',
          options: [{ value: 'paragraphs', label: 'Paragraphs' }, { value: 'accordion', label: 'Accordion' }],
          currentValue: opts => (opts.variant as string) ?? 'paragraphs',
        },
        {
          key: 'imagePosition', label: 'Image side',
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

// ─── Panel sub-components ────────────────────────────────────────────────────

function PanelSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-t border-gray-200">
      {title && (
        <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-2">
          {title}
        </p>
      )}
      {children}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function EditablePreview({ brief, imageUrls, videoUrls, onBriefUpdate, scale = 1 }: EditablePreviewProps) {
  const wrapperRef       = useRef<HTMLDivElement>(null)
  const containerRef     = useRef<HTMLDivElement>(null)
  const abortRef         = useRef<AbortController>(new AbortController())
  const hoverRingRef     = useRef<HTMLDivElement>(null)
  const selectionRingRef = useRef<HTMLDivElement>(null)
  const selectedElRef    = useRef<HTMLElement | null>(null)
  const hoverElRef       = useRef<HTMLElement | null>(null)
  const hideHoverTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const selectedSectionNameRef = useRef<string | null>(null)

  // Panel + left-side move buttons: fixed positioning driven via direct DOM updates
  const panelRef          = useRef<HTMLDivElement>(null)
  const leftBtnsRef       = useRef<HTMLDivElement>(null)
  const focusedBlockElRef = useRef<HTMLElement | null>(null)

  const [moveButtons,             setMoveButtons]             = useState<MoveButtonsState>(null)
  const [focusedBlock,            setFocusedBlock]            = useState<FocusedBlockState>(null)
  const [selectedImageSectionName, setSelectedImageSectionName] = useState<string | null>(null)

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
  const showPanel      = !!(focusedSection && (PANEL_BLOCKS.has(focusedSection.component) || selectedImageSectionName))

  const currentEmphasis = focusedSection?.blockOptions?.emphasis ?? 'ghost'


  // ── Panel position (fixed, viewport-relative) ─────────────────────────────
  // Top-aligned with the selected block, snug against the canvas right edge.

  const updateOverlayPositions = useCallback(() => {
    const blockEl = focusedBlockElRef.current
    const wrapper = wrapperRef.current
    if (!blockEl || !wrapper) return

    const wRect = wrapper.getBoundingClientRect()
    const bTop  = blockEl.offsetTop * scale

    // Right-side panel
    const panel = panelRef.current
    if (panel) {
      const panelH     = panel.offsetHeight || 400
      const idealTop   = wRect.top + bTop
      const clampedTop = Math.max(8, Math.min(window.innerHeight - panelH - 8, idealTop))
      panel.style.top  = `${clampedTop}px`
      panel.style.left = `${wRect.left + 1440 * scale + 8}px`
    }

    // Left-side move buttons
    const leftBtns = leftBtnsRef.current
    if (leftBtns) {
      leftBtns.style.top  = `${Math.max(8, wRect.top + bTop)}px`
      leftBtns.style.left = `${wRect.left - 48}px`
    }
  }, [scale])

  // Scroll / resize → re-sync panel position
  useEffect(() => {
    if (!focusedBlock) return

    const wrapper = wrapperRef.current
    if (!wrapper) return

    // Find the scrollable ancestor
    let scrollEl: HTMLElement | null = wrapper.parentElement
    while (scrollEl) {
      const ov = getComputedStyle(scrollEl).overflowY
      if (ov === 'auto' || ov === 'scroll') break
      scrollEl = scrollEl.parentElement
    }

    const onUpdate = () => requestAnimationFrame(updateOverlayPositions)

    scrollEl?.addEventListener('scroll', onUpdate, { passive: true })
    window.addEventListener('resize', onUpdate)

    // Initial position after panel is painted
    requestAnimationFrame(updateOverlayPositions)

    return () => {
      scrollEl?.removeEventListener('scroll', onUpdate)
      window.removeEventListener('resize', onUpdate)
    }
  }, [focusedBlock, updateOverlayPositions])

  // ── Scroll selected block to vertical center of viewport ─────────────────

  const scrollToBlock = useCallback((blockEl: HTMLElement) => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    let scrollEl: HTMLElement | null = wrapper.parentElement
    while (scrollEl) {
      const ov = getComputedStyle(scrollEl).overflowY
      if (ov === 'auto' || ov === 'scroll') break
      scrollEl = scrollEl.parentElement
    }
    if (!scrollEl) return

    const blockVisualTop    = blockEl.offsetTop    * scale
    const blockVisualHeight = blockEl.offsetHeight * scale

    let wrapperOffset = 0
    let curr: HTMLElement | null = wrapper
    while (curr && curr !== scrollEl) {
      wrapperOffset += curr.offsetTop
      curr = curr.offsetParent as HTMLElement | null
    }

    const targetScrollTop = wrapperOffset + blockVisualTop - (scrollEl.clientHeight - blockVisualHeight) / 2
    scrollEl.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' })
  }, [scale])

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
    update({
      ...brief,
      sections: brief.sections.map(s =>
        s.sectionName === sectionName ? { ...s, component: newComponent } : s
      ),
    })
  }, [brief, update])

  // ── Compute move button positions (used only outside focus mode) ──────────

  const computeMoveButtons = useCallback((blockEl: HTMLElement, sectionName: string): MoveButtonsState => {
    const wrapper = wrapperRef.current
    if (!wrapper) return null

    const draggableList = sections.filter(isDraggableSection)
    const idx = draggableList.findIndex(s => s.sectionName === sectionName)
    if (idx === -1) return null

    let top = 0, left = 0
    let curr: HTMLElement | null = blockEl
    while (curr && curr !== wrapper) {
      top  += curr.offsetTop
      left += curr.offsetLeft
      curr  = curr.offsetParent as HTMLElement | null
    }

    return {
      top:     top    * scale,
      left:    left   * scale,
      width:   blockEl.offsetWidth  * scale,
      height:  blockEl.offsetHeight * scale,
      isFirst: idx === 0,
      isLast:  idx === draggableList.length - 1,
    }
  }, [sections, scale])

  // ── Main interactions effect ──────────────────────────────────────────────

  useEffect(() => {
    const wrapper   = wrapperRef.current
    const container = containerRef.current
    const hoverRing = hoverRingRef.current
    const selRing   = selectionRingRef.current
    if (!wrapper || !container || !hoverRing || !selRing) return

    const active = document.activeElement as HTMLElement | null
    if (container.contains(active) && active?.contentEditable === 'true') return

    abortRef.current.abort()
    abortRef.current = new AbortController()
    const { signal } = abortRef.current

    const blockStack = container.querySelector('.block-stack')
    const blockEls   = blockStack ? Array.from(blockStack.children) as HTMLElement[] : []

    // ── Ring helpers ──────────────────────────────────────────────────────

    const positionRing = (ring: HTMLDivElement, el: HTMLElement) => {
      let top = 0, left = 0
      let curr: HTMLElement | null = el
      while (curr && curr !== wrapper) {
        top  += curr.offsetTop
        left += curr.offsetLeft
        curr  = curr.offsetParent as HTMLElement | null
      }
      ring.style.top    = `${top    * scale}px`
      ring.style.left   = `${left   * scale}px`
      ring.style.width  = `${el.offsetWidth  * scale}px`
      ring.style.height = `${el.offsetHeight * scale}px`
      ring.style.opacity = '1'
    }

    const hideHoverRing = () => {
      hoverRing.style.opacity = '0'
      hoverElRef.current = null
    }

    const hideSelectionRing = () => {
      selRing.style.opacity = '0'
      selectedElRef.current = null
      selectedSectionNameRef.current = null
      focusedBlockElRef.current = null
      setMoveButtons(null)
      setFocusedBlock(null)
      setSelectedImageSectionName(null)
    }

    // Re-sync ring + panel after blocks re-render (e.g. after a swap / emphasis change)
    const prevSectionName = selectedSectionNameRef.current
    if (prevSectionName) {
      const sIdx    = sections.findIndex(s => s.sectionName === prevSectionName)
      const blockEl = sIdx !== -1 ? blockEls[sIdx] : null
      if (blockEl) {
        positionRing(selRing, blockEl)
        selectedElRef.current     = blockEl
        focusedBlockElRef.current = blockEl
        setMoveButtons(computeMoveButtons(blockEl, prevSectionName))
        setFocusedBlock({ sectionIdx: sIdx, sectionName: prevSectionName })
        requestAnimationFrame(updateOverlayPositions)
      } else {
        hideSelectionRing()
      }
    }

    // ── Priority-based target resolution ───────────────────────────────────

    const findInteractiveEl = (target: HTMLElement): HTMLElement | null => {
      if (target.tagName === 'IMG') {
        const r = target.getBoundingClientRect()
        if (r.width > 64 || r.height > 64) return target
      }
      let el: HTMLElement | null = target
      while (el && el !== container) {
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
        if (el !== selectedElRef.current) {
          positionRing(hoverRing, el)
        } else {
          hideHoverRing()
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

      selectedElRef.current = el
      positionRing(selRing, el)
      hideHoverRing()

      // Image click → show image picker in panel
      if (el.tagName === 'IMG') {
        const parentBlock = blockEls.find(b => b.contains(el))
        if (parentBlock) {
          const parentIdx = blockEls.indexOf(parentBlock)
          if (parentIdx !== -1 && sections[parentIdx] && IMAGE_BLOCKS.has(sections[parentIdx].component)) {
            const sectionName = sections[parentIdx].sectionName
            selectedSectionNameRef.current = sectionName
            focusedBlockElRef.current      = parentBlock
            setFocusedBlock({ sectionIdx: parentIdx, sectionName })
            setSelectedImageSectionName(sectionName)
            setMoveButtons(null)
            scrollToBlock(parentBlock)
            return
          }
        }
        return
      }

      // Block click → block panel (clear image picker)
      setSelectedImageSectionName(null)

      const blockIdx = blockEls.indexOf(el)
      if (blockIdx !== -1 && sections[blockIdx]) {
        const sectionName = sections[blockIdx].sectionName
        selectedSectionNameRef.current = sectionName
        focusedBlockElRef.current      = el
        setMoveButtons(computeMoveButtons(el, sectionName))
        setFocusedBlock({ sectionIdx: blockIdx, sectionName })
        scrollToBlock(el)
      } else {
        selectedSectionNameRef.current = null
        focusedBlockElRef.current      = null
        setMoveButtons(null)
        setFocusedBlock(null)
      }
    }, { signal })

    // ── Deselect on outside click ─────────────────────────────────────────

    document.addEventListener('click', (e: Event) => {
      const target = e.target as Node
      // Clicks inside the panel should not deselect
      if (panelRef.current?.contains(target)) return
      if (!wrapper.contains(target)) {
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
      hoverRing.style.opacity = '0'
      selRing.style.opacity   = '0'
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks])

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div ref={wrapperRef} className="p2c-editor-canvas" style={{ position: 'relative' }}>

      {/* White 1440px canvas at zoom scale */}
      <div style={{ width: 1440, background: '#fff', ...(scale !== 1 ? { zoom: scale } : {}) }}>
        <ContentDsProvider>
          <div ref={containerRef}>
            <BlockRenderer blocks={blocks} />
          </div>
        </ContentDsProvider>
      </div>

      {/* Hover ring */}
      <div
        ref={hoverRingRef}
        style={{
          position: 'absolute', pointerEvents: 'none', zIndex: 9998,
          border: '1px dashed rgba(79,70,229,0.5)',
          boxSizing: 'border-box', opacity: 0,
          transition: 'opacity 0.08s',
          top: 0, left: 0,
        }}
      />

      {/* Selection ring */}
      <div
        ref={selectionRingRef}
        style={{
          position: 'absolute', pointerEvents: 'none', zIndex: 9999,
          border: '2px solid #4f46e5',
          boxSizing: 'border-box', opacity: 0,
          transition: 'opacity 0.1s',
          top: 0, left: 0,
        }}
      />

      {/* ── Move up / down — fixed, left side of selected block ──────────────
          position: fixed so scroll doesn't affect it. Updated via leftBtnsRef.
          Only rendered when a draggable block is selected (moveButtons != null).
      ─────────────────────────────────────────────────────────────────────── */}
      {moveButtons && (
        <div
          ref={leftBtnsRef}
          onClick={e => e.stopPropagation()}
          className="flex flex-col gap-1"
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 10001 }}
        >
          {!moveButtons.isFirst && (
            <button
              onClick={() => handleMove('up')}
              title="Move block up"
              className="w-10 h-10 border border-gray-200 rounded-md bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer transition-colors text-gray-500 hover:text-gray-900 shadow-sm"
            >
              <ChevronUp />
            </button>
          )}
          {!moveButtons.isLast && (
            <button
              onClick={() => handleMove('down')}
              title="Move block down"
              className="w-10 h-10 border border-gray-200 rounded-md bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer transition-colors text-gray-500 hover:text-gray-900 shadow-sm"
            >
              <ChevronDown />
            </button>
          )}
        </div>
      )}

      {/* ── Side panel ────────────────────────────────────────────────────────
          position: fixed so it sits to the right of the page canvas regardless
          of the parent scroll container's overflow. Top-aligned with the selected
          block. Position is updated directly via panelRef.current.style.
      ─────────────────────────────────────────────────────────────────────── */}
      {showPanel && focusedSection && (
        <div
          ref={panelRef}
          onClick={e => e.stopPropagation()}
          className="font-sans border border-gray-200 bg-white shadow-sm"
          style={{
            position: 'fixed',
            top: 0,   // overwritten by updateOverlayPositions
            left: 0,  // overwritten by updateOverlayPositions
            width: PANEL_WIDTH,
            zIndex: 10002,
            maxHeight: 'calc(100vh - 16px)',
            overflowY: 'auto',
          }}
        >
          {/* ── Title ─────────────────────────────────────────────────────── */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">
              {selectedImageSectionName
                ? 'Swap image'
                : (BLOCK_LABELS[focusedSection.component] ?? focusedSection.component)
              }
            </p>
          </div>

          {/* ── Image picker (when image was clicked) ─────────────────────── */}
          {selectedImageSectionName && imageUrls.length > 0 && (
            <PanelSection title="Choose image">
              <div className="grid grid-cols-3 gap-1.5">
                {imageUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      update(pinImage(brief, selectedImageSectionName, url))
                      setSelectedImageSectionName(null)
                    }}
                    className="p-0 border-2 border-transparent rounded hover:border-primary overflow-hidden aspect-square bg-transparent cursor-pointer transition-colors"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover block pointer-events-none"
                    />
                  </button>
                ))}
              </div>
              {imageUrls.length === 0 && (
                <p className="text-xs text-gray-400 leading-relaxed">No images available in DAM</p>
              )}
            </PanelSection>
          )}

          {/* ── Block editing sections (hidden in image picker mode) ───────── */}
          {!selectedImageSectionName && (
            <>
              {/* ── Choose block ─────────────────────────────────────────────── */}
              {CHANGE_BLOCK_COMPONENTS.includes(focusedSection.component) && (
                <PanelSection title="Choose block">
                  <div className="flex flex-col gap-0.5">
                    {CHANGE_BLOCK_COMPONENTS.map(comp => {
                      const isActive = comp === focusedSection.component
                      return (
                        <div
                          key={comp}
                          role="button"
                          tabIndex={0}
                          onClick={() => !isActive && handleSwapComponent(focusedSection.sectionName, comp)}
                          onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !isActive) { e.preventDefault(); handleSwapComponent(focusedSection.sectionName, comp) } }}
                          className={[
                            'flex items-center gap-2.5 px-2.5 py-2 rounded-md select-none transition-colors',
                            isActive ? 'bg-primary/5 cursor-default' : 'cursor-pointer hover:bg-gray-50',
                          ].join(' ')}
                        >
                          <div className={[
                            'shrink-0 w-3 h-3 rounded-full transition-all',
                            isActive ? 'border-[3.5px] border-primary' : 'border border-gray-300',
                          ].join(' ')} />
                          <span className={[
                            'text-sm flex-1',
                            isActive ? 'text-gray-900 font-medium' : 'text-gray-600',
                          ].join(' ')}>
                            {BLOCK_LABELS[comp] ?? comp}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-medium text-primary">Current</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </PanelSection>
              )}

              {/* ── Emphasis ──────────────────────────────────────────────────── */}
              {PANEL_BLOCKS.has(focusedSection.component) && (
                <PanelSection title="Emphasis">
                  <div className="flex gap-1.5 flex-wrap">
                    {EMPHASIS_OPTIONS.map(({ value, label }) => {
                      const isActive = currentEmphasis === value
                      return (
                        <button
                          key={value}
                          onClick={() => handleEmphasis(focusedSection.sectionName, value)}
                          className={[
                            'px-3 py-1 text-xs border rounded-md transition-colors cursor-pointer',
                            isActive
                              ? 'bg-gray-900 text-white border-gray-900 font-medium'
                              : 'text-gray-500 border-gray-200 hover:bg-gray-50',
                          ].join(' ')}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </PanelSection>
              )}

              {/* ── Variant ───────────────────────────────────────────────────── */}
              {getVariantConfigs(focusedSection.component).map(config => {
                const currentVal = config.currentValue(focusedSection.blockOptions ?? {})
                return (
                  <PanelSection key={config.key} title={config.label}>
                    <div className="flex gap-1.5 flex-wrap">
                      {config.options.map(({ value, label }) => {
                        const isActive = currentVal === value
                        return (
                          <button
                            key={value}
                            onClick={() => handleVariantUpdate(focusedSection.sectionName, config.key, value)}
                            className={[
                              'px-3 py-1 text-xs border rounded-md transition-colors cursor-pointer',
                              isActive
                                ? 'bg-gray-900 text-white border-gray-900 font-medium'
                                : 'text-gray-500 border-gray-200 hover:bg-gray-50',
                            ].join(' ')}
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </PanelSection>
                )
              })}

              {/* ── Add item ──────────────────────────────────────────────────── */}
              {ITEM_BLOCKS.has(focusedSection.component) && (
                <PanelSection>
                  <button
                    onClick={() => update(addItem(brief, focusedSection.sectionName))}
                    className="w-full px-3 py-2 text-sm text-left border border-dashed border-gray-200 rounded-md text-gray-500 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                  >
                    + Add {ITEM_LABEL[focusedSection.component] ?? 'item'}
                  </button>
                </PanelSection>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
