/** Max upload size for Studio inspiration media (images and videos) from figma2code. */
export const STUDIO_INSPIRATION_MAX_FILE_BYTES = 30 * 1024 * 1024

export function studioInspirationMaxFileMb(): number {
  return STUDIO_INSPIRATION_MAX_FILE_BYTES / (1024 * 1024)
}
