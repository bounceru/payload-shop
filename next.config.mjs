// next.config.mjs
import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  async redirects() {
    return [
      {
        // Match any path (including nested paths)
        source: '/:path*',
        // Look at the `Host` header; if it starts with "www.", capture the remainder as `domain`
        has: [
          {
            type: 'host',
            // ^ = start of string; we escape the dot \. and capture everything else as `domain`
            // $ = end of string
            value: '^www\\.(?<domain>.*)$',
          },
        ],
        // Use the named capturing group `:domain` in the destination to remove `www.`
        destination: 'https://:domain/:path*',
        permanent: true, // 301 redirect
      },
    ]
  },
  images: {
    domains: [
      'stagepass.ams3.digitaloceanspaces.com', // your Payload CMS images
      'lh3.googleusercontent.com', // Google review logo
      'tripadvisor.mediaroom.com', // TripAdvisor logo
      'static.tacdn.com', // (optional) TripAdvisor static CDN
    ],
  },

  // Webpack watcher fix (to avoid watching .pnpm folders)
  webpack(config, { isServer }) {
    config.watchOptions = {
      ignored: ['**/node_modules/.pnpm/**', '**/node_modules/**'],
    }
    return config
  },
}

export default withPayload(nextConfig)
