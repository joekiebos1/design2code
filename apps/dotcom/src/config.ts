/**
 * App URL for API calls from Studio (e.g. Configure with Claude).
 * Set SANITY_STUDIO_PREVIEW_URL or SANITY_STUDIO_APP_URL in .env
 */
export const APP_URL =
  process.env.SANITY_STUDIO_APP_URL ||
  process.env.SANITY_STUDIO_PREVIEW_URL ||
  'http://localhost:3000'
