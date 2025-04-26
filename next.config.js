/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure trailing slashes are handled correctly
  trailingSlash: false,
  // Configure redirects
  async redirects() {
    return [
      {
        source: '/businesses',
        destination: '/businesses/',
        permanent: true,
      },
    ];
  },
  // Configure rewrites for cleaner URLs
  async rewrites() {
    return [
      {
        source: '/b/:id',
        destination: '/businesses/:id',
      },
    ];
  },
}

module.exports = nextConfig
