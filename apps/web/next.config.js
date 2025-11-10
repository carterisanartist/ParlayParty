/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@parlay-party/shared'],
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com'],
  },
};

module.exports = nextConfig;

