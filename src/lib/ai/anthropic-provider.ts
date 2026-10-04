import type { AIProvider, GenerationContext, StageKey, StageOutputMap } from "./types";
import { generateMockStage } from "./mock/provider";

/**
 * AnthropicProvider — dùng Mock làm "khung" (đảm bảo đúng schema), rồi nhờ Claude
 * viết lại các trường văn bản cho sát ngữ cảnh. Nếu lỗi/không có key → trả về khung mock.
 * Credentials chỉ đọc từ biến môi trường, không lưu DB.
 */
export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  constructor(
    private readonly apiKey: string,
    readonly model: string = "claude-sonnet-5-5",
    private readonly timeoutMs = 45000,
  ) {}

  async generateStage<K extends StageKey>(stage: K, ctx: GenerationContext): Promise<StageOutputMap[K]> {
    const scaffold = generateMockStage(stage, ctx);
    if (!this.apiKey) return scaffold;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: controller.signal,
        headers: { "content-type": "application/json", "x-api-key": this.apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 8000,
          system:
            "Bạn là chuyên gia xây dựng business kit cho người kinh doanh nhỏ tại Việt Nam. Nhận một JSON và trả về JSON có CÙNG cấu trúc, chỉ viết lại các giá trị chuỗi (string) cho tự nhiên, cụ thể, đúng ngữ cảnh business. Không thêm/bớt khoá, không đổi số, không giải thích. Chỉ trả về JSON.",
          messages: [
            {
              role: "user",
              content: `Ngữ cảnh business:\n${JSON.stringify({ name: ctx.businessName, type: ctx.businessType.name, industry: ctx.industry.name, answers: ctx.answers }, null, 0)}\n\nStage: ${stage}\n\nJSON cần viết lại:\n${JSON.stringify(scaffold)}`,
            },
          ],
        }),
      });
      clearTimeout(timer);
      if (!res.ok) return scaffold;
      const data = (await res.json()) as { content?: { type: string; text?: string }[] };
      const text = data.content?.find((c) => c.type === "text")?.text ?? "";
      const jsonText = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "");
      const parsed = JSON.parse(jsonText) as StageOutputMap[K];
      return mergeSameShape(scaffold, parsed);
    } catch {
      return scaffold;
    }
  }
}

/** Chỉ nhận các giá trị chuỗi từ `candidate` khi cấu trúc trùng với `base`. */
function mergeSameShape<T>(base: T, candidate: unknown): T {
  if (typeof base === "string") return (typeof candidate === "string" && candidate.trim() ? candidate : base) as T;
  if (Array.isArray(base)) {
    if (!Array.isArray(candidate) || candidate.length !== base.length) return base;
    return base.map((item, i) => mergeSameShape(item, candidate[i])) as T;
  }
  if (base && typeof base === "object") {
    if (!candidate || typeof candidate !== "object") return base;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(base as Record<string, unknown>)) {
      out[k] = mergeSameShape(v, (candidate as Record<string, unknown>)[k]);
    }
    return out as T;
  }
  return base;
}
