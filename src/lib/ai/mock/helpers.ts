import type { GenerationContext } from "../types";
import { getProfile, PERSONALITY_VOICE, type TypeProfile } from "./library";
import { createRng, hashString, roundPrice, type Rng } from "./rng";
import { paletteByKey } from "@/lib/onboarding/schema";

export interface Gen {
  ctx: GenerationContext;
  profile: TypeProfile;
  rng: Rng;
  product: string;
  products: string[];
  customer: string;
  name: string;
  location: string;
  personality: string;
  personalities: string[];
  voice: (typeof PERSONALITY_VOICE)[string];
  palette: ReturnType<typeof paletteByKey>;
  basePrice: number;
  /** Thay thế placeholder trong template. */
  fill: (s: string, extra?: Record<string, string>) => string;
}

export function makeGen(ctx: GenerationContext, stageSalt = ""): Gen {
  const profile = getProfile(ctx.businessType.slug, ctx.industry.slug);
  const rng = createRng(hashString(`${ctx.seed}:${ctx.businessId}:${stageSalt}`));
  const products = ctx.answers.products.length ? ctx.answers.products : [profile.unit];
  const product = products[0];
  const personalities = ctx.answers.brandPersonality.length ? ctx.answers.brandPersonality : ["professional"];
  const personality = personalities[0];
  const voice = PERSONALITY_VOICE[personality] ?? PERSONALITY_VOICE.professional;
  const customer = ctx.answers.targetCustomer || profile.customerNoun;
  const location = ctx.answers.location || "TP.HCM";
  const basePrice = estimateBasePrice(profile.basePrice, ctx.answers.revenueTarget, ctx.answers.experience);

  const vars: Record<string, string> = {
    product,
    customer: shortCustomer(customer),
    name: ctx.businessName,
    location,
    noun: profile.noun,
    outcome: profile.outcomes[0],
    differentiator: profile.differentiators[0],
    basic: "Cơ bản",
    day: "thứ Năm tuần này",
    discovery: "buổi tư vấn",
    time: "1–2 tuần",
    pitfall: "khâu lên kế hoạch",
    support: "30 ngày",
    industry: ctx.industry.name,
  };

  const fill = (s: string, extra?: Record<string, string>) =>
    s.replace(/\{(\w+)\}/g, (_, k: string) => (extra && k in extra ? extra[k] : vars[k] ?? `{${k}}`));

  return { ctx, profile, rng, product, products, customer, name: ctx.businessName, location, personality, personalities, voice, palette: paletteByKey(ctx.answers.colorPalette), basePrice, fill };
}

/** Khách hàng mục tiêu rút gọn để dùng trong câu. */
export function shortCustomer(s: string): string {
  const trimmed = s.trim().replace(/[.。]+$/, "");
  if (trimmed.length <= 60) return lowerFirst(trimmed);
  return lowerFirst(trimmed.slice(0, 57).replace(/\s+\S*$/, "")) + "…";
}

export function lowerFirst(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}
export function upperFirst(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Ước lượng giá cơ sở dựa trên ngành, mục tiêu doanh thu và kinh nghiệm. */
export function estimateBasePrice(industryBase: number, revenueTarget: number, experience: string): number {
  let p = industryBase;
  if (experience === "experienced") p *= 1.3;
  else if (experience === "new") p *= 0.85;
  // Mục tiêu doanh thu cao kéo giá lên nhẹ (không quá 1.5x)
  const ratio = Math.min(1.5, Math.max(0.8, revenueTarget / 30_000_000));
  p *= 0.7 + 0.3 * ratio;
  return roundPrice(p);
}

export function priceFor(base: number, multiplier: number): number {
  return roundPrice(base * multiplier);
}

export function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function platformsFromChannels(channels: string[]): ("facebook" | "tiktok" | "instagram" | "threads")[] {
  const set = new Set<"facebook" | "tiktok" | "instagram" | "threads">();
  for (const c of channels) {
    if (c === "facebook" || c === "zalo" || c === "offline" || c === "referral" || c === "google" || c === "website" || c === "shopee") set.add("facebook");
    if (c === "tiktok") set.add("tiktok");
    if (c === "instagram") set.add("instagram");
  }
  if (set.size === 0) set.add("facebook");
  if (set.size < 2) set.add("threads");
  return [...set];
}

export const CHANNEL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  zalo: "Zalo",
  shopee: "Shopee",
  website: "Website",
  google: "Google",
  offline: "Trực tiếp",
  referral: "Giới thiệu",
  threads: "Threads",
  email: "Email",
};
