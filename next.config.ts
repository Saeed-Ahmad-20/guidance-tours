import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

// This computer's own network addresses, so a phone on the same Wi-Fi can open the dev server
// (e.g. http://192.168.1.20:3000). Without this, Next blocks the page's scripts for any host
// but localhost and nothing on the page runs. Development only.
const lanAddresses = Object.values(networkInterfaces())
  .flat()
  .filter(i => i && i.family === "IPv4" && !i.internal)
  .map(i => i!.address);

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: lanAddresses,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  experimental: {
    serverActions: {
      // Passport photo uploads go through a Server Action and are capped at
      // 10MB in app/actions/portal.ts; Next's own default body limit (1MB)
      // is smaller than that, so it needs raising to match.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
