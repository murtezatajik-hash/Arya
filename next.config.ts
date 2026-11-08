import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  agentRules: false,
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    const revalidate = [
      {
        key: "Cache-Control",
        value: "public, max-age=0, must-revalidate",
      },
    ];

    return [
      {
        source: "/sw.js",
        headers: revalidate,
      },
      {
        source: "/manifest.webmanifest",
        headers: revalidate,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
