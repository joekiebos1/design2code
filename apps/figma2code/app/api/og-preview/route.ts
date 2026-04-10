import { chromium, type Browser } from 'playwright'

export const runtime = 'nodejs'

// Reuse a single browser instance across requests
let _browser: Browser | null = null
let _launching: Promise<Browser> | null = null

async function getBrowser(): Promise<Browser> {
  if (_browser?.isConnected()) return _browser
  if (!_launching) {
    _launching = chromium.launch({ headless: true }).then((b) => {
      _browser = b
      _launching = null
      return b
    })
  }
  return _launching
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')
  const viewport = searchParams.get('viewport') === '360' ? 360 : 1440

  if (!url) return Response.json({ error: 'url is required' }, { status: 400 })

  try {
    new URL(url)
  } catch {
    return Response.json({ error: 'Invalid URL' }, { status: 400 })
  }

  let page
  try {
    const browser = await getBrowser()
    page = await browser.newPage()
    await page.setViewportSize({ width: viewport, height: viewport === 360 ? 780 : 900 })
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15_000 })

    // Dismiss cookie/consent banners before screenshotting
    const acceptPatterns = [
      '#onetrust-accept-btn-handler',
      '#CybotCookiebotDialogBodyButtonAccept',
      '#truste-consent-button',
      'button:has-text("Accept all")',
      'button:has-text("Accept All")',
      'button:has-text("Accept cookies")',
      'button:has-text("Accept & continue")',
      'button:has-text("I agree")',
      'button:has-text("Agree and continue")',
      'button:has-text("Allow all")',
      'button:has-text("Got it")',
      'button:has-text("OK")',
    ]
    for (const selector of acceptPatterns) {
      try {
        const el = page.locator(selector).first()
        if (await el.isVisible({ timeout: 300 })) {
          await el.click()
          await page.waitForTimeout(600)
          break
        }
      } catch { /* not found, try next */ }
    }

    const screenshot = await page.screenshot({ type: 'jpeg', quality: 85 })

    return new Response(screenshot, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 502 })
  } finally {
    await page?.close()
  }
}
