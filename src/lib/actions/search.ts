"use server";

import { createClient } from "@/lib/supabase/server";
import { requireProfileAction } from "@/lib/auth";
import { fail, ok, type ActionResult } from "@/types";

export interface SearchHit {
  kind: "business" | "document" | "content" | "asset";
  id: string;
  business_id: string;
  title: string;
  subtitle: string;
  href: string;
}

export async function globalSearchAction(q: string): Promise<ActionResult<SearchHit[]>> {
  try {
    await requireProfileAction();
    const query = q.trim().slice(0, 80);
    if (query.length < 2) return ok([]);
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("global_search", { q: query, lim: 6 });
    if (error) return fail(error.message);
    return ok((data ?? []) as SearchHit[]);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Lỗi tìm kiếm");
  }
}
