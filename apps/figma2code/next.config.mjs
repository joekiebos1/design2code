/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@design2code/ds', '@design2code/block-library'],
  experimental: {
    cssChunking: 'strict',
  },
  images: {
    remotePatterns: [
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
