import { dataUrlToFile } from './data-url-to-file'
import { isAllowedStudioMediaFile } from './studio-inspiration-allowed-files'

function filenameForMime(base: string, mime: string): string {
  if (mime.includes('video/mp4')) return `${base}.mp4`
  if (mime.includes('image/png')) return `${base}.png`
  return `${base}.bin`
}

/** Build a File from a data URL or fetchable URL. Only PNG and MP4 are allowed for Studio inspiration. */
export async function mediaInputToFile(raw: string, filenameBase: string): Promise<File> {
  const s = raw.trim()
  if (s.startsWith('data:')) {
    const mimePart = s.slice(5, s.indexOf(';'))
    if (mimePart !== 'image/png' && mimePart !== 'video/mp4') {
      throw new Error('Only PNG or MP4 data URLs are supported.')
    }
    return dataUrlToFile(s, filenameForMime(filenameBase, mimePart))
  }
  const res = await fetch(s)
  if (!res.ok) {
    throw new Error(
      'Could not load media from URL. Paste the file instead, or use a URL that allows download.'
    )
  }
  const blob = await res.blob()
  const name = filenameForMime(filenameBase, blob.type || '')
  const file = new File([blob], name, { type: blob.type || 'application/octet-stream' })
  if (!isAllowedStudioMediaFile(file)) {
    throw new Error('Only PNG or MP4 files are supported from URLs.')
  }
  return file
}
