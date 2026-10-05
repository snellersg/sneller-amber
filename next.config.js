/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Old routes from before the two-tab layout
  async redirects() {
    return [
      { source: '/sheets-and-docs', destination: '/', permanent: true },
      { source: '/guides/:slug', destination: '/guides', permanent: false },
    ]
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self';",
          },
        ],
      },
    ]
  },
}

export default nextConfig
