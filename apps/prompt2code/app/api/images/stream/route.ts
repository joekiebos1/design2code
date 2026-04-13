import { NextRequest, NextResponse } from 'next/server'
import { buildImageManifest } from '../../../lib/imageManifest'
import type { PageBrief } from '../../../lib/types'
import { registerStream } from '../stream-store'

type StreamEvent = {
  jobId: string
  slotId: string
  url: string
  alt: string
  source: 'library' | 'generated' | 'stock'
  ready: true
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const IMAGE_SERVICE_URL = process.env.IMAGE_SERVICE_URL

async function fetchDamImageUrls(): Promise<string[]> {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return []
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/dam_assets?status=eq.approved&select=image_url&order=created_at.desc`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
    )
    if (!res.ok) return []
    const rows = await res.json() as { image_url: string }[]
    return rows.map((r) => r.image_url).filter(Boolean)
  } catch {
    return []
  }
}

function resolveCallbackUrl(): string {
  return (
    process.env.CALLBACK_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    'http://localhost:3000'
  ) + '/api/images/ready'
}

/**
 * POST /api/images/stream
 *
 * Accepts: { jobId, brief }
 * Builds an ImageRequestManifest from the PageBrief and either:
 *   - Real mode: POSTs the manifest to IMAGE_SERVICE_URL, streams callbacks via SSE
 *   - Mock mode: Returns Sanity Image Library assets as stand-in images
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const jobId = body?.jobId as string | undefined

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    const brief = body?.brief as PageBrief | undefined
    if (!brief?.sections) {
      return NextResponse.json({ error: 'brief with sections is required' }, { status: 400 })
    }

    const callbackUrl = resolveCallbackUrl()
    const manifest = buildImageManifest(brief, jobId, callbackUrl)

    if (IMAGE_SERVICE_URL) {
      try {
        await fetch(IMAGE_SERVICE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(manifest),
        })
      } catch (err) {
        console.error('Content Manager request error:', err)
      }

      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          registerStream(jobId, controller, encoder, manifest.slots.length)
        },
      })
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      })
    }

    // Mock mode: stream DAM images as stand-ins for each slot
    const damUrls = await fetchDamImageUrls()
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        const pushEvent = (event: StreamEvent) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        }

        const tasks = manifest.slots.map((slot, idx) => {
          const delayMs = 200 + Math.random() * 800

          return delay(delayMs).then(() => {
            const url = damUrls.length > 0
              ? damUrls[idx % damUrls.length]
              : ''
            if (url) {
              pushEvent({
                jobId,
                slotId: slot.slotId,
                url,
                alt: `Image for ${slot.imageRole} — ${slot.adjacentText.headline ?? slot.blockType}`,
                source: 'library',
                ready: true,
              })
            }
          })
        })

        await Promise.all(tasks)
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('Image stream error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Stream failed' },
      { status: 500 }
    )
  }
}
