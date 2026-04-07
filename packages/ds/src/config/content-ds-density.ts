/**
 * Design system **density** for block-facing routes only (production pages, `/stories/*`, `/lab/*`).
 *
 * Root `Providers` in `app/layout.tsx` always uses `density="Default"` so **Sanity Studio**, **JioKarna**,
 * **Figma2Code**, and other tools keep a stable, compact UI.
 *
 * `ContentDsProvider` wraps only those content routes and passes this value to a nested `DsProvider`.
 *
 * Edit the constant below when you want Open / Compact for pages and lab. Do not use a global `.env`
 * for this unless you add an optional override here (e.g. for CI); the canonical source is this file.
 */

import type { DsDensity } from '../utils/ds-density'

/** Default density for CMS pages and lab when you want DS “Open” (or set to `Default` / `Compact`). */
export const CONTENT_DS_DENSITY: DsDensity = 'Default'

export function getContentDsDensity(): DsDensity {
  return CONTENT_DS_DENSITY
}
