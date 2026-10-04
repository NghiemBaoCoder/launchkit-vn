import {
  Calculator,
  CalendarDays,
  FileText,
  Globe,
  ListChecks,
  Megaphone,
  MessageSquare,
  Package,
  Sparkles,
  Tags,
  type LucideIcon,
} from "lucide-react";

export interface KitModule {
  key: string;
  title: string;
  description: string;
  icon: LucideIcon;
  count: string;
}

/** 10 phần của một Business Kit — dùng chung cho trang chủ, how-it-works và landing theo loại hình. */
export const KIT_MODULES: KitModule[] = [
  { key: "brand", title: "Thương hiệu", description: "Định vị, tagline, giá trị cốt lõi, giọng nói, chân dung khách hàng, bảng màu & typography.", icon: Sparkles, count: "9 tài sản" },
  { key: "services", title: "Dịch vụ", description: "Đóng gói sản phẩm / dịch vụ thành 4–5 hạng mục rõ phạm vi, giá, thời gian bàn giao và gợi ý bán thêm.", icon: Package, count: "4–5 dịch vụ" },
  { key: "pricing", title: "Bảng giá", description: "3 gói Cơ bản – Tiêu chuẩn – Cao cấp kèm khuyến nghị định giá và máy tính biên lợi nhuận.", icon: Tags, count: "3 gói giá" },
  { key: "sales", title: "Kịch bản bán hàng", description: "Elevator pitch, tin nhắn chốt đơn, kịch bản tư vấn 6 bước, xử lý 6 từ chối, chuỗi follow-up 30 ngày.", icon: MessageSquare, count: "8 kịch bản" },
  { key: "marketing", title: "Marketing 30 ngày", description: "Kênh ưu tiên, chiến lược ra mắt 4 giai đoạn, ý tưởng chiến dịch, khuyến mãi và việc cần làm từng ngày.", icon: Megaphone, count: "30 ngày" },
  { key: "content", title: "30 nội dung", description: "30 bài Facebook / TikTok / Instagram / Threads với hook, caption và CTA — sẵn sàng đăng.", icon: CalendarDays, count: "30 bài" },
  { key: "website", title: "Website Kit", description: "Landing page 12 section viết sẵn nội dung, theme màu theo thương hiệu, studio chỉnh sửa và trang public.", icon: Globe, count: "12 section" },
  { key: "finance", title: "Tài chính", description: "Chi phí khởi nghiệp, chi phí hàng tháng, mục tiêu doanh thu, lợi nhuận và điểm hoà vốn.", icon: Calculator, count: "5 máy tính" },
  { key: "operations", title: "Vận hành", description: "Checklist khai trương, việc hàng ngày / hàng tuần và 3 quy trình: khách hàng – bán hàng – bàn giao.", icon: ListChecks, count: "6 checklist" },
  { key: "documents", title: "6 tài liệu", description: "Báo giá, proposal, hợp đồng dịch vụ, brief khách hàng, hoá đơn và form tiếp nhận.", icon: FileText, count: "6 mẫu" },
];

export const EXPORT_FORMATS = [
  { key: "pdf", label: "PDF", description: "Bản in đẹp cho báo giá, hợp đồng, brand book." },
  { key: "csv", label: "CSV", description: "Lịch nội dung, kế hoạch marketing, bảng giá để mở bằng Excel / Google Sheets." },
  { key: "md", label: "Markdown", description: "Toàn bộ nội dung dạng văn bản để dán vào Notion, Obsidian." },
  { key: "txt", label: "TXT", description: "Kịch bản bán hàng, caption — copy nhanh vào Zalo, Facebook." },
  { key: "zip", label: "ZIP trọn bộ", description: "Tải toàn bộ kit một lần (gói Pro)." },
] as const;
