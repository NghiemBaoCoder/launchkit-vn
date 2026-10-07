/**
 * VNPay Pay v2.1.0 — hàm thuần (không phụ thuộc env/server) để ký và xác thực.
 * Quy tắc theo tài liệu & mã mẫu chính thức của VNPay:
 *  - Sắp xếp tham số theo key (ASCII), encodeURIComponent key & value, thay %20 bằng "+".
 *  - Chuỗi ký = "k1=v1&k2=v2..." (không encode lại), HMAC-SHA512 với vnp_HashSecret, hex.
 *  - vnp_SecureHash gắn vào query; khi xác thực phải bỏ vnp_SecureHash & vnp_SecureHashType.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export type VnpParams = Record<string, string | number>;

function enc(v: string | number): string {
  return encodeURIComponent(String(v)).replace(/%20/g, "+");
}

/** Sắp xếp + encode theo đúng cách VNPay mong đợi. Bỏ giá trị rỗng/undefined. */
export function vnpSortAndEncode(params: VnpParams): Record<string, string> {
  const keys = Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null && String(params[k]) !== "")
    .map((k) => enc(k))
    .sort();
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = enc(params[decodeURIComponent(k)] ?? params[k]);
  return out;
}

/** Chuỗi dùng để ký / dùng làm query (các giá trị đã encode). */
export function vnpQueryString(encoded: Record<string, string>): string {
  return Object.entries(encoded)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
}

export function vnpSign(params: VnpParams, secret: string): string {
  const { vnp_SecureHash: _h, vnp_SecureHashType: _t, ...rest } = params as Record<string, string | number>;
  void _h;
  void _t;
  const signData = vnpQueryString(vnpSortAndEncode(rest));
  return createHmac("sha512", secret).update(Buffer.from(signData, "utf8")).digest("hex");
}

/** Tạo URL thanh toán đầy đủ (đã gắn vnp_SecureHash). */
export function vnpBuildPaymentUrl(baseUrl: string, params: VnpParams, secret: string): string {
  const hash = vnpSign(params, secret);
  const encoded = vnpSortAndEncode(params);
  return `${baseUrl}?${vnpQueryString(encoded)}&vnp_SecureHash=${hash}`;
}

/** Xác thực chữ ký của tham số trả về (ReturnUrl) / IPN. So sánh thời gian hằng. */
export function vnpVerify(params: Record<string, string>, secret: string): boolean {
  const received = (params.vnp_SecureHash ?? "").trim().toLowerCase();
  if (!received || !secret) return false;
  const expected = vnpSign(params, secret);
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Lấy toàn bộ tham số vnp_* từ URLSearchParams (giá trị đã được decode). */
export function vnpParamsFrom(search: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  search.forEach((v, k) => {
    if (k.startsWith("vnp_")) out[k] = v;
  });
  return out;
}

/** yyyyMMddHHmmss theo giờ Việt Nam (GMT+7) — định dạng VNPay yêu cầu. */
export function vnpFormatDate(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  const hour = get("hour") === "24" ? "00" : get("hour");
  return `${get("year")}${get("month")}${get("day")}${hour}${get("minute")}${get("second")}`;
}

/** Mã tham chiếu giao dịch: chỉ chữ + số, duy nhất trong ngày, tối đa 100 ký tự. */
export function vnpMakeTxnRef(orderNumber: string, random: string): string {
  const base = `${orderNumber}${random}`.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  return base.slice(0, 60);
}

/** Thông điệp tiếng Việt cho vnp_ResponseCode (theo tài liệu VNPay). */
export const VNPAY_RESPONSE_MESSAGES: Record<string, string> = {
  "00": "Giao dịch thành công",
  "07": "Trừ tiền thành công nhưng giao dịch bị nghi ngờ (gian lận, bất thường)",
  "09": "Thẻ/Tài khoản chưa đăng ký dịch vụ Internet Banking tại ngân hàng",
  "10": "Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần",
  "11": "Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại giao dịch",
  "12": "Thẻ/Tài khoản bị khoá",
  "13": "Nhập sai mật khẩu xác thực giao dịch (OTP)",
  "24": "Bạn đã huỷ giao dịch tại cổng VNPay",
  "51": "Tài khoản không đủ số dư để thực hiện giao dịch",
  "65": "Tài khoản đã vượt quá hạn mức giao dịch trong ngày",
  "75": "Ngân hàng thanh toán đang bảo trì",
  "79": "Nhập sai mật khẩu thanh toán quá số lần quy định",
  "99": "Lỗi khác từ cổng thanh toán",
};

export function vnpMessage(code: string | undefined): string {
  return (code && VNPAY_RESPONSE_MESSAGES[code]) || `Giao dịch không thành công (mã ${code ?? "?"})`;
}

/** Giao dịch được coi là thành công khi cả hai mã đều "00". */
export function vnpIsSuccess(params: Record<string, string>): boolean {
  return params.vnp_ResponseCode === "00" && params.vnp_TransactionStatus === "00";
}
