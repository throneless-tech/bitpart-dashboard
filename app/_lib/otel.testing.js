// in-memory telemetry for tests: a tracer, meter and w3c propagator, the
// same as telemetry.js sets up but without exporting anywhere
import { context, metrics, propagation, trace } from "@opentelemetry/api";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
  TracerProvider,
} from "@opentelemetry/sdk-trace";
import {
  AggregationTemporality,
  InMemoryMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";

export const setUpTestTelemetry = () => {
  const spans = new InMemorySpanExporter();
  const reader = new PeriodicExportingMetricReader({
    exporter: new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE),
    exportIntervalMillis: 60 * 60 * 1000,
  });

  context.setGlobalContextManager(
    new AsyncLocalStorageContextManager().enable(),
  );
  propagation.setGlobalPropagator(new W3CTraceContextPropagator());
  trace.setGlobalTracerProvider(
    new TracerProvider({
      spanProcessors: [new SimpleSpanProcessor({ exporter: spans })],
    }),
  );
  metrics.setGlobalMeterProvider(new MeterProvider({ readers: [reader] }));

  // { name: [{ attributes, value }] } for every metric recorded so far
  const collect = async () => {
    const { resourceMetrics } = await reader.collect();
    const out = {};

    for (const scope of resourceMetrics.scopeMetrics) {
      for (const metric of scope.metrics) {
        out[metric.descriptor.name] = metric.dataPoints.map((point) => ({
          attributes: point.attributes,
          value: point.value,
        }));
      }
    }

    return out;
  };

  return { spans, collect };
};
