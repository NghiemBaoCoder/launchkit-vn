import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getBusinessTypes } from "@/lib/data/catalog";
import { EXAMPLE_KITS } from "@/lib/examples";

export const revalidate = 3600;

const STATIC: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/examples", priority: 0.9, changeFrequency: "weekly" },
  { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
  { path: "/how-it-works", priority: 0.8, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/refund-policy", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.appUrl;
  const now = new Date();
  const types = await getBusinessTypes();
  return [
    ...STATIC.map((s) => ({ url: `${base}${s.path}`, lastModified: now, changeFrequency: s.changeFrequency, priority: s.priority })),
    ...types.map((t) => ({ url: `${base}/business-kit/${t.slug}`, lastModified: t.updated_at ? new Date(t.updated_at) : now, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...EXAMPLE_KITS.map((k) => ({ url: `${base}/examples/${k.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
