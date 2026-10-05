import type { AssetPayload, ContentItemOutput, GenerationContext, MarketingOutput, MarketingPlanItemOutput } from "../types";
import { CHANNEL_LABELS, makeGen, platformsFromChannels, upperFirst } from "./helpers";
import { formatVND } from "@/lib/utils";

export function genMarketing(ctx: GenerationContext): MarketingOutput {
  const g = makeGen(ctx, "marketing");
  const { profile } = g;
  const p = g.product.toLowerCase();
  const customer = g.fill("{customer}");
  const channels = ctx.answers.salesChannels.length ? ctx.answers.salesChannels : ["facebook", "referral"];
  const main = channels.slice(0, 2);
  const budget = Math.max(1_000_000, Math.round(ctx.answers.revenueTarget * 0.08));

  const channelRoles: Record<string, { role: string; tactics: string[] }> = {
    facebook: { role: "Kênh chính: niềm tin & chuyển đổi", tactics: ["Đăng 4 bài/tuần (case study, mẹo, feedback)", "Trả lời inbox trong 15 phút giờ hành chính", "Chạy ads 'tin nhắn' cho bài case study tốt nhất", "Tham gia 3 nhóm cộng đồng liên quan"] },
    instagram: { role: "Hình ảnh & nhận diện", tactics: ["Reels 3/tuần", "Story hàng ngày", "Highlight: Bảng giá, Feedback, Quy trình"] },
    tiktok: { role: "Tiếp cận & viral", tactics: ["1 video/ngày trong 30 ngày đầu", "Format: before–after, mẹo 30s, hậu trường", "Dùng 3–5 hashtag ngành + địa phương"] },
    zalo: { role: "Chăm sóc & chốt", tactics: ["Zalo OA: gửi ưu đãi hàng tuần", "Nhóm khách thân thiết", "Nhắc lịch/tái mua tự động"] },
    shopee: { role: "Sàn: đơn tự nhiên", tactics: ["Tối ưu tiêu đề + ảnh bìa", "Tham gia Flash Sale tuần", "Trả lời đánh giá 100%"] },
    website: { role: "Điểm đến & SEO", tactics: ["Landing page 1 trang với form", "1 bài blog/tuần theo từ khoá địa phương", "Cài Google Analytics & Pixel"] },
    google: { role: "Tìm kiếm có ý định", tactics: ["Google Business Profile: xin 20 đánh giá đầu", "Google Ads từ khoá địa phương 500k/tuần thử nghiệm", "SEO 5 trang dịch vụ"] },
    offline: { role: "Trực tiếp & địa phương", tactics: ["Card/QR tại cửa hàng & đối tác", "Sự kiện/workshop nhỏ 1 lần/tháng", "Hợp tác chéo với 3 cửa hàng lân cận"] },
    referral: { role: "Giới thiệu – chi phí thấp nhất", tactics: ["Chương trình giới thiệu: tặng 10% cho cả hai", "Xin giới thiệu ngay sau khi bàn giao thành công", "Gửi quà cảm ơn người giới thiệu"] },
  };

  const assets: AssetPayload[] = [
    {
      key: "overview",
      title: "Tổng quan marketing",
      content: {
        summary: `Trong 90 ngày đầu, ${g.name} tập trung 2 kênh chính (${main.map((c) => CHANNEL_LABELS[c] ?? c).join(" + ")}) với thông điệp "${upperFirst(profile.outcomes[0])}" cho ${customer}. Mục tiêu: ${formatVND(ctx.answers.revenueTarget)}/tháng với ngân sách marketing khoảng ${formatVND(budget)}/tháng (8% doanh thu mục tiêu).`,
        goals: [`${Math.max(3, Math.round(ctx.answers.revenueTarget / g.basePrice))} khách/tháng từ tháng thứ 3`, "Đăng đều 3–5 nội dung/tuần", "20 đánh giá/feedback công khai trong 60 ngày", "Tỷ lệ chốt inbox ≥ 25%"],
        kpis: [{ name: "Khách tiềm năng/tuần", target: Math.max(5, Math.round(ctx.answers.revenueTarget / g.basePrice / 4) * 4) }, { name: "Tỷ lệ chốt", target: "25%" }, { name: "Chi phí/khách", target: formatVND(Math.round(budget / Math.max(3, Math.round(ctx.answers.revenueTarget / g.basePrice)))) }, { name: "Khách quay lại/giới thiệu", target: "30%" }],
        budget_monthly: budget,
        budget_split: main.map((c, i) => ({ channel: CHANNEL_LABELS[c] ?? c, pct: i === 0 ? 60 : 30 })).concat([{ channel: "Thử nghiệm", pct: 10 }]),
      },
    },
    {
      key: "target_audience",
      title: "Khách hàng mục tiêu",
      content: {
        segments: [
          { name: "Nhóm chính", description: ctx.answers.targetCustomer, where: main.map((c) => CHANNEL_LABELS[c] ?? c).join(", "), message: `${upperFirst(profile.outcomes[0])} — ${profile.differentiators[0]}` , size: "60%" },
          { name: "Nhóm sẵn sàng chi cao", description: `${upperFirst(customer)} đã từng ${profile.painPoints[1] ?? profile.painPoints[0]} và muốn làm lại cho đúng`, where: "Giới thiệu, Google", message: `Làm đúng một lần — ${profile.differentiators[1] ?? profile.differentiators[0]}`, size: "25%" },
          { name: "Nhóm tò mò", description: "Mới tìm hiểu, chưa có ngân sách rõ", where: channels.includes("tiktok") ? "TikTok, Facebook" : "Facebook, Instagram", message: "Nội dung giáo dục + lead magnet, chưa bán", size: "15%" },
        ],
      },
    },
    {
      key: "channels",
      title: "Kênh tiếp cận",
      content: {
        items: channels.map((c, i) => ({ channel: CHANNEL_LABELS[c] ?? c, key: c, role: channelRoles[c]?.role ?? "Kênh phụ", tactics: channelRoles[c]?.tactics ?? ["Đăng đều, phản hồi nhanh"], budget_pct: i === 0 ? 60 : i === 1 ? 30 : Math.round(10 / Math.max(1, channels.length - 2)), priority: i < 2 ? "Chính" : "Phụ" })),
      },
    },
    {
      key: "launch_strategy",
      title: "Chiến lược ra mắt",
      content: {
        phases: [
          { name: "Tuần 1–2: Chuẩn bị & tạo chờ đợi", duration: "14 ngày", actions: ["Hoàn thiện trang/profile với bảng giá & feedback", "Đăng 5 nội dung giới thiệu: mình là ai, làm gì, vì sao", "Nhắn riêng 30 người quen tiềm năng", "Chuẩn bị lead magnet"] },
          { name: "Tuần 3–4: Mở bán", duration: "14 ngày", actions: [g.fill(profile.launchIdeas[0]), "Chạy ads tin nhắn 300–500k/ngày cho bài tốt nhất", "Livestream/Q&A 1 buổi", "Xin 10 feedback đầu tiên"] },
          { name: "Tháng 2: Duy trì & tối ưu", duration: "30 ngày", actions: ["Giữ nhịp 3–5 nội dung/tuần", "Phân tích nội dung nào ra khách, nhân bản", "Mở chương trình giới thiệu", g.fill(profile.launchIdeas[2] ?? profile.launchIdeas[1])] },
          { name: "Tháng 3: Mở rộng", duration: "30 ngày", actions: ["Thêm kênh thứ 3", "Tăng giá 10% nếu lịch kín 80%", "Ra mắt gói cao cấp/định kỳ", "Hợp tác chéo với 2 đối tác"] },
        ],
      },
    },
    {
      key: "campaign_ideas",
      title: "Ý tưởng chiến dịch",
      content: {
        items: [
          { name: "Khách hàng sáng lập", goal: "5 khách đầu + testimonial", mechanics: g.fill(profile.launchIdeas[0]), duration: "14 ngày", channel: CHANNEL_LABELS[main[0]] },
          { name: `30 ngày ${p}`, goal: "Tăng nhận diện", mechanics: `Mỗi ngày 1 mẹo/câu chuyện về ${p}, tổng kết bằng 1 tài liệu tải về`, duration: "30 ngày", channel: channels.includes("tiktok") ? "TikTok" : "Facebook" },
          { name: "Before – After", goal: "Bằng chứng kết quả", mechanics: "Mỗi tuần 1 case trước–sau có số liệu, xin phép khách", duration: "Liên tục", channel: "Facebook/Instagram" },
          { name: "Giới thiệu bạn bè", goal: "Khách chi phí thấp", mechanics: "Tặng 10% cho người giới thiệu và người được giới thiệu", duration: "Liên tục", channel: "Zalo/Trực tiếp" },
          { name: g.fill(profile.launchIdeas[1]), goal: "Tương tác & follow", mechanics: "Minigame/thử thách có quà là dịch vụ của mình", duration: "7 ngày", channel: CHANNEL_LABELS[main[0]] },
        ],
      },
    },
    {
      key: "promotions",
      title: "Khuyến mãi",
      content: {
        items: [
          { name: "Ưu đãi khách mới", offer: "Giảm 15% gói đầu tiên hoặc tặng 1 hạng mục", condition: "Đặt trong 7 ngày kể từ khi tư vấn", when: "Liên tục" },
          { name: "Combo tiết kiệm", offer: g.products[1] ? `Mua ${g.products[0]} + ${g.products[1]} giảm 10%` : "Gói định kỳ giảm 15%", condition: "Thanh toán trọn gói", when: "Liên tục" },
          { name: "Flash tháng", offer: "3 suất giá cũ trước khi tăng giá", condition: "Đặt cọc trong 48h", when: "Cuối mỗi tháng" },
          { name: "Quà cảm ơn", offer: "Tặng tài liệu/phụ kiện cho khách để lại đánh giá", condition: "Đánh giá công khai", when: "Sau bàn giao" },
        ],
        rules: ["Không giảm quá 20%", "Luôn có điều kiện & thời hạn", "Ưu tiên tặng thêm thay vì giảm giá"],
      },
    },
    {
      key: "lead_magnets",
      title: "Lead magnets",
      content: {
        items: profile.leadMagnets.map((lm, i) => ({ name: g.fill(lm), format: i === 0 ? "PDF/Checklist" : i === 1 ? "Google Sheet / PDF" : "Zalo/Form", hook: `Nhận miễn phí khi nhắn "${["CHECKLIST", "BANGGIA", "NHOM"][i] ?? "FREE"}"`, delivery: "Gửi tự động qua Zalo/Email trong 5 phút, kèm 1 câu hỏi khám phá" })),
      },
    },
  ];

  const plan: MarketingPlanItemOutput[] = [];
  const ch = (i: number) => CHANNEL_LABELS[channels[i % channels.length]] ?? "Facebook";
  const week1 = ["Hoàn thiện profile/trang: ảnh bìa, mô tả, bảng giá", "Đăng bài giới thiệu: mình là ai, làm gì cho ai", "Chuẩn bị lead magnet #1", "Nhắn 10 người quen tiềm năng đầu tiên", "Đăng case study/feedback #1", "Thiết lập Zalo OA / tin nhắn tự động", "Tổng kết tuần 1, lên lịch tuần 2"];
  const week2 = ["Đăng mẹo chuyên môn #1", "Quay 3 video ngắn hậu trường", "Nhắn 10 người quen tiếp theo", "Đăng bảng giá minh bạch + lý do", "Tham gia 3 nhóm cộng đồng, trả lời 5 câu hỏi", "Đăng before–after #1", "Tổng kết tuần 2: bao nhiêu inbox?"];
  const week3 = ["Mở bán: đăng ưu đãi khách sáng lập", "Chạy ads tin nhắn 300k/ngày cho bài tốt nhất", "Livestream/Q&A 30 phút", "Follow-up tất cả inbox chưa chốt", "Đăng mẹo chuyên môn #2", "Xin 3 feedback từ khách đầu", "Tổng kết tuần 3: tỷ lệ chốt"];
  const week4 = ["Đăng case study chi tiết #2", "Gửi lead magnet cho 20 người đã tương tác", "Hợp tác chéo với 1 đối tác địa phương", "Đăng video hậu trường", "Nhắc ưu đãi còn 48h", "Thu thập 5 đánh giá công khai", "Tổng kết tháng: doanh thu, chi phí, bài học"];
  [week1, week2, week3, week4].forEach((week, w) => {
    week.forEach((title, d) => {
      const day = w * 7 + d + 1;
      const kind: MarketingPlanItemOutput["kind"] = title.startsWith("Đăng") || title.startsWith("Quay") ? "content" : title.includes("ưu đãi") || title.includes("Mở bán") ? "promotion" : title.includes("ads") || title.includes("Livestream") ? "campaign" : "task";
      plan.push({ day_index: day, title, description: kind === "content" ? `Kênh: ${ch(d)}. Giữ đúng giọng thương hiệu, kết thúc bằng CTA nhắn tin.` : "Hoàn thành trong ngày, ghi lại kết quả.", channel: ch(d), kind });
    });
  });
  for (let day = 29; day <= 30; day++) {
    plan.push({ day_index: day, title: day === 29 ? "Lên kế hoạch tháng 2 dựa trên số liệu" : "Chuẩn bị nội dung tuần đầu tháng 2", description: "Xem lại nội dung nào ra khách nhiều nhất và nhân bản.", channel: ch(day), kind: "task" });
  }
  return { assets, plan };
}

export function genContent(ctx: GenerationContext): { items: ContentItemOutput[] } {
  const g = makeGen(ctx, "content");
  const { profile, rng } = g;
  const p = g.product.toLowerCase();
  const platforms = platformsFromChannels(ctx.answers.salesChannels);
  const angles = rng.shuffle(profile.contentAngles.map((a) => g.fill(a)));
  const hooks = [
    `Bạn có đang ${profile.painPoints[0]}?`,
    `3 điều mình ước biết trước khi làm ${p}`,
    `Sự thật về ${p} mà ít ai nói`,
    `${rng.int(80, 97)}% ${g.fill("{customer}")} mắc lỗi này`,
    `Mình đã làm gì để ${profile.outcomes[0]}`,
    `Đừng chi tiền cho ${p} trước khi xem video này`,
    `Hậu trường một ngày của ${profile.noun} ${g.ctx.industry.name.toLowerCase()}`,
    `Feedback thật từ khách hôm nay`,
    `Bảng giá ${p} 2026: bao nhiêu là hợp lý?`,
    `Trước – sau: ${p} cho ${g.fill("{customer}")}`,
  ];
  const ctas = ["Nhắn tin để nhận tư vấn miễn phí 15 phút", "Comment 'GIÁ' để nhận bảng giá", "Lưu lại để dùng khi cần", "Inbox mình để giữ suất tháng này", "Chia sẻ cho người đang cần", "Bấm link trong bio để xem case study"];
  const types: Record<string, string[]> = { facebook: ["post", "carousel", "video", "story"], tiktok: ["video", "video", "story"], instagram: ["reel", "carousel", "story", "post"], threads: ["post", "post", "thread"] };
  const items: ContentItemOutput[] = [];
  for (let i = 0; i < 30; i++) {
    const platform = platforms[i % platforms.length];
    const angle = angles[i % angles.length];
    const hook = hooks[i % hooks.length];
    const type = rng.pick(types[platform] ?? ["post"]);
    const mix = i % 5;
    const caption =
      mix === 0
        ? `${hook}\n\n${angle}. ${g.fill(profile.differentiators[i % profile.differentiators.length])} — đó là cách ${g.name} làm ${p}.\n\nNếu bạn đang ${profile.painPoints[i % profile.painPoints.length]}, mình có 3 gợi ý:\n1. ${profile.outcomes[0]}\n2. ${profile.differentiators[(i + 1) % profile.differentiators.length]}\n3. Hỏi mình trước khi quyết định`
        : mix === 1
          ? `${angle}\n\nKhách của ${g.name} tuần này: ${g.fill("{customer}")}, vấn đề ban đầu là ${profile.painPoints[(i + 1) % profile.painPoints.length]}. Sau khi làm ${p}: ${profile.outcomes[(i + 1) % profile.outcomes.length]}.\n\n${profile.proofPoints[i % profile.proofPoints.length]}.`
          : mix === 2
            ? `${hook}\n\n${angle}.\n\nMình tổng hợp thành checklist ngắn, ai cần comment để mình gửi.`
            : mix === 3
              ? `Tháng này ${g.name} nhận thêm ${rng.int(3, 6)} ${profile.unit} ${p}.\n\n${upperFirst(profile.differentiators[0])}. ${upperFirst(profile.differentiators[1] ?? profile.outcomes[0])}.\n\nƯu đãi khách mới: giảm 15% khi đặt trong tuần.`
              : `${angle}\n\nMột ngày của mình: sáng ${profile.dailyTasks[0].toLowerCase()}, chiều ${profile.dailyTasks[1].toLowerCase()}, tối lên nội dung. Làm ${p} không chỉ là làm ${p} — là ${profile.outcomes[0]}.`;
    items.push({ title: angle, hook, caption, cta: ctas[i % ctas.length], platform, content_type: type, day_offset: i + 1 });
  }
  return { items };
}
