'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { getMotionOffset } from '@marcelinodzn/ds-tokens'

/**
 * Intersection Observer options for carousel reveal.
 * rootMargin: shrink bottom so animation triggers when carousel is well in view.
 * threshold: trigger when 15% of block is visible (not too early).
 */
const DEFAULT_OPTIONS: IntersectionObserverInit = {
  root: null,
  rootMargin: '0px 0px -120px 0px',
  threshold: 0.15,
}

/**
 * Hook for carousel staggered reveal animations.
 * Returns ref to attach to carousel root, visibility state per index, and prefers-reduced-motion.
 * When prefers-reduced-motion is true, all items are visible immediately (no animation).
 */
export function useCarouselReveal(
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

  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true
          if (itemCount === 0) return
          const level = prefersReducedMotion ? 'subtle' : 'moderate'
          const staggerDelayMs = getMotionOffset('l', level)
          for (let i = 0; i < itemCount; i++) {
            const delay = i * staggerDelayMs
            setTimeout(() => {
              setVisibleIndices((prev) => new Set([...prev, i]))
            }, delay)
          }
        }
      }
    },
    [itemCount, prefersReducedMotion]
  )

  useEffect(() => {
    if (prefersReducedMotion) {
      setVisibleIndices(new Set(Array.from({ length: itemCount }, (_, i) => i)))
      setContainerVisible(true)
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

  const [containerVisible, setContainerVisible] = useState(false)
  useEffect(() => {
    if (prefersReducedMotion || visibleIndices.size > 0) {
      setContainerVisible(true)
    }
  }, [prefersReducedMotion, visibleIndices.size])

  return { ref, isVisible, prefersReducedMotion, containerVisible }
}
