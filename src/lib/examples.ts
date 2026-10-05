import type { OnboardingAnswers } from "@/lib/onboarding/schema";
import type { AssetPayload, BrandOutput, ContentItemOutput, GenerationContext, MarketingOutput, PricingOutput, ServiceOutput, WebsiteOutput } from "@/lib/ai/types";
import { generateMockStage } from "@/lib/ai/mock/provider";
import { hashString } from "@/lib/ai/mock/rng";

/**
 * Ví dụ Business Kit công khai (/examples). Mỗi ví dụ là một bộ câu trả lời onboarding cố định;
 * nội dung được sinh bằng MockAIProvider (thuần, không gọi mạng / DB) với seed ổn định theo slug.
 */
export interface ExampleKit {
  slug: string;
  name: string;
  businessTypeSlug: string;
  businessTypeName: string;
  industrySlug: string;
  industryName: string;
  summary: string;
  tags: string[];
  answers: OnboardingAnswers;
}

export interface GeneratedExample {
  kit: ExampleKit;
  context: GenerationContext;
  brand: BrandOutput;
  services: ServiceOutput[];
  pricing: PricingOutput;
  sales: { assets: AssetPayload[] };
  marketing: MarketingOutput;
  content: ContentItemOutput[];
  website: WebsiteOutput;
}

export const EXAMPLE_KITS: ExampleKit[] = [
  {
    slug: "minh-web-studio",
    name: "Minh Web Studio",
    businessTypeSlug: "freelancer",
    businessTypeName: "Freelancer",
    industrySlug: "website-development",
    industryName: "Phát triển website",
    summary: "Freelancer lập trình web tại Đà Nẵng, chuyên landing page và website bán hàng cho chủ shop nhỏ. Mục tiêu 30 triệu/tháng.",
    tags: ["Freelancer", "Website", "B2B nhỏ", "Đà Nẵng"],
    answers: {
      businessTypeSlug: "freelancer",
      industrySlug: "website-development",
      industryCustom: "",
      businessName: "Minh Web Studio",
      ownerName: "Nguyễn Văn Minh",
      location: "Đà Nẵng",
      description: "Mình làm web 4 năm, chuyên landing page và website bán hàng cho shop nhỏ. Bàn giao nhanh, hướng dẫn tận tình.",
      experience: "experienced",
      targetCustomer: "Chủ shop online và doanh nghiệp nhỏ cần website chuyên nghiệp để chạy quảng cáo",
      customerSegment: "smb",
      customerPainPoints: "Thuê làm web xong không biết tự sửa, bị tính phí phát sinh, web chậm không lên Google",
      products: ["Landing page", "Website bán hàng", "Bảo trì website hàng tháng"],
      brandPersonality: ["professional", "trustworthy"],
      colorPalette: "indigo",
      salesChannels: ["facebook", "referral", "website"],
      revenueTarget: 30000000,
      primaryGoal: "raise_prices",
    },
  },
  {
    slug: "linh-beauty",
    name: "Linh Beauty",
    businessTypeSlug: "creator",
    businessTypeName: "Creator",
    industrySlug: "beauty-creator",
    industryName: "Beauty & Fashion",
    summary: "Beauty creator 48k followers trên TikTok và Instagram, review mỹ phẩm bình dân cho sinh viên và dân văn phòng. Mục tiêu 20 triệu/tháng từ booking.",
    tags: ["Creator", "TikTok", "Booking brand", "Hà Nội"],
    answers: {
      businessTypeSlug: "creator",
      industrySlug: "beauty-creator",
      industryCustom: "",
      businessName: "Linh Beauty",
      ownerName: "Phạm Thuỳ Linh",
      location: "Hà Nội",
      description: "Kênh review mỹ phẩm bình dân, makeup đi làm 5 phút. Thật thà, không review hộ.",
      experience: "some",
      targetCustomer: "Bạn nữ 20–30 tuổi, sinh viên và nhân viên văn phòng, thích mỹ phẩm giá hợp lý",
      customerSegment: "individual",
      customerPainPoints: "Mua mỹ phẩm theo quảng cáo rồi không hợp da, lãng phí tiền",
      products: ["Video review sản phẩm", "Bài đăng Instagram", "Gói booking tháng"],
      brandPersonality: ["young", "friendly"],
      colorPalette: "rose",
      salesChannels: ["tiktok", "instagram", "facebook"],
      revenueTarget: 20000000,
      primaryGoal: "more_leads",
    },
  },
  {
    slug: "nail-house-quan-7",
    name: "Nail House Quận 7",
    businessTypeSlug: "salon",
    businessTypeName: "Salon & Spa",
    industrySlug: "nail-salon",
    industryName: "Nail & Mi",
    summary: "Tiệm nail và nối mi 4 ghế tại Phú Mỹ Hưng, phục vụ chị em văn phòng và mẹ bỉm quanh khu. Mục tiêu 50 triệu/tháng, kín lịch cuối tuần.",
    tags: ["Salon", "Nail", "Khách quen", "TP.HCM"],
    answers: {
      businessTypeSlug: "salon",
      industrySlug: "nail-salon",
      industryCustom: "",
      businessName: "Nail House Quận 7",
      ownerName: "Trần Thu Hà",
      location: "Quận 7, TP.HCM",
      description: "Tiệm nail nhỏ 4 ghế, thợ tay nghề 5 năm, không gian sạch, dụng cụ tiệt trùng riêng từng khách.",
      experience: "some",
      targetCustomer: "Chị em văn phòng và mẹ bỉm sữa 25–40 tuổi quanh Phú Mỹ Hưng, thích nail gọn gàng, bền",
      customerSegment: "individual",
      customerPainPoints: "Làm nail bị hư sau 1 tuần, tiệm đông phải chờ lâu, dụng cụ không sạch",
      products: ["Sơn gel", "Nail art theo mẫu", "Nối mi classic", "Combo nail + mi"],
      brandPersonality: ["caring", "premium"],
      colorPalette: "rose",
      salesChannels: ["facebook", "zalo", "tiktok", "offline"],
      revenueTarget: 50000000,
      primaryGoal: "more_leads",
    },
  },
  {
    slug: "moc-local-brand",
    name: "Mộc Local Brand",
    businessTypeSlug: "online-shop",
    businessTypeName: "Shop online",
    industrySlug: "fashion-shop",
    industryName: "Thời trang",
    summary: "Local brand thời trang linen tối giản cho nữ 25–35, bán trên Instagram, Facebook và Shopee. Mục tiêu 100 triệu/tháng.",
    tags: ["Shop online", "Local brand", "Instagram", "Shopee"],
    answers: {
      businessTypeSlug: "online-shop",
      industrySlug: "fashion-shop",
      industryCustom: "",
      businessName: "Mộc Local Brand",
      ownerName: "Phạm Ngọc Mai",
      location: "TP.HCM",
      description: "Đồ linen tối giản, form rộng dễ mặc, may tại xưởng riêng. Mỗi tháng ra 1 bộ sưu tập nhỏ.",
      experience: "some",
      targetCustomer: "Nữ 25–35 tuổi làm văn phòng hoặc tự do, thích phong cách tối giản, sẵn sàng trả 300–600k cho một món đồ bền",
      customerSegment: "individual",
      customerPainPoints: "Mua online không đúng form, chất vải khác ảnh, đổi trả phiền phức",
      products: ["Áo sơ mi linen", "Quần ống rộng", "Set đồ đi làm", "Váy linen"],
      brandPersonality: ["minimal", "trustworthy"],
      colorPalette: "slate",
      salesChannels: ["instagram", "facebook", "shopee", "tiktok"],
      revenueTarget: 100000000,
      primaryGoal: "grow_brand",
    },
  },
  {
    slug: "bright-agency",
    name: "Bright Agency",
    businessTypeSlug: "agency",
    businessTypeName: "Agency",
    industrySlug: "marketing-agency",
    industryName: "Marketing agency",
    summary: "Agency performance marketing 6 người tại TP.HCM, chuyên chạy ads và content cho F&B và spa. Mục tiêu 200 triệu/tháng doanh thu retainer.",
    tags: ["Agency", "Performance", "Retainer", "B2B"],
    answers: {
      businessTypeSlug: "agency",
      industrySlug: "marketing-agency",
      industryCustom: "",
      businessName: "Bright Agency",
      ownerName: "Đỗ Quang Huy",
      location: "TP.HCM",
      description: "Team 6 người, 3 năm kinh nghiệm chạy ads F&B và spa. Báo cáo minh bạch từng đồng, cam kết KPI theo tháng.",
      experience: "experienced",
      targetCustomer: "Chủ chuỗi F&B và spa 2–5 chi nhánh, ngân sách marketing 30–100 triệu/tháng, cần đối tác chạy ads có cam kết",
      customerSegment: "smb",
      customerPainPoints: "Từng bị agency đốt tiền ads không ra khách, báo cáo mập mờ, không biết tiền đi đâu",
      products: ["Gói performance ads", "Gói content & quản lý fanpage", "Gói branding trọn gói"],
      brandPersonality: ["professional", "creative"],
      colorPalette: "violet",
      salesChannels: ["referral", "facebook", "google", "website"],
      revenueTarget: 200000000,
      primaryGoal: "systemize",
    },
  },
  {
    slug: "ca-phe-goc-pho",
    name: "Cà phê Góc Phố",
    businessTypeSlug: "fnb",
    businessTypeName: "F&B nhỏ",
    industrySlug: "coffee-shop",
    industryName: "Quán cà phê",
    summary: "Quán cà phê 40m² ở Bình Thạnh, cà phê rang xay và bánh ngọt tự làm, nhắm vào dân văn phòng và sinh viên làm việc từ xa. Mục tiêu 50 triệu/tháng.",
    tags: ["F&B", "Cà phê", "Khai trương", "Bình Thạnh"],
    answers: {
      businessTypeSlug: "fnb",
      industrySlug: "coffee-shop",
      industryCustom: "",
      businessName: "Cà phê Góc Phố",
      ownerName: "Võ Thị Lan Anh",
      location: "Bình Thạnh, TP.HCM",
      description: "Quán nhỏ 40m², cà phê rang xay từ Cầu Đất, bánh ngọt nhà làm, có ổ cắm và wifi mạnh cho người làm việc.",
      experience: "new",
      targetCustomer: "Dân văn phòng và sinh viên 20–35 tuổi quanh khu Bình Thạnh, cần chỗ ngồi làm việc yên tĩnh với cà phê ngon",
      customerSegment: "individual",
      customerPainPoints: "Quán đông ồn không làm việc được, cà phê pha sẵn nhạt, giá cao so với chất lượng",
      products: ["Cà phê rang xay", "Bánh ngọt nhà làm", "Combo sáng", "Trà trái cây"],
      brandPersonality: ["friendly", "caring"],
      colorPalette: "coffee",
      salesChannels: ["offline", "facebook", "tiktok", "shopee"],
      revenueTarget: 50000000,
      primaryGoal: "launch_new",
    },
  },
];

export function getExampleBySlug(slug: string): ExampleKit | undefined {
  return EXAMPLE_KITS.find((k) => k.slug === slug);
}

export function buildExampleContext(kit: ExampleKit): GenerationContext {
  return {
    businessId: `example-${kit.slug}`,
    businessName: kit.name,
    businessType: { slug: kit.businessTypeSlug, name: kit.businessTypeName },
    industry: { slug: kit.industrySlug, name: kit.industryName },
    answers: kit.answers,
    currency: "VND",
    seed: hashString(kit.slug),
    templates: {},
  };
}

/** Sinh toàn bộ nội dung ví dụ cho một slug. Trả về null nếu không tồn tại. */
export function getExampleKit(slug: string): GeneratedExample | null {
  const kit = getExampleBySlug(slug);
  if (!kit) return null;
  const context = buildExampleContext(kit);
  return {
    kit,
    context,
    brand: generateMockStage("brand", context),
    services: generateMockStage("services", context).services,
    pricing: generateMockStage("pricing", context),
    sales: generateMockStage("sales", context),
    marketing: generateMockStage("marketing", context),
    content: generateMockStage("content", context).items,
    website: generateMockStage("website", context),
  };
}

/** Tìm asset theo key trong một danh sách asset. */
export function findAsset(assets: AssetPayload[], key: string): AssetPayload | undefined {
  return assets.find((a) => a.key === key);
}
