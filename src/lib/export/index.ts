import "server-only";
import JSZip from "jszip";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/data/notifications";
import { logActivity } from "@/lib/data/activity";
import { slugify } from "@/lib/utils";
import type { ExportFormat, ExportRow, JsonValue } from "@/types";
import { buildKitCsv, buildKitOutline, buildSectionOutline, documentOutline, EXPORTABLE_SECTIONS, SECTION_TITLES, type ExportSection } from "./build";
import { outlineToMarkdown, outlineToText, type Outline } from "./outline";
import { renderOutlinePdf } from "./pdf";

export const EXPORT_BUCKET = "exports";

export interface ExportRequest {
  businessId: string;
  userId: string;
  kind: "full_kit" | "section" | "document";
  format: ExportFormat;
  /** Cho kind=section: danh sách mục; kind=document: id tài liệu. */
  items?: string[];
}

const MIME: Record<ExportFormat, string> = { pdf: "application/pdf", csv: "text/csv; charset=utf-8", txt: "text/plain; charset=utf-8", md: "text/markdown; charset=utf-8", zip: "application/zip" };

export async function createExport(req: ExportRequest): Promise<ExportRow> {
  const admin = createAdminClient();
  const { data: business } = await admin.from("businesses").select("name").eq("id", req.businessId).single();
  const title = req.kind === "full_kit" ? `Business Kit — ${business?.name ?? ""}` : req.kind === "document" ? `Tài liệu — ${business?.name ?? ""}` : `${(req.items ?? []).map((s) => SECTION_TITLES[s] ?? s).join(", ")} — ${business?.name ?? ""}`;
  const { data, error } = await admin.from("exports").insert({ business_id: req.businessId, user_id: req.userId, kind: req.kind, format: req.format, status: "pending", title, items: (req.items ?? []) as JsonValue }).select("*").single();
  if (error) throw error;
  return data;
}

async function renderOutline(outline: Outline, format: Exclude<ExportFormat, "zip" | "csv">): Promise<Buffer> {
  if (format === "pdf") return renderOutlinePdf(outline);
  if (format === "md") return Buffer.from(outlineToMarkdown(outline), "utf8");
  return Buffer.from(outlineToText(outline), "utf8");
}

/** Chạy export: build file, upload storage, cập nhật trạng thái. */
export async function runExport(exportId: string): Promise<ExportRow> {
  const admin = createAdminClient();
  const { data: exp } = await admin.from("exports").select("*").eq("id", exportId).single();
  if (!exp) throw new Error("Không tìm thấy export");
  if (exp.status === "ready") return exp;
  await admin.from("exports").update({ status: "processing", error: null }).eq("id", exportId);
  try {
    const { data: business } = await admin.from("businesses").select("name").eq("id", exp.business_id).single();
    const name = business?.name ?? "business";
    const items = (exp.items as string[]) ?? [];
    let buffer: Buffer;
    let ext: string = exp.format;

    if (exp.format === "zip") {
      const zip = new JSZip();
      const outline = await buildKitOutline(admin, exp.business_id, name);
      zip.file("business-kit.md", outlineToMarkdown(outline));
      zip.file("business-kit.txt", outlineToText(outline));
      zip.file("business-kit.pdf", await renderOutlinePdf(outline));
      zip.file("du-lieu-bang.csv", await buildKitCsv(admin, exp.business_id));
      for (const s of EXPORTABLE_SECTIONS) {
        const so = await buildSectionOutline(admin, exp.business_id, s, name);
        zip.file(`muc/${s}.md`, outlineToMarkdown(so));
      }
      const { data: docs } = await admin.from("documents").select("*").eq("business_id", exp.business_id);
      for (const d of docs ?? []) zip.file(`tai-lieu/${slugify(d.title) || d.type}.pdf`, await renderOutlinePdf(documentOutline(d)));
      buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
    } else if (exp.format === "csv") {
      buffer = Buffer.from(await buildKitCsv(admin, exp.business_id), "utf8");
    } else if (exp.kind === "document") {
      const { data: doc } = await admin.from("documents").select("*").eq("id", items[0]).eq("business_id", exp.business_id).single();
      if (!doc) throw new Error("Không tìm thấy tài liệu");
      buffer = await renderOutline(documentOutline(doc), exp.format);
    } else if (exp.kind === "section") {
      const sections = items.filter((s): s is ExportSection => (EXPORTABLE_SECTIONS as readonly string[]).includes(s));
      const outline = sections.length === 1 ? await buildSectionOutline(admin, exp.business_id, sections[0], name) : await buildKitOutline(admin, exp.business_id, name, sections);
      buffer = await renderOutline(outline, exp.format);
    } else {
      buffer = await renderOutline(await buildKitOutline(admin, exp.business_id, name), exp.format);
    }
    ext = exp.format;
    const filePath = `${exp.user_id}/${exp.business_id}/${exportId}-${slugify(exp.title).slice(0, 40) || "export"}.${ext}`;
    const { error: upErr } = await admin.storage.from(EXPORT_BUCKET).upload(filePath, buffer, { contentType: MIME[exp.format], upsert: true });
    if (upErr) throw upErr;
    const { data: done, error } = await admin.from("exports").update({ status: "ready", file_path: filePath, file_size: buffer.byteLength, completed_at: new Date().toISOString() }).eq("id", exportId).select("*").single();
    if (error) throw error;
    await createNotification(exp.user_id, { type: "export_ready", title: "File xuất đã sẵn sàng", body: `${exp.title} (${exp.format.toUpperCase()}) đã sẵn sàng để tải.`, href: `/business/${exp.business_id}/downloads` });
    await logActivity({ userId: exp.user_id, businessId: exp.business_id, action: "export.completed", entityType: "export", entityId: exportId, title: `Xuất ${exp.format.toUpperCase()}: ${exp.title}` });
    return done;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const { data: failed } = await admin.from("exports").update({ status: "failed", error: message }).eq("id", exportId).select("*").single();
    await createNotification(exp.user_id, { type: "export_failed", title: "Xuất file thất bại", body: message.slice(0, 200), href: `/business/${exp.business_id}/downloads` });
    return failed ?? { ...exp, status: "failed", error: message };
  }
}

/** URL ký để tải file export (hết hạn sau 10 phút). */
export async function getExportSignedUrl(filePath: string): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage.from(EXPORT_BUCKET).createSignedUrl(filePath, 600, { download: true });
  if (error || !data) throw error ?? new Error("Không tạo được liên kết tải");
  return data.signedUrl;
}
