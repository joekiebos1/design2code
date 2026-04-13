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
} from '../../lib/briefEditor'
import type { PageBrief, Section } from '../../lib/types'

// ─── Types ──────────────────────────────────────────────────────────────────

type EditablePreviewProps = {
  brief: PageBrief
  imageUrls: string[]
  videoUrls: string[]
  onBriefUpdate: (brief: PageBrief) => void
}

// Blocks that support item add/remove
const ITEM_BLOCKS = new Set(['cardGrid', 'carousel', 'proofPoints', 'mediaTextAsymmetric', 'mediaText5050'])

const ITEM_LABEL: Record<string, string> = {
  cardGrid:            'card',
  carousel:            'item',
  proofPoints:         'point',
  mediaTextAsymmetric: 'question',
  mediaText5050:       'item',
}

// Blocks that have a primary image
const IMAGE_BLOCKS = new Set(['hero', 'mediaTextStacked', 'mediaText5050', 'mediaTextAsymmetric', 'cardGrid', 'carousel'])

// ─── DOM helpers ──────────────────────────────────────────────────────────

/**
 * Finds the best leaf element whose trimmed text content exactly matches `text`.
 * Skips elements that already have contenteditable, or that contain block-level children.
 */
function findLeafByText(container: HTMLElement, text: string): HTMLElement | null {
  if (!text.trim()) return null
  const t = text.trim()
  const candidates = container.querySelectorAll<HTMLElement>('h1,h2,h3,h4,p,span')
  for (const el of Array.from(candidates)) {
    if (el.contentEditable === 'true') continue
    if (el.querySelector('h1,h2,h3,h4,p,div,ul,ol')) continue // not a leaf
    if (el.textContent?.trim() === t) return el
  }
  return null
}

/**
 * Makes an element contenteditable, fires onCommit on blur or Enter.
 * Reverts on Escape. Cleans up via AbortSignal.
 */
function makeEditable(
  el: HTMLElement,
  original: string,
  onCommit: (val: string) => void,
  signal: AbortSignal,
) {
  el.contentEditable = 'true'
  el.style.outline = 'none'
  el.style.cursor = 'text'
  el.style.borderRadius = '3px'

  const onFocus = () => { el.style.boxShadow = '0 0 0 2px rgba(0,100,220,0.35)' }
  const onBlur = () => {
    el.style.boxShadow = ''
    const val = el.textContent?.trim() ?? ''
    if (val !== original.trim()) onCommit(val)
  }
  const onKeyDown = (e: Event) => {
    const ke = e as KeyboardEvent
    if (ke.key === 'Enter' && !ke.shiftKey) { ke.preventDefault(); el.blur() }
    if (ke.key === 'Escape') { el.textContent = original; el.blur() }
  }

  el.addEventListener('focus', onFocus, { signal })
  el.addEventListener('blur', onBlur, { signal })
  el.addEventListener('keydown', onKeyDown, { signal })
}

/**
 * Adds a camera-icon swap button overlaid on the first <img> in a block element.
 * Only adds once (checks for data-swap-added).
 */
function addImageSwap(
  blockEl: HTMLElement,
  onSwap: () => void,
  signal: AbortSignal,
) {
  // Use the first img that's not tiny (icon/decoration threshold: 64px)
  const imgs = Array.from(blockEl.querySelectorAll<HTMLImageElement>('img'))
  const target = imgs.find(img => {
    const rect = img.getBoundingClientRect()
    return rect.width > 64 || img.style.position === 'absolute'
  })
  if (!target) return

  // Walk up to find a positioned ancestor (Next.js Image wraps in a span)
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
  // Keep existing overflow unless it would clip the button
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

/**
 * Appends an "+ Add {label}" bar below a block element.
 * Removes any previous bar first (idempotent).
 */
function addItemBar(
  blockEl: HTMLElement,
  label: string,
  onClick: () => void,
  signal: AbortSignal,
) {
  // Remove old bar
  blockEl.querySelector('[data-add-bar]')?.remove()

  const bar = document.createElement('div')
  bar.dataset.addBar = '1'
  bar.style.cssText = `
    display:flex;align-items:center;justify-content:center;
    padding:10px 0;border-top:1px dashed rgba(0,0,0,0.12);
    background:rgba(0,0,0,0.01);
  `

  const btn = document.createElement('button')
  btn.textContent = `+ Add ${label}`
  btn.style.cssText = `
    padding:5px 14px;border-radius:20px;
    border:1px dashed rgba(0,0,0,0.2);background:transparent;
    color:rgba(0,0,0,0.45);font-size:12px;cursor:pointer;
    font-family:inherit;transition:border-color 0.12s,color 0.12s;
  `
  btn.addEventListener('mouseenter', () => { btn.style.color='rgba(0,100,220,0.8)'; btn.style.borderColor='rgba(0,100,220,0.4)' })
  btn.addEventListener('mouseleave', () => { btn.style.color='rgba(0,0,0,0.45)'; btn.style.borderColor='rgba(0,0,0,0.2)' })
  btn.addEventListener('click', onClick, { signal })

  bar.appendChild(btn)
  blockEl.appendChild(bar)
}

// ─── Apply edit affordances to one block ────────────────────────────────────

function applyBlockAffordances(
  blockEl: HTMLElement,
  section: Section,
  onFieldUpdate: (field: string, value: string) => void,
  onItemFieldUpdate: (itemIndex: number, field: string, value: string) => void,
  onImageSwap: () => void,
  onAddItem: () => void,
  signal: AbortSignal,
) {
  const slots = section.contentSlots

  // Block-level text fields
  const textFields: Array<{ key: string; val: string | null | undefined }> = [
    { key: 'headline', val: slots.headline },
    { key: 'subhead',  val: slots.subhead },
    { key: 'body',     val: slots.body },
    { key: 'eyebrow',  val: slots.eyebrow },
  ]

  // CTA label
  const ctaLabel = typeof slots.cta === 'string' ? slots.cta : slots.cta?.label
  if (ctaLabel) textFields.push({ key: 'ctaLabel', val: ctaLabel })

  for (const { key, val } of textFields) {
    if (!val) continue
    const el = findLeafByText(blockEl, val)
    if (!el) continue
    makeEditable(el, val, (v) => onFieldUpdate(key, v), signal)
  }

  // Item-level text
  const items = Array.isArray(slots.items) ? slots.items as Record<string, unknown>[] : []
  items.forEach((item, i) => {
    // Different block types use different field names
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

  // Image swap
  if (IMAGE_BLOCKS.has(section.component)) {
    addImageSwap(blockEl, onImageSwap, signal)
  }

  // Add item bar
  if (ITEM_BLOCKS.has(section.component)) {
    addItemBar(blockEl, ITEM_LABEL[section.component] ?? 'item', onAddItem, signal)
  }
}

// ─── Main component ──────────────────────────────────────────────────────────

export function EditablePreview({ brief, imageUrls, videoUrls, onBriefUpdate }: EditablePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController>(new AbortController())
  const [pickerSection, setPickerSection] = useState<string | null>(null)

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

  // Apply edit affordances after every render
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Don't interrupt active editing
    const active = document.activeElement as HTMLElement | null
    if (container.contains(active) && active?.contentEditable === 'true') return

    // Cancel previous signal, create fresh one
    abortRef.current.abort()
    abortRef.current = new AbortController()
    const { signal } = abortRef.current

    // Reset image swap markers so they get re-applied cleanly
    container.querySelectorAll('[data-swap-added]').forEach(el => {
      delete (el as HTMLElement).dataset.swapAdded
      el.querySelector('button[style*="position:absolute"]')?.remove()
    })

    const blockStack = container.querySelector('.block-stack')
    const blockEls = blockStack ? Array.from(blockStack.children) as HTMLElement[] : []

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
        () => update(addItem(brief, section.sectionName)),
        signal,
      )
    })

    return () => abortRef.current.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks])

  return (
    <>
      <ContentDsProvider>
        <div ref={containerRef}>
          <BlockRenderer blocks={blocks} />
        </div>
      </ContentDsProvider>

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
    </>
  )
}
