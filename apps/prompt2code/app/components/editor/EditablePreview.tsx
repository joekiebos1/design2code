'use client'

import { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { ContentDsProvider } from '@design2code/ds'
import { BlockRenderer } from '../BlockRenderer'
import { briefToBlocks } from '../../lib/briefToBlocks'
import { DamImagePicker } from './DamImagePicker'
import {
  updateField,
  updateCtaLabel,
  updateItemField,
  addItem,
  pinImage,
  reorderSections,
} from '../../lib/briefEditor'
import type { PageBrief, Section } from '../../lib/types'

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

/** The three swappable Engage block types shown in the "Change block" section. */
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

function addImageSwap(
  blockEl: HTMLElement,
  onSwap: () => void,
  signal: AbortSignal,
) {
  const imgs = Array.from(blockEl.querySelectorAll<HTMLImageElement>('img'))
  const target = imgs.find(img => {
    const rect = img.getBoundingClientRect()
    return rect.width > 64 || img.style.position === 'absolute'
  })
  if (!target) return

  let wrapper: HTMLElement = target.parentElement as HTMLElement
  while (wrapper && wrapper !== blockEl) {
    const pos = getComputedStyle(wrapper).position
    if (pos === 'relative' || pos === 'absolute') break
    wrapper = wrapper.parentElement as HTMLElement
  }
  if (!wrapper || wrapper === blockEl) return
  if (wrapper.dataset.swapAdded) return

  wrapper.dataset.swapAdded = '1'
  wrapper.style.position = 'relative'
  if (getComputedStyle(wrapper).overflow === 'hidden') wrapper.style.overflow = 'visible'

  const btn = document.createElement('button')
  btn.textContent = '⟳ Swap'
  btn.style.cssText = `
    position:absolute;top:8px;right:8px;z-index:10;
    padding:4px 10px;border-radius:20px;border:none;
    background:rgba(0,0,0,0.65);color:#fff;
    font-size:11px;font-weight:600;cursor:pointer;
    opacity:0;transition:opacity 0.15s;pointer-events:none;
    font-family:inherit;
  `

  const show = () => { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto' }
  const hide = () => { btn.style.opacity = '0'; btn.style.pointerEvents = 'none' }

  wrapper.addEventListener('mouseenter', show, { signal })
  wrapper.addEventListener('mouseleave', hide, { signal })
  btn.addEventListener('click', (e) => { e.stopPropagation(); onSwap() }, { signal })

  wrapper.appendChild(btn)
}

// ─── Apply edit affordances (no add-item bar — that lives in the panel) ──────

function applyBlockAffordances(
  blockEl: HTMLElement,
  section: Section,
  onFieldUpdate: (field: string, value: string) => void,
  onItemFieldUpdate: (itemIndex: number, field: string, value: string) => void,
  onImageSwap: () => void,
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

  if (IMAGE_BLOCKS.has(section.component)) {
    addImageSwap(blockEl, onImageSwap, signal)
  }
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
    <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(0,0,0,0.07)' }}>
      {title && (
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.35)',
          marginBottom: 8,
          fontFamily: 'inherit',
        }}>
          {title}
        </div>
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

  // Panel: fixed positioning driven via direct DOM updates (no re-render on scroll)
  const panelRef          = useRef<HTMLDivElement>(null)
  const focusedBlockElRef = useRef<HTMLElement | null>(null)

  const [pickerSection, setPickerSection] = useState<string | null>(null)
  const [moveButtons,   setMoveButtons]   = useState<MoveButtonsState>(null)
  const [focusedBlock,  setFocusedBlock]  = useState<FocusedBlockState>(null)

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
  const showPanel      = !!(focusedSection && PANEL_BLOCKS.has(focusedSection.component))

  const currentEmphasis = focusedSection?.blockOptions?.emphasis ?? 'ghost'

  const draggable     = sections.filter(isDraggableSection)
  const draggableIdx  = focusedSection ? draggable.findIndex(s => s.sectionName === focusedSection.sectionName) : -1
  const isFirstInList = draggableIdx === 0
  const isLastInList  = draggableIdx === draggable.length - 1

  // ── Panel position (fixed, viewport-relative) ─────────────────────────────
  // Updated directly on DOM to avoid scroll jank — no state involved.

  const updatePanelPosition = useCallback(() => {
    const panel   = panelRef.current
    const blockEl = focusedBlockElRef.current
    const wrapper = wrapperRef.current
    if (!panel || !blockEl || !wrapper) return

    const wRect   = wrapper.getBoundingClientRect()
    const bTop    = blockEl.offsetTop    * scale
    const bHeight = blockEl.offsetHeight * scale

    const panelH  = panel.offsetHeight || 400
    const idealTop = wRect.top + bTop + bHeight / 2 - panelH / 2
    const clampedTop = Math.max(8, Math.min(window.innerHeight - panelH - 8, idealTop))

    panel.style.top  = `${clampedTop}px`
    panel.style.left = `${wRect.left + 1440 * scale + 20}px`
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

    const onUpdate = () => requestAnimationFrame(updatePanelPosition)

    scrollEl?.addEventListener('scroll', onUpdate, { passive: true })
    window.addEventListener('resize', onUpdate)

    // Initial position after panel is painted
    requestAnimationFrame(updatePanelPosition)

    return () => {
      scrollEl?.removeEventListener('scroll', onUpdate)
      window.removeEventListener('resize', onUpdate)
    }
  }, [focusedBlock, updatePanelPosition])

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

    container.querySelectorAll('[data-swap-added]').forEach(el => {
      delete (el as HTMLElement).dataset.swapAdded
      el.querySelector('button[style*="position:absolute"]')?.remove()
    })

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
    }

    // Re-sync ring + panel after blocks re-render (e.g. after a swap / emphasis change)
    const prevSectionName = selectedSectionNameRef.current
    if (prevSectionName) {
      const sIdx    = sections.findIndex(s => s.sectionName === prevSectionName)
      const blockEl = sIdx !== -1 ? blockEls[sIdx] : null
      if (blockEl) {
        positionRing(selRing, blockEl)
        selectedElRef.current    = blockEl
        focusedBlockElRef.current = blockEl
        setMoveButtons(computeMoveButtons(blockEl, prevSectionName))
        requestAnimationFrame(updatePanelPosition)
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
        () => setPickerSection(section.sectionName),
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

  const BTN      = 64
  const BTN_HALF = BTN / 2

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

      {/* Move up / down buttons — only when focused block has no panel (non-panel blocks) */}
      {!showPanel && moveButtons && (
        <>
          {!moveButtons.isFirst && (
            <button
              onClick={() => handleMove('up')}
              title="Move block up"
              style={{
                position: 'absolute',
                top:  moveButtons.top - BTN_HALF,
                left: moveButtons.left + moveButtons.width / 2 - BTN_HALF,
                width: BTN, height: BTN, borderRadius: '50%',
                background: '#4f46e5', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10000, boxShadow: '0 4px 16px rgba(79,70,229,0.45)',
                transition: 'transform 0.12s, box-shadow 0.12s',
              }}
              onMouseEnter={e => { const b = e.currentTarget; b.style.transform='scale(1.08)'; b.style.boxShadow='0 6px 20px rgba(79,70,229,0.55)' }}
              onMouseLeave={e => { const b = e.currentTarget; b.style.transform='scale(1)';    b.style.boxShadow='0 4px 16px rgba(79,70,229,0.45)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 15 12 9 18 15" /></svg>
            </button>
          )}
          {!moveButtons.isLast && (
            <button
              onClick={() => handleMove('down')}
              title="Move block down"
              style={{
                position: 'absolute',
                top:  moveButtons.top + moveButtons.height - BTN_HALF,
                left: moveButtons.left + moveButtons.width / 2 - BTN_HALF,
                width: BTN, height: BTN, borderRadius: '50%',
                background: '#4f46e5', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10000, boxShadow: '0 4px 16px rgba(79,70,229,0.45)',
                transition: 'transform 0.12s, box-shadow 0.12s',
              }}
              onMouseEnter={e => { const b = e.currentTarget; b.style.transform='scale(1.08)'; b.style.boxShadow='0 6px 20px rgba(79,70,229,0.55)' }}
              onMouseLeave={e => { const b = e.currentTarget; b.style.transform='scale(1)';    b.style.boxShadow='0 4px 16px rgba(79,70,229,0.45)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
          )}
        </>
      )}

      {/* ── Side panel ────────────────────────────────────────────────────────
          position: fixed so it sits to the right of the page canvas regardless
          of the parent scroll container's overflow. Position is updated directly
          via panelRef.current.style to avoid scroll jank.
      ─────────────────────────────────────────────────────────────────────── */}
      {showPanel && focusedSection && (
        <div
          ref={panelRef}
          onClick={e => e.stopPropagation()}   // prevent outside-click deselect
          style={{
            position: 'fixed',
            top: 0,           // overwritten by updatePanelPosition
            left: 0,          // overwritten by updatePanelPosition
            width: PANEL_WIDTH,
            background: '#fff',
            border: '1px solid rgba(0,0,0,0.13)',
            borderRadius: 0,
            zIndex: 10002,
            fontFamily: 'inherit',
            maxHeight: 'calc(100vh - 16px)',
            overflowY: 'auto',
          }}
        >
          {/* ── Title ─────────────────────────────────────────────────────── */}
          <div style={{
            padding: '14px 16px 12px',
            borderBottom: '1px solid rgba(0,0,0,0.07)',
          }}>
            <div style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'rgb(13,13,15)',
              letterSpacing: '-0.02em',
            }}>
              {BLOCK_LABELS[focusedSection.component] ?? focusedSection.component}
            </div>
          </div>

          {/* ── Emphasis ──────────────────────────────────────────────────── */}
          <PanelSection title="Emphasis">
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {EMPHASIS_OPTIONS.map(({ value, label }) => {
                const isActive = currentEmphasis === value
                return (
                  <button
                    key={value}
                    onClick={() => handleEmphasis(focusedSection.sectionName, value)}
                    style={{
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: isActive ? 600 : 400,
                      background: isActive ? 'rgb(13,13,15)' : 'transparent',
                      color: isActive ? '#fff' : 'rgba(0,0,0,0.55)',
                      border: '1px solid',
                      borderColor: isActive ? 'rgb(13,13,15)' : 'rgba(0,0,0,0.14)',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.1s',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </PanelSection>

          {/* ── Move block ────────────────────────────────────────────────── */}
          {isDraggableSection(focusedSection) && (
            <PanelSection title="Move block">
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { dir: 'up'   as const, label: 'Up',   icon: <ChevronUp />,   disabled: isFirstInList },
                  { dir: 'down' as const, label: 'Down', icon: <ChevronDown />, disabled: isLastInList  },
                ].map(({ dir, label, icon, disabled }) => (
                  <button
                    key={dir}
                    onClick={() => handleMove(dir)}
                    disabled={disabled}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '6px 12px',
                      fontSize: 12, fontFamily: 'inherit',
                      background: disabled ? 'rgba(0,0,0,0.04)' : '#fff',
                      color: disabled ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.7)',
                      border: '1px solid',
                      borderColor: disabled ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.16)',
                      borderRadius: 4,
                      cursor: disabled ? 'default' : 'pointer',
                      transition: 'all 0.1s',
                    }}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </PanelSection>
          )}

          {/* ── Change block ──────────────────────────────────────────────── */}
          {CHANGE_BLOCK_COMPONENTS.includes(focusedSection.component) && (
            <PanelSection title="Change block">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {CHANGE_BLOCK_COMPONENTS.map(comp => {
                  const isActive = comp === focusedSection.component
                  return (
                    <div
                      key={comp}
                      role="button"
                      tabIndex={0}
                      onClick={() => !isActive && handleSwapComponent(focusedSection.sectionName, comp)}
                      onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !isActive) { e.preventDefault(); handleSwapComponent(focusedSection.sectionName, comp) } }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '7px 10px',
                        background: isActive ? 'rgba(79,70,229,0.06)' : 'transparent',
                        cursor: isActive ? 'default' : 'pointer',
                        borderRadius: 4,
                        transition: 'background 0.1s',
                        userSelect: 'none',
                      }}
                    >
                      {/* Radio dot */}
                      <div style={{
                        width: 13, height: 13, borderRadius: '50%', flexShrink: 0,
                        border: isActive ? '4px solid #4f46e5' : '1.5px solid rgba(0,0,0,0.22)',
                        transition: 'border 0.1s',
                      }} />
                      <span style={{
                        fontSize: 12,
                        color: isActive ? 'rgb(13,13,15)' : 'rgba(0,0,0,0.65)',
                        fontWeight: isActive ? 500 : 400,
                        letterSpacing: '-0.01em',
                        fontFamily: 'inherit',
                      }}>
                        {BLOCK_LABELS[comp] ?? comp}
                      </span>
                      {isActive && (
                        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#4f46e5', fontWeight: 600, letterSpacing: '-0.01em', fontFamily: 'inherit' }}>
                          Current
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </PanelSection>
          )}

          {/* ── Add item ──────────────────────────────────────────────────── */}
          {ITEM_BLOCKS.has(focusedSection.component) && (
            <PanelSection>
              <button
                onClick={() => update(addItem(brief, focusedSection.sectionName))}
                style={{
                  width: '100%', padding: '7px 12px', textAlign: 'left',
                  fontSize: 12, fontFamily: 'inherit',
                  background: 'transparent', cursor: 'pointer',
                  border: '1px dashed rgba(0,0,0,0.2)',
                  borderRadius: 4,
                  color: 'rgba(0,0,0,0.55)',
                  transition: 'border-color 0.1s, color 0.1s',
                }}
                onMouseEnter={e => { const b = e.currentTarget; b.style.color='rgba(0,100,220,0.8)'; b.style.borderColor='rgba(0,100,220,0.4)' }}
                onMouseLeave={e => { const b = e.currentTarget; b.style.color='rgba(0,0,0,0.55)'; b.style.borderColor='rgba(0,0,0,0.2)' }}
              >
                + Add {ITEM_LABEL[focusedSection.component] ?? 'item'}
              </button>
            </PanelSection>
          )}
        </div>
      )}

      {/* DAM Image picker */}
      {pickerSection && (
        <DamImagePicker
          imageUrls={imageUrls}
          onSelect={(url) => {
            update(pinImage(brief, pickerSection, url))
          }}
          onClose={() => setPickerSection(null)}
        />
      )}
    </div>
  )
}
