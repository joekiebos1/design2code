import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? ''

/**
 * GET /api/dam-images
 * Returns approved image URLs from the Supabase DAM.
 */
export async function GET() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json({ urls: [], videoUrls: [] })
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/dam_assets?status=eq.approved&select=image_url,workflow_type&order=created_at.desc`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  )

  if (!res.ok) {
    return NextResponse.json({ urls: [], videoUrls: [] }, { status: 502 })
  }

  const rows = await res.json() as { image_url: string; workflow_type: string }[]
  const urls = rows.map((r) => r.image_url).filter(Boolean)

  return NextResponse.json({ urls, videoUrls: [] })
}
