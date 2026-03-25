import { NextResponse } from 'next/server'
import { createImageUrlBuilder } from '@sanity/image-url'
import { client } from '../../../../lib/sanity/client'

/**
 * GET /api/jiokarna/images
 * Returns image URLs (Image Library) and video URLs (Media Library file assets) for JioKarna preview.
 */
export async function GET() {
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
    console.error('JioKarna media fetch error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch media' },
      { status: 500 }
    )
  }
}
