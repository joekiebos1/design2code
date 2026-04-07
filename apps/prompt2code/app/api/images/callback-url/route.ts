import { NextResponse } from 'next/server'

/**
 * GET /api/images/callback-url
 *
 * Returns the callback base URL used for webhook callbacks (e.g. when using a Cloudflare tunnel).
 */
export async function GET() {
  const baseUrl =
    process.env.CALLBACK_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    'http://localhost:3000'

  const callbackUrl = `${baseUrl}/api/images/ready`
  return NextResponse.json({ callbackUrl, baseUrl })
}
