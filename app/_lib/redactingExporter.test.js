import { describe, expect, it, vi } from "vitest";
import {
  RedactingSpanExporter,
  redactAttributes,
  redactSpan,
} from "./redactingExporter";

const span = {
  name: "GET /verify-email?token=SECRET",
  attributes: {
    "http.target": "/verify-email?token=SECRET",
    "http.url": "https://bitp.art/reset-password?token=SECRET#x",
    "url.full": "https://bitp.art/reset-password?token=SECRET",
    "url.query": "token=SECRET",
    "url.path": "/reset-password",
    "next.route": "/verify-email?token=SECRET",
    "next.span_name": "GET /verify-email?token=SECRET",
    "http.response.status_code": 200,
    "http.request.header.authorization": "Bearer SECRET",
    "http.request.header.cookie": "better-auth.session_token=SECRET",
    "auth.code": "123456",
    backup_code: "aaaaa-bbbbb",
    "db.statement": "SELECT 1",
    "code.function": "handler",
  },
  events: [
    {
      name: "exception",
      attributes: {
        "exception.message": "failed for /reset-password?token=SECRET&x=1",
      },
    },
  ],
  links: [],
  spanContext: () => ({ traceId: "t", spanId: "s" }),
};

describe("redactAttributes", () => {
  const out = redactAttributes(span.attributes);

  it("strips query strings from url-like attributes", () => {
    expect(out["http.target"]).toBe("/verify-email");
    expect(out["http.url"]).toBe("https://bitp.art/reset-password");
    expect(out["url.full"]).toBe("https://bitp.art/reset-password");
    expect(out["next.route"]).toBe("/verify-email");
    expect(out["next.span_name"]).toBe("GET /verify-email");
    expect(out["url.path"]).toBe("/reset-password");
  });

  it("drops secret-looking attributes and url.query", () => {
    for (const key of [
      "url.query",
      "http.request.header.authorization",
      "http.request.header.cookie",
      "auth.code",
      "backup_code",
    ]) {
      expect(out).not.toHaveProperty(key);
    }
  });

  it("keeps everything else", () => {
    expect(out["http.response.status_code"]).toBe(200);
    expect(out["db.statement"]).toBe("SELECT 1");
    expect(out["code.function"]).toBe("handler");
  });
});

describe("redactSpan", () => {
  it("redacts the name, attributes and events, keeping the span context", () => {
    const copy = redactSpan(span);

    expect(copy.name).toBe("GET /verify-email");
    expect(copy.events[0].attributes["exception.message"]).toBe(
      "failed for /reset-password?token=[redacted]&x=1",
    );
    expect(copy.spanContext()).toEqual({ traceId: "t", spanId: "s" });
    expect(JSON.stringify(copy)).not.toContain("SECRET");
    // the original is left alone
    expect(span.name).toContain("SECRET");
  });
});

describe("RedactingSpanExporter", () => {
  it("hands redacted spans to the real exporter", () => {
    const inner = { export: vi.fn(), shutdown: vi.fn() };
    const done = vi.fn();

    new RedactingSpanExporter(inner).export([span], done);

    const [exported, callback] = inner.export.mock.calls[0];
    expect(exported[0].name).toBe("GET /verify-email");
    expect(JSON.stringify(exported)).not.toContain("SECRET");
    expect(callback).toBe(done);
  });
});
