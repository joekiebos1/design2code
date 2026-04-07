'use client'

import { useGridBreakpoint } from '@design2code/ds'
import { EDGE_TO_EDGE_BREAKOUT, useEdgeToEdgeMediaStyles } from '@design2code/ds'

type WidthCapElement = 'div' | 'section' | 'article' | 'main'

/**
 * Content width options. Size scale: XS=4, S=6, M=8, L=10, XL=12, XXL=12 cols.
 * Desktop (12 cols): XS=4, S=6, M=8, L=10, XL=12, XXL=12.
 * Tablet (8 cols): XS=4, S=6, M=6, L=6, XL=8, XXL=8.
 * Mobile (4 cols): all=4.
 * - XL: 12 cols, 1346 cap. XXL: 12 cols, 1920 cap (opt-in).
 * - edgeToEdge: full viewport, capped at 1920px on large screens (rounded corners when capped)
 * - full: 100% width, no max-width (for block wrapper)
 */
export type ContentWidth = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'edgeToEdge' | 'full'

/** Spacing values from DS tokens. none=0, medium=3xl, large=4xl (largest). */
export type BlockSpacing = 'none' | 'medium' | 'large'

/** Block spacing – DS tokens at runtime (--ds-spacing-* from generated CSS) */
export const SPACING_VAR: Record<BlockSpacing, string> = {
  none: '0',
  medium: 'var(--ds-spacing-3xl)',
  large: 'var(--ds-spacing-4xl)',
}

type WidthCapProps = React.HTMLAttributes<HTMLElement> & {
  as?: WidthCapElement
  contentWidth?: ContentWidth
  /** Padding above block (paddingBlockStart). Fallback when spacingTop not set. */
  spacingTop?: BlockSpacing
  /** Padding below block (paddingBlockEnd). Fallback when spacingBottom not set. */
  spacingBottom?: BlockSpacing
  /** @deprecated Use spacingTop and spacingBottom. Fallback for both when new fields not set. */
  spacing?: BlockSpacing
  /** When true, skip paddingBlockStart (block handles top internally, e.g. overflow); still add paddingBlockEnd. */
  spacingOnlyOnContent?: boolean
}

/**
 * WidthCap — constrains how wide content gets. Centres content within a max-width.
 * XS=4col, S=6col, M=8col, L=10col, XL=12col, XXL=12col (1920 cap).
 * Use for headings, standalone content, carousel viewport.
 * See lib/blocks/layout-rules.md
 */
export function WidthCap({
  children,
  style,
  as: Component = 'div',
  contentWidth = 'L',
  spacingTop,
  spacingBottom,
  spacing,
  spacingOnlyOnContent = false,
  ...props
}: WidthCapProps) {
  const fallback = spacing ? (SPACING_VAR[spacing as BlockSpacing] ?? SPACING_VAR.large) : undefined
  const topValue = spacingTop ? (SPACING_VAR[spacingTop as BlockSpacing] ?? SPACING_VAR.large) : fallback
  const bottomValue = spacingBottom ? (SPACING_VAR[spacingBottom as BlockSpacing] ?? SPACING_VAR.large) : fallback
  const paddingBlockStart = spacingOnlyOnContent ? undefined : topValue
  const paddingBlockEnd = bottomValue

  const {
    contentMaxXS,
    contentMaxS,
    contentMaxM,
    contentMaxL,
    contentMaxXL,
    contentMaxXXL,
  } = useGridBreakpoint()

  const paddingStyle = {
    ...(paddingBlockStart !== undefined && paddingBlockStart !== '0' && { paddingBlockStart }),
    ...(paddingBlockEnd !== undefined && paddingBlockEnd !== '0' && { paddingBlockEnd }),
  }

  if (contentWidth === 'XXL') {
    return (
      <Component
        style={{
          width: '100%',
          maxWidth: contentMaxXXL,
          marginInline: 'auto',
          boxSizing: 'border-box',
          ...paddingStyle,
          ...style,
        }}
        {...props}
      >
        {children}
      </Component>
    )
  }

  if (contentWidth === 'edgeToEdge') {
    const edgeStyles = useEdgeToEdgeMediaStyles()
    return (
      <Component
        style={{
          ...EDGE_TO_EDGE_BREAKOUT,
          paddingInline: 0,
          ...paddingStyle,
          ...style,
        }}
        {...props}
      >
        <div style={edgeStyles.inner}>
          {children}
        </div>
      </Component>
    )
  }

  if (contentWidth === 'full') {
    return (
      <Component
        style={{
          position: 'relative',
          width: '100%',
          boxSizing: 'border-box',
          ...paddingStyle,
          ...style,
        }}
        {...props}
      >
        {children}
      </Component>
    )
  }

  const maxWidth =
    contentWidth === 'XS'
      ? contentMaxXS
      : contentWidth === 'S'
        ? contentMaxS
        : contentWidth === 'M'
          ? contentMaxM
          : contentWidth === 'XL'
            ? contentMaxXL
            : contentMaxL

  return (
    <Component
      style={{
        width: '100%',
        maxWidth,
        marginInline: 'auto',
        boxSizing: 'border-box',
        ...paddingStyle,
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  )
}
