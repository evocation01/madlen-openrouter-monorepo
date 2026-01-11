/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/shared", "@repo/database"],
};

export default nextConfig;