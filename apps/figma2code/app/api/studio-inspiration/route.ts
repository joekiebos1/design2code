import { createClient, type SanityClient } from '@sanity/client'
import { isFigmaUrl } from '../../studio/utils/is-figma-url'
import { isAllowedStudioMediaFile } from '../../../lib/studio-inspiration-allowed-files'
import { STUDIO_INSPIRATION_MAX_FILE_BYTES } from '../../../lib/studio-inspiration-limits'

export const runtime = 'nodejs'

const MEDIA_PROJECTION = `
  "mediaUrl": coalesce(media.asset->url, thumbnail.asset->url, mediaVideo.asset->url),
  "mimeType": coalesce(media.asset->mimeType, thumbnail.asset->mimeType, mediaVideo.asset->mimeType)
`

function getProjectConfig() {
  const projectId =
    process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
  const dataset =
    process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  return { projectId, dataset }
}

function getWriteClient(): SanityClient | null {
  const { projectId, dataset } = getProjectConfig()
  const token = process.env.SANITY_API_TOKEN
  if (!projectId || !token) return null
  return createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    token,
    useCdn: false,
  })
}

export async function GET(req: Request) {
  const client = getWriteClient()
  if (!client) {
    return Response.json(
      { error: 'Sanity is not configured (set SANITY_STUDIO_PROJECT_ID and SANITY_API_TOKEN).' },
      { status: 503 }
    )
  }
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')
  if (type !== 'benchmark' && type !== 'jioDesign') {
    return Response.json({ error: 'Query ?type= must be benchmark or jioDesign' }, { status: 400 })
  }
  const rows = await client.fetch<
    Array<{
      _id: string
      title: string | null
      linkUrl: string | null
      mediaUrl: string | null
      mimeType: string | null
    }>
  >(
    `*[_type == "studioInspiration" && inspirationType == $t] | order(_updatedAt desc) {
      _id,
      title,
      linkUrl,
      ${MEDIA_PROJECTION}
    }`,
    { t: type }
  )
  const items = rows.map((r) => ({
    id: r._id,
    title: r.title ?? '',
    url: r.linkUrl ?? '',
    mediaUrl: r.mediaUrl ?? '',
    mimeType: r.mimeType ?? '',
  }))
  return Response.json({ items })
}

export async function POST(req: Request) {
  const client = getWriteClient()
  if (!client) {
    return Response.json(
      { error: 'Sanity is not configured (set SANITY_STUDIO_PROJECT_ID and SANITY_API_TOKEN).' },
      { status: 503 }
    )
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
  const inspirationType = String(formData.get('inspirationType') ?? '').trim()

  if (!title || !linkUrl) {
    return Response.json({ error: 'title and linkUrl are required' }, { status: 400 })
  }
  if (inspirationType !== 'benchmark' && inspirationType !== 'jioDesign') {
    return Response.json({ error: 'inspirationType must be benchmark or jioDesign' }, { status: 400 })
  }

  try {
    const u = new URL(linkUrl)
    if (!u.protocol.startsWith('http')) {
      return Response.json({ error: 'linkUrl must be http(s)' }, { status: 400 })
    }
  } catch {
    return Response.json({ error: 'Invalid linkUrl' }, { status: 400 })
  }

  if (inspirationType === 'jioDesign' && !isFigmaUrl(linkUrl)) {
    return Response.json({ error: 'Jio Designs requires a valid https Figma URL' }, { status: 400 })
  }

  if (!(file instanceof Blob) || file.size === 0) {
    return Response.json({ error: 'Media file is required' }, { status: 400 })
  }

  if (!(file instanceof File)) {
    return Response.json({ error: 'Expected a File' }, { status: 400 })
  }

  if (file.size > STUDIO_INSPIRATION_MAX_FILE_BYTES) {
    return Response.json(
      { error: `File must be ${STUDIO_INSPIRATION_MAX_FILE_BYTES / (1024 * 1024)} MB or smaller` },
      { status: 413 }
    )
  }

  if (!isAllowedStudioMediaFile(file)) {
    return Response.json({ error: 'Only PNG or MP4 files are allowed' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const lower = file.name.toLowerCase()
  const isPng = file.type === 'image/png' || lower.endsWith('.png')
  const filename =
    file.name && (lower.endsWith('.png') || lower.endsWith('.mp4'))
      ? file.name
      : isPng
        ? 'upload.png'
        : 'upload.mp4'
  const contentType = isPng ? 'image/png' : 'video/mp4'

  const asset = await client.assets.upload('file', buffer, {
    filename,
    contentType,
  })

  const created = await client.create({
    _type: 'studioInspiration',
    title,
    linkUrl,
    inspirationType,
    media: {
      _type: 'file',
      asset: { _type: 'reference', _ref: asset._id },
    },
  })

  const row = await client.fetch<{
    mediaUrl: string | null
    mimeType: string | null
  }>(
    `*[_id == $id][0]{ ${MEDIA_PROJECTION} }`,
    { id: created._id }
  )

  return Response.json({
    id: created._id,
    title,
    url: linkUrl,
    mediaUrl: row?.mediaUrl ?? '',
    mimeType: row?.mimeType ?? '',
  })
}
