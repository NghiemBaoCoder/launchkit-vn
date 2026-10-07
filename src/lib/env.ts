/**
 * Truy cập biến môi trường có kiểm tra. Các biến public được inline lúc build,
 * các biến server chỉ được đọc ở server.
 */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  appUrl: (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").trim().replace(/\/+$/, ""),
  googleOAuthEnabled: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === "true",
};

export function serverEnv() {
  return {
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    mockPaymentSecret: process.env.MOCK_PAYMENT_WEBHOOK_SECRET ?? "mock-secret-dev",
    aiProvider: (process.env.AI_PROVIDER ?? "mock") as "mock" | "anthropic",
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
    /** VNPay Pay v2.1.0 — để trống TMN code/secret thì phương thức VNPay bị ẩn. */
    vnpay: {
      tmnCode: (process.env.VNPAY_TMN_CODE ?? "").trim(),
      hashSecret: (process.env.VNPAY_HASH_SECRET ?? "").trim(),
      paymentUrl: (process.env.VNPAY_PAYMENT_URL ?? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html").trim(),
      apiUrl: (process.env.VNPAY_API_URL ?? "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction").trim(),
    },
  };
}

export function assertSupabaseEnv() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error(
      "Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY. Xem .env.example.",
    );
  }
}
