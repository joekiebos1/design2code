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
const outPath = process.argv[2]
  ? join(process.cwd(), process.argv[2])
  : join(__dirname, '..', 'app', 'ds-tokens.generated.css')

// MyJio theme for token resolution (matches DsProvider theme)
const ctx = createTokenContext({
  [COLLECTION_NAMES.PLATFORM]: PLATFORM_MODES.DESKTOP_1440,
  [COLLECTION_NAMES.DENSITY]: DENSITY_MODES.DEFAULT,
  [COLLECTION_NAMES.COLOR_MODE]: COLOR_MODE_MODES.LIGHT,
  [COLLECTION_NAMES.THEME]: '↓Pack1',
  [COLLECTION_NAMES.THEME_PACK1]: 'MyJio',
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

// Platform-specific tokens (grid + typography) – DS single source of truth
const gridPlatforms = [
  [PLATFORM_MODES.MOBILE_360, bp.mobile],
  [PLATFORM_MODES.TABLET_768, bp.tablet],
  [PLATFORM_MODES.DESKTOP_1440, bp.desktop],
  [PLATFORM_MODES.DESKTOP_1920, bp.desktopLarge],
]

function createPlatformContext(platform) {
  return createTokenContext({
    [COLLECTION_NAMES.PLATFORM]: platform,
    [COLLECTION_NAMES.DENSITY]: DENSITY_MODES.DEFAULT,
    [COLLECTION_NAMES.COLOR_MODE]: COLOR_MODE_MODES.LIGHT,
    [COLLECTION_NAMES.THEME]: '↓Pack1',
    [COLLECTION_NAMES.THEME_PACK1]: 'MyJio',
  })
}

function getTypographyVars(platformCtx) {
  const v = []
  const labelS = typography.fontSize('Label', 'S', platformCtx)
  const labelM = typography.fontSize('Label', 'M', platformCtx)
  const bodyXs = typography.fontSize('Body', 'XS', platformCtx)
  const displayL = typography.fontSize('Display', 'L', platformCtx)
  const displayM = typography.fontSize('Display', 'M', platformCtx)
  const headlineL = typography.fontSize('Headline', 'L', platformCtx)
  const headlineM = typography.fontSize('Headline', 'M', platformCtx)
  const headlineS = typography.fontSize('Headline', 'S', platformCtx)
  if (labelS != null) v.push(`  --ds-typography-label-s: ${labelS}px;`)
  if (labelM != null) v.push(`  --ds-typography-label-m: ${labelM}px;`)
  if (bodyXs != null) v.push(`  --ds-typography-body-xs: ${bodyXs}px;`)
  if (displayL != null) v.push(`  --ds-typography-h1: ${displayL}px;`)
  if (displayM != null) v.push(`  --ds-typography-h2: ${displayM}px;`)
  if (headlineL != null) v.push(`  --ds-typography-h3: ${headlineL}px;`)
  if (headlineM != null) v.push(`  --ds-typography-h4: ${headlineM}px;`)
  const headlineSPx = headlineS ?? (headlineM != null ? Math.round(Number(headlineM) * 0.85) : 22)
  v.push(`  --ds-typography-h5: ${headlineSPx}px;`)
  if (headlineM != null) v.push(`  --ds-typography-headline-m: ${headlineM}px;`)
  v.push(`  --ds-typography-headline-s: ${headlineSPx}px;`)
  const headlineXsPx = headlineM != null ? Math.round(Number(headlineM) * 0.7) : 18
  v.push(`  --ds-typography-headline-xs: ${headlineXsPx}px;`)
  if (displayL != null) v.push(`  --ds-typography-display-hero: ${displayL}px;`)
  if (displayM != null) v.push(`  --ds-typography-display-2xl: ${displayM}px;`)
  return v
}

const CONTAINER_MAX_FALLBACK = 1346
const platformMediaVars = []
for (const [platform, minWidth] of gridPlatforms) {
  const platformCtx = createPlatformContext(platform)
  const cols = Number(getVariableByName('Grid/columns', platformCtx)) || 12
  const margin = Number(getVariableByName(
    platform.includes('360') ? 'Grid/S (360)/margin' : platform.includes('768') ? 'Grid/M (768)/margin' : platform.includes('1440') ? 'Grid/L (1440)/margin' : 'Grid/XL (1920)/margin',
    platformCtx
  )) || 47
  const gutter = Number(getVariableByName(
    platform.includes('360') ? 'Grid/S (360)/gutter' : platform.includes('768') ? 'Grid/M (768)/gutter' : platform.includes('1440') ? 'Grid/L (1440)/gutter' : 'Grid/XL (1920)/gutter',
    platformCtx
  )) || 19
  const rawContainerWidth = Math.max(0, minWidth - 2 * margin)
  const isDesktop = minWidth >= bp.desktop
  const containerMaxCap = Number(getVariableByName('ContainerWidth/L (1440)/100-100-100', platformCtx)) || CONTAINER_MAX_FALLBACK
  const containerWidth = isDesktop ? Math.min(rawContainerWidth, containerMaxCap) : rawContainerWidth
  const gridVars = [
    `  --ds-grid-columns: ${cols};`,
    `  --ds-grid-margin: ${margin}px;`,
    `  --ds-grid-gutter: ${gutter}px;`,
  ]
  const typographyVars = getTypographyVars(platformCtx)
  platformMediaVars.push({ minWidth, gridVars, typographyVars })
}

// Colors
const bgSubtle = colors.background('Subtle', ctx)
const bgGhost = colors.background('Ghost', ctx)
const bgMinimal = colors.background('Minimal', ctx)
const textHigh = colors.text('High', ctx)
const textMedium = colors.text('Medium', ctx)
const textLow = colors.text('Low', ctx)
const primaryBold = colors.appearance('Primary', 'Background/Bold', ctx)
const secondaryBold = getVariableByName('Secondary/Background/Bold', ctx)
const strokeSubtle = colors.background('Ghost', ctx) ?? colors.background('Subtle', ctx)
if (bgSubtle != null) vars.push(`  --ds-color-background-subtle: ${bgSubtle};`)
if (bgGhost != null) vars.push(`  --ds-color-background-ghost: ${bgGhost};`)
if (bgMinimal != null) vars.push(`  --ds-color-background-minimal: ${bgMinimal};`)
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
// Block backgrounds: CarouselBlock, MediaTextBlock, ProofPointsBlock use useBlockBackgroundColor (runtime DS).
// HeroBlock, TextOnColourCard, MediaCardContained still use these CSS vars:
const blockBgSubtle = colors.appearance('Primary', 'Background/Subtle', ctx)
const blockBgBold = colors.appearance('Primary', 'Background/Bold', ctx)
if (blockBgSubtle != null) vars.push(`  --ds-color-block-background-subtle: ${blockBgSubtle};`)
if (blockBgBold != null) vars.push(`  --ds-color-block-background-bold: ${blockBgBold};`)
// Lab GridBlockCard: tertiary (teal) – from theme if available, else fallback for card backgrounds
const tertiaryBold = getVariableByName('Tertiary/Background/Bold', ctx) ?? getVariableByName('Primary/Background/Subtle', ctx)
if (tertiaryBold != null) vars.push(`  --ds-color-card-tertiary: ${tertiaryBold};`)
else vars.push(`  --ds-color-card-tertiary: var(--ds-color-block-background-subtle);`)
// Thin divider for white surfaces (visible on light backgrounds)
vars.push(`  --ds-color-stroke-divider: rgba(0, 0, 0, 0.08);`)

// Typography – responsive per platform (mobile base in :root, overrides in media)
const labelWeightHigh = typography.fontWeight('Label', 'High', ctx)
const labelWeightLow = typography.fontWeight('Label', 'Low', ctx)
const bodyWeightMedium = typography.fontWeight('Body', 'Medium', ctx)
if (labelWeightHigh != null) vars.push(`  --ds-typography-weight-high: ${labelWeightHigh};`)
if (labelWeightLow != null) vars.push(`  --ds-typography-weight-low: ${labelWeightLow};`)
if (bodyWeightMedium != null) vars.push(`  --ds-typography-weight-medium: ${bodyWeightMedium};`)
// Typography sizes: mobile (first platform) in :root
vars.push(...getTypographyVars(createPlatformContext(PLATFORM_MODES.MOBILE_360)))

// Derived tokens
const spacing2xl = spacing.get('2XL', ctx)
const spacingS = spacing.get('S', ctx)
if (spacing2xl != null && spacingS != null) {
  vars.push(`  --ds-spacing-hero-sides: ${Number(spacing2xl) + Number(spacingS)}px;`)
}
vars.push(`  --ds-spacing-hero-overlap: 12.5vw;`)
vars.push(`  --ds-spacing-hero-panel-trim: 25vw;`)
// Card radius from DS Shape tokens (XL=35, L=26, M=19, S=14). Pill = full rounded ends.
const radiusCard = getVariableByName('Shape/XL', ctx)
const radiusCardL = getVariableByName('Shape/L', ctx)
const radiusCardM = getVariableByName('Shape/M', ctx)
const radiusCardS = getVariableByName('Shape/S', ctx)
const radiusPill = getVariableByName('Shape/Pill', ctx)
const radiusCardPx = radiusCard != null ? `${Number(radiusCard)}px` : '32px'
const radiusCardLPx = radiusCardL != null ? `${Number(radiusCardL)}px` : '26px'
const radiusCardMPx = radiusCardM != null ? `${Number(radiusCardM)}px` : '19px'
const radiusCardSPx = radiusCardS != null ? `${Number(radiusCardS)}px` : '14px'
const radiusFullPx = radiusPill != null ? `${Number(radiusPill)}px` : '999px'
vars.push(`  --ds-radius-card: ${radiusCardPx};`)
vars.push(`  --ds-radius-card-l: ${radiusCardLPx};`)
vars.push(`  --ds-radius-card-m: ${radiusCardMPx};`)
vars.push(`  --ds-radius-card-s: ${radiusCardSPx};`)
vars.push(`  --ds-radius-full: ${radiusFullPx};`)

// Grid + typography media queries – per breakpoint
vars.push(...platformMediaVars[0].gridVars)
let mediaCss = ''
for (let i = 1; i < platformMediaVars.length; i++) {
  const { minWidth, gridVars, typographyVars } = platformMediaVars[i]
  const allVars = [...gridVars, ...typographyVars]
  mediaCss += `@media (min-width: ${minWidth}px) {\n  :root {\n${allVars.join('\n')}\n  }\n}\n`
}

const css = `/**
 * Design System tokens - generated from @marcelinodzn/ds-tokens
 * Do not edit. Run: node scripts/generate-ds-tokens-css.mjs
 */
:root {
${vars.join('\n')}
}
${mediaCss}
`

mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, css)
console.log('Generated:', outPath)
