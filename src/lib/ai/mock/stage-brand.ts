import type { AssetPayload, GenerationContext, ServiceOutput, PricingOutput } from "../types";
import { FONT_PAIRS, PERSONALITY_VOICE } from "./library";
import { makeGen, priceFor, upperFirst } from "./helpers";
import { formatVND } from "@/lib/utils";

export function genAnalyzing(ctx: GenerationContext): { assets: AssetPayload[] } {
  const g = makeGen(ctx, "analyzing");
  const strengths = [
    `Sản phẩm/dịch vụ rõ ràng: ${g.products.slice(0, 3).join(", ")}`,
    `Tính cách thương hiệu "${g.personalities.map((p) => PERSONALITY_VOICE[p]?.tone.split(",")[0] ?? p).join(", ")}" phù hợp với ${g.fill("{customer}")}`,
    ctx.answers.experience === "experienced" ? "Kinh nghiệm thực chiến nhiều năm là bằng chứng mạnh để định giá cao hơn" : "Mới bắt đầu nhưng có thể dùng ưu đãi 'khách hàng sáng lập' để lấy case study nhanh",
  ];
  const opportunities = [
    `${g.ctx.industry.name} tại ${g.location} còn nhiều đơn vị làm việc thiếu quy trình — minh bạch giá & quy trình là lợi thế`,
    `Kênh ${ctx.answers.salesChannels.slice(0, 2).join(" + ")} đủ để đạt mục tiêu ${formatVND(ctx.answers.revenueTarget)}/tháng nếu đăng đều 3–4 nội dung/tuần`,
    `Nhóm khách "${g.fill("{customer}")}" thường gặp vấn đề: ${g.profile.painPoints[0]} — đây là góc nội dung nên khai thác đầu tiên`,
  ];
  const risks = [
    "Định giá thấp để lấy khách dễ dẫn đến quá tải mà không có lãi",
    "Nội dung không đều khiến kênh mất đà sau 2–3 tuần",
    ctx.answers.salesChannels.length > 3 ? "Ôm quá nhiều kênh cùng lúc — nên tập trung 2 kênh chính trong 90 ngày đầu" : "Phụ thuộc vào ít kênh — nên có kế hoạch giới thiệu/truyền miệng song song",
  ];
  const goalMap: Record<string, string> = {
    first_customers: "Lấy 5 khách hàng đầu tiên trong 30 ngày bằng ưu đãi sáng lập + tư vấn miễn phí",
    more_leads: "Xây hệ thống nội dung + lead magnet để có khách đều mỗi tuần",
    raise_prices: "Đóng gói lại dịch vụ thành 3 gói, tăng giá trung bình 25–40% kèm bằng chứng",
    systemize: "Chuẩn hoá quy trình khách hàng – bán hàng – bàn giao bằng checklist",
    launch_new: "Kế hoạch ra mắt 30 ngày với 3 giai đoạn: tạo chờ đợi – mở bán – duy trì",
    grow_brand: "Nhất quán thông điệp & nhận diện trên mọi điểm chạm, tập trung nội dung giá trị",
  };
  return {
    assets: [
      {
        key: "analysis",
        title: "Phân tích business",
        content: {
          summary: `${g.name} là ${g.profile.noun} trong lĩnh vực ${g.ctx.industry.name} tại ${g.location}, phục vụ ${g.fill("{customer}")}. Mục tiêu ${formatVND(ctx.answers.revenueTarget)}/tháng là khả thi với mức giá trung bình ${formatVND(g.basePrice)} và khoảng ${Math.max(1, Math.round(ctx.answers.revenueTarget / g.basePrice))} ${g.profile.unit}/tháng.`,
          strengths,
          opportunities,
          risks,
          positioning_angle: `${upperFirst(g.profile.differentiators[0])} cho ${g.fill("{customer}")}`,
          recommended_focus: goalMap[ctx.answers.primaryGoal] ?? goalMap.first_customers,
          units_needed_per_month: Math.max(1, Math.round(ctx.answers.revenueTarget / g.basePrice)),
          avg_price: g.basePrice,
        },
      },
    ],
  };
}

export function genBrand(ctx: GenerationContext): { assets: AssetPayload[] } {
  const g = makeGen(ctx, "brand");
  const { rng, profile } = g;
  const diffs = rng.shuffle(profile.differentiators);
  const customer = g.fill("{customer}");
  const taglines = rng.shuffle([
    `${upperFirst(profile.outcomes[0])}.`,
    `${g.product} làm đúng ngay từ đầu`,
    `Đồng hành cùng ${customer}`,
    `${upperFirst(diffs[0])}`,
    `Ít lời, nhiều kết quả`,
    `Chuyên ${g.ctx.industry.name.toLowerCase()} cho ${customer}`,
    `Bắt đầu đúng, lớn bền`,
  ]).slice(0, 5);

  const pillars = [
    { title: upperFirst(diffs[0]), description: `Đây là lý do khách chọn ${g.name} thay vì tự làm hoặc tìm nơi rẻ hơn.` },
    { title: upperFirst(diffs[1] ?? profile.outcomes[1]), description: `Khách luôn biết chuyện gì đang diễn ra, không bị bỏ rơi giữa chừng.` },
    { title: upperFirst(profile.outcomes[1] ?? profile.outcomes[0]), description: `Kết quả được định nghĩa trước, đo được sau.` },
  ];

  const personaNames = ctx.answers.customerSegment === "smb" ? ["Chị Lan – chủ shop", "Anh Minh – giám đốc SME", "Chị Thu – quản lý marketing"] : ["Chị Hạnh", "Anh Tuấn", "Bạn Linh"];
  const persona = {
    name: rng.pick(personaNames),
    age_range: ctx.answers.customerSegment === "smb" ? "30–45" : "22–38",
    occupation: ctx.answers.customerSegment === "smb" ? "Chủ doanh nghiệp nhỏ / chủ shop" : "Nhân viên văn phòng, người kinh doanh tự do",
    description: ctx.answers.targetCustomer,
    goals: [profile.outcomes[0], profile.outcomes[1] ?? "tiết kiệm thời gian", "được tư vấn thật lòng, không bị ép mua"],
    pains: ctx.answers.customerPainPoints ? [ctx.answers.customerPainPoints, ...profile.painPoints.slice(0, 2)] : profile.painPoints.slice(0, 3),
    channels: ctx.answers.salesChannels.slice(0, 3),
    quote: `"Mình chỉ cần một người làm ${g.product.toLowerCase()} cho đàng hoàng, nói rõ giá, đúng hẹn là được."`,
    buying_triggers: ["Thấy case study/feedback thật", "Được tư vấn miễn phí trước", "Giá rõ ràng, có bảo hành/cam kết"],
  };

  const voice = g.voice;
  const secondVoice = g.personalities[1] ? PERSONALITY_VOICE[g.personalities[1]] : null;
  const fonts = FONT_PAIRS[g.personality] ?? FONT_PAIRS.professional;

  return {
    assets: [
      {
        key: "positioning",
        title: "Định vị thương hiệu",
        content: {
          statement: `${g.name} là ${profile.noun} ${g.ctx.industry.name.toLowerCase()} dành cho ${customer}, giúp họ ${profile.outcomes[0]} nhờ ${diffs[0]}.`,
          for_whom: ctx.answers.targetCustomer,
          what: `${g.ctx.industry.name}: ${g.products.join(", ")}`,
          unlike: `những nơi ${profile.painPoints[2] ?? profile.painPoints[0]}`,
          because: diffs.slice(0, 2).join("; "),
          category: g.ctx.industry.name,
        },
      },
      {
        key: "value_proposition",
        title: "Giá trị cốt lõi",
        content: {
          headline: `${upperFirst(profile.outcomes[0])} — không phát sinh, không mơ hồ`,
          subheadline: `${g.name} giúp ${customer} ${profile.outcomes[1] ?? profile.outcomes[0]} với ${diffs[0]}.`,
          pillars,
        },
      },
      { key: "tagline", title: "Tagline", content: { options: taglines, selected: taglines[0] } },
      {
        key: "description",
        title: "Mô tả thương hiệu",
        content: {
          short: `${g.name} — ${g.ctx.industry.name.toLowerCase()} cho ${customer} tại ${g.location}. ${upperFirst(diffs[0])}.`,
          long: `${g.name} là ${profile.noun} chuyên ${g.ctx.industry.name.toLowerCase()} tại ${g.location}. Chúng tôi làm việc với ${customer} — những người đang ${profile.painPoints[0]}. Thay vì ${profile.painPoints[1]}, bạn nhận được ${profile.outcomes[0]} với ${diffs[0]} và ${diffs[1] ?? diffs[0]}. ${ctx.answers.description ? ctx.answers.description : ""}`.trim(),
          elevator: `Bạn biết ${customer} hay ${profile.painPoints[0]} không? ${g.name} giúp họ ${profile.outcomes[0]} bằng ${g.product.toLowerCase()} với ${diffs[0]}. Khác biệt là ${diffs[1] ?? diffs[0]}.`,
        },
      },
      {
        key: "voice",
        title: "Giọng nói thương hiệu",
        content: {
          tone: secondVoice ? `${voice.tone}; pha chút ${secondVoice.tone.split(",")[0]}` : voice.tone,
          do: [...voice.do, ...(secondVoice?.do.slice(0, 1) ?? [])],
          dont: [...voice.dont, ...(secondVoice?.dont.slice(0, 1) ?? [])],
          words: [...voice.words, ...(secondVoice?.words.slice(0, 2) ?? [])],
          sample_sentences: [
            `Mình không hứa "tốt nhất", mình hứa ${profile.outcomes[0]}.`,
            `Giá ${g.product.toLowerCase()} bên ${g.name} công khai — xem xong rồi quyết định, không ai thúc.`,
            `Nếu bạn đang ${profile.painPoints[0]}, nhắn mình 1 tin, 15 phút là có hướng đi.`,
          ],
        },
      },
      { key: "persona", title: "Chân dung khách hàng", content: persona },
      {
        key: "key_messages",
        title: "Thông điệp chính",
        content: {
          messages: [
            { title: "Thông điệp chủ đạo", message: `${upperFirst(profile.outcomes[0])} với ${g.product.toLowerCase()} từ ${g.name}.`, proof: profile.proofPoints[0] },
            { title: "Khác biệt", message: upperFirst(diffs[0]), proof: profile.proofPoints[1] ?? profile.proofPoints[0] },
            { title: "Giảm rủi ro", message: `Tư vấn trước, ${profile.differentiators.find((d) => d.includes("bảo hành") || d.includes("cam kết")) ?? "cam kết phạm vi bằng văn bản"}.`, proof: profile.proofPoints[2] ?? "" },
            { title: "Kêu gọi hành động", message: `Nhắn ${g.name} để nhận tư vấn miễn phí 15 phút và báo giá trong ngày.`, proof: "" },
          ],
        },
      },
      {
        key: "palette",
        title: "Bảng màu",
        content: {
          key: g.palette.key,
          label: g.palette.label,
          primary: g.palette.primary,
          secondary: g.palette.secondary,
          accent: g.palette.accent,
          bg: g.palette.bg,
          text: "#0F172A",
          muted: "#64748B",
          usage: { primary: "Nút CTA, tiêu đề nhấn, logo", secondary: "Link, icon, đồ hoạ phụ", accent: "Khuyến mãi, badge, điểm nhấn nhỏ", bg: "Nền trang, nền card", text: "Chữ chính" },
        },
      },
      {
        key: "typography",
        title: "Typography",
        content: {
          heading: fonts.heading,
          body: fonts.body,
          scale: { h1: "40/48 – 700", h2: "28/36 – 700", h3: "20/28 – 600", body: "16/24 – 400", small: "14/20 – 400" },
          notes: ["Tiêu đề in đậm, tối đa 8 từ", "Đoạn văn ngắn 2–3 câu", "Dùng 1 font tiêu đề + 1 font nội dung, không thêm font thứ 3"],
        },
      },
    ],
  };
}

export function genServices(ctx: GenerationContext): { services: ServiceOutput[] } {
  const g = makeGen(ctx, "services");
  const { profile, rng } = g;
  const services: ServiceOutput[] = [];
  const archetypes = profile.serviceArchetypes;

  // Sản phẩm người dùng nhập → mỗi sản phẩm là 1 dịch vụ tiêu chuẩn
  g.products.slice(0, 5).forEach((p, i) => {
    const arch = archetypes[1] ?? archetypes[0];
    const mult = 1 + (i % 3) * 0.2 - (i >= 3 ? 0.3 : 0);
    const price = priceFor(g.basePrice, Math.max(0.3, mult));
    services.push({
      name: upperFirst(p),
      description: g.fill(arch.description, { product: p.toLowerCase() }),
      price,
      sale_price: i === 0 && rng.chance(0.5) ? priceFor(price, 0.85) : null,
      unit: arch.unit,
      delivery_time: arch.deliveryTime,
      features: arch.features.map((f) => g.fill(f, { product: p.toLowerCase() })),
      benefits: arch.benefits.map((b) => g.fill(b, { product: p.toLowerCase() })),
      target_customer: g.fill("{customer}"),
      upsell: g.products[i + 1] ? `Kết hợp với ${g.products[i + 1]} để tiết kiệm 10%` : g.fill(archetypes[3]?.name ?? "Gói đồng hành", {}),
    });
  });

  // Bổ sung archetype còn thiếu để có tối thiểu 4 dịch vụ
  for (const arch of [archetypes[0], archetypes[2], archetypes[3]]) {
    if (!arch || services.length >= 5) break;
    services.push({
      name: g.fill(arch.name),
      description: g.fill(arch.description),
      price: priceFor(g.basePrice, arch.priceMultiplier),
      sale_price: null,
      unit: arch.unit,
      delivery_time: arch.deliveryTime,
      features: arch.features.map((f) => g.fill(f)),
      benefits: arch.benefits.map((b) => g.fill(b)),
      target_customer: g.fill("{customer}"),
      upsell: services[0] ? `Khách dùng ${services[0].name} được giảm 10% khi thêm gói này` : "",
    });
  }
  return { services };
}

export function genPricing(ctx: GenerationContext): PricingOutput {
  const g = makeGen(ctx, "pricing");
  const { profile } = g;
  const base = g.basePrice;
  const tmpl = (ctx.templates.pricing ?? {}) as { multipliers?: number[]; margin_target?: number };
  const mults = tmpl.multipliers?.length === 3 ? tmpl.multipliers : [1, 1.8, 3.2];
  const basic = priceFor(base, 0.65 * mults[0]);
  const standard = priceFor(base, 0.65 * mults[1]);
  const premium = priceFor(base, 0.65 * mults[2]);
  const unit = profile.unit;
  const p = g.product.toLowerCase();

  const packages = [
    {
      tier: "basic" as const,
      name: "Cơ bản",
      description: `Đủ để bắt đầu với ${p} — phù hợp khi ngân sách còn hạn chế.`,
      price: basic,
      billing_unit: unit,
      features: [`${upperFirst(p)} phiên bản tiêu chuẩn`, "1 vòng chỉnh sửa", "Hỗ trợ 7 ngày sau bàn giao", "Bàn giao đầy đủ file/kết quả"],
      recommended: false,
    },
    {
      tier: "standard" as const,
      name: "Tiêu chuẩn",
      description: `Lựa chọn phổ biến nhất: ${p} đầy đủ + ${profile.outcomes[0]}.`,
      price: standard,
      billing_unit: unit,
      features: ["Mọi thứ trong gói Cơ bản", `${upperFirst(p)} đầy đủ hạng mục`, "3 vòng chỉnh sửa", "Hỗ trợ 30 ngày", upperFirst(profile.differentiators[0])],
      recommended: true,
    },
    {
      tier: "premium" as const,
      name: "Cao cấp",
      description: `Giải pháp trọn vẹn cho khách muốn ${profile.outcomes[1] ?? profile.outcomes[0]} và được đồng hành dài hạn.`,
      price: premium,
      billing_unit: unit,
      features: ["Mọi thứ trong gói Tiêu chuẩn", g.products[1] ? `Kèm ${g.products[1]}` : "Hạng mục mở rộng theo yêu cầu", "Chỉnh sửa không giới hạn trong 14 ngày", "Hỗ trợ ưu tiên 90 ngày", "Buổi tư vấn chiến lược 60 phút"],
      recommended: false,
    },
  ];

  const unitsNeeded = Math.max(1, Math.round(ctx.answers.revenueTarget / standard));
  return {
    packages,
    assets: [
      {
        key: "recommendations",
        title: "Khuyến nghị định giá",
        content: {
          strategy: `Định giá theo giá trị (value-based) với 3 mức để khách tự chọn. Gói Tiêu chuẩn là "mỏ neo" — đặt ở mức ${formatVND(standard)} và làm nổi bật. Gói Cao cấp tồn tại để gói Tiêu chuẩn trông hợp lý.`,
          anchor: standard,
          target_margin: tmpl.margin_target ?? 0.45,
          units_needed: unitsNeeded,
          revenue_target: ctx.answers.revenueTarget,
          tips: [
            `Để đạt ${formatVND(ctx.answers.revenueTarget)}/tháng cần khoảng ${unitsNeeded} ${unit} gói Tiêu chuẩn — hoặc ít hơn nếu bán được gói Cao cấp.`,
            "Không giảm giá trực tiếp; thay vào đó tặng thêm hạng mục (bonus) để giữ giá trị gói.",
            "Dùng số lẻ hợp lý (ví dụ 2.900.000 thay vì 3.000.000) cho gói Cơ bản; gói Cao cấp để số tròn tạo cảm giác cao cấp.",
            "Tăng giá 10–15% sau mỗi 10 khách hoặc khi lịch kín 80%.",
            ctx.answers.experience === "new" ? "Giai đoạn đầu: 3–5 khách sáng lập giảm 20% đổi lấy testimonial và case study." : "Bạn đã có kinh nghiệm: hãy đưa case study vào bảng giá để bảo vệ mức giá cao hơn thị trường.",
          ],
          psychology: ["Mỏ neo (anchor) bằng gói Cao cấp", "Nổi bật gói khuyến nghị", "Cam kết/bảo hành giảm rủi ro cảm nhận", "So sánh với chi phí 'không làm gì'"],
        },
      },
      {
        key: "calculator_defaults",
        title: "Máy tính chi phí & biên lợi nhuận",
        content: {
          cost_items: profile.monthlyExpenses.slice(0, 4).map((e) => ({ name: e.name, amount: Math.round(e.amount / Math.max(unitsNeeded, 4)) })),
          hours_per_unit: profile.unit === "dự án" ? 20 : profile.unit === "buổi" ? 1.5 : 2,
          hourly_rate_target: Math.round(standard / (profile.unit === "dự án" ? 20 : 2)),
          target_margin: tmpl.margin_target ?? 0.45,
        },
      },
    ],
  };
}
