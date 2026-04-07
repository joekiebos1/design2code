import { NextRequest, NextResponse } from 'next/server'
import { pushCallback, type CallbackEvent } from '../stream-store'

/**
 * POST /api/images/ready
 *
 * Callback receiver for the Content Manager.
 * Receives resolved images and pushes them to the connected SSE stream.
 *
 * Body (ImageSlotResponse):
 *   { jobId, slotId, url, alt, source: "library" | "generated" | "stock", width?, height?, metadata? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const jobId = body?.jobId as string | undefined
    const slotId = (body?.slotId ?? body?.slot) as string | undefined
    const url = body?.url as string | undefined

    if (!jobId || !slotId || !url) {
      return NextResponse.json(
        { error: 'jobId, slotId, and url are required' },
        { status: 400 }
      )
    }

    const event: CallbackEvent = {
      jobId,
      slotId,
      url,
      alt: (body?.alt as string) ?? '',
      source: (body?.source as string) ?? 'library',
      ready: body?.ready !== false,
      ...(body?.width != null ? { width: body.width as number } : {}),
      ...(body?.height != null ? { height: body.height as number } : {}),
      ...(body?.metadata != null ? { metadata: body.metadata as Record<string, unknown> } : {}),
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
