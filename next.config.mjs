/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['d3-scale', 'd3-shape', 'd3-array'],
  },
};

export default nextConfig;
