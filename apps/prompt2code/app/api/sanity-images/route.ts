import { NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production'

/**
 * GET /api/sanity-images
 * Returns image CDN URLs and video URLs from the Sanity Media Library.
 * Used by the preview to show the same images that will be published.
 */
export async function GET() {
  if (!projectId || projectId === 'your-project-id') {
    return NextResponse.json(
      { error: 'Sanity project ID not configured', urls: [], videoUrls: [] },
      { status: 500 }
    )
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    useCdn: true,
  })

  try {
    const assets = await client.fetch<{ _id: string }[]>(
      `*[_type == "sanity.imageAsset"]{ _id }`
    )
    const builder = createImageUrlBuilder(client)
    const urls = assets
      .map((a) => {
        if (!a?._id) return null
        try {
          return builder.image(a._id).url()
        } catch {
          return null
        }
      })
      .filter((u): u is string => typeof u === 'string' && u.trim() !== '')

    const videoRows = await client.fetch<{ url: string | null }[]>(
      `*[_type == "sanity.fileAsset" && mimeType match "video*"]{ url }`
    )
    const videoUrls = videoRows
      .map((r) => r.url)
      .filter((u): u is string => typeof u === 'string' && u.trim() !== '')

    return NextResponse.json({ urls, videoUrls })
  } catch (err) {
    console.error('Sanity media fetch error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch media', urls: [], videoUrls: [] },
      { status: 500 }
    )
  }
}
