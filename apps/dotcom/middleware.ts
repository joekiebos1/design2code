import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const EXCLUDED = ['/login', '/api/auth', '/_next', '/favicon.ico', '/lab']

function isExcluded(pathname: string): boolean {
  return EXCLUDED.some((prefix) => pathname.startsWith(prefix))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isExcluded(pathname)) return NextResponse.next()

  const password = process.env.SITE_PASSWORD
  if (!password) return NextResponse.next()

  try {
    const token = request.cookies.get('site-auth')?.value
    const expected = await computeToken(password)

    if (token === expected) return NextResponse.next()
  } catch {
    // fall through to login on any error
  }

  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

async function computeToken(password: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('__site-auth-salt__'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(password),
  )
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const config = {
  matcher: ['/:path*'],
}
