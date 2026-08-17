import type { NextConfig } from "next";

const BACKEND_URL =
  process.env.BACKEND_URL ??
  "https://reachinbox-email-scheduler-do4r.onrender.com";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${BACKEND_URL}/api/auth/:path*`,
      },
      {
        source: "/api/emails/:path*",
        destination: `${BACKEND_URL}/api/emails/:path*`,
      },
      {
        source: "/health/:path*",
        destination: `${BACKEND_URL}/health/:path*`,
      },
    ];
  },
};

export default nextConfig;