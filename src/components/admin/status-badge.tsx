import { Badge } from "@/components/ui/badge";

type Variant = "default" | "secondary" | "destructive" | "success" | "warning" | "info" | "outline" | "premium";
type Entry = { label: string; variant: Variant };

const MAPS = {
  order: {
    pending: { label: "Chờ thanh toán", variant: "warning" },
    paid: { label: "Đã thanh toán", variant: "success" },
    failed: { label: "Thất bại", variant: "destructive" },
    expired: { label: "Hết hạn", variant: "secondary" },
    refunded: { label: "Đã hoàn tiền", variant: "info" },
  },
  payment: {
    pending: { label: "Chờ xử lý", variant: "warning" },
    processing: { label: "Đang xử lý", variant: "info" },
    succeeded: { label: "Thành công", variant: "success" },
    failed: { label: "Thất bại", variant: "destructive" },
    refunded: { label: "Đã hoàn tiền", variant: "info" },
  },
  job: {
    pending: { label: "Đang chờ", variant: "secondary" },
    processing: { label: "Đang chạy", variant: "info" },
    completed: { label: "Hoàn tất", variant: "success" },
    failed: { label: "Thất bại", variant: "destructive" },
  },
  business: {
    draft: { label: "Nháp", variant: "secondary" },
    generating: { label: "Đang tạo", variant: "info" },
    ready: { label: "Sẵn sàng", variant: "success" },
    archived: { label: "Lưu trữ", variant: "warning" },
  },
  user: {
    active: { label: "Hoạt động", variant: "success" },
    suspended: { label: "Tạm khoá", variant: "destructive" },
  },
  role: {
    user: { label: "Người dùng", variant: "secondary" },
    admin: { label: "Admin", variant: "info" },
    super_admin: { label: "Super admin", variant: "premium" },
  },
  affiliate: {
    pending: { label: "Chờ duyệt", variant: "warning" },
    approved: { label: "Đã duyệt", variant: "success" },
    rejected: { label: "Từ chối", variant: "destructive" },
    paid: { label: "Đã thanh toán", variant: "info" },
  },
  commission: {
    pending: { label: "Chờ duyệt", variant: "warning" },
    approved: { label: "Đã duyệt", variant: "success" },
    paid: { label: "Đã trả", variant: "info" },
    rejected: { label: "Từ chối", variant: "destructive" },
  },
  productKind: {
    free: { label: "Miễn phí", variant: "secondary" },
    one_time: { label: "Mua một lần", variant: "info" },
    subscription: { label: "Định kỳ", variant: "premium" },
  },
  couponType: {
    fixed: { label: "Giảm cố định", variant: "info" },
    percentage: { label: "Giảm %", variant: "success" },
  },
  stage: {
    pending: { label: "Chờ", variant: "secondary" },
    processing: { label: "Đang chạy", variant: "info" },
    completed: { label: "Xong", variant: "success" },
    failed: { label: "Lỗi", variant: "destructive" },
  },
  subscription: {
    active: { label: "Đang hoạt động", variant: "success" },
    canceled: { label: "Đã huỷ", variant: "secondary" },
    expired: { label: "Hết hạn", variant: "warning" },
    past_due: { label: "Quá hạn", variant: "destructive" },
  },
} satisfies Record<string, Record<string, Entry>>;

export type StatusKind = keyof typeof MAPS;

export function statusLabel(kind: StatusKind, value: string): string {
  const map = MAPS[kind] as Record<string, Entry>;
  return map[value]?.label ?? value;
}

export function statusOptions(kind: StatusKind): { value: string; label: string }[] {
  const map = MAPS[kind] as Record<string, Entry>;
  return Object.entries(map).map(([value, e]) => ({ value, label: e.label }));
}

export function StatusBadge({ kind, value, className }: { kind: StatusKind; value: string | null | undefined; className?: string }) {
  if (!value) return <Badge variant="outline" className={className}>—</Badge>;
  const map = MAPS[kind] as Record<string, Entry>;
  const entry = map[value] ?? { label: value, variant: "outline" as Variant };
  return <Badge variant={entry.variant} className={className}>{entry.label}</Badge>;
}

export function ActiveBadge({ active, className }: { active: boolean; className?: string }) {
  return <Badge variant={active ? "success" : "secondary"} className={className}>{active ? "Đang bật" : "Đã tắt"}</Badge>;
}
