import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Bỏ qua static files, ảnh, favicon, API webhook (xác thực bằng chữ ký riêng).
     */
    "/((?!_next/static|_next/image|favicon.ico|api/payments/webhook|api/track|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
