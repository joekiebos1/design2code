import { dataUrlToFile } from './data-url-to-file'

/** Build a File from pasted data URL or from an image URL (browser fetch; may fail on CORS). */
export async function imageInputToFile(raw: string, filename: string): Promise<File> {
  const s = raw.trim()
  if (s.startsWith('data:')) return dataUrlToFile(s, filename)
  const res = await fetch(s)
  if (!res.ok) {
    throw new Error('Could not load image from URL. Paste the image instead, or use a URL that allows download.')
  }
  const blob = await res.blob()
  return new File([blob], filename, { type: blob.type || 'image/png' })
}
