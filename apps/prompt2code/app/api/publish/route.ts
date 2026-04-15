import { NextResponse } from 'next/server'
import { briefToStrapiBlocks } from '../../lib/briefToStrapiBlocks'
import type { PageBrief } from '../../lib/types'

const STRAPI_URL = process.env.STRAPI_URL
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

export async function POST(request: Request) {
  if (!STRAPI_URL) {
    return NextResponse.json(
      { error: 'STRAPI_URL is not configured' },
      { status: 500 }
    )
  }
  if (!STRAPI_API_TOKEN) {
    return NextResponse.json(
      { error: 'STRAPI_API_TOKEN is required for publishing pages. Add it to .env' },
      { status: 500 }
    )
  }

  let brief: PageBrief
  let providedImageUrls: string[] | undefined
  let providedVideoUrls: string[] | undefined

  try {
    const body = await request.json()
    brief = body.brief ?? (body as PageBrief)
    providedImageUrls = body.imageUrls
    providedVideoUrls = body.videoUrls

    if (!brief?.meta?.pageName || !brief?.meta?.slug || !Array.isArray(brief?.sections)) {
      return NextResponse.json(
        { error: 'Invalid brief: meta.pageName, meta.slug, and sections are required' },
        { status: 400 }
      )
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const authHeaders = {
    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    'Content-Type': 'application/json',
  }

  try {
    // Fetch media from Strapi if not provided
    let imageUrls: string[] = providedImageUrls ?? []
    let videoUrls: string[] = providedVideoUrls ?? []

    if (!providedImageUrls || !providedVideoUrls) {
      const mediaRes = await fetch(`${STRAPI_URL}/api/upload/files`, {
        headers: authHeaders,
      })
      if (mediaRes.ok) {
        const mediaData = await mediaRes.json()
        const files: { url: string; mime: string }[] = Array.isArray(mediaData) ? mediaData : (mediaData.data ?? [])

        if (!providedImageUrls) {
          imageUrls = files.filter((f) => f.mime?.startsWith('image/')).map((f) => f.url)
        }
        if (!providedVideoUrls) {
          videoUrls = files.filter((f) => f.mime?.startsWith('video/')).map((f) => f.url)
        }
      }
    }

    // Convert brief to Strapi blocks
    const blocks = briefToStrapiBlocks(brief, imageUrls, videoUrls)

    // Normalize slug
    const slug = brief.meta.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (!slug) {
      return NextResponse.json(
        { error: 'Invalid slug: meta.slug must produce a valid URL segment' },
        { status: 400 }
      )
    }

    const title = brief.meta.pageName

    // Check if page exists
    const existingRes = await fetch(
      `${STRAPI_URL}/api/pages?filters[slug][$eq]=${encodeURIComponent(slug)}&fields[0]=documentId&fields[1]=id`,
      { headers: authHeaders }
    )
    const existingData = await existingRes.json()
    const existingItems: { documentId: string; id: number }[] = existingData?.data ?? []
    const existing = existingItems[0] ?? null

    if (existing) {
      const updateRes = await fetch(`${STRAPI_URL}/api/pages/${existing.documentId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ data: { title, blocks } }),
      })
      const updateData = await updateRes.json()
      if (!updateRes.ok) {
        throw new Error(updateData?.error?.message ?? `Strapi PUT failed: ${updateRes.status}`)
      }

      return NextResponse.json({
        success: true,
        id: existing.documentId,
        slug,
        title,
        message: `Page "${title}" updated. Visit /${slug} to view.`,
      })
    }

    // Create new page
    const createRes = await fetch(`${STRAPI_URL}/api/pages`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ data: { title, slug, blocks } }),
    })
    const createData = await createRes.json()
    if (!createRes.ok) {
      throw new Error(createData?.error?.message ?? `Strapi POST failed: ${createRes.status}`)
    }

    const createdId = createData?.data?.documentId ?? createData?.data?.id

    return NextResponse.json({
      success: true,
      id: createdId,
      slug,
      title,
      message: `Page "${title}" created. Visit /${slug} to view.`,
    })
  } catch (err) {
    console.error('Publish route error:', err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to publish page to Strapi',
      },
      { status: 500 }
    )
  }
}
