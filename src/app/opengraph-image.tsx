import { ImageResponse } from "next/og";
import { OG_CONTENT_TYPE, OG_SIZE, OgFrame, loadOgFonts } from "@/lib/og";

export const alt = "LaunchKit VN — Bộ khởi nghiệp hoàn chỉnh cho business của bạn trong 10 phút";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    <OgFrame
      eyebrow="Business Kit cho người Việt"
      title="Bộ khởi nghiệp hoàn chỉnh cho business của bạn — trong 10 phút"
      description="Thương hiệu · Bảng giá · Kịch bản bán hàng · Marketing 30 ngày · 30 nội dung · Website · Tài liệu"
      chips={["8 loại hình", "38 ngành", "100% tiếng Việt", "Miễn phí bắt đầu"]}
    />,
    { ...size, fonts },
  );
}
