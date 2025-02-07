import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qriojldfgcamrpuuxijq.supabase.co",
      },
    ],
  },
};

export default nextConfig;
