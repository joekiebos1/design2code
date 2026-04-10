export function extractDomain(url: string | undefined): string {
  try { return new URL(url ?? '').hostname.replace(/^www\./, '') } catch { return url ?? '' }
}
