import type { NextConfig } from "next";

const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);

const nextConfig: NextConfig = {
  ...(isVercel ? {} : { output: 'export' }),
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
};

export default nextConfig;
