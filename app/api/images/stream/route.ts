import { NextRequest, NextResponse } from 'next/server'
import { extractArtDirectorPayload } from '../../../jiokarna/briefToBlocks'
import type { PageBrief } from '../../../jiokarna/types'
import { registerStream } from '../stream-store'

type BlockInput = { slot: string; section?: string; blockType?: string; headline?: string; imageBrief?: string; intent?: string; mediaStyle?: string }

type StreamEvent = {
  jobId: string
  slot: string
  url: string
  alt: string
  source: 'database' | 'generated'
  ready: true
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const IMAGE_SERVICE_URL = process.env.IMAGE_SERVICE_URL

/**
 * POST /api/images/stream
 *
 * Accepts either:
 * - Legacy: { jobId, blocks: [{ slot }] }
 * - Art Director: { jobId, product, audience, blocks } or { jobId, brief } (extracts from PageBrief)
 *
 * Mock: Simulates database (fast) and generated (slow) images.
 * Real: POSTs to IMAGE_SERVICE_URL, streams events as callbacks arrive at /api/images/ready.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const jobId = body?.jobId as string | undefined

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      'http://localhost:3000'

    let blocks: BlockInput[]
    if (body?.brief && body.brief?.sections) {
      const payload = extractArtDirectorPayload(body.brief as PageBrief, jobId)
      blocks = payload.blocks
      if (IMAGE_SERVICE_URL) {
        try {
          await fetch(IMAGE_SERVICE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...payload,
              callbackUrl: `${baseUrl}/api/images/ready`,
            }),
          })
        } catch (err) {
          console.error('Art Director webhook error:', err)
        }
      }
    } else {
      const rawBlocks = body?.blocks as BlockInput[] | undefined
      if (!Array.isArray(rawBlocks) || rawBlocks.length === 0) {
        return NextResponse.json({ error: 'blocks array or brief is required' }, { status: 400 })
      }
      blocks = rawBlocks
      if (IMAGE_SERVICE_URL && body?.product && body?.audience) {
        try {
          await fetch(IMAGE_SERVICE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jobId,
              product: body.product,
              audience: body.audience,
              blocks: blocks.map((b) => ({
                slot: b.slot,
                section: b.section ?? 'engage',
                blockType: b.blockType ?? 'unknown',
                headline: b.headline ?? '',
                imageBrief: b.imageBrief ?? '',
                intent: b.intent ?? 'lifestyle',
                mediaStyle: b.mediaStyle,
              })),
            }),
          })
        } catch (err) {
          console.error('Art Director webhook error:', err)
        }
      }
    }

    const encoder = new TextEncoder()

    if (IMAGE_SERVICE_URL && body?.brief) {
      const stream = new ReadableStream({
        start(controller) {
          registerStream(jobId, controller, encoder, blocks.length)
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

    const stream = new ReadableStream({
      async start(controller) {
        const pushEvent = (event: StreamEvent) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        }

        const tasks = blocks.map((block) => {
          const slot = typeof block === 'string' ? block : block.slot
          const isDatabase = Math.random() < 0.4
          const delayMs = isDatabase ? Math.random() * 500 : 3000 + Math.random() * 9000
          const source: 'database' | 'generated' = isDatabase ? 'database' : 'generated'
          const seed = encodeURIComponent(slot)

          return delay(delayMs).then(() => {
            pushEvent({
              jobId,
              slot,
              url: `https://picsum.photos/seed/${seed}/400/300`,
              alt: `Image for ${slot}`,
              source,
              ready: true,
            })
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
