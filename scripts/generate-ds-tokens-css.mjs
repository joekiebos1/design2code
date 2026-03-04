#!/usr/bin/env node
/**
 * Generates CSS variables from @marcelinodzn/ds-tokens at build time.
 * Single source of truth: no duplicated values in globals.css.
 *
 * Run: node scripts/generate-ds-tokens-css.mjs
 */
import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import {
  spacing,
  typography,
  colors,
  getBreakpoints,
  getVariableByName,
  createTokenContext,
  COLLECTION_NAMES,
  PLATFORM_MODES,
  DENSITY_MODES,
  COLOR_MODE_MODES,
} from '@marcelinodzn/ds-tokens'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = join(__dirname, '..', 'app', 'ds-tokens.generated.css')

// JioHome theme for token resolution (matches DsProvider theme)
const ctx = createTokenContext({
  [COLLECTION_NAMES.PLATFORM]: PLATFORM_MODES.DESKTOP_1440,
  [COLLECTION_NAMES.DENSITY]: DENSITY_MODES.DEFAULT,
  [COLLECTION_NAMES.COLOR_MODE]: COLOR_MODE_MODES.LIGHT,
  [COLLECTION_NAMES.THEME]: '↓Pack1',
  [COLLECTION_NAMES.THEME_PACK1]: 'JioHome',
})

const vars = []

// Font family - use next/font variable (JioType Var loaded via app/layout.tsx)
vars.push(`  --ds-font-family: var(--font-jiotype), "Inter", system-ui, sans-serif;`)

// Spacing
const spacingSizes = ['3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']
spacingSizes.forEach((size) => {
  const value = spacing.get(size, ctx)
  if (value != null) vars.push(`  --ds-spacing-${size.toLowerCase()}: ${value}px;`)
})

// Breakpoints
const bp = getBreakpoints()
vars.push(`  --ds-breakpoint-mobile: ${bp.mobile}px;`)
vars.push(`  --ds-breakpoint-tablet: ${bp.tablet}px;`)
vars.push(`  --ds-breakpoint-tablet-landscape: ${bp.tabletLandscape ?? 1024}px;`)
vars.push(`  --ds-breakpoint-desktop: ${bp.desktop}px;`)
vars.push(`  --ds-breakpoint-desktop-lg: ${bp.desktopLarge}px;`)

// Grid tokens per breakpoint (from DS – single source of truth)
const gridPlatforms = [
  [PLATFORM_MODES.MOBILE_360, bp.mobile],
  [PLATFORM_MODES.TABLET_768, bp.tablet],
  [PLATFORM_MODES.DESKTOP_1440, bp.desktop],
  [PLATFORM_MODES.DESKTOP_1920, bp.desktopLarge],
]
const gridMediaVars = []
for (const [platform, minWidth] of gridPlatforms) {
  const ctx = createTokenContext({
    [COLLECTION_NAMES.PLATFORM]: platform,
    [COLLECTION_NAMES.DENSITY]: DENSITY_MODES.DEFAULT,
  })
  const cols = getVariableByName('Grid/columns', ctx)
  const margin = getVariableByName(
    platform.includes('360') ? 'Grid/S (360)/margin' : platform.includes('768') ? 'Grid/M (768)/margin' : platform.includes('1440') ? 'Grid/L (1440)/margin' : 'Grid/XL (1920)/margin',
    ctx
  )
  const gutter = getVariableByName(
    platform.includes('360') ? 'Grid/S (360)/gutter' : platform.includes('768') ? 'Grid/M (768)/gutter' : platform.includes('1440') ? 'Grid/L (1440)/gutter' : 'Grid/XL (1920)/gutter',
    ctx
  )
  gridMediaVars.push({ minWidth, cols: cols ?? 12, margin: margin ?? 47, gutter: gutter ?? 19 })
}

// Colors
const bgSubtle = colors.background('Subtle', ctx)
const bgGhost = colors.background('Ghost', ctx)
const textHigh = colors.text('High', ctx)
const textMedium = colors.text('Medium', ctx)
const textLow = colors.text('Low', ctx)
const primaryBold = colors.appearance('Primary', 'Background/Bold', ctx)
const secondaryBold = getVariableByName('Secondary/Background/Bold', ctx)
const strokeSubtle = colors.background('Ghost', ctx) ?? colors.background('Subtle', ctx)
if (bgSubtle != null) vars.push(`  --ds-color-background-subtle: ${bgSubtle};`)
if (bgGhost != null) vars.push(`  --ds-color-background-ghost: ${bgGhost};`)
if (textHigh != null) vars.push(`  --ds-color-text-high: ${textHigh};`)
if (textMedium != null) vars.push(`  --ds-color-text-medium: ${textMedium};`)
if (textLow != null) vars.push(`  --ds-color-text-low: ${textLow};`)
if (primaryBold != null) vars.push(`  --ds-color-surface-bold: ${primaryBold};`)
if (secondaryBold != null) vars.push(`  --ds-color-surface-secondary: ${secondaryBold};`)
const neutralBold = colors.appearance('Neutral', 'Background/Bold', ctx)
const neutralSubtle = colors.appearance('Neutral', 'Background/Subtle', ctx)
if (neutralBold != null) vars.push(`  --ds-color-neutral-bold: ${neutralBold};`)
if (neutralSubtle != null) vars.push(`  --ds-color-neutral-subtle: ${neutralSubtle};`)
if (strokeSubtle != null) vars.push(`  --ds-color-stroke-subtle: ${strokeSubtle};`)
const blockBgSubtle = colors.appearance('Primary', 'Background/Subtle', ctx)
const blockBgBold = colors.appearance('Primary', 'Background/Bold', ctx)
if (blockBgSubtle != null) vars.push(`  --ds-color-block-background-subtle: ${blockBgSubtle};`)
if (blockBgBold != null) vars.push(`  --ds-color-block-background-bold: ${blockBgBold};`)
// Thin divider for white surfaces (visible on light backgrounds)
vars.push(`  --ds-color-stroke-divider: rgba(0, 0, 0, 0.08);`)

// Typography - DS tokens only
const labelS = typography.fontSize('Label', 'S', ctx)
const labelM = typography.fontSize('Label', 'M', ctx)
const bodyXs = typography.fontSize('Body', 'XS', ctx)
const labelWeightHigh = typography.fontWeight('Label', 'High', ctx)
const labelWeightLow = typography.fontWeight('Label', 'Low', ctx)
const bodyWeightMedium = typography.fontWeight('Body', 'Medium', ctx)
const displayL = typography.fontSize('Display', 'L', ctx)
const displayM = typography.fontSize('Display', 'M', ctx)
const headlineL = typography.fontSize('Headline', 'L', ctx)
const headlineM = typography.fontSize('Headline', 'M', ctx)
const headlineS = typography.fontSize('Headline', 'S', ctx)
if (labelS != null) vars.push(`  --ds-typography-label-s: ${labelS}px;`)
if (labelM != null) vars.push(`  --ds-typography-label-m: ${labelM}px;`)
if (bodyXs != null) vars.push(`  --ds-typography-body-xs: ${bodyXs}px;`)
// H1 (hero): Display/L - fairly large
if (displayL != null) vars.push(`  --ds-typography-h1: ${displayL}px;`)
// H2: Display/M - slightly smaller than H1
if (displayM != null) vars.push(`  --ds-typography-h2: ${displayM}px;`)
// H3: Headline/L, H4: Headline/M, H5: Headline/S
if (headlineL != null) vars.push(`  --ds-typography-h3: ${headlineL}px;`)
if (headlineM != null) vars.push(`  --ds-typography-h4: ${headlineM}px;`)
const headlineSPx = headlineS ?? (headlineM != null ? Math.round(Number(headlineM) * 0.85) : 22)
vars.push(`  --ds-typography-h5: ${headlineSPx}px;`)
// Legacy aliases for semantic-headline
if (headlineM != null) vars.push(`  --ds-typography-headline-m: ${headlineM}px;`)
vars.push(`  --ds-typography-headline-s: ${headlineSPx}px;`)
const headlineXsPx = headlineM != null ? Math.round(Number(headlineM) * 0.7) : 18
vars.push(`  --ds-typography-headline-xs: ${headlineXsPx}px;`)
if (labelWeightHigh != null) vars.push(`  --ds-typography-weight-high: ${labelWeightHigh};`)
if (labelWeightLow != null) vars.push(`  --ds-typography-weight-low: ${labelWeightLow};`)
if (bodyWeightMedium != null) vars.push(`  --ds-typography-weight-medium: ${bodyWeightMedium};`)
// Aliases for hero/display (H1=display-hero, H2=display-2xl)
if (displayL != null) vars.push(`  --ds-typography-display-hero: ${displayL}px;`)
if (displayM != null) vars.push(`  --ds-typography-display-2xl: ${displayM}px;`)

// Derived tokens
const spacing2xl = spacing.get('2XL', ctx)
const spacingS = spacing.get('S', ctx)
if (spacing2xl != null && spacingS != null) {
  vars.push(`  --ds-spacing-hero-sides: ${Number(spacing2xl) + Number(spacingS)}px;`)
}
vars.push(`  --ds-spacing-hero-overlap: 12.5vw;`)
vars.push(`  --ds-spacing-hero-panel-trim: 25vw;`)
// Card radius from DS Shape tokens (XL=35, L=26, M=19, S=14)
const radiusCard = getVariableByName('Shape/XL', ctx)
const radiusCardL = getVariableByName('Shape/L', ctx)
const radiusCardM = getVariableByName('Shape/M', ctx)
const radiusCardS = getVariableByName('Shape/S', ctx)
const radiusCardPx = radiusCard != null ? `${Number(radiusCard)}px` : '32px'
const radiusCardLPx = radiusCardL != null ? `${Number(radiusCardL)}px` : '26px'
const radiusCardMPx = radiusCardM != null ? `${Number(radiusCardM)}px` : '19px'
const radiusCardSPx = radiusCardS != null ? `${Number(radiusCardS)}px` : '14px'
vars.push(`  --ds-radius-card: ${radiusCardPx};`)
vars.push(`  --ds-radius-card-l: ${radiusCardLPx};`)
vars.push(`  --ds-radius-card-m: ${radiusCardMPx};`)
vars.push(`  --ds-radius-card-s: ${radiusCardSPx};`)

// Grid media queries – DS grid per breakpoint
let gridCss = ''
for (let i = 0; i < gridMediaVars.length; i++) {
  const { minWidth, cols, margin, gutter } = gridMediaVars[i]
  const selector = i === 0 ? ':root' : `@media (min-width: ${minWidth}px) {\n  :root`
  const gridVars = [
    `  --ds-grid-columns: ${cols};`,
    `  --ds-grid-margin: ${margin}px;`,
    `  --ds-grid-gutter: ${gutter}px;`,
  ]
  if (i === 0) {
    vars.push(...gridVars)
  } else {
    gridCss += `@media (min-width: ${minWidth}px) {\n  :root {\n${gridVars.join('\n')}\n  }\n}\n`
  }
}

const css = `/**
 * Design System tokens - generated from @marcelinodzn/ds-tokens
 * Do not edit. Run: node scripts/generate-ds-tokens-css.mjs
 */
:root {
${vars.join('\n')}
}
${gridCss}
`

mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, css)
console.log('Generated:', outPath)
