import { NextRequest, NextResponse } from 'next/server'
import { pushCallback } from '../stream-store'

/**
 * POST /api/images/ready
 *
 * Callback receiver for Art Director (n8n).
 * Receives resolved images and pushes them to the connected SSE stream.
 *
 * Body: { jobId, slot, url, alt, source: "database" | "generated", ready: true }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const jobId = body?.jobId as string | undefined
    const slot = body?.slot as string | undefined
    const url = body?.url as string | undefined

    if (!jobId || !slot || !url) {
      return NextResponse.json(
        { error: 'jobId, slot, and url are required' },
        { status: 400 }
      )
    }

    const event = {
      jobId,
      slot,
      url,
      alt: (body?.alt as string) ?? '',
      source: (body?.source as string) ?? 'database',
      ready: body?.ready !== false,
    }

    const pushed = pushCallback(jobId, event)
    if (!pushed) {
      return NextResponse.json(
        { error: 'No stream registered for this jobId', jobId },
        { status: 404 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Images ready callback error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Callback failed' },
      { status: 500 }
    )
  }
}
