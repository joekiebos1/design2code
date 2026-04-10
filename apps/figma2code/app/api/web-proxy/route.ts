export const runtime = 'nodejs'

/**
 * Minimal HTML proxy — fetches a URL server-side, strips X-Frame-Options /
 * CSP frame-ancestors, and injects a <base> tag so relative asset paths
 * resolve against the original origin. This lets us embed pages that would
 * normally refuse to be iframed.
 *
 * Only proxies the initial HTML document; all sub-resources (JS, CSS, images)
 * load directly from the original origin, so the page looks and scrolls correctly.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const urlParam = searchParams.get('url')

  if (!urlParam) return new Response('url required', { status: 400 })

  let target: URL
  try {
    target = new URL(urlParam)
    if (!target.protocol.startsWith('http')) throw new Error()
  } catch {
    return new Response('Invalid URL', { status: 400 })
  }

  let upstreamRes: Response
  try {
    upstreamRes = await fetch(target.href, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15_000),
    })
  } catch (err) {
    return new Response(`Upstream fetch failed: ${err}`, { status: 502 })
  }

  const contentType = upstreamRes.headers.get('content-type') ?? ''

  // Non-HTML resources: pass through as-is (shouldn't normally be requested here)
  if (!contentType.includes('text/html')) {
    return new Response(upstreamRes.body, {
      headers: { 'Content-Type': contentType },
    })
  }

  let html = await upstreamRes.text()

  // Inject <base> so relative URLs resolve against the original origin.
  // Use the final (post-redirect) URL as the base.
  const finalOrigin = target.origin
  const baseTag = `<base href="${finalOrigin}/">`
  if (/<head[\s>]/i.test(html)) {
    html = html.replace(/<head[\s>][^>]*/i, (m) => `${m}>${baseTag}`)
  } else {
    html = baseTag + html
  }

  // Build response headers — omit X-Frame-Options and CSP entirely
  const headers = new Headers({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'private, max-age=60',
  })

  return new Response(html, { status: 200, headers })
}
