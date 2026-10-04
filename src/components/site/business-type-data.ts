/**
 * Nội dung tĩnh bổ sung cho landing theo loại hình (/business-kit/[slug]).
 * Dữ liệu chính (tên, hero, highlights, seo) lấy từ DB; phần này mô tả "bên trong kit có gì" theo từng loại hình.
 */
export interface TypeInsideItem {
  moduleKey: string;
  detail: string;
}

export interface TypeDetail {
  audience: string;
  painPoints: string[];
  inside: TypeInsideItem[];
  exampleSlug?: string;
}

const DEFAULT_DETAIL: TypeDetail = {
  audience: "chủ business nhỏ muốn bắt đầu đúng ngay từ đầu",
  painPoints: ["Không biết bắt đầu từ đâu", "Báo giá theo cảm tính", "Đăng bài không đều, không ra khách"],
  inside: [
    { moduleKey: "brand", detail: "Định vị, tagline, giọng nói và chân dung khách hàng mục tiêu." },
    { moduleKey: "pricing", detail: "3 gói giá kèm khuyến nghị định giá theo mục tiêu doanh thu." },
    { moduleKey: "sales", detail: "Kịch bản tư vấn, xử lý từ chối và follow-up." },
    { moduleKey: "marketing", detail: "Kế hoạch 30 ngày theo kênh bạn chọn." },
    { moduleKey: "content", detail: "30 bài đăng đa nền tảng sẵn sàng dùng." },
    { moduleKey: "documents", detail: "Báo giá, hợp đồng, hoá đơn và form tiếp nhận." },
  ],
};

export const TYPE_DETAILS: Record<string, TypeDetail> = {
  freelancer: {
    audience: "freelancer thiết kế, lập trình, viết lách, marketing, dịch thuật, nhiếp ảnh",
    painPoints: ["Khách trả giá, mình xuống giá", "Phạm vi công việc mơ hồ, sửa mãi không xong", "Không có hợp đồng, bị quỵt tiền"],
    inside: [
      { moduleKey: "pricing", detail: "Bảng giá theo giờ / theo dự án với 3 gói, máy tính giá giờ mục tiêu từ chi phí thực tế." },
      { moduleKey: "sales", detail: "Kịch bản discovery call 20 phút, xử lý 'bên kia rẻ hơn', 'để mình suy nghĩ' và chuỗi follow-up 30 ngày." },
      { moduleKey: "documents", detail: "Báo giá, proposal, hợp đồng dịch vụ có điều khoản chỉnh sửa & thanh toán cọc, biên bản bàn giao." },
      { moduleKey: "marketing", detail: "Kế hoạch tìm khách 30 ngày: hồ sơ năng lực, nhóm cộng đồng, giới thiệu, LinkedIn / Facebook." },
      { moduleKey: "brand", detail: "Định vị theo ngách, portfolio pitch và giọng nói chuyên nghiệp nhưng gần gũi." },
      { moduleKey: "operations", detail: "Quy trình nhận brief – báo giá – làm – bàn giao, checklist tuần để không trễ deadline." },
    ],
    exampleSlug: "minh-web-studio",
  },
  creator: {
    audience: "content creator, KOC/KOL, YouTuber, TikToker, podcaster",
    painPoints: ["Nhãn hàng hỏi giá không biết báo bao nhiêu", "Không có media kit chuyên nghiệp", "Đăng theo hứng, kênh không tăng đều"],
    inside: [
      { moduleKey: "pricing", detail: "Bảng giá booking: bài đăng, video, livestream, gói tháng — kèm nguyên tắc tăng giá theo follower." },
      { moduleKey: "brand", detail: "Media kit: định vị kênh, số liệu nổi bật, persona người xem, bảng màu & font cho thumbnail." },
      { moduleKey: "sales", detail: "Email / tin nhắn pitch nhãn hàng, xử lý 'ngân sách thấp', 'muốn trao đổi sản phẩm'." },
      { moduleKey: "content", detail: "Lịch 30 ngày đa nền tảng với mix giáo dục – đời thường – hậu trường – quảng bá." },
      { moduleKey: "documents", detail: "Hợp đồng hợp tác, brief nhận từ brand, báo giá booking, hoá đơn." },
      { moduleKey: "finance", detail: "Mục tiêu thu nhập, số booking cần mỗi tháng, chi phí sản xuất." },
    ],
    exampleSlug: "linh-beauty",
  },
  salon: {
    audience: "tiệm tóc, nail, spa, mi, massage, chăm sóc da",
    painPoints: ["Đầu tuần vắng, cuối tuần quá tải", "Khách làm một lần rồi không quay lại", "Nhân viên tư vấn mỗi người một kiểu"],
    inside: [
      { moduleKey: "services", detail: "Menu dịch vụ & combo theo mùa, giá rõ từng hạng mục, gợi ý upsell tự nhiên." },
      { moduleKey: "sales", detail: "Kịch bản tư vấn tại quầy, upsell nhẹ nhàng, nhắn nhắc lịch và chăm sóc sau dịch vụ." },
      { moduleKey: "marketing", detail: "Chương trình khách thân thiết, ưu đãi đầu tuần, kế hoạch TikTok / Facebook 30 ngày." },
      { moduleKey: "content", detail: "30 bài: before–after, hậu trường, mẹo chăm sóc, feedback khách, flash sale." },
      { moduleKey: "operations", detail: "Checklist mở cửa – đóng cửa, vệ sinh dụng cụ, quy trình phục vụ chuẩn 7 bước." },
      { moduleKey: "finance", detail: "Chi phí mặt bằng, nhân sự, vật tư; số lượt khách cần mỗi ngày để hoà vốn." },
    ],
    exampleSlug: "nail-house-quan-7",
  },
  "online-shop": {
    audience: "shop bán hàng trên Facebook, Shopee, TikTok Shop, Instagram",
    painPoints: ["Inbox nhiều nhưng chốt ít", "Giảm giá mãi không còn lời", "Đổi trả, hoàn hàng xử lý lộn xộn"],
    inside: [
      { moduleKey: "sales", detail: "Kịch bản inbox chốt đơn theo từng tình huống: hỏi giá, so sánh, 'để em xem lại', xin ship." },
      { moduleKey: "pricing", detail: "Chiến lược giá & combo tối ưu lợi nhuận, quy tắc khuyến mãi không phá giá." },
      { moduleKey: "content", detail: "Lịch đăng 30 ngày: sản phẩm, review, livestream, mini game, hậu trường đóng gói." },
      { moduleKey: "operations", detail: "Quy trình nhận đơn – đóng gói – giao – chăm sóc sau bán, chính sách đổi trả rõ ràng." },
      { moduleKey: "brand", detail: "Định vị shop khác biệt với hàng chợ, giọng nói thương hiệu, bộ màu & font cho ảnh sản phẩm." },
      { moduleKey: "finance", detail: "Giá vốn, chi phí ship / sàn / ads, số đơn cần mỗi ngày để đạt mục tiêu." },
    ],
    exampleSlug: "moc-local-brand",
  },
  agency: {
    audience: "agency marketing, thiết kế, phát triển web, sản xuất nội dung",
    painPoints: ["Pitch nhiều thắng ít", "Mỗi người làm proposal một kiểu", "Khách đòi thêm việc ngoài phạm vi"],
    inside: [
      { moduleKey: "services", detail: "Gói retainer / dự án với phạm vi rõ ràng, SLA và điều khoản phát sinh." },
      { moduleKey: "documents", detail: "Proposal mẫu, hợp đồng dịch vụ, brief khách hàng, báo giá theo giai đoạn." },
      { moduleKey: "sales", detail: "Quy trình discovery – pitch – close cho B2B, câu hỏi khám phá và xử lý 'so với agency lớn'." },
      { moduleKey: "marketing", detail: "Kế hoạch content B2B: case study, LinkedIn, webinar, referral từ khách cũ." },
      { moduleKey: "brand", detail: "Định vị chuyên sâu theo ngách khách hàng, thông điệp chính và bằng chứng năng lực." },
      { moduleKey: "operations", detail: "Quy trình onboarding khách, báo cáo tuần, bàn giao và nghiệm thu." },
    ],
    exampleSlug: "bright-agency",
  },
  fnb: {
    audience: "quán cà phê, trà sữa, quán ăn nhỏ, bếp online, bánh handmade",
    painPoints: ["Không biết bán bao nhiêu ly mới hoà vốn", "Khai trương xong vắng dần", "Mỗi ca làm một kiểu, chất lượng không đều"],
    inside: [
      { moduleKey: "finance", detail: "Tính giá vốn từng món, biên lợi nhuận, chi phí cố định và điểm hoà vốn theo ngày." },
      { moduleKey: "marketing", detail: "Kế hoạch khai trương 30 ngày: tạo chờ đợi – khai trương – duy trì, hợp tác với app giao đồ ăn." },
      { moduleKey: "operations", detail: "Checklist mở ca – đóng ca, vệ sinh, kiểm kho, quy trình phục vụ và xử lý phàn nàn." },
      { moduleKey: "content", detail: "30 bài TikTok / Facebook: món mới, hậu trường pha chế, không gian quán, feedback khách." },
      { moduleKey: "services", detail: "Menu & combo theo khung giờ, gợi ý bán kèm bánh / topping." },
      { moduleKey: "brand", detail: "Định vị quán, câu chuyện thương hiệu, bảng màu & font cho menu và biển hiệu." },
    ],
    exampleSlug: "ca-phe-goc-pho",
  },
  coach: {
    audience: "gia sư, coach, trung tâm nhỏ, khoá học online",
    painPoints: ["Phụ huynh / học viên hỏi giá rồi im", "Chưa có lộ trình rõ ràng để thuyết phục", "Học viên bỏ ngang giữa khoá"],
    inside: [
      { moduleKey: "services", detail: "Gói học phí theo lộ trình (1 kèm 1, nhóm nhỏ, online), cam kết đầu ra rõ ràng." },
      { moduleKey: "sales", detail: "Kịch bản tư vấn phụ huynh / học viên, xử lý 'học phí cao', 'để con thử trước'." },
      { moduleKey: "documents", detail: "Form tiếp nhận học viên, cam kết học tập, hoá đơn học phí, báo cáo tiến độ." },
      { moduleKey: "content", detail: "Kế hoạch content chia sẻ kiến thức: mẹo học, câu chuyện học viên, mini test." },
      { moduleKey: "operations", detail: "Quy trình nhận học viên – kiểm tra đầu vào – học – báo cáo – gia hạn." },
      { moduleKey: "brand", detail: "Định vị phương pháp riêng, giọng nói tận tâm, persona phụ huynh / học viên." },
    ],
  },
  "local-service": {
    audience: "sửa chữa, dọn dẹp, vận chuyển, chăm sóc thú cưng, điện lạnh",
    painPoints: ["Khách hỏi giá qua Zalo rồi biến mất", "Bị so sánh với thợ dạo giá rẻ", "Lịch trùng, quên khách"],
    inside: [
      { moduleKey: "pricing", detail: "Bảng giá minh bạch theo hạng mục, phụ phí rõ ràng, gói bảo trì định kỳ." },
      { moduleKey: "sales", detail: "Kịch bản báo giá qua Zalo / điện thoại trong 1 phút, xử lý 'thợ ngoài rẻ hơn'." },
      { moduleKey: "operations", detail: "Quy trình nhận – xác nhận – làm – nghiệm thu – bảo hành, checklist dụng cụ mỗi ngày." },
      { moduleKey: "marketing", detail: "Marketing địa phương: Google Business Profile, nhóm chung cư, tờ rơi QR, giới thiệu." },
      { moduleKey: "content", detail: "30 bài: trước–sau, mẹo bảo quản, cảnh báo lỗi thường gặp, feedback khách." },
      { moduleKey: "documents", detail: "Phiếu báo giá, biên bản nghiệm thu, phiếu bảo hành, hoá đơn." },
    ],
  },
};

export function getTypeDetail(slug: string): TypeDetail {
  return TYPE_DETAILS[slug] ?? DEFAULT_DETAIL;
}
