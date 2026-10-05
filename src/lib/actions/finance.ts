"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireProfileAction } from "@/lib/auth";
import { fail, ok, type ActionResult, type JsonValue } from "@/types";

const typeSchema = z.enum(["startup_cost", "monthly_expenses", "revenue_target", "profit", "break_even"]);

export async function saveFinanceCalculationAction(businessId: string, type: string, data: unknown): Promise<ActionResult<undefined>> {
  await requireProfileAction();
  const t = typeSchema.safeParse(type);
  if (!t.success) return fail("Loại máy tính không hợp lệ", "validation");
  const parsed = z.record(z.string(), z.unknown()).safeParse(data);
  if (!parsed.success) return fail("Dữ liệu không hợp lệ", "validation");
  const supabase = await createClient();
  const { error } = await supabase.from("finance_calculations").upsert({ business_id: businessId, type: t.data, data: parsed.data as JsonValue }, { onConflict: "business_id,type" });
  if (error) return fail(error.message);
  revalidatePath(`/business/${businessId}/finance`);
  return ok(undefined, "Đã lưu");
}
