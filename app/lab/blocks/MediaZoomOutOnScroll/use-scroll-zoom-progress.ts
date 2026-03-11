'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

/**
 * Scroll-driven zoom progress: 0 = full viewport + zoomed, 1 = Default width + normal scale.
 * When prefers-reduced-motion is true, returns 1 immediately (final state, no animation).
 *
 * Progress is based on scroll position:
 * - 0 when block top is at viewport top (just scrolled into view)
 * - 1 when user has scrolled past by ~80vh
 */
export function useScrollZoomProgress() {
  const [progress, setProgress] = useState(0)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = () => setPrefersReducedMotion(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const updateProgress = useCallback(() => {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    // When block top at viewport top: rect.top = 0 → progress 0
    // When block has scrolled up by 80vh: rect.top = -80vh → progress 1
    const scrollRange = viewportHeight * 0.8
    const raw = -rect.top / scrollRange
    const clamped = Math.min(1, Math.max(0, raw))
    setProgress(clamped)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(1)
      return
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    const ro = new ResizeObserver(updateProgress)
    const el = ref.current
    if (el) ro.observe(el)
    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
      ro.disconnect()
    }
  }, [prefersReducedMotion, updateProgress])

  return { ref, progress: prefersReducedMotion ? 1 : progress, prefersReducedMotion }
}
