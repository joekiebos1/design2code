import { NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { briefToSanityBlocks } from '../../../jiokarna/briefToSanityBlocks'
import type { PageBrief } from '../../../jiokarna/types'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

export async function POST(request: Request) {
  if (!projectId || projectId === 'your-project-id') {
    return NextResponse.json(
      { error: 'SANITY_STUDIO_PROJECT_ID or NEXT_PUBLIC_SANITY_PROJECT_ID not configured' },
      { status: 500 }
    )
  }
  if (!token) {
    return NextResponse.json(
      { error: 'SANITY_API_TOKEN is required for creating pages. Add it to .env' },
      { status: 500 }
    )
  }

  let brief: PageBrief
  try {
    const body = await request.json()
    brief = body as PageBrief
    if (!brief?.meta?.pageName || !brief?.meta?.slug || !Array.isArray(brief?.sections)) {
      return NextResponse.json(
        { error: 'Invalid brief: meta.pageName, meta.slug, and sections are required' },
        { status: 400 }
      )
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-01-01',
    token,
    useCdn: false,
  })

  try {
    const imageAssets = await client.fetch<{ _id: string }[]>(
      `*[_type == "sanity.imageAsset"]{ _id }`
    )
    const imageAssetIds = imageAssets.map((a) => a._id)

    const videoAssets = await client.fetch<{ _id: string }[]>(
      `*[_type == "sanity.fileAsset" && mimeType match "video*"]{ _id }`
    )
    const videoAssetIds = videoAssets.map((a) => a._id)

    const sections = briefToSanityBlocks(brief, imageAssetIds, videoAssetIds)

    const slug = brief.meta.slug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (!slug) {
      return NextResponse.json(
        { error: 'Invalid slug: meta.slug must produce a valid URL segment' },
        { status: 400 }
      )
    }

    const existing = await client.fetch<{ _id: string } | null>(
      `*[_type == "page" && slug.current == $slug][0]{ _id }`,
      { slug }
    )
    if (existing) {
      return NextResponse.json(
        { error: `A page with slug "${slug}" already exists. Choose a different slug or edit the existing page in Sanity Studio.` },
        { status: 409 }
      )
    }

    const pageDoc = {
      _type: 'page',
      title: brief.meta.pageName,
      slug: { _type: 'slug', current: slug },
      sections,
    }

    const created = await client.create(pageDoc)

    return NextResponse.json({
      success: true,
      id: created._id,
      slug,
      title: brief.meta.pageName,
      message: `Page "${brief.meta.pageName}" created. Visit /${slug} to view.`,
    })
  } catch (err) {
    console.error('JioKarna create-page error:', err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Failed to create page in Sanity',
      },
      { status: 500 }
    )
  }
}
