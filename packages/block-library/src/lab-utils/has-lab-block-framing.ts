import type { LabBlockCallToAction } from './lab-block-framing-typography'

export function hasLabBlockFraming(
  title?: string | null,
  description?: string | null,
  callToActions?: LabBlockCallToAction[] | null,
  eyebrow?: string | null,
): boolean {
  const e = (eyebrow ?? '').toString().trim()
  const t = (title ?? '').toString().trim()
  const d = (description ?? '').toString().trim()
  const hasCta = Boolean(
    callToActions?.some((a) => (a?.label ?? '').toString().trim().length > 0),
  )
  return Boolean(e || t || d || hasCta)
}
