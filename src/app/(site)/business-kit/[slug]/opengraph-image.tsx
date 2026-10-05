import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgFrame, loadOgFonts } from "@/lib/og";
import { getBusinessTypeBySlug } from "@/lib/data/catalog";

export const alt = "Business Kit theo loại hình — LaunchKit VN";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

function stringList(json: unknown): string[] {
  return Array.isArray(json) ? json.filter((x): x is string => typeof x === "string") : [];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [fonts, bt] = await Promise.all([loadOgFonts(), getBusinessTypeBySlug(slug)]);
  const title = bt?.hero_title ?? (bt ? `Business Kit cho ${bt.name}` : "Business Kit theo loại hình");
  const description = bt?.hero_description ?? bt?.description ?? "Thương hiệu, bảng giá, kịch bản bán hàng, marketing, nội dung và tài liệu — viết riêng cho cách bạn kinh doanh.";
  const chips = stringList(bt?.highlights).slice(0, 3);
  return new ImageResponse(<OgFrame eyebrow={bt ? `Dành cho ${bt.name}` : undefined} title={title} description={description.length > 140 ? `${description.slice(0, 137)}…` : description} chips={chips.length ? chips : ["10 phần", "30 nội dung", "6 tài liệu"]} />, { ...size, fonts });
}
