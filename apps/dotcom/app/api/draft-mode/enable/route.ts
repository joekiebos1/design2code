import { validatePreviewUrl } from '@sanity/preview-url-secret'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
})

const clientWithToken = client.withConfig({
  token: process.env.SANITY_API_TOKEN || process.env.SANITY_API_READ_TOKEN,
})

export async function GET(req: Request) {
  const { isValid, redirectTo = '/' } = await validatePreviewUrl(clientWithToken, req.url)
  if (!isValid) {
    return new Response('Invalid secret', { status: 401 })
  }
  ;(await draftMode()).enable()
  redirect(redirectTo)
}
