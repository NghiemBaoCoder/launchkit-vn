import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { vnpBuildPaymentUrl, vnpFormatDate, vnpIsSuccess, vnpMakeTxnRef, vnpMessage, vnpParamsFrom, vnpQueryString, vnpSign, vnpSortAndEncode, vnpVerify } from "@/lib/payments/vnpay/sign";

const SECRET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456";

const BASE = {
  vnp_Version: "2.1.0",
  vnp_Command: "pay",
  vnp_TmnCode: "LKTEST01",
  vnp_Amount: 29900000,
  vnp_CurrCode: "VND",
  vnp_TxnRef: "LK20261007000101ABC123",
  vnp_OrderInfo: "Thanh toan don hang LK20261007000101 LaunchKit VN",
  vnp_OrderType: "other",
  vnp_Locale: "vn",
  vnp_ReturnUrl: "https://launchkit-vn.vercel.app/api/payments/vnpay/return",
  vnp_IpAddr: "113.161.1.1",
  vnp_CreateDate: "20261007093000",
  vnp_ExpireDate: "20261007100000",
};

describe("VNPay — sắp xếp & encode", () => {
  it("sắp xếp key theo ASCII, encode value và thay %20 bằng +", () => {
    const enc = vnpSortAndEncode({ vnp_OrderInfo: "Thanh toan don hang", vnp_Amount: 100, vnp_ReturnUrl: "https://a.vn/x?y=1&z=2" });
    expect(Object.keys(enc)).toEqual(["vnp_Amount", "vnp_OrderInfo", "vnp_ReturnUrl"]);
    expect(enc.vnp_OrderInfo).toBe("Thanh+toan+don+hang");
    expect(enc.vnp_ReturnUrl).toBe("https%3A%2F%2Fa.vn%2Fx%3Fy%3D1%26z%3D2");
    expect(vnpQueryString(enc)).toBe("vnp_Amount=100&vnp_OrderInfo=Thanh+toan+don+hang&vnp_ReturnUrl=https%3A%2F%2Fa.vn%2Fx%3Fy%3D1%26z%3D2");
  });
  it("bỏ qua tham số rỗng", () => {
    const enc = vnpSortAndEncode({ vnp_A: "", vnp_B: "x" });
    expect(Object.keys(enc)).toEqual(["vnp_B"]);
  });
});

describe("VNPay — ký & xác thực", () => {
  it("chữ ký là HMAC-SHA512 hex của chuỗi đã sắp xếp (giống mã mẫu VNPay)", () => {
    const signData = vnpQueryString(vnpSortAndEncode(BASE));
    const expected = createHmac("sha512", SECRET).update(Buffer.from(signData, "utf8")).digest("hex");
    expect(vnpSign(BASE, SECRET)).toBe(expected);
    expect(vnpSign(BASE, SECRET)).toHaveLength(128);
  });
  it("URL thanh toán chứa mọi tham số + vnp_SecureHash hợp lệ", () => {
    const url = vnpBuildPaymentUrl("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html", BASE, SECRET);
    const u = new URL(url);
    const params = vnpParamsFrom(u.searchParams);
    expect(params.vnp_TmnCode).toBe("LKTEST01");
    expect(params.vnp_OrderInfo).toBe(BASE.vnp_OrderInfo); // URLSearchParams decode "+" → space
    expect(params.vnp_Amount).toBe("29900000");
    expect(vnpVerify(params, SECRET)).toBe(true);
  });
  it("xác thực thất bại khi đổi tham số, đổi secret hoặc thiếu hash", () => {
    const url = vnpBuildPaymentUrl("https://x", BASE, SECRET);
    const params = vnpParamsFrom(new URL(url).searchParams);
    expect(vnpVerify({ ...params, vnp_Amount: "100" }, SECRET)).toBe(false);
    expect(vnpVerify(params, "other-secret")).toBe(false);
    const { vnp_SecureHash: _h, ...noHash } = params;
    void _h;
    expect(vnpVerify(noHash, SECRET)).toBe(false);
  });
  it("vnp_SecureHashType không tham gia chuỗi ký", () => {
    const url = vnpBuildPaymentUrl("https://x", BASE, SECRET);
    const params = vnpParamsFrom(new URL(url).searchParams);
    expect(vnpVerify({ ...params, vnp_SecureHashType: "HmacSHA512" }, SECRET)).toBe(true);
  });
});

describe("VNPay — tiện ích", () => {
  it("định dạng ngày yyyyMMddHHmmss theo GMT+7", () => {
    expect(vnpFormatDate(new Date("2026-10-07T02:30:05Z"))).toBe("20261007093005");
    expect(vnpFormatDate(new Date("2026-12-31T17:00:00Z"))).toBe("20270101000000");
  });
  it("mã tham chiếu chỉ gồm chữ và số, viết hoa", () => {
    const ref = vnpMakeTxnRef("LK-2026-0101", "ab12xy");
    expect(ref).toMatch(/^[A-Z0-9]+$/);
    expect(ref).toBe("LK20260101AB12XY");
  });
  it("nhận diện thành công & thông điệp lỗi", () => {
    expect(vnpIsSuccess({ vnp_ResponseCode: "00", vnp_TransactionStatus: "00" })).toBe(true);
    expect(vnpIsSuccess({ vnp_ResponseCode: "00", vnp_TransactionStatus: "02" })).toBe(false);
    expect(vnpMessage("24")).toMatch(/huỷ/);
    expect(vnpMessage("zz")).toMatch(/mã zz/);
  });
});
