import { metrics, SpanKind, SpanStatusCode, trace } from "@opentelemetry/api";

// tracing and metrics helpers. they do nothing until app/_lib/telemetry.js
// has started the sdk (DASHBOARD_OPENTELEMETRY=true), so they're safe to use
// anywhere, including tests.

const NAME = "bitpart-dashboard";

export const tracer = () => trace.getTracer(NAME);

// next's redirect() and notFound() throw to end a request; they aren't errors
const isNextControlFlow = (error) =>
  typeof error?.digest === "string" && error.digest.startsWith("NEXT_");

// run fn in a new active span, recording a thrown error on it
export const withSpan = (name, attributes, fn, { kind } = {}) =>
  tracer().startActiveSpan(
    name,
    { kind: kind ?? SpanKind.INTERNAL, attributes },
    async (span) => {
      try {
        return await fn(span);
      } catch (error) {
        if (!isNextControlFlow(error)) {
          span.recordException(error);
          span.setStatus({ code: SpanStatusCode.ERROR });
        }
        throw error;
      } finally {
        span.end();
      }
    },
  );

// a server action in its own span. getUser() adds user.id to it.
export const traceAction =
  (name, fn) =>
  async (...args) =>
    withSpan(name, {}, () => fn(...args));

// attributes on the span of whatever is running now (if any)
export const setSpanAttributes = (attributes) =>
  trace.getActiveSpan()?.setAttributes(attributes);

// instruments are made on first use. the metrics api has no proxy, so one
// made before the sdk starts would stay a no-op; keep them per provider.
const instruments = new WeakMap();

const instrument = (create, name, options) => {
  const provider = metrics.getMeterProvider();
  let byName = instruments.get(provider);

  if (!byName) {
    byName = new Map();
    instruments.set(provider, byName);
  }

  if (!byName.has(name)) {
    byName.set(name, metrics.getMeter(NAME)[create](name, options));
  }

  return byName.get(name);
};

export const count = (name, attributes, value = 1) =>
  instrument("createCounter", name).add(value, attributes);

// durations are in seconds, like bitpart
export const recordDuration = (name, seconds, attributes) =>
  instrument("createHistogram", name, { unit: "s" }).record(
    seconds,
    attributes,
  );

export const meter = () => metrics.getMeter(NAME);

// "bitpart-0" from "bitpart-0.bitpart.bitpart.svc.cluster.local:3000": the
// first dns label of a bot's bitpart host, which is bitpart's
// service.instance.id
export const bitpartInstance = (host) => {
  if (!host || typeof host !== "string") {
    return "unknown";
  }

  const hostname = host.replace(/^[a-z]+:\/\//i, "").split(/[/:]/)[0];

  return hostname.split(".")[0] || "unknown";
};
