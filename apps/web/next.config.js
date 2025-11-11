/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@parlay-party/shared'],
  eslint: {
    ignoreDuringBuilds: true, // Disable ESLint during builds for production focus
  },
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com'],
  },
};

module.exports = nextConfig;

