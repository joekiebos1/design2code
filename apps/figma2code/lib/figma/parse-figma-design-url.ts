/**
 * Extract Figma file key and optional node id from common share URLs.
 * Example: …/design/nd2oz39ZiXB6G327ccqYYn/…?node-id=1004-1348 → nodeId `1004:1348`
 */
export function parseFigmaDesignUrl(url: string): { fileKey: string; nodeId: string | null } | null {
  try {
    const u = new URL(url.trim())
    const path = u.pathname
    const designMatch = path.match(/\/design\/([a-zA-Z0-9]+)/)
    const fileMatch = path.match(/\/file\/([a-zA-Z0-9]+)/)
    const fileKey = designMatch?.[1] ?? fileMatch?.[1]
    if (!fileKey) return null
    const nodeParam = u.searchParams.get('node-id')
    const nodeId = nodeParam ? nodeParam.replace(/-/g, ':') : null
    return { fileKey, nodeId }
  } catch {
    return null
  }
}
