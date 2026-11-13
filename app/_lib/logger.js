import pino from "pino";
import { trace } from "@opentelemetry/api";

// json logs on stdout (collected from the pod), with the trace and span ids
// of the active span so logs and traces line up

const SECRET_FIELDS = [
  "password",
  "currentPassword",
  "newPassword",
  "code",
  "otp",
  "token",
  "email",
  "pendingEmail",
  "phone",
  "qrLink",
  "passcode",
  "captcha",
  "challengeToken",
  "authorization",
  "cookie",
];

// the fields at the top level and up to two levels down
const redactPaths = SECRET_FIELDS.flatMap((field) => [
  field,
  `*.${field}`,
  `*.*.${field}`,
]);

export const traceFields = () => {
  const context = trace.getActiveSpan()?.spanContext();

  return context && trace.isSpanContextValid(context)
    ? { trace_id: context.traceId, span_id: context.spanId }
    : {};
};

export const createLogger = (destination) =>
  pino(
    {
      level: process.env.LOG_LEVEL ?? (process.env.VITEST ? "silent" : "info"),
      base: { service: "bitpart-dashboard" },
      messageKey: "message",
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: { level: (label) => ({ level: label }) },
      mixin: traceFields,
      redact: { paths: redactPaths, censor: "[redacted]" },
    },
    destination,
  );

export const logger = createLogger();

// error objects as log fields, without anything else hanging off them
export const errorFields = (error) =>
  error instanceof Error
    ? {
        error: { type: error.name, message: error.message, stack: error.stack },
      }
    : { error: String(error) };
