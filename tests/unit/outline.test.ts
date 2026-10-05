import { describe, expect, it } from "vitest";
import { contentToBlocks, outlineToMarkdown, outlineToText } from "@/lib/export/outline";
import { contentToText, contentToMarkdown } from "@/lib/workspace/labels";

describe("outline", () => {
  const content = { statement: "Chúng tôi là X", pillars: [{ title: "A", description: "a" }, { title: "B", description: "b" }], words: ["rõ", "gọn"] };
  it("chuyển jsonb thành blocks với bảng cho mảng object đồng nhất", () => {
    const blocks = contentToBlocks(content);
    expect(blocks[0]).toEqual({ type: "kv", label: "Tuyên bố định vị", value: "Chúng tôi là X" });
    expect(blocks.find((b) => b.type === "table")).toBeTruthy();
    expect(blocks.find((b) => b.type === "bullets")).toEqual({ type: "bullets", items: ["rõ", "gọn"] });
  });
  it("render markdown và text có tiêu đề", () => {
    const o = { title: "Kit", subtitle: "Phụ", blocks: contentToBlocks(content) };
    expect(outlineToMarkdown(o)).toContain("# Kit");
    expect(outlineToMarkdown(o)).toContain("| Tiêu đề | Mô tả |");
    expect(outlineToText(o)).toContain("KIT");
  });
  it("contentToText/markdown dùng nhãn tiếng Việt", () => {
    expect(contentToText({ tone: "ấm" })).toBe("Giọng điệu: ấm");
    expect(contentToMarkdown({ tone: "ấm" })).toBe("**Giọng điệu:** ấm");
  });
});
