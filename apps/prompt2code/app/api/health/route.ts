import { NextResponse } from 'next/server'
import { existsSync } from 'fs'
import { join } from 'path'

const REQUIRED_FILES = [
  'lib/storytelling/product-pages.md',
  'lib/shared/jio-experience-principles.md',
  'lib/shared/design-for-india-principles.md',
]

const REQUIRED_ENV = [
  'ANTHROPIC_API_KEY',
]

/**
 * GET /api/health
 * Validates that all required files and environment variables are present.
 * Hit this first if the server is behaving strangely.
 */
export function GET() {
  const cwd = process.cwd()
  const checks: { name: string; ok: boolean; detail?: string }[] = []

  for (const file of REQUIRED_FILES) {
    const full = join(cwd, file)
    const ok = existsSync(full)
    checks.push({ name: file, ok, detail: ok ? undefined : `MISSING: ${full}` })
  }

  for (const key of REQUIRED_ENV) {
    const ok = Boolean(process.env[key])
    checks.push({ name: key, ok, detail: ok ? undefined : 'NOT SET' })
  }

  const allOk = checks.every((c) => c.ok)
  const failed = checks.filter((c) => !c.ok)

  if (!allOk) {
    console.error('[health] Startup check failed:')
    failed.forEach((c) => console.error(' ✗', c.name, '-', c.detail))
  }

  return NextResponse.json(
    { ok: allOk, checks },
    { status: allOk ? 200 : 500 }
  )
}
