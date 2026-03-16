'use client'

/**
 * DS token context coupling.
 *
 * DsProvider (from ds-react) exposes platform, colorMode, theme, density via useDsContext().
 * It also builds tokenContext from those values and passes it to ds-tokens for resolution.
 *
 * To resolve tokens at runtime (colors, spacing, etc.) in sync with DsProvider:
 *
 *   const { tokenContext, platform, colorMode, theme } = useDsContext()
 *   const color = colors.appearance('Primary', 'Background/Subtle', tokenContext)
 *
 * When you change DsProvider props (e.g. colorMode="Dark" or platform="Mobile (360)"),
 * tokenContext updates and any component using it gets new values automatically.
 *
 * Example: block-surface uses useBlockBackgroundColor which calls useDsContext + colors.appearance.
 */

export { useDsContext, useDsContextOptional } from '@marcelinodzn/ds-react'
