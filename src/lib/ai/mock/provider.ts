import type { AIProvider, GenerationContext, StageKey, StageOutputMap } from "../types";
import { genAnalyzing, genBrand, genPricing, genServices } from "./stage-brand";
import { genSales } from "./stage-sales";
import { genContent, genMarketing } from "./stage-marketing";
import { genWebsite } from "./stage-website";
import { genDocuments, genFinance, genOperations } from "./stage-ops";

/**
 * MockAIProvider — sinh nội dung tiếng Việt thực tế từ thư viện template,
 * ổn định theo seed để kiểm thử được. Không gọi mạng.
 */
export class MockAIProvider implements AIProvider {
  readonly name = "mock";
  readonly model = "launchkit-mock-v1";

  constructor(private readonly options: { delayMs?: number } = {}) {}

  async generateStage<K extends StageKey>(stage: K, ctx: GenerationContext): Promise<StageOutputMap[K]> {
    if (this.options.delayMs) {
      await new Promise((r) => setTimeout(r, this.options.delayMs));
    }
    return generateMockStage(stage, ctx);
  }
}

export function generateMockStage<K extends StageKey>(stage: K, ctx: GenerationContext): StageOutputMap[K] {
  switch (stage) {
    case "analyzing":
      return genAnalyzing(ctx) as StageOutputMap[K];
    case "brand":
      return genBrand(ctx) as StageOutputMap[K];
    case "services":
      return genServices(ctx) as StageOutputMap[K];
    case "pricing":
      return genPricing(ctx) as StageOutputMap[K];
    case "sales":
      return genSales(ctx) as StageOutputMap[K];
    case "marketing":
      return genMarketing(ctx) as StageOutputMap[K];
    case "content":
      return genContent(ctx) as StageOutputMap[K];
    case "website":
      return genWebsite(ctx) as StageOutputMap[K];
    case "finance":
      return genFinance(ctx) as StageOutputMap[K];
    case "operations":
      return genOperations(ctx) as StageOutputMap[K];
    case "documents":
      return genDocuments(ctx) as StageOutputMap[K];
    default:
      throw new Error(`Stage không hỗ trợ: ${String(stage)}`);
  }
}
