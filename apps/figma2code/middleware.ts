import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function getAuthToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + '__site-auth-salt__')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function middleware(request: NextRequest) {
  const password = process.env.SITE_PASSWORD
  if (!password) return NextResponse.next()

  const token = request.cookies.get('site-auth')?.value
  if (token && token === (await getAuthToken(password))) {
    return NextResponse.next()
  }

  const url = new URL('/login', request.url)
  url.searchParams.set('from', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon\\.ico).*)'],
}
