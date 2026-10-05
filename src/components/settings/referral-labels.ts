/** Nhãn tiếng Việt cho trạng thái affiliate / hoa hồng — an toàn cho client. */
import type { Enums } from "@/types";
import type { StatusBadgeVariant } from "@/lib/payments/labels";

export type AffiliateStatus = Enums<"affiliate_status">;
export type CommissionStatus = Enums<"commission_status">;

export const AFFILIATE_STATUS_LABELS: Record<AffiliateStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đang hoạt động",
  rejected: "Bị từ chối",
  paid: "Đã thanh toán",
};

export const AFFILIATE_STATUS_VARIANTS: Record<AffiliateStatus, StatusBadgeVariant> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
  paid: "info",
};

export const COMMISSION_STATUS_LABELS: Record<CommissionStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  paid: "Đã thanh toán",
  rejected: "Từ chối",
};

export const COMMISSION_STATUS_VARIANTS: Record<CommissionStatus, StatusBadgeVariant> = {
  pending: "warning",
  approved: "info",
  paid: "success",
  rejected: "destructive",
};

/** Số tiền tối thiểu để được thanh toán hoa hồng (VND). */
export const COMMISSION_PAYOUT_MIN = 200_000;
