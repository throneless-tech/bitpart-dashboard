// span exporter wrapper that keeps secrets out of traces: query strings come
// off url-like attributes and span names (reset and confirmation links carry
// tokens), and attributes whose key looks secret are dropped.

const URL_KEYS = new Set([
  "http.target",
  "http.url",
  "url.full",
  "url.path",
  "http.route",
  "url.original",
]);

// dropped outright
const DROP_KEYS = new Set(["url.query"]);

const SECRET_KEY =
  /token|password|passwd|passcode|secret|authorization|cookie|captcha|otp|qr_?link/i;

// "code" on its own (e.g. auth.code), not http.status_code or code.function
const isCodeKey = (key) =>
  /(^|[._-])(backup_)?code$/i.test(key) && !/status_code$/i.test(key);

// tokens can also turn up inside other strings, e.g. exception messages
const SECRET_PARAM =
  /([?&;](?:token|code|password|secret|callbackURL)=)[^&#\s"']*/gi;

export const stripQuery = (value) =>
  typeof value === "string" ? value.replace(/[?#].*$/s, "") : value;

const scrub = (value) =>
  typeof value === "string"
    ? value.replace(SECRET_PARAM, "$1[redacted]")
    : value;

export const redactAttributes = (attributes = {}) => {
  const out = {};

  for (const [key, value] of Object.entries(attributes)) {
    if (DROP_KEYS.has(key) || SECRET_KEY.test(key) || isCodeKey(key)) {
      continue;
    }

    out[key] =
      URL_KEYS.has(key) || key.startsWith("next.")
        ? stripQuery(value)
        : scrub(value);
  }

  return out;
};

// a copy of the span with redacted name, attributes and events; everything
// else (span context, resource, times) comes from the original
export const redactSpan = (span) =>
  Object.create(span, {
    name: { value: stripQuery(span.name), enumerable: true },
    attributes: { value: redactAttributes(span.attributes), enumerable: true },
    events: {
      value: (span.events ?? []).map((event) => ({
        ...event,
        attributes: redactAttributes(event.attributes),
      })),
      enumerable: true,
    },
    links: {
      value: (span.links ?? []).map((link) => ({
        ...link,
        attributes: redactAttributes(link.attributes),
      })),
      enumerable: true,
    },
  });

export class RedactingSpanExporter {
  constructor(exporter) {
    this.exporter = exporter;
  }

  export(spans, resultCallback) {
    this.exporter.export(spans.map(redactSpan), resultCallback);
  }

  shutdown() {
    return this.exporter.shutdown();
  }

  forceFlush() {
    return this.exporter.forceFlush?.() ?? Promise.resolve();
  }
}
