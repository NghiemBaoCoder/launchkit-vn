import "server-only";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_PAGE_SIZE, emptyList, likeTerm, pageRange, paramPage, paramStr, pickEnum, type ListResult, type SearchParams } from "./admin-shared";
import { CONTACT_STATUSES, CONTACT_TOPIC_LABEL, type ContactMessage, type ContactStatus } from "@/lib/contact";

export { CONTACT_STATUSES, CONTACT_STATUS_LABEL, CONTACT_TOPIC_LABEL, type ContactMessage, type ContactStatus } from "@/lib/contact";

export interface MessageFilters {
  q: string;
  status: ContactStatus | null;
  topic: string | null;
  page: number;
}

export function parseMessageFilters(sp: SearchParams): MessageFilters {
  return {
    q: paramStr(sp, "q"),
    status: pickEnum(paramStr(sp, "status"), CONTACT_STATUSES),
    topic: pickEnum(paramStr(sp, "topic"), Object.keys(CONTACT_TOPIC_LABEL)) ?? null,
    page: paramPage(sp),
  };
}

export interface MessageListResult extends ListResult<ContactMessage> {
  /** Lỗi hạ tầng (vd: chưa chạy migration) để trang hiển thị hướng dẫn. */
  error?: string;
  counts: Record<ContactStatus, number>;
}

export async function listContactMessages(f: MessageFilters): Promise<MessageListResult> {
  const supabase = await createClient();
  const emptyCounts: Record<ContactStatus, number> = { new: 0, read: 0, replied: 0, archived: 0 };
  let query = supabase.from("contact_messages").select("*, handler:profiles!contact_messages_handled_by_fkey(full_name, email)", { count: "exact" });
  if (f.q) {
    const term = likeTerm(f.q);
    query = query.or(`name.ilike.${term},email.ilike.${term},message.ilike.${term}`);
  }
  if (f.status) query = query.eq("status", f.status);
  if (f.topic) query = query.eq("topic", f.topic);
  const [from, to] = pageRange(f.page);
  const [{ data, count, error }, countsRes] = await Promise.all([
    query.order("created_at", { ascending: false }).range(from, to),
    supabase.from("contact_messages").select("status"),
  ]);
  if (error) {
    if (error.code === "PGRST103") return { ...emptyList<ContactMessage>(f.page), counts: emptyCounts };
    return { ...emptyList<ContactMessage>(f.page), counts: emptyCounts, error: error.message };
  }
  const counts = { ...emptyCounts };
  for (const row of countsRes.data ?? []) counts[row.status] += 1;
  return { items: (data ?? []) as ContactMessage[], total: count ?? 0, page: f.page, pageSize: ADMIN_PAGE_SIZE, counts };
}

export async function countNewMessages(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new");
  return count ?? 0;
}
