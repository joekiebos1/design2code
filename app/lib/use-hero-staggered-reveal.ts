'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createTransition, getMotionOffset } from '@marcelinodzn/ds-tokens'
import type { CSSProperties } from 'react'

/**
 * Intersection Observer options for hero block reveal.
 * rootMargin: shrink bottom so animation triggers when block is well in view.
 * threshold: trigger when 15% of block is visible (not too early).
 */
const DEFAULT_OPTIONS: IntersectionObserverInit = {
  root: null,
  rootMargin: '0px 0px -120px 0px',
  threshold: 0.15,
}

/**
 * Hook for hero staggered reveal animations.
 * Returns ref to attach to hero root, visibility state per index, and getRevealStyle for staggered children.
 * When prefers-reduced-motion is true, all items are visible immediately (no animation).
 *
 * Stagger: 'm' or 'l' offset between elements. Transition: 'xl' entrance.
 */
export function useHeroStaggeredReveal(
  itemCount: number,
  options?: Partial<IntersectionObserverInit>
) {
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set())
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const hasTriggeredRef = useRef(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = () => setPrefersReducedMotion(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options }
  const motionLevel = prefersReducedMotion ? 'subtle' : 'moderate'
  const staggerDelayMs = getMotionOffset('m', motionLevel)
  const transition = prefersReducedMotion
    ? undefined
    : createTransition(['opacity', 'transform'], 'xl', 'entrance', motionLevel)

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true
          if (itemCount === 0) return
          for (let i = 0; i < itemCount; i++) {
            const delay = i * staggerDelayMs
            setTimeout(() => {
              setVisibleIndices((prev) => new Set([...prev, i]))
            }, delay)
          }
        }
      }
    },
    [itemCount, staggerDelayMs]
  )

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisibleIndices(new Set(Array.from({ length: itemCount }, (_, i) => i)))
      return
    }

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(observerCallback, mergedOptions)
    observer.observe(el)
    return () => {
      observer.disconnect()
      hasTriggeredRef.current = false
    }
  }, [
    prefersReducedMotion,
    observerCallback,
    itemCount,
    mergedOptions.root,
    mergedOptions.rootMargin,
    mergedOptions.threshold,
  ])

  const isVisible = (index: number) =>
    prefersReducedMotion || visibleIndices.has(index)

  const getRevealStyle = useCallback(
    (index: number): CSSProperties => {
      if (prefersReducedMotion) {
        return {}
      }
      const visible = visibleIndices.has(index)
      return {
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(var(--ds-spacing-xl))',
        transition,
      }
    },
    [prefersReducedMotion, visibleIndices, transition]
  )

  return { ref, isVisible, getRevealStyle, prefersReducedMotion }
}
