'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@marcelinodzn/ds-react'

const TEST_IMAGES_WEBHOOK = 'https://meet-collaborative-allan-cork.trycloudflare.com/webhook/joeri'

const ART_DIRECTOR_PAYLOAD = {
  product: 'Jiosaavn',
  audience: 'Music lovers, young adults in India',
  blocks: [
    {
      slot: 'hero-0-image',
      section: 'engage',
      blockType: 'hero',
      headline: 'Millions of songs. One app.',
      imageBrief:
        'Jiosaavn hero: person listening to music on headphones, modern lifestyle, vibrant colors, music streaming app on phone',
      intent: 'lifestyle',
    },
    {
      slot: 'hero-1-image',
      section: 'engage',
      blockType: 'hero',
      headline: 'Discover your next favorite artist',
      imageBrief:
        'Jiosaavn hero: music discovery, curated playlists, diverse genres, upbeat mood',
      intent: 'lifestyle',
    },
    {
      slot: 'mediaTextBlock-0-media',
      section: 'engage',
      blockType: 'mediaTextBlock',
      headline: 'Stream anywhere',
      imageBrief:
        'Jiosaavn: person streaming music on phone while commuting, headphones, urban setting',
      intent: 'lifestyle',
      mediaStyle: 'contained',
    },
    {
      slot: 'mediaTextBlock-1-media',
      section: 'engage',
      blockType: 'mediaTextBlock',
      headline: 'Offline listening',
      imageBrief:
        'Jiosaavn: downloaded songs for offline playback, airplane or no-signal scenario, music always available',
      intent: 'lifestyle',
      mediaStyle: 'contained',
    },
    {
      slot: 'mediaTextBlock-2-media',
      section: 'engage',
      blockType: 'mediaTextBlock',
      headline: 'Curated playlists',
      imageBrief:
        'Jiosaavn: music playlists for every mood, Bollywood, regional, international, personalized recommendations',
      intent: 'lifestyle',
      mediaStyle: 'contained',
    },
    {
      slot: 'carousel-0-item-0-image',
      section: 'engage',
      blockType: 'carousel',
      headline: 'Bollywood hits',
      imageBrief:
        'Jiosaavn: Bollywood music, film songs, Hindi cinema soundtrack, popular tracks',
      intent: 'lifestyle',
    },
    {
      slot: 'carousel-0-item-1-image',
      section: 'engage',
      blockType: 'carousel',
      headline: 'Podcasts & shows',
      imageBrief: 'Jiosaavn: podcasts, audio shows, spoken content, diverse topics',
      intent: 'lifestyle',
    },
    {
      slot: 'cardGrid-0-item-0-image',
      section: 'engage',
      blockType: 'cardGrid',
      headline: 'New releases',
      imageBrief:
        'Jiosaavn: latest music releases, new albums, fresh tracks, trending now',
      intent: 'lifestyle',
    },
  ],
}

type StreamEvent = {
  raw: string
  parsed: Record<string, unknown>
}

export default function TestImagesPage() {
  const [jobId, setJobId] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [images, setImages] = useState<Record<string, { url: string; alt: string; source: string; ready: boolean }>>({})
  const [eventsReceived, setEventsReceived] = useState<StreamEvent[]>([])
  const [payloadSent, setPayloadSent] = useState<string | null>(null)
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const totalCount = ART_DIRECTOR_PAYLOAD.blocks.length
  const readyCount = Object.values(images).filter((i) => i?.ready).length

  useEffect(() => {
    if (!startTime) return
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 100)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [startTime])

  useEffect(() => {
    fetch('/api/images/callback-url')
      .then((res) => res.json())
      .then((data) => setCallbackUrl(data?.callbackUrl ?? null))
      .catch(() => setCallbackUrl(null))
  }, [])

  const handleStart = async () => {
    const id = crypto.randomUUID()
    setJobId(id)
    setStartTime(Date.now())
    setElapsed(0)
    setImages({})
    setEventsReceived([])

    let url = 'http://localhost:3000/api/images/ready'
    try {
      const res = await fetch('/api/images/callback-url')
      const data = await res.json()
      if (data?.callbackUrl) url = data.callbackUrl
    } catch {
      // use default
    }
    setCallbackUrl(url)

    const payload = {
      jobId: id,
      ...ART_DIRECTOR_PAYLOAD,
      callbackUrl: url,
    }
    setPayloadSent(JSON.stringify(payload, null, 2))

    abortRef.current = new AbortController()

    fetch('/api/images/stream-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: abortRef.current.signal,
    })
      .then(async (res) => {
        if (!res.body) return
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const chunks = buffer.split('\n\n')
          buffer = chunks.pop() ?? ''

          for (const chunk of chunks) {
            const match = chunk.match(/^data: (.+)$/m)
            if (match) {
              const raw = match[1]
              setEventsReceived((prev) => {
                let parsed: Record<string, unknown> = {}
                try {
                  parsed = JSON.parse(raw) as Record<string, unknown>
                } catch {
                  parsed = { _parseError: true, raw }
                }
                return [...prev, { raw, parsed }]
              })
              try {
                const event = JSON.parse(raw) as {
                  slot?: string
                  url?: string
                  alt?: string
                  source?: string
                  ready?: boolean
                }
                const slot = event.slot
                const url = event.url
                if (slot && url) {
                  setImages((prev) => ({
                    ...prev,
                    [slot]: {
                      url,
                      alt: event.alt ?? '',
                      source: event.source ?? 'database',
                      ready: event.ready ?? true,
                    },
                  }))
                }
              } catch {
                // ignore
              }
            }
          }
        }
      })
      .catch(() => {
        // aborted or network error
      })
  }

  const handleReset = () => {
    abortRef.current?.abort()
    setJobId(null)
    setStartTime(null)
    setElapsed(0)
    setImages({})
    setEventsReceived([])
    setPayloadSent(null)
  }

  return (
    <div
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: 'var(--ds-spacing-xl)',
        fontFamily: 'var(--ds-font-family)',
      }}
    >
      <h1 style={{ margin: 0, marginBottom: 'var(--ds-spacing-l)', fontSize: 'var(--ds-typography-h4)' }}>
        Image stream test
      </h1>
      <div style={{ marginBottom: 'var(--ds-spacing-l)' }}>
        <p style={{ color: 'var(--ds-color-text-low)', fontSize: 'var(--ds-typography-body-s)', margin: 0 }}>
          Webhook: {TEST_IMAGES_WEBHOOK}
        </p>
        <p style={{ color: 'var(--ds-color-text-low)', fontSize: 'var(--ds-typography-body-s)', margin: 'var(--ds-spacing-s) 0 0' }}>
          Callback URL: {callbackUrl ?? 'Loading…'}
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 'var(--ds-spacing-m)',
          alignItems: 'center',
          marginBottom: 'var(--ds-spacing-xl)',
          flexWrap: 'wrap',
        }}
      >
        {!jobId ? (
          <Button onPress={handleStart} appearance="primary" size="M">
            Start test
          </Button>
        ) : (
          <>
            <Button onPress={handleReset} appearance="secondary" contained={false} size="M">
              Reset
            </Button>
            <span style={{ fontSize: 'var(--ds-typography-body-s)', color: 'var(--ds-color-text-medium)' }}>
              {readyCount} of {totalCount} images ready
            </span>
            <span style={{ fontSize: 'var(--ds-typography-body-s)', color: 'var(--ds-color-text-low)' }}>
              {elapsed}s elapsed
            </span>
          </>
        )}
      </div>

      {jobId && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 'var(--ds-spacing-l)',
              marginBottom: 'var(--ds-spacing-2xl)',
            }}
          >
            {ART_DIRECTOR_PAYLOAD.blocks.map(({ slot }) => {
              const state = images[slot]
              const ready = state?.ready ?? false
              const source = state?.source ?? 'database'

              return (
                <div
                  key={slot}
                  style={{
                    border: '1px solid var(--ds-color-stroke-subtle)',
                    borderRadius: 'var(--ds-radius-card)',
                    overflow: 'hidden',
                    background: 'var(--ds-color-background-default)',
                  }}
                >
                  <div
                    style={{
                      padding: 'var(--ds-spacing-s)',
                      fontSize: 'var(--ds-typography-label-s)',
                      fontWeight: 'var(--ds-typography-weight-medium)',
                      color: 'var(--ds-color-text-high)',
                      borderBottom: '1px solid var(--ds-color-stroke-subtle)',
                    }}
                  >
                    {slot}
                  </div>
                  <div
                    style={{
                      aspectRatio: '4/3',
                      position: 'relative',
                      background: 'var(--ds-color-background-subtle)',
                    }}
                  >
                    {!ready ? (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background: 'var(--ds-color-background-subtle)',
                          animation: 'stream-image-skeleton 1.5s ease-in-out infinite',
                        }}
                      />
                    ) : (
                      <>
                        <img
                          src={state.url}
                          alt={state.alt}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            bottom: 'var(--ds-spacing-xs)',
                            left: 'var(--ds-spacing-xs)',
                            padding: 'var(--ds-spacing-2xs) var(--ds-spacing-xs)',
                            borderRadius: 'var(--ds-radius-chip)',
                            fontSize: 'var(--ds-typography-label-xs)',
                            fontWeight: 'var(--ds-typography-weight-medium)',
                            color: 'white',
                            background:
                              source === 'database'
                                ? 'var(--ds-color-positive-bold)'
                                : 'var(--ds-color-warning-bold)',
                          }}
                        >
                          {source}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div
            style={{
              border: '1px solid var(--ds-color-stroke-subtle)',
              borderRadius: 'var(--ds-radius-card)',
              overflow: 'hidden',
              background: 'var(--ds-color-background-subtle)',
            }}
          >
            <div
              style={{
                padding: 'var(--ds-spacing-m)',
                borderBottom: '1px solid var(--ds-color-stroke-subtle)',
                fontSize: 'var(--ds-typography-label-m)',
                fontWeight: 'var(--ds-typography-weight-medium)',
                color: 'var(--ds-color-text-high)',
              }}
            >
              Debug: payload sent & responses
            </div>
            <div style={{ padding: 'var(--ds-spacing-m)', maxHeight: 400, overflow: 'auto' }}>
              {callbackUrl && (
                <div style={{ marginBottom: 'var(--ds-spacing-xl)' }}>
                  <div
                    style={{
                      fontSize: 'var(--ds-typography-label-s)',
                      color: 'var(--ds-color-text-medium)',
                      marginBottom: 'var(--ds-spacing-xs)',
                    }}
                  >
                    Callback URL
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      padding: 'var(--ds-spacing-m)',
                      background: 'var(--ds-color-background-default)',
                      borderRadius: 'var(--ds-radius-chip)',
                      fontSize: 'var(--ds-typography-body-xs)',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      overflow: 'auto',
                    }}
                  >
                    {callbackUrl}
                  </pre>
                </div>
              )}
              {(() => {
                const webhookEv = eventsReceived.find((e) => (e.parsed as { _type?: string })._type === 'webhookResponse')
                if (!webhookEv) return null

                const body = (webhookEv.parsed as { body?: string }).body
                const bodyParsed = (webhookEv.parsed as { bodyParsed?: Record<string, unknown> }).bodyParsed

                /** Extract base64 image as data URL from body or parsed JSON */
                const getBase64ImageSrc = (): string | null => {
                  if (!body) return null
                  if (body.startsWith('data:image/')) return body
                  const base64Match = body.match(/^[A-Za-z0-9+/=]+$/)
                  if (base64Match && body.length > 100) return `data:image/png;base64,${body}`
                  if (bodyParsed && typeof bodyParsed === 'object') {
                    const img =
                      (bodyParsed.image as string) ??
                      (bodyParsed.data as string) ??
                      (bodyParsed.base64 as string) ??
                      (bodyParsed.url as string)
                    if (typeof img === 'string') {
                      if (img.startsWith('data:image/')) return img
                      if (/^[A-Za-z0-9+/=]+$/.test(img) && img.length > 100) return `data:image/png;base64,${img}`
                    }
                  }
                  return null
                }
                const imageSrc = getBase64ImageSrc()

                return (
                  <div style={{ marginBottom: 'var(--ds-spacing-xl)' }}>
                    {imageSrc && (
                      <div style={{ marginBottom: 'var(--ds-spacing-m)' }}>
                        <div
                          style={{
                            fontSize: 'var(--ds-typography-label-s)',
                            color: 'var(--ds-color-text-medium)',
                            marginBottom: 'var(--ds-spacing-xs)',
                          }}
                        >
                          Webhook response (image)
                        </div>
                        <div
                          style={{
                            padding: 'var(--ds-spacing-m)',
                            background: 'var(--ds-color-background-default)',
                            borderRadius: 'var(--ds-radius-chip)',
                            border: '1px solid var(--ds-color-stroke-subtle)',
                            display: 'inline-block',
                            maxWidth: '100%',
                          }}
                        >
                          <img
                            src={imageSrc}
                            alt="Webhook response"
                            style={{
                              maxWidth: 400,
                              maxHeight: 300,
                              objectFit: 'contain',
                              display: 'block',
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 'var(--ds-typography-label-s)',
                        color: 'var(--ds-color-text-medium)',
                        marginBottom: 'var(--ds-spacing-xs)',
                      }}
                    >
                      Webhook response body
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: 'var(--ds-spacing-m)',
                        background: 'var(--ds-color-background-default)',
                        borderRadius: 'var(--ds-radius-chip)',
                        fontSize: 'var(--ds-typography-body-xs)',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        overflow: 'auto',
                        maxHeight: 120,
                      }}
                    >
                      {body
                        ? body.length > 500
                          ? `${body.slice(0, 200)}… [${body.length} chars total]`
                          : body
                        : JSON.stringify(webhookEv.parsed, null, 2)}
                    </pre>
                    {bodyParsed != null && (
                      <details style={{ marginTop: 'var(--ds-spacing-xs)' }}>
                        <summary style={{ fontSize: 'var(--ds-typography-label-xs)', cursor: 'pointer' }}>
                          Parsed JSON
                        </summary>
                        <pre
                          style={{
                            margin: 'var(--ds-spacing-xs) 0 0',
                            fontSize: 'var(--ds-typography-body-xs)',
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                            color: 'var(--ds-color-text-low)',
                          }}
                        >
                          {JSON.stringify(bodyParsed, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                )
              })()}
              {payloadSent && (
                <div style={{ marginBottom: 'var(--ds-spacing-xl)' }}>
                  <div
                    style={{
                      fontSize: 'var(--ds-typography-label-s)',
                      color: 'var(--ds-color-text-medium)',
                      marginBottom: 'var(--ds-spacing-xs)',
                    }}
                  >
                    Payload sent (JSON)
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      padding: 'var(--ds-spacing-m)',
                      background: 'var(--ds-color-background-default)',
                      borderRadius: 'var(--ds-radius-chip)',
                      fontSize: 'var(--ds-typography-body-xs)',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      overflow: 'auto',
                    }}
                  >
                    {payloadSent}
                  </pre>
                </div>
              )}
              <div>
                <div
                  style={{
                    fontSize: 'var(--ds-typography-label-s)',
                    color: 'var(--ds-color-text-medium)',
                    marginBottom: 'var(--ds-spacing-xs)',
                  }}
                >
                  Events received ({eventsReceived.filter((e) => (e.parsed as { _type?: string })._type !== 'webhookResponse').length})
                </div>
                {eventsReceived.filter((e) => (e.parsed as { _type?: string })._type !== 'webhookResponse').length === 0 ? (
                  <div style={{ color: 'var(--ds-color-text-low)', fontSize: 'var(--ds-typography-body-s)' }}>
                    Waiting for callbacks from webhook…
                  </div>
                ) : (
                  eventsReceived
                    .filter((e) => (e.parsed as { _type?: string })._type !== 'webhookResponse')
                    .map((ev, i) => (
                    <div
                      key={i}
                      style={{
                        marginBottom: 'var(--ds-spacing-m)',
                        padding: 'var(--ds-spacing-m)',
                        background: 'var(--ds-color-background-default)',
                        borderRadius: 'var(--ds-radius-chip)',
                        border: '1px solid var(--ds-color-stroke-subtle)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 'var(--ds-typography-label-xs)',
                          color: 'var(--ds-color-text-low)',
                          marginBottom: 'var(--ds-spacing-xs)',
                        }}
                      >
                        Event #{i + 1}
                      </div>
                      <pre
                        style={{
                          margin: 0,
                          fontSize: 'var(--ds-typography-body-xs)',
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                          overflow: 'auto',
                        }}
                      >
                        {JSON.stringify(ev.parsed, null, 2)}
                      </pre>
                      <details style={{ marginTop: 'var(--ds-spacing-xs)' }}>
                        <summary style={{ fontSize: 'var(--ds-typography-label-xs)', cursor: 'pointer' }}>
                          Raw JSON text
                        </summary>
                        <pre
                          style={{
                            margin: 'var(--ds-spacing-xs) 0 0',
                            fontSize: 'var(--ds-typography-body-xs)',
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all',
                            color: 'var(--ds-color-text-low)',
                          }}
                        >
                          {ev.raw}
                        </pre>
                      </details>
                    </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {!jobId && (
        <p style={{ color: 'var(--ds-color-text-low)', fontSize: 'var(--ds-typography-body-s)' }}>
          Click Start test to POST the full Art Director payload (Jiosaavn) to the webhook and stream images from
          callbacks.
        </p>
      )}
    </div>
  )
}
