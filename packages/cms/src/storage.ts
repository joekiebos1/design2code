import type { SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'studio-media'

/** Slugify a string for use as a file name. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96) || 'upload'
}

/**
 * Upload a media file to the studio-media storage bucket.
 *
 * Files are organized as: `{folder}/{slugified-title}.{ext}`
 * e.g. `benchmarks/google-pixel-10a.png`
 *
 * If a file with the same name already exists, a short suffix is appended.
 */
export async function uploadMedia(
  client: SupabaseClient,
  file: File | Blob,
  options?: {
    folder?: string
    title?: string
    fileName?: string
  },
): Promise<{ storageKey: string; publicUrl: string }> {
  const rawName = options?.fileName ?? (file instanceof File ? file.name : 'upload')
  const ext = rawName.split('.').pop() ?? 'bin'
  const baseName = options?.title ? slugify(options.title) : slugify(rawName.replace(/\.[^.]+$/, ''))
  const folder = options?.folder ?? ''
  const prefix = folder ? `${folder}/` : ''

  // Try the clean name first, append a short ID if it collides
  let storageKey = `${prefix}${baseName}.${ext}`
  let { error } = await client.storage
    .from(BUCKET)
    .upload(storageKey, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (error?.message?.includes('already exists') || error?.message?.includes('Duplicate')) {
    const suffix = crypto.randomUUID().slice(0, 8)
    storageKey = `${prefix}${baseName}-${suffix}.${ext}`
    const retry = await client.storage
      .from(BUCKET)
      .upload(storageKey, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })
    error = retry.error
  }

  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  const publicUrl = getMediaUrl(client, storageKey)
  return { storageKey, publicUrl }
}

/** Get the public CDN URL for a storage key. */
export function getMediaUrl(client: SupabaseClient, storageKey: string): string {
  const { data } = client.storage.from(BUCKET).getPublicUrl(storageKey)
  return data.publicUrl
}
