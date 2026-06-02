import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'naroa.online',
      },
    ],
  },
};

export default nextConfig;
