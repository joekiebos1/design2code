/** Resolve Strapi media (v4/v5 shapes) to an absolute URL. */
export function resolveStrapiMediaUrl(
  baseUrl: string,
  media: unknown,
  externalFallback?: string | null
): string | undefined {
  const ext = externalFallback?.trim()
  const fromUpload = extractMediaUrl(baseUrl, media)
  return fromUpload ?? (ext || undefined)
}

function extractMediaUrl(baseUrl: string, media: unknown): string | undefined {
  if (media == null) return undefined
  if (typeof media === 'string') {
    return absolutise(baseUrl, media)
  }
  if (typeof media !== 'object') return undefined
  const o = media as Record<string, unknown>
  const direct = o.url
  if (typeof direct === 'string') return absolutise(baseUrl, direct)
  const data = o.data
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    const attrs = d.attributes as Record<string, unknown> | undefined
    const nested = attrs?.url ?? d.url
    if (typeof nested === 'string') return absolutise(baseUrl, nested)
  }
  return undefined
}

function absolutise(baseUrl: string, pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl
  return `${baseUrl.replace(/\/$/, '')}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}
