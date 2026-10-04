import "server-only";
import { serverEnv } from "@/lib/env";
import type { AIProvider } from "./types";
import { MockAIProvider } from "./mock/provider";
import { AnthropicProvider } from "./anthropic-provider";
import type { AiSettings } from "@/lib/data/settings";

/** Chọn provider theo cài đặt admin + biến môi trường. Secrets chỉ từ env. */
export function getAIProvider(settings: AiSettings): AIProvider {
  const env = serverEnv();
  const wanted = settings.provider ?? env.aiProvider;
  if (wanted === "anthropic" && env.anthropicApiKey) {
    return new AnthropicProvider(env.anthropicApiKey, settings.model || "claude-sonnet-5-5", settings.timeout_ms);
  }
  return new MockAIProvider({ delayMs: settings.stage_delay_ms });
}

export * from "./types";
