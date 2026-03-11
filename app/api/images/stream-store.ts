/**
 * Shared store for SSE stream controllers.
 * Used when IMAGE_SERVICE_URL is set: Art Director callbacks push to the connected client.
 */

type StreamController = {
  controller: ReadableStreamDefaultController<Uint8Array>
  encoder: TextEncoder
  pendingCount: number
}

const streams = new Map<string, StreamController>()

export function registerStream(
  jobId: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  pendingCount: number
): void {
  streams.set(jobId, { controller, encoder, pendingCount })
}

export function pushCallback(
  jobId: string,
  event: { jobId: string; slot: string; url: string; alt: string; source: string; ready: boolean }
): boolean {
  const entry = streams.get(jobId)
  if (!entry) return false

  entry.controller.enqueue(entry.encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
  entry.pendingCount--
  if (entry.pendingCount <= 0) {
    entry.controller.close()
    streams.delete(jobId)
  }
  return true
}

/** Push a custom event without decrementing pendingCount (e.g. webhook response for debug). */
export function pushRawEvent(jobId: string, event: Record<string, unknown>): boolean {
  const entry = streams.get(jobId)
  if (!entry) return false
  entry.controller.enqueue(entry.encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
  return true
}
