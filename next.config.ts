import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
  },
  turbopack: {
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    optimizePackageImports: ['three', '@react-three/fiber', '@react-three/drei'],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'naroa.online',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/shop/:path*',
        destination: 'https://naroa.online/shop/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
