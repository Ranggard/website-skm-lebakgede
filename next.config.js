/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Disable automatic static generation to avoid preload warnings
    isrMemoryCacheSize: 0,
  },
}

module.exports = nextConfig
