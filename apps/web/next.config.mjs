import { withIntlayer } from "next-intlayer/server";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/shared", "@repo/database", "@repo/ui"],
  experimental: {
    instrumentationHook: true,
  },
};

export default withIntlayer(nextConfig);
