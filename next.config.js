/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure we can resolve modules from both src and business-ai-simulator/src
  experimental: {
    esmExternals: 'loose',
  },
  // Specify the location of the source directory
  distDir: '.next',
  // Handle the nested structure
  webpack: (config, { isServer }) => {
    // Add additional module resolution paths if needed
    config.resolve.modules = ['node_modules', '.', ...config.resolve.modules];
    return config;
  },
}

module.exports = nextConfig
