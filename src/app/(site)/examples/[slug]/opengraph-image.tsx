import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgFrame, loadOgFonts } from "@/lib/og";
import { EXAMPLE_KITS, getExampleBySlug } from "@/lib/examples";
import { paletteByKey } from "@/lib/onboarding/schema";

export const alt = "Ví dụ Business Kit — LaunchKit VN";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return EXAMPLE_KITS.map((k) => ({ slug: k.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fonts = await loadOgFonts();
  const kit = getExampleBySlug(slug);
  if (!kit) return new ImageResponse(<OgFrame eyebrow="Ví dụ" title="Ví dụ Business Kit" />, { ...size, fonts });
  const palette = paletteByKey(kit.answers.colorPalette);
  return new ImageResponse(
    <OgFrame eyebrow={`${kit.businessTypeName} · ${kit.industryName}`} title={kit.name} description={kit.summary.length > 150 ? `${kit.summary.slice(0, 147)}…` : kit.summary} palette={{ primary: palette.primary, secondary: palette.secondary, accent: palette.accent }} chips={kit.tags.slice(0, 4)} footer="launchkit.vn/examples" />,
    { ...size, fonts },
  );
}
