/** Tiện ích thời gian nhỏ để component không gọi Date.now() trực tiếp trong render. */
export function isPast(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && t < Date.now();
}

export function isFuture(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) && t > Date.now();
}
