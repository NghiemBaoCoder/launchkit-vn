import "server-only";
import type { ZodError } from "zod";
import { AuthError } from "@/lib/auth";
import { GenerationError } from "@/lib/ai/jobs";
import { getErrorMessage } from "@/lib/utils";
import { fail, type ActionResult } from "@/types";

/** Chuyển lỗi ném ra trong server action admin thành ActionResult (không throw ra client). */
export function adminActionError(e: unknown): ActionResult<never> {
  if (e instanceof AuthError) return fail(e.message, e.code);
  if (e instanceof GenerationError) return fail(e.message, e.code);
  console.error("[admin action]", e);
  return fail(getErrorMessage(e));
}

/** fieldErrors từ ZodError cho ActionResult. */
export function zodFieldErrors(error: ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

/** Thông báo lỗi validation ngắn gọn (lấy lỗi đầu tiên). */
export function zodMessage(error: ZodError, fallback = "Thông tin không hợp lệ"): string {
  const first = error.issues[0];
  return first ? `${first.message}` : fallback;
}

/** Chuỗi rỗng → null, trim phần còn lại. */
export function nullable(s: string | null | undefined): string | null {
  const t = (s ?? "").trim();
  return t ? t : null;
}

/** Textarea "mỗi dòng một mục" → mảng chuỗi. */
export function linesToArray(s: string | null | undefined): string[] {
  return (s ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}
