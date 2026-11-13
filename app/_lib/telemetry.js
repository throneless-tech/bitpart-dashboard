import os from "node:os";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { envDetector, resourceFromAttributes } from "@opentelemetry/resources";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { UndiciInstrumentation } from "@opentelemetry/instrumentation-undici";
import { PrismaInstrumentation } from "@prisma/instrumentation";

import { RedactingSpanExporter } from "@/app/_lib/redactingExporter";
import { startDbGauges } from "@/app/_lib/dbGauges";
import { logger } from "@/app/_lib/logger";

// like bitpart
export const METRIC_INTERVAL_MS = 60 * 1000;

export const telemetryEnabled = () =>
  process.env.DASHBOARD_OPENTELEMETRY === "true";

let sdk = null;

// start tracing and metrics (OTLP over http, configured with the standard
// OTEL_* variables). off unless DASHBOARD_OPENTELEMETRY=true. runs from
// instrumentation.js, in node only, before anything else starts.
export const startTelemetry = () => {
  if (sdk || !telemetryEnabled()) {
    return false;
  }

  sdk = new NodeSDK({
    // OTEL_SERVICE_NAME and OTEL_RESOURCE_ATTRIBUTES (the pod name as
    // service.instance.id) override these
    resource: resourceFromAttributes({
      "service.name": "bitpart-dashboard",
      "service.instance.id": os.hostname(),
    }),
    resourceDetectors: [envDetector],
    spanProcessors: [
      new BatchSpanProcessor({
        exporter: new RedactingSpanExporter(new OTLPTraceExporter()),
      }),
    ],
    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
        exportIntervalMillis: METRIC_INTERVAL_MS,
      }),
    ],
    instrumentations: [
      new HttpInstrumentation({
        // health checks and next's own assets aren't interesting
        ignoreIncomingRequestHook: (request) =>
          /^\/(_next\/|favicon)/.test(request.url ?? ""),
      }),
      new UndiciInstrumentation(),
      new PrismaInstrumentation(),
    ],
  });

  sdk.start();
  startDbGauges();
  logger.info("telemetry started");

  return true;
};

// export what's left and stop, e.g. at the end of a script
export const stopTelemetry = async () => {
  await sdk?.shutdown();
  sdk = null;
};
