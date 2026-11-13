import { Writable } from "node:stream";
import { beforeAll, describe, expect, it } from "vitest";
import { setUpTestTelemetry } from "./otel.testing";
import { createLogger, errorFields } from "./logger";
import { withSpan } from "./otel";

const capture = () => {
  const lines = [];
  const stream = new Writable({
    write(chunk, encoding, done) {
      lines.push(JSON.parse(chunk.toString()));
      done();
    },
  });
  return { lines, stream };
};

let telemetry;

beforeAll(() => {
  process.env.LOG_LEVEL = "debug";
  telemetry = setUpTestTelemetry();
});

describe("logger", () => {
  it("writes json with the service name and message", () => {
    const { lines, stream } = capture();
    createLogger(stream).info({ "user.id": "u1" }, "login");

    expect(lines[0]).toMatchObject({
      level: "info",
      service: "bitpart-dashboard",
      message: "login",
      "user.id": "u1",
    });
    expect(lines[0].time).toMatch(/^\d{4}-\d\d-\d\dT/);
  });

  it("redacts secrets, at the top level and nested", () => {
    const { lines, stream } = capture();
    createLogger(stream).warn(
      {
        password: "hunter2",
        email: "a@mail.org",
        bot: { qrLink: "sgnl://linkdevice?uuid=x", passcode: "1234" },
        request: { headers: { authorization: "Bearer x", cookie: "s=x" } },
        code: "123456",
      },
      "oops",
    );

    const text = JSON.stringify(lines[0]);
    for (const secret of [
      "hunter2",
      "a@mail.org",
      "sgnl://",
      "1234",
      "Bearer",
      "s=x",
      "123456",
    ]) {
      expect(text).not.toContain(secret);
    }
    expect(lines[0].password).toBe("[redacted]");
  });

  it("adds the active span's trace and span ids", async () => {
    const { lines, stream } = capture();
    const log = createLogger(stream);

    await withSpan("test", {}, async () => log.info("inside"));
    log.info("outside");

    const [span] = telemetry.spans.getFinishedSpans();
    expect(lines[0]).toMatchObject({
      trace_id: span.spanContext().traceId,
      span_id: span.spanContext().spanId,
    });
    expect(lines[1]).not.toHaveProperty("trace_id");
  });

  it("logs errors as plain fields", () => {
    expect(errorFields(new TypeError("bad"))).toMatchObject({
      error: { type: "TypeError", message: "bad" },
    });
    expect(errorFields("text")).toEqual({ error: "text" });
  });
});
