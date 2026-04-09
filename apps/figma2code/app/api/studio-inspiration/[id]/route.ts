import { createClient, type SanityClient } from '@sanity/client'

export const runtime = 'nodejs'

const MEDIA_PROJECTION = `
  "mediaUrl": coalesce(media.asset->url, thumbnail.asset->url, mediaVideo.asset->url),
  "mimeType": coalesce(media.asset->mimeType, thumbnail.asset->mimeType, mediaVideo.asset->mimeType)
`

function getWriteClient(): SanityClient | null {
  const projectId =
    process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
  const dataset =
    process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
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

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const client = getWriteClient()
  if (!client) {
    return Response.json(
      { error: 'Sanity is not configured (set SANITY_STUDIO_PROJECT_ID and SANITY_API_TOKEN).' },
      { status: 503 }
    )
  }
  const { id: rawId } = await context.params
  const id = decodeURIComponent(rawId)

  const row = await client.fetch<{
    _id: string
    title: string | null
    linkUrl: string | null
    mediaUrl: string | null
    mimeType: string | null
    inspirationType: string | null
  } | null>(
    `*[_type == "studioInspiration" && _id == $id][0]{
      _id,
      title,
      linkUrl,
      inspirationType,
      ${MEDIA_PROJECTION}
    }`,
    { id }
  )

  if (!row) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  return Response.json({
    id: row._id,
    title: row.title ?? '',
    url: row.linkUrl ?? '',
    mediaUrl: row.mediaUrl ?? '',
    mimeType: row.mimeType ?? '',
    inspirationType: row.inspirationType,
  })
}
