import { NextRequest, NextResponse } from 'next/server'
import { registerStream, pushCallback, pushRawEvent } from '../stream-store'

type ImageEvent = {
  jobId: string
  slotId: string
  url: string
  alt?: string
  source?: string
  ready?: boolean
}

function extractEventsFromResponse(data: unknown, jobId: string): ImageEvent[] {
  if (!data || typeof data !== 'object') return []
  const arr = Array.isArray(data)
    ? data
    : 'events' in data && Array.isArray((data as { events: unknown }).events)
      ? (data as { events: unknown[] }).events
      : ('slotId' in data || 'slot' in data) && 'url' in data
        ? [data]
        : []
  return arr
    .filter((e): e is Record<string, unknown> => e && typeof e === 'object' && ('slotId' in e || 'slot' in e) && 'url' in e)
    .map((e) => ({
      jobId: (e.jobId as string) ?? jobId,
      slotId: String(e.slotId ?? e.slot),
      url: String(e.url),
      alt: (e.alt as string) ?? '',
      source: (e.source as string) ?? 'library',
      ready: (e.ready as boolean) !== false,
    }))
}

const TEST_IMAGES_WEBHOOK_URL =
  'https://meet-collaborative-allan-cork.trycloudflare.com/webhook/joeri'

type BlockInput = {
  slot: string
  section?: string
  blockType?: string
  headline?: string
  imageBrief?: string
  intent?: string
  mediaStyle?: string
}

/**
 * POST /api/images/stream-test
 *
 * Test-images page: POSTs full Art Director payload to webhook, streams events from callbacks.
 * Uses hardcoded webhook URL (not IMAGE_SERVICE_URL).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const jobId = body?.jobId as string | undefined
    const product = body?.product as string | undefined
    const audience = body?.audience as string | undefined
    const rawBlocks = body?.blocks as BlockInput[] | undefined

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }
    if (!Array.isArray(rawBlocks) || rawBlocks.length === 0) {
      return NextResponse.json({ error: 'blocks array is required' }, { status: 400 })
    }

    /** Use CALLBACK_BASE_URL when running a Cloudflare tunnel to localhost (e.g. https://xxx.trycloudflare.com) */
    const baseUrl =
      process.env.CALLBACK_BASE_URL ||
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      'http://localhost:3000'

    const blocks = rawBlocks.map((b) => ({
      slot: b.slot,
      section: b.section ?? 'engage',
      blockType: b.blockType ?? 'unknown',
      headline: b.headline ?? '',
      imageBrief: b.imageBrief ?? '',
      intent: b.intent ?? 'lifestyle',
      mediaStyle: b.mediaStyle,
    }))

    const payload = {
      jobId,
      product: product ?? 'Jiosaavn',
      audience: audience ?? 'Music lovers, young adults in India',
      blocks,
      callbackUrl: `${baseUrl}/api/images/ready`,
    }

    let responseEvents: ImageEvent[] = []
    let webhookResponseBody: string | null = null
    try {
      const res = await fetch(TEST_IMAGES_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const text = await res.text()
      webhookResponseBody = text || null
      if (text) {
        try {
          const data = JSON.parse(text)
          responseEvents = extractEventsFromResponse(data, jobId)
        } catch {
          // not JSON, ignore
        }
      }
    } catch (err) {
      console.error('Test images webhook error:', err)
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        registerStream(jobId, controller, encoder, blocks.length)
        if (webhookResponseBody !== null) {
          pushRawEvent(jobId, {
            _type: 'webhookResponse',
            status: 'ok',
            body: webhookResponseBody,
            bodyParsed: (() => {
              try {
                return JSON.parse(webhookResponseBody!)
              } catch {
                return null
              }
            })(),
            eventsFromBody: responseEvents.length,
          })
        }
        for (const ev of responseEvents) {
          pushCallback(jobId, {
            jobId: ev.jobId,
            slotId: ev.slotId,
            url: ev.url,
            alt: ev.alt ?? '',
            source: ev.source ?? 'library',
            ready: ev.ready ?? false,
          })
        }
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
    console.error('Stream test error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Stream failed' },
      { status: 500 }
    )
  }
}
