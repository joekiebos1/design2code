/**
 * Startup validator — import this at the top of any API route that depends on
 * files or env vars. It runs once per server process and logs clearly if
 * something is missing, so you know exactly why a route is broken.
 */
import { existsSync } from 'fs'
import { join } from 'path'

const REQUIRED_FILES = [
  'lib/storytelling/product-pages.md',
  'lib/shared/jio-experience-principles.md',
  'lib/shared/design-for-india-principles.md',
]

const REQUIRED_ENV = ['ANTHROPIC_API_KEY']

let checked = false

export function validateStartup(): void {
  if (checked) return
  checked = true

  const cwd = process.cwd()
  let allOk = true

  for (const file of REQUIRED_FILES) {
    if (!existsSync(join(cwd, file))) {
      console.error(`[startup] ✗ MISSING FILE: ${file}`)
      allOk = false
    }
  }

  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
      console.error(`[startup] ✗ MISSING ENV: ${key}`)
      allOk = false
    }
  }

  if (allOk) {
    console.log('[startup] ✓ All required files and env vars present')
  } else {
    console.error('[startup] ✗ Startup validation failed — see errors above')
  }
}

// Auto-run on import
validateStartup()
