import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
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
    ignoreBuildErrors: true,
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
} as any;

export default nextConfig;
