export const runtime = 'nodejs'

function getStrapiConfig() {
  const baseUrl = process.env.STRAPI_URL
  const apiToken = process.env.STRAPI_API_TOKEN
  if (!baseUrl || !apiToken) return null
  return { baseUrl, apiToken }
}

function resolveMediaUrl(baseUrl: string, media: Record<string, unknown> | null): { mediaUrl: string; mimeType: string } {
  if (!media) return { mediaUrl: '', mimeType: '' }
  const url = media.url as string | null
  const mime = media.mime as string | null
  if (!url) return { mediaUrl: '', mimeType: '' }
  const mediaUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
  return { mediaUrl, mimeType: mime ?? '' }
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const cfg = getStrapiConfig()
  if (!cfg) {
    return Response.json(
      { error: 'Strapi is not configured (set STRAPI_URL and STRAPI_API_TOKEN).' },
      { status: 503 }
    )
  }

  const { id } = await context.params

  const qs = new URLSearchParams({ 'populate': 'media' })
  const res = await fetch(`${cfg.baseUrl}/api/studio-inspirations/${id}?${qs}`, {
    headers: { Authorization: `Bearer ${cfg.apiToken}` },
  })

  if (res.status === 404) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }
  if (!res.ok) {
    return Response.json({ error: 'Failed to fetch from Strapi' }, { status: 502 })
  }

  const json = await res.json() as { data: Record<string, unknown> }
  const e = json.data
  const media = (e.media ?? null) as Record<string, unknown> | null
  const { mediaUrl, mimeType } = resolveMediaUrl(cfg.baseUrl, media)

  return Response.json({
    id: String(e.documentId ?? e.id ?? ''),
    title: String(e.title ?? ''),
    url: String(e.linkUrl ?? ''),
    mediaUrl: mediaUrl || String(e.mediaUrl ?? ''),
    mimeType: mimeType || String(e.mimeType ?? ''),
    inspirationType: String(e.category ?? ''),
  })
}
