export function hasLabBlockFraming(
  title?: string | null,
  description?: string | null,
  callToActions?: { label: string; link?: string | null; style?: 'filled' | 'outlined' | null }[] | null,
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
