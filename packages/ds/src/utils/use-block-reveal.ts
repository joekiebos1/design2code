'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

/**
 * Intersection Observer options for block reveal.
 * rootMargin: shrink bottom so animation triggers when block is well in view.
 * threshold: trigger when 15% of block is visible (not too early).
 */
const DEFAULT_OPTIONS: IntersectionObserverInit = {
  root: null,
  rootMargin: '0px 0px -120px 0px',
  threshold: 0.15,
}

/**
 * Hook for on-scroll block reveal animations.
 * Returns ref to attach to block root, visibility state, and prefers-reduced-motion.
 * When prefers-reduced-motion is true, isVisible is always true (no animation).
 */
export function useBlockReveal(options?: Partial<IntersectionObserverInit>) {
  const [isVisible, setIsVisible] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

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
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      }
    },
    []
  )

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(observerCallback, mergedOptions)
    observer.observe(el)
    return () => observer.disconnect()
  }, [prefersReducedMotion, observerCallback, mergedOptions.root, mergedOptions.rootMargin, mergedOptions.threshold])

  return { ref, isVisible: prefersReducedMotion || isVisible, prefersReducedMotion }
}
