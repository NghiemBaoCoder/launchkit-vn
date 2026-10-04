/**
 * Mô hình "outline" trung gian: mọi nội dung kit được chuyển thành các block
 * rồi render ra Markdown / TXT / PDF. Giữ file này không phụ thuộc server.
 */
import { labelFor, HIDDEN_KEYS } from "@/lib/workspace/labels";
import { formatVND } from "@/lib/utils";

export type Block =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "kv"; label: string; value: string }
  | { type: "bullets"; items: string[] }
  | { type: "numbered"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "divider" }
  | { type: "small"; text: string };

export interface Outline {
  title: string;
  subtitle?: string;
  blocks: Block[];
}

const str = (v: unknown) => (v === null || v === undefined ? "" : typeof v === "number" ? v.toLocaleString("vi-VN") : String(v));

/** Chuyển jsonb bất kỳ thành blocks. */
export function contentToBlocks(value: unknown, depth = 0): Block[] {
  const blocks: Block[] = [];
  if (value === null || value === undefined || value === "") return blocks;
  if (typeof value === "string") return [{ type: "p", text: value }];
  if (typeof value === "number" || typeof value === "boolean") return [{ type: "p", text: str(value) }];
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v !== "object" || v === null)) return [{ type: "bullets", items: value.map(str) }];
    // mảng object đồng nhất → bảng nếu các giá trị đều là primitive
    const keys = Array.from(new Set(value.flatMap((v) => Object.keys((v as Record<string, unknown>) ?? {})))).filter((k) => !HIDDEN_KEYS.has(k));
    const allPrimitive = value.every((v) => Object.values((v as Record<string, unknown>) ?? {}).every((x) => typeof x !== "object" || x === null));
    if (allPrimitive && keys.length <= 6 && value.length > 1) {
      return [{ type: "table", headers: keys.map(labelFor), rows: value.map((v) => keys.map((k) => str((v as Record<string, unknown>)[k]))) }];
    }
    value.forEach((v, i) => {
      blocks.push({ type: depth === 0 ? "h3" : "small", text: `${i + 1}.` });
      blocks.push(...contentToBlocks(v, depth + 1));
    });
    return blocks;
  }
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (HIDDEN_KEYS.has(k) || v === null || v === "" || (Array.isArray(v) && v.length === 0)) continue;
      const label = labelFor(k);
      if (typeof v === "object") {
        blocks.push({ type: depth === 0 ? "h3" : "small", text: label });
        blocks.push(...contentToBlocks(v, depth + 1));
      } else {
        blocks.push({ type: "kv", label, value: str(v) });
      }
    }
  }
  return blocks;
}

/* ---------- Render ---------- */

export function outlineToMarkdown(o: Outline): string {
  const out: string[] = [`# ${o.title}`];
  if (o.subtitle) out.push(`_${o.subtitle}_`);
  for (const b of o.blocks) {
    switch (b.type) {
      case "h1": out.push(`\n# ${b.text}`); break;
      case "h2": out.push(`\n## ${b.text}`); break;
      case "h3": out.push(`\n### ${b.text}`); break;
      case "p": out.push(`\n${b.text}`); break;
      case "small": out.push(`\n**${b.text}**`); break;
      case "kv": out.push(`- **${b.label}:** ${b.value}`); break;
      case "bullets": out.push(...b.items.map((i) => `- ${i}`)); break;
      case "numbered": out.push(...b.items.map((i, n) => `${n + 1}. ${i}`)); break;
      case "table": out.push(`\n| ${b.headers.join(" | ")} |`, `| ${b.headers.map(() => "---").join(" | ")} |`, ...b.rows.map((r) => `| ${r.map((c) => c.replace(/\|/g, "\\|").replace(/\n/g, " ")).join(" | ")} |`)); break;
      case "divider": out.push("\n---"); break;
    }
  }
  return out.join("\n") + "\n";
}

export function outlineToText(o: Outline): string {
  const out: string[] = [o.title.toUpperCase(), "=".repeat(Math.min(60, o.title.length))];
  if (o.subtitle) out.push(o.subtitle);
  for (const b of o.blocks) {
    switch (b.type) {
      case "h1": out.push("", b.text.toUpperCase(), "=".repeat(Math.min(60, b.text.length))); break;
      case "h2": out.push("", b.text, "-".repeat(Math.min(60, b.text.length))); break;
      case "h3": out.push("", `## ${b.text}`); break;
      case "small": out.push(`[${b.text}]`); break;
      case "p": out.push("", b.text); break;
      case "kv": out.push(`${b.label}: ${b.value}`); break;
      case "bullets": out.push(...b.items.map((i) => `  • ${i}`)); break;
      case "numbered": out.push(...b.items.map((i, n) => `  ${n + 1}. ${i}`)); break;
      case "table": out.push("", b.headers.join(" | "), ...b.rows.map((r) => r.join(" | "))); break;
      case "divider": out.push("", "-".repeat(40)); break;
    }
  }
  return out.join("\n") + "\n";
}

export function money(n: unknown): string {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? formatVND(v) : str(n);
}
