function slugifyPart(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function makeBenchmarkId(title: string, existingIds: Set<string>): string {
  const base = slugifyPart(title).slice(0, 96) || `benchmark-${Date.now()}`
  let id = base
  if (!existingIds.has(id)) return id
  let n = 2
  while (existingIds.has(`${base}-${n}`)) n += 1
  return `${base}-${n}`
}
