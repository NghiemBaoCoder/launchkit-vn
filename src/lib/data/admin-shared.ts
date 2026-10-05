import "server-only";

/** Kích thước trang mặc định cho các bảng admin. */
export const ADMIN_PAGE_SIZE = 20;

export type SearchParams = Record<string, string | string[] | undefined>;

/** Lấy giá trị chuỗi đầu tiên của một searchParam. */
export function paramStr(sp: SearchParams, key: string): string {
  const v = sp[key];
  const s = Array.isArray(v) ? v[0] : v;
  return (s ?? "").trim();
}

/** Trang hiện tại (>= 1). */
export function paramPage(sp: SearchParams): number {
  const n = Number.parseInt(paramStr(sp, "page"), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/** Khoảng [from, to] cho `.range()` của supabase. */
export function pageRange(page: number, size = ADMIN_PAGE_SIZE): [number, number] {
  return [(page - 1) * size, page * size - 1];
}

/** Số ngày của bộ chọn kỳ (7/30/90). */
export function paramDays(sp: SearchParams): 7 | 30 | 90 {
  const d = Number.parseInt(paramStr(sp, "days"), 10);
  return d === 7 || d === 90 ? d : 30;
}

/** Chuẩn hoá chuỗi tìm kiếm để đưa vào bộ lọc `.or()` của PostgREST (loại ký tự đặc biệt). */
export function likeTerm(q: string): string {
  const cleaned = q.replace(/[%_,().\\]/g, " ").replace(/\s+/g, " ").trim();
  return `%${cleaned}%`;
}

/** Kiểm tra giá trị filter có thuộc danh sách enum cho phép hay không. */
export function pickEnum<T extends string>(value: string, allowed: readonly T[]): T | null {
  return (allowed as readonly string[]).includes(value) ? (value as T) : null;
}

export interface ListResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function emptyList<T>(page = 1): ListResult<T> {
  return { items: [], total: 0, page, pageSize: ADMIN_PAGE_SIZE };
}

/** Giá trị jsonb đã parse an toàn thành object. */
export function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

/** Đường dẫn + query hiện tại (bỏ `page`) để truyền vào `<Pagination baseHref>` từ Server Component. */
export function baseHrefOf(pathname: string, sp: SearchParams): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page") continue;
    const s = Array.isArray(v) ? v[0] : v;
    if (s) qs.set(k, s);
  }
  const q = qs.toString();
  return q ? `${pathname}?${q}` : pathname;
}
