import { withIntlayer } from "next-intlayer/server";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/shared", "@repo/database"],
};

export default withIntlayer(nextConfig);
