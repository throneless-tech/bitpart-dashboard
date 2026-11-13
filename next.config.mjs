/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
    taint: true,
  },
  productionBrowserSourceMaps: true,
  // loaded by node, not bundled: the instrumentations patch modules as
  // they're required, and pino must find its own files
  serverExternalPackages: [
    "@opentelemetry/sdk-node",
    "@opentelemetry/instrumentation-http",
    "@opentelemetry/instrumentation-undici",
    "@opentelemetry/exporter-trace-otlp-http",
    "@opentelemetry/exporter-metrics-otlp-http",
    "@prisma/instrumentation",
    "pino",
  ],
};

export default nextConfig;
