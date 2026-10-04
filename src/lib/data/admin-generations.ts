import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { JobStatus } from "@/types";
import { GENERATION_STAGES } from "@/lib/ai/types";
import { ADMIN_PAGE_SIZE, emptyList, likeTerm, pageRange, paramPage, paramStr, pickEnum, type ListResult, type SearchParams } from "./admin-shared";

const STATUSES = ["pending", "processing", "completed", "failed"] as const;
export const JOB_TYPES = ["full", ...GENERATION_STAGES.map((s) => s.key)] as const;

export interface GenerationFilters {
  q: string;
  status: JobStatus | null;
  type: string;
  page: number;
}

export function parseGenerationFilters(sp: SearchParams): GenerationFilters {
  const type = paramStr(sp, "type");
  return { q: paramStr(sp, "q"), status: pickEnum(paramStr(sp, "status"), STATUSES), type: (JOB_TYPES as readonly string[]).includes(type) ? type : "", page: paramPage(sp) };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function listGenerations(f: GenerationFilters) {
  const supabase = await createClient();
  let query = supabase.from("generation_jobs").select("*, profiles(email, full_name), businesses(name)", { count: "exact" });
  if (f.q) {
    const parts: string[] = [];
    if (UUID_RE.test(f.q)) {
      parts.push(`id.eq.${f.q}`, `business_id.eq.${f.q}`, `user_id.eq.${f.q}`);
    } else {
      const term = likeTerm(f.q);
      const [{ data: users }, { data: businesses }] = await Promise.all([
        supabase.from("profiles").select("id").or(`email.ilike.${term},full_name.ilike.${term}`).limit(50),
        supabase.from("businesses").select("id").ilike("name", term).limit(50),
      ]);
      if (users?.length) parts.push(`user_id.in.(${users.map((u) => u.id).join(",")})`);
      if (businesses?.length) parts.push(`business_id.in.(${businesses.map((b) => b.id).join(",")})`);
      parts.push(`error.ilike.${term}`, `model.ilike.${term}`);
    }
    query = query.or(parts.join(","));
  }
  if (f.status) query = query.eq("status", f.status);
  if (f.type) query = query.eq("type", f.type);
  const [from, to] = pageRange(f.page);
  const { data, count, error } = await query.order("created_at", { ascending: false }).range(from, to);
  if (error) {
    if (error.code === "PGRST103") return emptyList<NonNullable<typeof data>[number]>(f.page);
    throw new Error(error.message);
  }
  const result: ListResult<NonNullable<typeof data>[number]> = { items: data ?? [], total: count ?? 0, page: f.page, pageSize: ADMIN_PAGE_SIZE };
  return result;
}

export type GenerationRow = Awaited<ReturnType<typeof listGenerations>>["items"][number];
