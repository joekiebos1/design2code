'use client'

import { useGridBreakpoint } from '../../lib/utils/use-grid-breakpoint'
import { EDGE_TO_EDGE_BREAKOUT, useEdgeToEdgeMediaStyles } from '../../lib/utils/edge-to-edge'

type WidthCapElement = 'div' | 'section' | 'article' | 'main'

/**
 * Content width options. Column spans: XS=4, S=6, M=8, Default=10, Wide=12.
 * Desktop (12 cols): XS=4, S=6, M=8, Default=10, Wide=12.
 * Tablet (8 cols): XS=4, S=6, M=6, Default=6, Wide=8.
 * Mobile (4 cols): all=4.
 * - edgeToEdge: full viewport, capped at 1920px on large screens (rounded corners when capped)
 * - full: 100% width, no max-width (for block wrapper)
 *
 * Above 1440px, all content widths cap at ContainerWidth/L (1440)/100-100-100 (1346px).
 */
export type ContentWidth = 'XS' | 'S' | 'M' | 'Default' | 'Wide' | 'edgeToEdge' | 'full'

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
 * XS=4col, S=6col, M=8col, Default=10col, Wide=12col.
 * Use for headings, standalone content, carousel viewport.
 * See lib/blocks/layout-rules.md
 */
export function WidthCap({
  children,
  style,
  as: Component = 'div',
  contentWidth = 'Default',
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
    contentMaxDefault,
    contentMaxWide,
  } = useGridBreakpoint()

  const paddingStyle = {
    ...(paddingBlockStart !== undefined && paddingBlockStart !== '0' && { paddingBlockStart }),
    ...(paddingBlockEnd !== undefined && paddingBlockEnd !== '0' && { paddingBlockEnd }),
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
          : contentWidth === 'Wide'
            ? contentMaxWide
            : contentMaxDefault

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
