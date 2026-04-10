import { isFigmaUrl } from '../../studio/utils/is-figma-url'
import { isAllowedStudioMediaFile } from '../../../lib/studio-inspiration-allowed-files'
import { STUDIO_INSPIRATION_MAX_FILE_BYTES } from '../../../lib/studio-inspiration-limits'

export const runtime = 'nodejs'

function getStrapiConfig() {
  const baseUrl = process.env.STRAPI_URL
  const apiToken = process.env.STRAPI_API_TOKEN
  if (!baseUrl || !apiToken) return null
  return { baseUrl, apiToken }
}

function strapiHeaders(apiToken: string): HeadersInit {
  return { Authorization: `Bearer ${apiToken}` }
}

function resolveMediaUrl(baseUrl: string, media: Record<string, unknown> | null): { mediaUrl: string; mimeType: string } {
  if (!media) return { mediaUrl: '', mimeType: '' }
  const url = media.url as string | null
  const mime = media.mime as string | null
  if (!url) return { mediaUrl: '', mimeType: '' }
  const mediaUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
  return { mediaUrl, mimeType: mime ?? '' }
}

export async function GET(req: Request) {
  const cfg = getStrapiConfig()
  if (!cfg) {
    return Response.json({ error: 'Strapi is not configured (set STRAPI_URL and STRAPI_API_TOKEN).' }, { status: 503 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  if (type !== 'benchmark' && type !== 'jioDesign') {
    return Response.json({ error: 'Query ?type= must be benchmark or jioDesign' }, { status: 400 })
  }

  const qs = new URLSearchParams({
    'filters[category][$eq]': type,
    'populate': 'media',
    'sort': 'createdAt:desc',
    'pagination[pageSize]': '100',
  })

  const res = await fetch(`${cfg.baseUrl}/api/studio-inspirations?${qs}`, {
    headers: strapiHeaders(cfg.apiToken),
  })

  if (!res.ok) {
    return Response.json({ error: 'Failed to fetch from Strapi' }, { status: 502 })
  }

  const json = await res.json() as { data: unknown[] }
  const items = (json.data ?? []).map((entry: unknown) => {
    const e = entry as Record<string, unknown>
    const media = (e.media ?? null) as Record<string, unknown> | null
    const { mediaUrl, mimeType } = resolveMediaUrl(cfg.baseUrl, media)
    return {
      id: String(e.documentId ?? e.id ?? ''),
      title: String(e.title ?? ''),
      url: String(e.linkUrl ?? ''),
      mediaUrl: mediaUrl || String(e.mediaUrl ?? ''),
      mimeType: mimeType || String(e.mimeType ?? ''),
      description: e.description ? String(e.description) : undefined,
      viewport: e.viewport ? String(e.viewport) : undefined,
    }
  })

  return Response.json({ items })
}

export async function POST(req: Request) {
  const cfg = getStrapiConfig()
  if (!cfg) {
    return Response.json({ error: 'Strapi is not configured (set STRAPI_URL and STRAPI_API_TOKEN).' }, { status: 503 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return Response.json({ error: 'Expected multipart form data' }, { status: 400 })
  }

  const file = formData.get('file')
  const title = String(formData.get('title') ?? '').trim()
  const linkUrl = String(formData.get('linkUrl') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const viewport = String(formData.get('viewport') ?? '').trim()
  const category = String(formData.get('inspirationType') ?? '').trim()

  if (!title) {
    return Response.json({ error: 'title is required' }, { status: 400 })
  }
  if (category !== 'benchmark' && category !== 'jioDesign') {
    return Response.json({ error: 'inspirationType must be benchmark or jioDesign' }, { status: 400 })
  }

  const hasFile = file instanceof Blob && file.size > 0
  const hasUrl = linkUrl.length > 0

  if (!hasFile && !hasUrl) {
    return Response.json({ error: 'Either a media file or a URL is required' }, { status: 400 })
  }

  // Validate URL if provided
  if (hasUrl) {
    try {
      const u = new URL(linkUrl)
      if (!u.protocol.startsWith('http')) {
        return Response.json({ error: 'linkUrl must be http(s)' }, { status: 400 })
      }
    } catch {
      return Response.json({ error: 'Invalid linkUrl' }, { status: 400 })
    }
    if (category === 'jioDesign' && !isFigmaUrl(linkUrl)) {
      return Response.json({ error: 'Jio Designs requires a valid https Figma URL' }, { status: 400 })
    }
  }

  // Validate file if provided
  if (hasFile) {
    if (!(file instanceof File)) {
      return Response.json({ error: 'Expected a File' }, { status: 400 })
    }
    if (file.size > STUDIO_INSPIRATION_MAX_FILE_BYTES) {
      return Response.json({ error: `File must be ${STUDIO_INSPIRATION_MAX_FILE_BYTES / (1024 * 1024)} MB or smaller` }, { status: 413 })
    }
    if (!isAllowedStudioMediaFile(file)) {
      return Response.json({ error: 'Only image or video files are allowed (no PDFs)' }, { status: 400 })
    }
  }

  let uploadedFile: Record<string, unknown> | null = null

  // Upload file to Strapi media library if present
  if (hasFile && file instanceof File) {
    const uploadForm = new FormData()
    uploadForm.append('files', file, file.name || 'upload')

    const uploadRes = await fetch(`${cfg.baseUrl}/api/upload`, {
      method: 'POST',
      headers: strapiHeaders(cfg.apiToken),
      body: uploadForm,
    })

    if (!uploadRes.ok) {
      return Response.json({ error: 'Failed to upload media to Strapi' }, { status: 502 })
    }

    const uploaded = await uploadRes.json() as Array<Record<string, unknown>>
    uploadedFile = uploaded[0] ?? null
  }

  // Build Strapi entry data
  const entryData: Record<string, unknown> = {
    title,
    category,
    ...(linkUrl ? { linkUrl } : {}),
    ...(description ? { description } : {}),
    ...(viewport ? { viewport } : {}),
    ...(uploadedFile ? { media: uploadedFile.id, mimeType: String(uploadedFile.mime ?? '') } : {}),
  }

  const createRes = await fetch(`${cfg.baseUrl}/api/studio-inspirations`, {
    method: 'POST',
    headers: {
      ...strapiHeaders(cfg.apiToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: entryData }),
  })

  if (!createRes.ok) {
    return Response.json({ error: 'Failed to create entry in Strapi' }, { status: 502 })
  }

  const created = await createRes.json() as { data: Record<string, unknown> }
  const entry = created.data
  const { mediaUrl, mimeType } = resolveMediaUrl(cfg.baseUrl, uploadedFile)

  return Response.json({
    id: String(entry.documentId ?? entry.id ?? ''),
    title,
    url: linkUrl,
    mediaUrl,
    mimeType,
    description: description || undefined,
    viewport: viewport || undefined,
  })
}
