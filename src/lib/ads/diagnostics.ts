export type AdDiagnosticProvider = "exoclick" | "monetag" | "ima" | "system";
export type AdDiagnosticEvent =
  | "vast_request" | "ad_started" | "ad_completed" | "ad_no_fill"
  | "ad_error" | "ad_timeout" | "sdk_error" | "placement_loaded"
  | "placement_click" | "placement_error";

const ALLOWED_EVENTS = new Set<AdDiagnosticEvent>([
  "vast_request", "ad_started", "ad_completed", "ad_no_fill", "ad_error",
  "ad_timeout", "sdk_error", "placement_loaded", "placement_click", "placement_error",
]);
const ALLOWED_PROVIDERS = new Set<AdDiagnosticProvider>(["exoclick", "monetag", "ima", "system"]);

/** Non-billable operational diagnostics only. Never use these events for revenue settlement. */
export function sendAdDiagnostic(
  event: AdDiagnosticEvent,
  provider: AdDiagnosticProvider,
  placement: string,
): void {
  if (!ALLOWED_EVENTS.has(event) || !ALLOWED_PROVIDERS.has(provider)) return;
  const safePlacement = /^[a-z0-9-]{1,64}$/.test(placement) ? placement : "unknown";
  try {
    void fetch("/api/ads/diagnostics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, provider, placement: safePlacement }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Diagnostics must never affect playback or page rendering.
  }
}
