export const SITE = {
  name: "LaunchKit VN",
  shortName: "LaunchKit",
  tagline: "Bộ khởi nghiệp hoàn chỉnh cho người Việt — trong 10 phút",
  description:
    "LaunchKit VN tạo Business Kit hoàn chỉnh cho freelancer, creator và chủ shop nhỏ: thương hiệu, bảng giá, kịch bản bán hàng, kế hoạch marketing, nội dung, website và tài liệu.",
  supportEmail: "support@launchkit.vn",
  defaultCurrency: "VND",
  locale: "vi-VN",
};

export const ROUTES = {
  home: "/",
  pricing: "/pricing",
  examples: "/examples",
  howItWorks: "/how-it-works",
  faq: "/faq",
  contact: "/contact",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  onboarding: "/onboarding",
  businesses: "/dashboard/businesses",
  purchases: "/dashboard/purchases",
  billing: "/dashboard/billing",
  settingsProfile: "/settings/profile",
  admin: "/admin",
};

export const WORKSPACE_SECTIONS = [
  { key: "overview", label: "Tổng quan", icon: "LayoutDashboard" },
  { key: "brand", label: "Thương hiệu", icon: "Sparkles" },
  { key: "services", label: "Dịch vụ", icon: "Package" },
  { key: "pricing", label: "Bảng giá", icon: "Tags" },
  { key: "sales", label: "Bán hàng", icon: "MessageSquare" },
  { key: "marketing", label: "Marketing", icon: "Megaphone" },
  { key: "content", label: "Nội dung", icon: "CalendarDays" },
  { key: "website", label: "Website Kit", icon: "Globe" },
  { key: "finance", label: "Tài chính", icon: "Calculator" },
  { key: "operations", label: "Vận hành", icon: "ListChecks" },
  { key: "documents", label: "Tài liệu", icon: "FileText" },
  { key: "downloads", label: "Tải xuống", icon: "Download" },
  { key: "settings", label: "Cài đặt", icon: "Settings" },
] as const;

export type WorkspaceSectionKey = (typeof WORKSPACE_SECTIONS)[number]["key"];
