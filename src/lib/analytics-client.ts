/** Gửi sự kiện funnel tới /api/track (fire-and-forget). */
const SESSION_KEY = "lk_anon";

export function anonId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

const sent = new Set<string>();

export function track(event: string, properties: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const key = `${event}:${properties.path ?? ""}`;
  // Chống đếm trùng trong cùng phiên trang
  if (sent.has(key) && event.endsWith("_view")) return;
  sent.add(key);
  const body = JSON.stringify({ event, anon_id: anonId(), path: properties.path ?? window.location.pathname, source: properties.source ?? null, ref: properties.ref ?? null, properties });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      return;
    }
  } catch {}
  void fetch("/api/track", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => {});
}
