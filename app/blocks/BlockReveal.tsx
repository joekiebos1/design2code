'use client'

import { createTransition } from '@marcelinodzn/ds-tokens'
import { useBlockReveal } from '../../lib/utils/use-block-reveal'

type BlockRevealProps = {
  children: React.ReactNode
  /** Optional style merge */
  style?: React.CSSProperties
  /** Optional className */
  className?: string
}

/**
 * Wraps block content with on-scroll reveal animation (fade-in + slide-up).
 * Respects prefers-reduced-motion: when set, content shows immediately without animation.
 * Uses DS spacing tokens for the slide distance.
 */
export function BlockReveal({
  children,
  style,
  className,
}: BlockRevealProps) {
  const { ref, isVisible, prefersReducedMotion } = useBlockReveal()

  const baseStyle: React.CSSProperties = {
    width: '100%',
    ...style,
  }

  if (prefersReducedMotion) {
    return (
      <div ref={ref} style={baseStyle} className={className}>
        {children}
      </div>
    )
  }

  const level = prefersReducedMotion ? 'subtle' : 'moderate'
  const animatedStyle: React.CSSProperties = {
    ...baseStyle,
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(var(--ds-spacing-xl))',
    transition: createTransition(['opacity', 'transform'], 'xl', 'entrance', level),
  }

  return (
    <div ref={ref} style={animatedStyle} className={className}>
      {children}
    </div>
  )
}
