import { beforeAll, describe, expect, it } from "vitest";
import { SpanStatusCode } from "@opentelemetry/api";
import { setUpTestTelemetry } from "./otel.testing";
import { bitpartInstance, count, withSpan } from "./otel";
import { startTelemetry } from "./telemetry";

describe("bitpartInstance", () => {
  it("takes the first dns label of the host", () => {
    expect(
      bitpartInstance("bitpart-0.bitpart.bitpart.svc.cluster.local:3000"),
    ).toBe("bitpart-0");
    expect(bitpartInstance("ws://bitpart-1.bitpart:3000/ws")).toBe("bitpart-1");
    expect(bitpartInstance("localhost:3000")).toBe("localhost");
    expect(bitpartInstance("")).toBe("unknown");
    expect(bitpartInstance(undefined)).toBe("unknown");
  });
});

describe("without DASHBOARD_OPENTELEMETRY", () => {
  it("doesn't start, and the helpers do nothing", async () => {
    expect(process.env.DASHBOARD_OPENTELEMETRY).toBeUndefined();
    expect(startTelemetry()).toBe(false);
    expect(() => count("dashboard.test", { a: "b" })).not.toThrow();
    expect(await withSpan("test", {}, async () => 42)).toBe(42);
  });
});

describe("withSpan", () => {
  let telemetry;

  beforeAll(() => {
    telemetry = setUpTestTelemetry();
  });

  it("records a thrown error, but not next's redirects", async () => {
    await expect(
      withSpan("fails", { a: 1 }, async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    await expect(
      withSpan("redirects", {}, async () => {
        throw Object.assign(new Error("NEXT_REDIRECT"), {
          digest: "NEXT_REDIRECT;replace;/login;307;",
        });
      }),
    ).rejects.toThrow();

    const [fails, redirects] = telemetry.spans.getFinishedSpans();
    expect(fails.name).toBe("fails");
    expect(fails.attributes).toEqual({ a: 1 });
    expect(fails.status.code).toBe(SpanStatusCode.ERROR);
    expect(fails.events[0].name).toBe("exception");
    expect(redirects.status.code).not.toBe(SpanStatusCode.ERROR);
  });
});
