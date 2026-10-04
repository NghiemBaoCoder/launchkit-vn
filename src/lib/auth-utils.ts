/** Chỉ cho phép redirect nội bộ an toàn. */
export function safeNext(next: unknown, fallback = "/dashboard"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/auth") || next.startsWith("/login") || next.startsWith("/register")) return fallback;
  return next;
}
