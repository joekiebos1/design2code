export type StrapiClientConfig = {
  baseUrl: string
  /** API token (Settings → API Tokens). Optional only if Public role can read pages. */
  apiToken?: string
}

export function getStrapiConfigFromEnv(): StrapiClientConfig | null {
  const baseUrl = process.env.STRAPI_URL?.trim()
  if (!baseUrl) return null
  const apiToken = process.env.STRAPI_API_TOKEN?.trim() || undefined
  return { baseUrl: baseUrl.replace(/\/$/, ''), apiToken }
}
