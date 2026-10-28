// runs once when each server instance starts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startBotAlertPoller } = await import("@/app/_lib/botAlerts");
    startBotAlertPoller();
  }
}
