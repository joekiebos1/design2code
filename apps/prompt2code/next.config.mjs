import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@design2code/ds', '@design2code/block-library', '@design2code/sanity', '@design2code/cms-schema'],
  turbopack: {
    // Stop Turbopack walking up past the monorepo root.
    // Without this it finds /Users/<user>/node_modules (stray chromatic install)
    // and treats the home directory as the project root, breaking all resolution.
    root: path.resolve(__dirname, '../..'),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lcxdmvcwlpgljetipcxo.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
