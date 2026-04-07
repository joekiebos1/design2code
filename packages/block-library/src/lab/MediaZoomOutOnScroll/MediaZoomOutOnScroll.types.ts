/**
 * MediaZoomOutOnScroll – Lab block types.
 * Media starts full viewport + zoomed; on scroll reduces to Default content width.
 */

import type { LabBlockCallToAction } from '../../lab-utils/lab-block-framing-typography'

export type MediaZoomOutOnScrollProps = {
  title?: string | null
  description?: string | null
  callToActions?: LabBlockCallToAction[] | null
  /** Image URL (required). Use next/image or img. */
  image: string
  /** Optional video URL. When set, video is shown (with poster from image). */
  videoUrl?: string | null
  /** Alt text for image. */
  alt?: string | null
}
