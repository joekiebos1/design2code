/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@design2code/ds', '@design2code/block-library', '@design2code/cms-schema', '@design2code/cms'],
  experimental: {
    cssChunking: 'strict',
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
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'rkmupomdjphheifqiblt.supabase.co',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
