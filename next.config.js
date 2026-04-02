const path = require('path')
const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Old /dashboard URLs → canonical /min-side
      { source: '/:locale/dashboard', destination: '/:locale/min-side', permanent: true },
      { source: '/:locale/dashboard/:path*', destination: '/:locale/min-side/:path*', permanent: true },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      },
    ]
  },
  skipTrailingSlashRedirect: true,
  // Avoid inferring a parent folder (e.g. ~/package-lock.json) as the workspace root
  outputFileTracingRoot: path.join(__dirname),
  // Bundles next-intl + FormatJS into the app graph so dev doesn’t reference missing vendor-chunks/@formatjs.js
  transpilePackages: ['next-intl'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = withNextIntl(nextConfig)
