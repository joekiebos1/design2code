import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type CmsConfig = {
  supabaseUrl: string
  publishableKey: string
  secretKey?: string
}

export function getCmsConfigFromEnv(): CmsConfig | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  if (!supabaseUrl || !publishableKey) return null
  return {
    supabaseUrl,
    publishableKey,
    secretKey: process.env.CMS_SUPABASE_SECRET_KEY?.trim() || undefined,
  }
}

/** Read-only client — safe for server components. */
export function getPublicClient(cfg: CmsConfig): SupabaseClient {
  return createClient(cfg.supabaseUrl, cfg.publishableKey)
}

/** Write-capable client — use only in server-side API routes. */
export function getServiceClient(cfg: CmsConfig): SupabaseClient {
  return createClient(cfg.supabaseUrl, cfg.secretKey ?? cfg.publishableKey)
}
