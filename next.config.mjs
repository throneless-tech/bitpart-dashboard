/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
    taint: true,
  },
  productionBrowserSourceMaps: true,
};

export default nextConfig;
