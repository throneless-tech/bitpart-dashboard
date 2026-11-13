// runs once when each server instance starts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // telemetry first, so everything after it is traced
    const { startTelemetry } = await import("@/app/_lib/telemetry");
    startTelemetry();

    const { startBotAlertPoller } = await import("@/app/_lib/botAlerts");
    startBotAlertPoller();
  }
}
