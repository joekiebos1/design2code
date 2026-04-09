/** Shared Studio tool UI tokens */

export const studioInputClass =
  'w-full px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-900 bg-gray-50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors'

/** Space below main tool title + intro (before fields / list) */
export const studioTitleBlockBottom = 'mb-8'

/**
 * Panel 2 — per-tool input only (forms, block list). Fixed 320px on md+.
 * Panel 1 is the Studio sidebar (tool selector) in `Sidebar.tsx`.
 */
export const studioToolInputColumn =
  'min-h-0 max-md:w-full shrink-0 overflow-y-auto studio-scrollbar md:flex-[0_0_320px]'

/**
 * Panel 3 — Preview: flexible width, fills remaining space beside the 320px input column.
 */
export const studioPreviewColumn =
  'min-h-0 min-w-0 flex-1 flex flex-col overflow-hidden'
