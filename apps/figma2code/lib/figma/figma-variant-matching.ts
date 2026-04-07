/**
 * Normalise Figma / Sanity labels for fuzzy matching (import, name hints).
 */

export const NORMALISE = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/['’]/g, "'")

/** Strip Figma's `#nodeId` suffix from component property keys. */
export function figmaComponentPropertyDisplayKey(rawKey: string): string {
  const base = rawKey.includes('#') ? rawKey.slice(0, rawKey.indexOf('#')) : rawKey
  return NORMALISE(base)
}

/** Compare Figma property label to Sanity field name (camelCase), ignoring spaces/case. */
export function figmaPropertyKeyMatchesFieldName(figmaDisplayKey: string, sanityFieldName: string): boolean {
  const a = figmaDisplayKey.replace(/\s+/g, '').toLowerCase()
  const b = sanityFieldName.replace(/\s+/g, '').toLowerCase()
  return a === b
}

export function matchOptionValue<T extends string | number>(
  hint: string,
  options: ReadonlyArray<{ value: T; title: string }>,
): T | undefined {
  const h = NORMALISE(hint)
  if (!h) return undefined
  for (const o of options) {
    const vt = NORMALISE(String(o.value))
    const tt = NORMALISE(o.title)
    if (h === vt || h === tt) return o.value
  }
  for (const o of options) {
    const tt = NORMALISE(o.title)
    if (tt.includes(h) || h.includes(tt)) return o.value
  }
  return undefined
}

export type FigmaComponentPropStringEntry = {
  displayKey: string
  value: string
  propType: string
}

/** VARIANT and TEXT entries with string values (REST API). */
export function collectFigmaStringComponentProperties(
  props: Record<string, unknown>,
): FigmaComponentPropStringEntry[] {
  const out: FigmaComponentPropStringEntry[] = []
  for (const [rawKey, raw] of Object.entries(props)) {
    if (!raw || typeof raw !== 'object') continue
    const p = raw as { type?: string; value?: unknown }
    const t = p.type
    if (t !== 'VARIANT' && t !== 'TEXT') continue
    const val = p.value
    if (typeof val !== 'string' || !val.trim()) continue
    out.push({
      displayKey: figmaComponentPropertyDisplayKey(rawKey),
      value: val.trim(),
      propType: t,
    })
  }
  return out
}
