/**
 * Thư viện nội dung tiếng Việt theo loại hình kinh doanh.
 * {product} / {customer} / {name} / {location} sẽ được thay thế khi sinh nội dung.
 */
export interface ServiceArchetype {
  name: string;
  description: string;
  features: string[];
  benefits: string[];
  deliveryTime: string;
  priceMultiplier: number;
  unit: string;
}

export interface TypeProfile {
  noun: string;
  customerNoun: string;
  unit: string;
  basePrice: number;
  painPoints: string[];
  outcomes: string[];
  differentiators: string[];
  serviceArchetypes: ServiceArchetype[];
  objections: { objection: string; response: string }[];
  startupCosts: { name: string; amount: number; note?: string }[];
  monthlyExpenses: { name: string; amount: number; category: string }[];
  contentAngles: string[];
  faq: { q: string; a: string }[];
  proofPoints: string[];
  launchIdeas: string[];
  leadMagnets: string[];
  dailyTasks: string[];
  weeklyTasks: string[];
}

const COMMON_OBJECTIONS = [
  { objection: "Giá hơi cao so với dự tính của mình", response: "Em hiểu. Mình có thể xem lại phạm vi để phù hợp ngân sách — bỏ bớt phần chưa cần ngay, giữ phần tạo kết quả. Với gói {basic}, anh/chị vẫn có {outcome} mà chi phí nhẹ hơn khoảng 30%." },
  { objection: "Để mình suy nghĩ thêm", response: "Dạ hoàn toàn hợp lý ạ. Để tiện cân nhắc, em gửi anh/chị bản tóm tắt 1 trang gồm phạm vi, thời gian và cam kết. Em xin phép nhắn lại vào {day} để xem anh/chị có thắc mắc gì không nhé?" },
  { objection: "Bên khác báo giá rẻ hơn", response: "Có nhiều mức giá vì phạm vi mỗi bên khác nhau. Điểm khác ở bên em là {differentiator}. Nếu anh/chị gửi báo giá bên kia, em so sánh từng mục cho rõ, không ép mua ạ." },
  { objection: "Mình chưa chắc có cần không", response: "Vậy mình bắt đầu bằng {discovery} miễn phí 20 phút. Nếu sau đó anh/chị thấy chưa cần, mình dừng — không mất gì cả." },
  { objection: "Mình tự làm cũng được", response: "Tự làm hoàn toàn được ạ, nhiều khách của em từng làm vậy. Vấn đề là thời gian: trung bình mất {time} và dễ sai ở {pitfall}. Em giúp anh/chị bỏ qua đoạn đó để tập trung vào việc tạo doanh thu." },
  { objection: "Có cam kết kết quả không?", response: "Em cam kết về phạm vi, chất lượng và thời gian bàn giao bằng văn bản. Với kết quả kinh doanh, em cam kết đồng hành chỉnh sửa trong {support} để đạt mục tiêu đã thống nhất." },
];

const COMMON_FAQ = [
  { q: "Mất bao lâu để hoàn thành?", a: "Tuỳ gói, thường từ {time}. Mình sẽ thống nhất mốc thời gian cụ thể trước khi bắt đầu." },
  { q: "Thanh toán như thế nào?", a: "Đặt cọc 50% khi bắt đầu, 50% còn lại khi nghiệm thu. Hỗ trợ chuyển khoản, Momo, ZaloPay." },
  { q: "Có được chỉnh sửa không?", a: "Mỗi gói bao gồm số lần chỉnh sửa rõ ràng. Mình luôn ưu tiên làm đúng từ đầu để hạn chế sửa." },
  { q: "Có hỗ trợ sau khi bàn giao không?", a: "Có. Mỗi gói đều kèm thời gian hỗ trợ sau bàn giao, mình phản hồi trong 24 giờ làm việc." },
];

export const TYPE_PROFILES: Record<string, TypeProfile> = {
  freelancer: {
    noun: "freelancer",
    customerNoun: "khách hàng",
    unit: "dự án",
    basePrice: 5_000_000,
    painPoints: ["không biết định giá sao cho đúng", "khách hay trả giá và so sánh", "thiếu quy trình nên dự án kéo dài", "phụ thuộc vào 1-2 khách lớn", "khó giải thích giá trị mình tạo ra"],
    outcomes: ["dự án bàn giao đúng hạn, đúng kỳ vọng", "khách hiểu rõ mình nhận được gì", "ít chỉnh sửa, ít phát sinh", "kết quả đo được bằng con số"],
    differentiators: ["quy trình rõ ràng từ brief đến bàn giao", "tư vấn thẳng thắn, không bán gói thừa", "phản hồi trong 24h làm việc", "làm việc trực tiếp với người thực hiện, không qua trung gian"],
    serviceArchetypes: [
      { name: "Gói tư vấn & lên kế hoạch", description: "Buổi làm việc 90 phút để làm rõ mục tiêu, phạm vi và lộ trình cho {product}.", features: ["1 buổi tư vấn 90 phút", "Bản kế hoạch & phạm vi công việc", "Ước tính chi phí chi tiết"], benefits: ["Biết chính xác cần làm gì trước khi chi tiền", "Tránh phát sinh giữa chừng"], deliveryTime: "2–3 ngày", priceMultiplier: 0.25, unit: "buổi" },
      { name: "{product} — gói tiêu chuẩn", description: "Thực hiện {product} trọn gói theo quy trình chuẩn, bàn giao đầy đủ file nguồn và hướng dẫn.", features: ["Khảo sát & brief", "Thực hiện theo mốc thời gian", "2 vòng chỉnh sửa", "Bàn giao file nguồn"], benefits: ["{outcome}", "Tiết kiệm thời gian tự mày mò"], deliveryTime: "7–14 ngày", priceMultiplier: 1, unit: "dự án" },
      { name: "{product} — gói nâng cao", description: "Phiên bản mở rộng của {product}: thêm hạng mục, tối ưu kỹ hơn và hỗ trợ sau bàn giao dài hơn.", features: ["Mọi thứ trong gói tiêu chuẩn", "Hạng mục mở rộng theo yêu cầu", "4 vòng chỉnh sửa", "Hỗ trợ 30 ngày sau bàn giao"], benefits: ["Giải pháp hoàn chỉnh, không chắp vá", "An tâm có người đồng hành"], deliveryTime: "14–21 ngày", priceMultiplier: 1.9, unit: "dự án" },
      { name: "Bảo trì & đồng hành hàng tháng", description: "Gói retainer: cập nhật, chỉnh sửa và tư vấn định kỳ mỗi tháng.", features: ["8 giờ làm việc/tháng", "Ưu tiên xử lý trong 24h", "Báo cáo cuối tháng"], benefits: ["Không lo bị bỏ rơi sau dự án", "Chi phí ổn định, dễ dự trù"], deliveryTime: "Theo tháng", priceMultiplier: 0.6, unit: "tháng" },
    ],
    objections: COMMON_OBJECTIONS,
    startupCosts: [
      { name: "Laptop / thiết bị làm việc", amount: 15_000_000, note: "Có thể dùng máy hiện có" },
      { name: "Phần mềm & công cụ (năm đầu)", amount: 4_000_000 },
      { name: "Portfolio / website cá nhân", amount: 2_000_000 },
      { name: "Chi phí pháp lý & đăng ký hộ kinh doanh", amount: 1_500_000 },
      { name: "Ngân sách quảng cáo thử nghiệm", amount: 3_000_000 },
      { name: "Dự phòng 3 tháng", amount: 15_000_000 },
    ],
    monthlyExpenses: [
      { name: "Phần mềm & subscription", amount: 800_000, category: "Công cụ" },
      { name: "Internet & điện thoại", amount: 500_000, category: "Vận hành" },
      { name: "Quảng cáo / marketing", amount: 2_000_000, category: "Marketing" },
      { name: "Coworking / cà phê làm việc", amount: 1_500_000, category: "Vận hành" },
      { name: "Thuế & kế toán", amount: 700_000, category: "Pháp lý" },
      { name: "Học tập & nâng cấp kỹ năng", amount: 1_000_000, category: "Phát triển" },
    ],
    contentAngles: ["Case study dự án gần nhất: trước – sau", "3 sai lầm khách hay mắc khi tự làm {product}", "Quy trình làm việc của mình từ A đến Z", "Bảng giá minh bạch và vì sao mình định giá như vậy", "Một ngày làm việc của {noun}", "Checklist chuẩn bị trước khi thuê {noun}", "Review công cụ mình dùng hàng ngày", "Hỏi đáp: câu hỏi mình nhận nhiều nhất tuần này"],
    faq: COMMON_FAQ,
    proofPoints: ["Đã hoàn thành 40+ dự án cho khách cá nhân & SME", "98% khách quay lại hoặc giới thiệu", "Phản hồi trung bình trong 4 giờ"],
    launchIdeas: ["Ưu đãi 'khách hàng sáng lập': 5 suất đầu giảm 20% đổi lấy testimonial", "Đăng case study chi tiết nhất từng làm", "Tổ chức buổi tư vấn miễn phí 20 phút trong 2 tuần"],
    leadMagnets: ["Checklist chuẩn bị trước khi làm {product}", "Bảng tính ước lượng ngân sách {product}", "Mẫu brief 1 trang"],
    dailyTasks: ["Kiểm tra & phản hồi tin nhắn khách trong 2 giờ", "Cập nhật tiến độ dự án đang chạy", "Đăng 1 nội dung hoặc tương tác 15 phút", "Ghi lại giờ làm việc"],
    weeklyTasks: ["Tổng kết doanh thu & pipeline", "Gửi follow-up cho khách tiềm năng", "Lên lịch nội dung tuần tới", "Rà soát chi phí công cụ"],
  },
  creator: {
    noun: "creator",
    customerNoun: "nhãn hàng",
    unit: "video",
    basePrice: 3_000_000,
    painPoints: ["view nhiều nhưng chưa ra tiền", "không biết báo giá booking", "bị nhãn hàng ép giá", "nội dung lên xuống thất thường"],
    outcomes: ["nội dung đúng tệp, đúng thông điệp nhãn hàng", "số liệu rõ ràng sau chiến dịch", "lịch đăng đều đặn"],
    differentiators: ["hiểu tệp khán giả của mình bằng số liệu", "kịch bản tự viết, sản xuất gọn", "báo cáo kết quả minh bạch sau 7 ngày"],
    serviceArchetypes: [
      { name: "Video review / unboxing", description: "1 video review {product} theo phong cách kênh, kèm caption và hashtag.", features: ["Kịch bản gửi duyệt", "1 video 45–90s", "Đăng trên kênh chính", "Báo cáo sau 7 ngày"], benefits: ["Tiếp cận đúng tệp khán giả", "Nội dung tự nhiên, không quảng cáo lộ liễu"], deliveryTime: "5–7 ngày", priceMultiplier: 1, unit: "video" },
      { name: "Combo 3 video chiến dịch", description: "Chuỗi 3 video kể câu chuyện về {product}: giới thiệu – trải nghiệm – kết quả.", features: ["3 video", "Đăng đa nền tảng", "Story/Reels kèm theo", "Báo cáo tổng hợp"], benefits: ["Tần suất xuất hiện cao hơn", "Chi phí/video tốt hơn"], deliveryTime: "14 ngày", priceMultiplier: 2.6, unit: "gói" },
      { name: "Sản xuất nội dung cho nhãn hàng (usage rights)", description: "Sản xuất video để nhãn hàng dùng trên kênh của họ & chạy ads.", features: ["2 video 30–60s", "Quyền sử dụng 6 tháng", "2 vòng chỉnh sửa"], benefits: ["Nhãn hàng có nội dung chạy ads hiệu quả"], deliveryTime: "7–10 ngày", priceMultiplier: 1.6, unit: "gói" },
      { name: "Livestream bán hàng", description: "1 phiên livestream 60–90 phút giới thiệu {product} kèm mã giảm giá.", features: ["Kịch bản live", "Phiên live 60–90 phút", "Clip cắt highlight"], benefits: ["Chuyển đổi trực tiếp", "Tương tác thật với khán giả"], deliveryTime: "Theo lịch", priceMultiplier: 1.3, unit: "phiên" },
    ],
    objections: COMMON_OBJECTIONS,
    startupCosts: [
      { name: "Điện thoại / máy quay", amount: 12_000_000 },
      { name: "Mic, đèn, tripod", amount: 3_500_000 },
      { name: "Phần mềm dựng & thiết kế", amount: 2_000_000 },
      { name: "Phông nền / góc quay", amount: 2_000_000 },
      { name: "Dự phòng 3 tháng", amount: 10_000_000 },
    ],
    monthlyExpenses: [
      { name: "Phần mềm dựng, nhạc bản quyền", amount: 600_000, category: "Công cụ" },
      { name: "Sản phẩm/đạo cụ quay", amount: 1_500_000, category: "Sản xuất" },
      { name: "Quảng cáo đẩy bài", amount: 1_000_000, category: "Marketing" },
      { name: "Internet & điện thoại", amount: 400_000, category: "Vận hành" },
      { name: "Học tập & workshop", amount: 500_000, category: "Phát triển" },
    ],
    contentAngles: ["Behind the scenes một ngày quay", "Top 3 sản phẩm mình thật sự dùng", "Câu chuyện bắt đầu làm kênh", "Trả lời bình luận gây tranh cãi nhất", "So sánh A/B thẳng thắn", "Mini-series 5 ngày về chủ đề kênh", "Media kit: vì sao mình hợp tác với nhãn hàng", "Lỗi lớn nhất mình mắc khi mới làm nội dung"],
    faq: [
      { q: "Có nhận booking ngoài ngành không?", a: "Mình chỉ nhận sản phẩm phù hợp với khán giả của kênh để giữ uy tín, nên sẽ từ chối nếu không hợp." },
      { q: "Nhãn hàng có được duyệt kịch bản không?", a: "Có, mình gửi kịch bản trước khi quay và nhận 1–2 vòng góp ý." },
      ...COMMON_FAQ.slice(1),
    ],
    proofPoints: ["Trung bình 50.000+ lượt xem/video", "Tỷ lệ tương tác 6–8%", "Đã hợp tác 20+ nhãn hàng"],
    launchIdeas: ["Công bố media kit & mở booking tháng này", "Series 7 ngày 'thử thách' theo chủ đề kênh", "Mini game tặng quà kéo follow"],
    leadMagnets: ["Media kit PDF", "Bảng giá booking & combo", "Checklist nhãn hàng cần chuẩn bị"],
    dailyTasks: ["Trả lời bình luận & tin nhắn 30 phút", "Đăng ít nhất 1 story/short", "Ghi chú ý tưởng mới", "Kiểm tra số liệu video hôm qua"],
    weeklyTasks: ["Quay batch 3–5 video", "Tổng kết số liệu tuần", "Gửi báo cáo cho nhãn hàng đang chạy", "Pitch 3 nhãn hàng mới"],
  },
  salon: {
    noun: "salon",
    customerNoun: "khách",
    unit: "lượt",
    basePrice: 350_000,
    painPoints: ["lịch lúc đông lúc vắng", "khách đến một lần rồi thôi", "nhân viên tư vấn chưa biết upsell", "không có nội dung đăng đều"],
    outcomes: ["khách đặt lịch trước, giảm chờ đợi", "khách quay lại định kỳ", "doanh thu/khách tăng nhờ combo"],
    differentiators: ["tư vấn kỹ trước khi làm, không ép dịch vụ", "sản phẩm rõ nguồn gốc", "bảo hành dịch vụ 7 ngày", "không gian sạch, đặt lịch không chờ"],
    serviceArchetypes: [
      { name: "{product} cơ bản", description: "Dịch vụ {product} tiêu chuẩn với sản phẩm chính hãng.", features: ["Tư vấn kiểu phù hợp", "Thực hiện bởi thợ chính", "Chăm sóc sau dịch vụ"], benefits: ["Kết quả đúng mong đợi", "Giữ được lâu"], deliveryTime: "45–60 phút", priceMultiplier: 1, unit: "lượt" },
      { name: "{product} cao cấp", description: "Phiên bản cao cấp dùng dòng sản phẩm premium và quy trình chuyên sâu.", features: ["Sản phẩm premium", "Thêm bước phục hồi/dưỡng", "Bảo hành 7 ngày"], benefits: ["Hiệu quả rõ rệt hơn", "Trải nghiệm thư giãn"], deliveryTime: "90–120 phút", priceMultiplier: 1.8, unit: "lượt" },
      { name: "Combo chăm sóc định kỳ", description: "Gói 4 lần {product} trong 2 tháng với giá ưu đãi.", features: ["4 lượt dịch vụ", "Ưu tiên đặt lịch", "Tặng 1 lần dưỡng"], benefits: ["Tiết kiệm 20%", "Duy trì kết quả đều"], deliveryTime: "2 tháng", priceMultiplier: 3.2, unit: "gói" },
      { name: "Thẻ thành viên tháng", description: "Thẻ ưu đãi 10% mọi dịch vụ + 1 dịch vụ miễn phí mỗi tháng.", features: ["Giảm 10% mọi dịch vụ", "1 dịch vụ cơ bản miễn phí/tháng", "Ưu tiên khung giờ đẹp"], benefits: ["Khách quen được chăm sóc tốt hơn"], deliveryTime: "Theo tháng", priceMultiplier: 1.2, unit: "tháng" },
    ],
    objections: [
      { objection: "Chỗ khác rẻ hơn", response: "Dạ, giá bên em bao gồm sản phẩm chính hãng và bảo hành 7 ngày. Nếu không ưng, em làm lại miễn phí. Chị thử một lần dịch vụ cơ bản để cảm nhận tay nghề trước ạ." },
      { objection: "Sợ làm xong không hợp", response: "Em tư vấn kiểu dựa trên khuôn mặt và thói quen của chị trước, có hình minh hoạ. Chị ưng mới làm, không ưng không mất phí tư vấn." },
      ...COMMON_OBJECTIONS.slice(1, 3),
    ],
    startupCosts: [
      { name: "Thuê mặt bằng (cọc 2 tháng + tháng đầu)", amount: 36_000_000 },
      { name: "Thiết bị, ghế, gương, dụng cụ", amount: 40_000_000 },
      { name: "Sản phẩm nhập ban đầu", amount: 15_000_000 },
      { name: "Trang trí, biển hiệu", amount: 12_000_000 },
      { name: "Giấy phép & pháp lý", amount: 2_000_000 },
      { name: "Marketing khai trương", amount: 6_000_000 },
      { name: "Dự phòng 3 tháng", amount: 30_000_000 },
    ],
    monthlyExpenses: [
      { name: "Thuê mặt bằng", amount: 12_000_000, category: "Mặt bằng" },
      { name: "Lương nhân viên", amount: 18_000_000, category: "Nhân sự" },
      { name: "Sản phẩm tiêu hao", amount: 6_000_000, category: "Hàng hoá" },
      { name: "Điện nước, internet", amount: 2_500_000, category: "Vận hành" },
      { name: "Marketing", amount: 3_000_000, category: "Marketing" },
      { name: "Phần mềm đặt lịch", amount: 300_000, category: "Công cụ" },
    ],
    contentAngles: ["Before – After khách hôm nay", "Thợ chính chia sẻ 1 mẹo chăm sóc tại nhà", "Tour không gian salon", "Giải thích vì sao sản phẩm chính hãng quan trọng", "Khách quen nói gì về salon", "Lịch trống tuần này – đặt ngay", "Xu hướng tháng này", "Hậu trường một ca làm 2 tiếng rút gọn 30 giây"],
    faq: [
      { q: "Có cần đặt lịch trước không?", a: "Nên đặt trước qua Zalo/Facebook để không phải chờ, nhất là cuối tuần." },
      { q: "Sản phẩm sử dụng là gì?", a: "Salon dùng sản phẩm chính hãng có tem nhãn, chị có thể xem trực tiếp trước khi làm." },
      { q: "Làm xong không ưng thì sao?", a: "Bảo hành 7 ngày: chỉnh sửa miễn phí nếu kết quả không đúng tư vấn." },
      { q: "Có chỗ gửi xe không?", a: "Có chỗ gửi xe máy miễn phí ngay trước cửa." },
    ],
    proofPoints: ["Hơn 500 khách quay lại định kỳ", "Đánh giá 4.9/5 trên Google", "Thợ chính 8 năm kinh nghiệm"],
    launchIdeas: ["Khai trương: giảm 30% tuần đầu cho 50 khách đầu tiên", "Tặng thẻ thành viên cho khách check-in & review", "Hợp tác 2 KOC địa phương trải nghiệm miễn phí"],
    leadMagnets: ["Voucher dùng thử dịch vụ cơ bản 50%", "Cẩm nang chăm sóc tại nhà", "Lịch nhắc chăm sóc định kỳ qua Zalo"],
    dailyTasks: ["Xác nhận lịch hẹn hôm nay qua Zalo", "Vệ sinh dụng cụ & khu vực trước giờ mở", "Chụp 1 before/after xin phép khách", "Nhắn cảm ơn khách sau dịch vụ", "Kiểm kê sản phẩm tiêu hao"],
    weeklyTasks: ["Tổng kết doanh thu & số khách", "Nhắn nhắc lịch cho khách đến kỳ", "Lên lịch nội dung tuần", "Họp nhân viên 15 phút", "Đặt hàng sản phẩm"],
  },
  "online-shop": {
    noun: "shop",
    customerNoun: "khách",
    unit: "sản phẩm",
    basePrice: 250_000,
    painPoints: ["inbox nhiều nhưng chốt ít", "chạy ads tốn mà không ra đơn", "hàng tồn, vốn đọng", "khách so giá với sàn"],
    outcomes: ["tỷ lệ chốt inbox cao hơn", "khách quay lại mua lần 2", "đơn trung bình cao hơn nhờ combo"],
    differentiators: ["hàng có sẵn, gửi trong 24h", "tư vấn size/mẫu tận tình qua video", "đổi trả 7 ngày không cần lý do", "hình thật – hàng thật"],
    serviceArchetypes: [
      { name: "{product}", description: "{product} chính hãng, hình thật tại shop, gửi trong 24h.", features: ["Hàng có sẵn", "Kiểm tra hàng trước khi thanh toán", "Đổi trả 7 ngày"], benefits: ["Yên tâm mua không lo hàng giả", "Nhận nhanh"], deliveryTime: "1–3 ngày", priceMultiplier: 1, unit: "sản phẩm" },
      { name: "Combo {product} tiết kiệm", description: "Mua combo 2–3 món {product} giảm 15% và freeship.", features: ["Giảm 15%", "Freeship toàn quốc", "Tặng quà nhỏ"], benefits: ["Tiết kiệm hơn mua lẻ"], deliveryTime: "1–3 ngày", priceMultiplier: 2.4, unit: "combo" },
      { name: "Gói quà tặng {product}", description: "Đóng gói quà cao cấp kèm thiệp viết tay theo yêu cầu.", features: ["Hộp quà cao cấp", "Thiệp viết tay", "Giao đúng ngày"], benefits: ["Tặng quà không cần nghĩ"], deliveryTime: "2–4 ngày", priceMultiplier: 1.4, unit: "gói" },
      { name: "Khách sỉ / mua số lượng", description: "Giá sỉ cho đơn từ 10 sản phẩm, hỗ trợ hình ảnh bán lại.", features: ["Giá sỉ giảm 25–35%", "Hỗ trợ hình ảnh, nội dung", "Giao hàng tận nơi"], benefits: ["Lãi tốt cho người bán lại"], deliveryTime: "3–5 ngày", priceMultiplier: 7, unit: "lô 10" },
    ],
    objections: [
      { objection: "Trên Shopee rẻ hơn", response: "Dạ, giá sàn thường chưa gồm ship và nhiều shop bán hàng không rõ nguồn. Bên em hình thật – hàng thật, đổi trả 7 ngày, hôm nay freeship nên tổng tiền tương đương mà chị yên tâm hơn ạ." },
      { objection: "Sợ không đúng size/màu", response: "Chị gửi em số đo/ảnh, em tư vấn size và quay video thật cho chị xem màu trước khi gửi. Không vừa đổi size miễn phí ạ." },
      { objection: "Để mình xem thêm", response: "Dạ chị cứ xem ạ. Mẫu này còn 3 cái, em giữ cho chị đến tối nay nhé? Cần gì chị nhắn em tư vấn thêm." },
      ...COMMON_OBJECTIONS.slice(1, 2),
    ],
    startupCosts: [
      { name: "Nhập hàng đợt đầu", amount: 20_000_000 },
      { name: "Chụp ảnh sản phẩm, bao bì", amount: 3_000_000 },
      { name: "Thiết bị đóng gói, kệ hàng", amount: 2_000_000 },
      { name: "Ngân sách quảng cáo tháng đầu", amount: 5_000_000 },
      { name: "Đăng ký hộ kinh doanh", amount: 1_000_000 },
      { name: "Dự phòng", amount: 10_000_000 },
    ],
    monthlyExpenses: [
      { name: "Quảng cáo Facebook/TikTok", amount: 5_000_000, category: "Marketing" },
      { name: "Phí sàn & thanh toán", amount: 1_500_000, category: "Vận hành" },
      { name: "Đóng gói & vận chuyển (phần shop chịu)", amount: 2_000_000, category: "Vận hành" },
      { name: "Phần mềm quản lý đơn", amount: 300_000, category: "Công cụ" },
      { name: "Kho / lưu trữ", amount: 1_500_000, category: "Mặt bằng" },
    ],
    contentAngles: ["Unbox & feedback khách hôm nay", "Phối đồ/cách dùng {product} 3 kiểu", "Hàng về: mẫu mới tuần này", "Phân biệt hàng thật – hàng giả", "Flash sale 2 giờ tối nay", "Hậu trường đóng gói 200 đơn", "Giải đáp 5 câu hỏi khách hay hỏi", "Câu chuyện vì sao mình bán {product}"],
    faq: [
      { q: "Có được kiểm hàng trước khi thanh toán không?", a: "Có, shop hỗ trợ đồng kiểm với mọi đơn COD." },
      { q: "Bao lâu nhận được hàng?", a: "Nội thành 1–2 ngày, tỉnh 2–4 ngày. Shop gửi trong 24h sau khi chốt." },
      { q: "Đổi trả thế nào?", a: "Đổi trả trong 7 ngày nếu lỗi do shop hoặc không đúng mô tả, shop chịu phí ship." },
      { q: "Mua nhiều có giảm không?", a: "Combo từ 2 món giảm 15%, từ 10 món có giá sỉ." },
    ],
    proofPoints: ["10.000+ đơn đã giao", "4.8★ từ 1.200 đánh giá", "Tỷ lệ đổi trả dưới 1%"],
    launchIdeas: ["Mở bán: 100 đơn đầu freeship + quà", "Minigame tag bạn bè nhận voucher", "Livestream khai trương kèm deal giờ vàng"],
    leadMagnets: ["Voucher 30k cho đơn đầu khi nhắn tin", "Bảng size / hướng dẫn chọn {product}", "Nhóm Zalo khách thân thiết: deal sớm"],
    dailyTasks: ["Trả lời inbox trong 15 phút (giờ hành chính)", "Chốt & lên đơn trước 15h để gửi trong ngày", "Đăng 1 bài/story", "Kiểm tra tồn kho & đơn hoàn", "Nhắn xin feedback khách đã nhận hàng"],
    weeklyTasks: ["Tổng kết đơn, doanh thu, tỷ lệ chốt", "Lên kế hoạch khuyến mãi tuần sau", "Quay batch video sản phẩm", "Đối soát vận chuyển & COD", "Nhập hàng theo tồn"],
  },
  agency: {
    noun: "agency",
    customerNoun: "doanh nghiệp",
    unit: "dự án",
    basePrice: 25_000_000,
    painPoints: ["pitch nhiều mà tỷ lệ thắng thấp", "khách muốn kết quả nhanh với ngân sách nhỏ", "phạm vi công việc trôi (scope creep)", "phụ thuộc vào vài khách lớn"],
    outcomes: ["KPI rõ ràng và báo cáo định kỳ", "một đầu mối duy nhất xử lý mọi việc", "chiến lược trước – thực thi sau"],
    differentiators: ["đội ngũ in-house, không thuê ngoài", "báo cáo minh bạch theo KPI đã thống nhất", "quy trình 4 bước: Discovery – Strategy – Execution – Review", "cam kết thời gian phản hồi 1 ngày làm việc"],
    serviceArchetypes: [
      { name: "Gói Discovery & Chiến lược", description: "2 tuần nghiên cứu, đánh giá hiện trạng và xây dựng chiến lược {product} cho doanh nghiệp.", features: ["Workshop 2 buổi với ban lãnh đạo", "Phân tích đối thủ & khách hàng", "Roadmap 6 tháng", "Ước tính ngân sách"], benefits: ["Biết rõ nên đầu tư gì trước", "Tránh chi tiền sai chỗ"], deliveryTime: "2 tuần", priceMultiplier: 0.5, unit: "dự án" },
      { name: "{product} — dự án trọn gói", description: "Thực hiện {product} từ chiến lược đến bàn giao với đội ngũ chuyên trách.", features: ["Quản lý dự án chuyên trách", "Mốc bàn giao hàng tuần", "3 vòng chỉnh sửa", "Đào tạo bàn giao"], benefits: ["{outcome}"], deliveryTime: "4–8 tuần", priceMultiplier: 1, unit: "dự án" },
      { name: "Retainer hàng tháng", description: "Đồng hành thực thi {product} liên tục theo tháng với KPI rõ ràng.", features: ["Đội ngũ cố định", "Báo cáo KPI hàng tuần", "Họp review hàng tháng", "Ưu tiên xử lý 24h"], benefits: ["Kết quả tích luỹ theo thời gian", "Chi phí dự trù được"], deliveryTime: "Theo tháng", priceMultiplier: 0.7, unit: "tháng" },
      { name: "Gói doanh nghiệp (Enterprise)", description: "Giải pháp tuỳ chỉnh đa hạng mục cho doanh nghiệp quy mô lớn.", features: ["Phạm vi tuỳ chỉnh", "Account manager riêng", "SLA cam kết bằng hợp đồng"], benefits: ["Một đối tác cho mọi nhu cầu"], deliveryTime: "Theo thoả thuận", priceMultiplier: 3, unit: "dự án" },
    ],
    objections: [
      { objection: "Ngân sách chúng tôi hạn chế", response: "Chúng tôi có thể chia giai đoạn: bắt đầu với Discovery để xác định ưu tiên, rồi thực thi phần tạo tác động lớn nhất trước. Ngân sách giai đoạn 1 chỉ bằng khoảng 30% tổng dự án." },
      { objection: "Agency lớn có nhiều kinh nghiệm hơn", response: "Đúng là họ có quy mô lớn. Khác biệt của chúng tôi là người pitch cũng là người làm, anh/chị làm việc trực tiếp với đội ngũ cao cấp, không bị chuyển cho junior sau khi ký." },
      ...COMMON_OBJECTIONS.slice(1, 2),
      { objection: "Làm sao đo được hiệu quả?", response: "Trước khi bắt đầu, chúng ta thống nhất 3–5 KPI và dashboard theo dõi. Báo cáo hàng tuần, nếu không đạt mốc giữa kỳ sẽ điều chỉnh miễn phí." },
    ],
    startupCosts: [
      { name: "Văn phòng / coworking (3 tháng)", amount: 30_000_000 },
      { name: "Thiết bị cho đội ngũ", amount: 40_000_000 },
      { name: "Phần mềm & license", amount: 10_000_000 },
      { name: "Thành lập công ty, pháp lý", amount: 5_000_000 },
      { name: "Website, bộ nhận diện", amount: 15_000_000 },
      { name: "Dự phòng lương 3 tháng", amount: 90_000_000 },
    ],
    monthlyExpenses: [
      { name: "Lương đội ngũ", amount: 60_000_000, category: "Nhân sự" },
      { name: "Văn phòng", amount: 10_000_000, category: "Mặt bằng" },
      { name: "Phần mềm & công cụ", amount: 3_000_000, category: "Công cụ" },
      { name: "Marketing & sự kiện", amount: 5_000_000, category: "Marketing" },
      { name: "Kế toán, pháp lý, bảo hiểm", amount: 3_000_000, category: "Pháp lý" },
    ],
    contentAngles: ["Case study: số liệu trước – sau của một khách", "Phân tích chiến dịch nổi bật trong ngành", "Framework 4 bước của chúng tôi", "Những sai lầm doanh nghiệp hay mắc khi {product}", "Gặp gỡ đội ngũ", "Insight thị trường tháng này", "Checklist chọn agency", "Webinar/workshop sắp tới"],
    faq: [
      { q: "Quy trình làm việc thế nào?", a: "4 bước: Discovery – Strategy – Execution – Review, mỗi bước có mốc bàn giao và nghiệm thu rõ ràng." },
      { q: "Có làm việc với doanh nghiệp nhỏ không?", a: "Có, chúng tôi có gói phù hợp cho SME với phạm vi gọn và ngân sách chia giai đoạn." },
      { q: "Hợp đồng và thanh toán?", a: "Hợp đồng theo dự án hoặc retainer tháng. Thanh toán 40/30/30 theo mốc hoặc đầu mỗi tháng." },
      { q: "Ai sẽ trực tiếp làm việc với chúng tôi?", a: "Một account manager cố định và đội ngũ chuyên môn in-house." },
    ],
    proofPoints: ["30+ doanh nghiệp đã đồng hành", "Tăng trưởng trung bình 2.4x KPI chính sau 6 tháng", "Tỷ lệ gia hạn retainer 85%"],
    launchIdeas: ["Công bố 3 case study chi tiết nhất", "Workshop miễn phí cho 20 doanh nghiệp SME", "Chương trình đối tác giới thiệu nhận 10% hoa hồng"],
    leadMagnets: ["Báo cáo xu hướng ngành (PDF)", "Audit miễn phí 30 phút", "Template kế hoạch {product} 90 ngày"],
    dailyTasks: ["Stand-up đội ngũ 15 phút", "Cập nhật tiến độ dự án lên board", "Phản hồi khách hàng trong ngày", "Theo dõi KPI chiến dịch đang chạy"],
    weeklyTasks: ["Gửi báo cáo tuần cho khách", "Review pipeline bán hàng", "Họp retro nội bộ", "Đăng 2 nội dung thought leadership", "Rà soát giờ làm & biên lợi nhuận dự án"],
  },
  fnb: {
    noun: "quán",
    customerNoun: "khách",
    unit: "phần",
    basePrice: 45_000,
    painPoints: ["khách đông giờ cao điểm, vắng giờ còn lại", "giá vốn tăng, không biết tăng giá sao", "chưa có khách quen", "nhân viên làm không đồng đều"],
    outcomes: ["món đồng đều, phục vụ nhanh", "khách quay lại mỗi tuần", "biết rõ món nào lời, món nào lỗ"],
    differentiators: ["nguyên liệu tươi mỗi ngày", "công thức riêng, không mua sẵn", "không gian sạch, wifi mạnh", "phục vụ trong 5 phút"],
    serviceArchetypes: [
      { name: "{product}", description: "{product} đặc trưng của quán, nguyên liệu chọn lọc mỗi ngày.", features: ["Công thức riêng", "Phục vụ trong 5–7 phút", "Có thể tuỳ chỉnh"], benefits: ["Ngon đúng vị, giá hợp lý"], deliveryTime: "5–7 phút", priceMultiplier: 1, unit: "phần" },
      { name: "Combo {product} + đồ uống", description: "Combo tiết kiệm gồm {product} và 1 đồ uống tự chọn.", features: ["Tiết kiệm 15%", "Đổi đồ uống tuỳ thích"], benefits: ["Bữa đủ đầy, giá tốt"], deliveryTime: "7–10 phút", priceMultiplier: 1.5, unit: "combo" },
      { name: "Đặt tiệc / nhóm", description: "Set menu cho nhóm từ 6 người, đặt trước 1 ngày.", features: ["Set menu theo ngân sách", "Trang trí cơ bản", "Ưu tiên bàn"], benefits: ["Tụ họp không cần lo chuẩn bị"], deliveryTime: "Đặt trước 24h", priceMultiplier: 8, unit: "set 6 người" },
      { name: "Thẻ khách quen", description: "Mua 10 tặng 1 và ưu đãi sinh nhật.", features: ["Tích điểm mỗi hoá đơn", "Tặng 1 phần khi đủ 10", "Ưu đãi sinh nhật"], benefits: ["Càng đến càng lợi"], deliveryTime: "Áp dụng ngay", priceMultiplier: 0, unit: "thẻ" },
    ],
    objections: [
      { objection: "Giá hơi cao so với quán bên cạnh", response: "Dạ, phần bên em đầy đặn hơn và dùng nguyên liệu tươi trong ngày. Anh/chị thử combo hôm nay giảm 15% để so sánh ạ." },
      { objection: "Chờ lâu không?", response: "Quán phục vụ trong 5–7 phút, giờ cao điểm anh/chị đặt trước qua Zalo là có ngay khi tới." },
      ...COMMON_OBJECTIONS.slice(1, 2),
    ],
    startupCosts: [
      { name: "Mặt bằng (cọc + tháng đầu)", amount: 45_000_000 },
      { name: "Thiết bị bếp / pha chế", amount: 50_000_000 },
      { name: "Bàn ghế, trang trí, biển hiệu", amount: 35_000_000 },
      { name: "Nguyên liệu & bao bì đợt đầu", amount: 10_000_000 },
      { name: "Giấy phép, VSATTP", amount: 3_000_000 },
      { name: "Marketing khai trương", amount: 8_000_000 },
      { name: "Dự phòng 3 tháng", amount: 40_000_000 },
    ],
    monthlyExpenses: [
      { name: "Mặt bằng", amount: 15_000_000, category: "Mặt bằng" },
      { name: "Nhân viên", amount: 20_000_000, category: "Nhân sự" },
      { name: "Nguyên liệu", amount: 25_000_000, category: "Hàng hoá" },
      { name: "Điện, nước, gas, internet", amount: 4_000_000, category: "Vận hành" },
      { name: "Phí app giao hàng", amount: 5_000_000, category: "Vận hành" },
      { name: "Marketing", amount: 3_000_000, category: "Marketing" },
    ],
    contentAngles: ["Hậu trường chuẩn bị nguyên liệu 5h sáng", "Món bán chạy nhất tuần", "Khách nói gì về quán", "Công thức rút gọn 1 món dễ làm", "Góc check-in đẹp nhất quán", "Deal giờ vàng chiều nay", "Menu mới tháng này", "Một ngày của chủ quán"],
    faq: [
      { q: "Quán mở cửa giờ nào?", a: "7:00 – 22:00 mỗi ngày, kể cả lễ." },
      { q: "Có giao hàng không?", a: "Có, qua GrabFood/ShopeeFood hoặc đặt trực tiếp Zalo trong bán kính 3km." },
      { q: "Có chỗ để xe không?", a: "Có chỗ để xe máy miễn phí, ô tô đỗ ven đường." },
      { q: "Có nhận đặt tiệc không?", a: "Có, nhóm từ 6 người đặt trước 24h để quán chuẩn bị chu đáo." },
    ],
    proofPoints: ["300+ khách mỗi ngày", "4.7★ trên GrabFood", "80% khách quay lại trong tháng"],
    launchIdeas: ["Khai trương: mua 1 tặng 1 trong 3 ngày", "Check-in nhận đồ uống miễn phí", "Mời 3 food reviewer địa phương"],
    leadMagnets: ["Voucher giảm 20% đơn đầu khi follow", "Nhóm Zalo deal giờ vàng", "Thẻ tích điểm"],
    dailyTasks: ["Kiểm tra nguyên liệu & đặt hàng tươi", "Vệ sinh khu bếp/quầy trước & sau ca", "Đăng 1 story món hôm nay", "Kiểm đếm tiền & đối soát app", "Nhắn cảm ơn khách đặt tiệc"],
    weeklyTasks: ["Tính giá vốn & món bán chạy", "Lên lịch nhân viên tuần sau", "Lên 1 chương trình ưu đãi", "Tổng vệ sinh", "Trả lời đánh giá trên app"],
  },
  coach: {
    noun: "giáo viên",
    customerNoun: "học viên",
    unit: "buổi",
    basePrice: 300_000,
    painPoints: ["học viên học vài buổi rồi nghỉ", "khó tư vấn phụ huynh", "chưa có lộ trình rõ ràng", "thu nhập phụ thuộc số giờ dạy"],
    outcomes: ["học viên thấy tiến bộ sau 4 tuần", "lộ trình rõ ràng, đo được", "phụ huynh/học viên tin tưởng gia hạn"],
    differentiators: ["lộ trình cá nhân hoá theo mục tiêu", "báo cáo tiến bộ mỗi 2 tuần", "học thử miễn phí 1 buổi", "lớp nhỏ tối đa 6 người"],
    serviceArchetypes: [
      { name: "Buổi học thử & đánh giá", description: "Đánh giá trình độ và tư vấn lộ trình {product} miễn phí hoặc phí tượng trưng.", features: ["Bài kiểm tra đầu vào", "Buổi học thử 45 phút", "Báo cáo & lộ trình đề xuất"], benefits: ["Biết rõ mình đang ở đâu"], deliveryTime: "1 buổi", priceMultiplier: 0.3, unit: "buổi" },
      { name: "Khoá {product} 1 kèm 1", description: "Học riêng theo lộ trình cá nhân, lịch linh hoạt.", features: ["12 buổi x 60 phút", "Lộ trình cá nhân", "Bài tập & chữa chi tiết", "Báo cáo tiến bộ 2 tuần/lần"], benefits: ["Tiến bộ nhanh nhất", "Lịch theo học viên"], deliveryTime: "6 tuần", priceMultiplier: 12, unit: "khoá" },
      { name: "Lớp nhóm nhỏ {product}", description: "Lớp tối đa 6 người, tương tác nhiều, chi phí hợp lý.", features: ["16 buổi x 90 phút", "Tối đa 6 học viên", "Tài liệu riêng", "Nhóm hỗ trợ"], benefits: ["Học cùng bạn có động lực", "Chi phí/buổi thấp hơn"], deliveryTime: "8 tuần", priceMultiplier: 6, unit: "khoá" },
      { name: "Gói đồng hành hàng tháng", description: "Gói duy trì: 4 buổi/tháng + hỗ trợ qua Zalo.", features: ["4 buổi/tháng", "Hỏi đáp Zalo không giới hạn", "Bài tập hàng tuần"], benefits: ["Giữ phong độ ổn định"], deliveryTime: "Theo tháng", priceMultiplier: 3.6, unit: "tháng" },
    ],
    objections: [
      { objection: "Học phí cao hơn trung tâm", response: "Lớp bên em tối đa 6 người và có lộ trình riêng, nên tính trên tiến bộ thì thực ra tiết kiệm hơn: học viên đạt mục tiêu trong 8 tuần thay vì 6 tháng." },
      { objection: "Sợ con/mình không theo được", response: "Có buổi học thử và bài đánh giá đầu vào miễn phí. Em xếp lớp đúng trình độ, không nhận nếu thấy chưa phù hợp." },
      ...COMMON_OBJECTIONS.slice(1, 2),
      { objection: "Học online có hiệu quả không?", response: "Lớp online của em có tương tác trực tiếp, bài tập chấm chi tiết và ghi hình để xem lại. Nhiều học viên đạt mục tiêu hoàn toàn online." },
    ],
    startupCosts: [
      { name: "Thiết bị dạy (laptop, mic, bảng, webcam)", amount: 15_000_000 },
      { name: "Tài liệu & giáo trình", amount: 3_000_000 },
      { name: "Phần mềm lớp học / quản lý", amount: 2_000_000 },
      { name: "Trang trí góc dạy / thuê phòng", amount: 5_000_000 },
      { name: "Marketing ban đầu", amount: 3_000_000 },
      { name: "Dự phòng", amount: 10_000_000 },
    ],
    monthlyExpenses: [
      { name: "Thuê phòng / nền tảng online", amount: 3_000_000, category: "Mặt bằng" },
      { name: "Tài liệu, in ấn", amount: 500_000, category: "Vận hành" },
      { name: "Phần mềm", amount: 400_000, category: "Công cụ" },
      { name: "Marketing", amount: 2_000_000, category: "Marketing" },
      { name: "Nâng cấp chuyên môn", amount: 1_000_000, category: "Phát triển" },
    ],
    contentAngles: ["Mẹo 60 giây: 1 lỗi học viên hay mắc", "Tiến bộ của học viên sau 4 tuần", "Lộ trình học {product} từ 0", "Giải thích khái niệm khó bằng ví dụ đời thường", "Hỏi đáp phụ huynh/học viên", "Một buổi học diễn ra thế nào", "Tài liệu miễn phí tuần này", "Câu chuyện vì sao mình đi dạy"],
    faq: [
      { q: "Có học thử không?", a: "Có 1 buổi học thử và bài kiểm tra đầu vào miễn phí." },
      { q: "Lịch học linh hoạt không?", a: "1 kèm 1 chọn giờ tự do; lớp nhóm có lịch cố định tối và cuối tuần." },
      { q: "Học online hay offline?", a: "Cả hai. Online qua Zoom có ghi hình để xem lại." },
      { q: "Nghỉ buổi có được bù không?", a: "Báo trước 24h được bù 1 buổi trong khoá." },
    ],
    proofPoints: ["200+ học viên đạt mục tiêu", "92% gia hạn khoá tiếp theo", "Đánh giá 5★ từ phụ huynh"],
    launchIdeas: ["Mở 10 suất học thử miễn phí tháng này", "Thử thách 7 ngày học cùng nhau trên Zalo", "Ưu đãi nhóm bạn đăng ký 2 người giảm 15%"],
    leadMagnets: ["Bài kiểm tra trình độ miễn phí", "Lộ trình học {product} 8 tuần (PDF)", "Bộ tài liệu bắt đầu"],
    dailyTasks: ["Chuẩn bị giáo án buổi hôm nay", "Chấm & phản hồi bài tập trong ngày", "Nhắc lịch học viên qua Zalo", "Đăng 1 mẹo học ngắn"],
    weeklyTasks: ["Gửi báo cáo tiến bộ", "Lên kế hoạch bài tuần sau", "Liên hệ học viên sắp hết khoá để gia hạn", "Quay 2 video nội dung", "Tổng kết doanh thu & số buổi"],
  },
  "local-service": {
    noun: "thợ",
    customerNoun: "khách",
    unit: "lần",
    basePrice: 300_000,
    painPoints: ["khách gọi hỏi giá rồi im", "bị so sánh giá với thợ dạo", "khách không tin tưởng người lạ vào nhà", "lịch trùng, đi lại tốn thời gian"],
    outcomes: ["báo giá rõ ràng trước khi làm", "đúng giờ, làm sạch, bảo hành", "khách gọi lại mỗi khi cần"],
    differentiators: ["báo giá trọn gói, không phát sinh", "đúng giờ hẹn, báo trước 30 phút", "bảo hành dịch vụ 30 ngày", "nhân viên có đồng phục, đeo thẻ"],
    serviceArchetypes: [
      { name: "{product} cơ bản", description: "Dịch vụ {product} tiêu chuẩn tại nhà, báo giá trọn gói trước khi làm.", features: ["Khảo sát & báo giá qua ảnh/video", "Đúng giờ hẹn", "Dọn sạch sau khi làm", "Bảo hành 30 ngày"], benefits: ["Không lo phát sinh", "Yên tâm có bảo hành"], deliveryTime: "Trong ngày", priceMultiplier: 1, unit: "lần" },
      { name: "{product} trọn gói nâng cao", description: "Gói đầy đủ gồm kiểm tra tổng thể và xử lý triệt để.", features: ["Kiểm tra toàn bộ", "Xử lý triệt để", "Vật tư chính hãng", "Bảo hành 90 ngày"], benefits: ["Làm 1 lần, yên tâm lâu dài"], deliveryTime: "1–2 ngày", priceMultiplier: 2.2, unit: "lần" },
      { name: "Gói định kỳ hàng tháng", description: "Đặt lịch định kỳ, ưu đãi 15% và ưu tiên khung giờ.", features: ["Lịch cố định hàng tháng", "Giảm 15%", "Ưu tiên khung giờ", "Nhắc lịch tự động"], benefits: ["Không cần nhớ lịch", "Tiết kiệm hơn"], deliveryTime: "Theo tháng", priceMultiplier: 0.85, unit: "tháng" },
      { name: "Khách doanh nghiệp / toà nhà", description: "Hợp đồng dịch vụ cho văn phòng, chung cư, cửa hàng.", features: ["Hợp đồng theo quý/năm", "Đội thợ cố định", "Báo cáo sau mỗi lần", "Xuất hoá đơn"], benefits: ["Một đầu mối cho mọi sự cố"], deliveryTime: "Theo hợp đồng", priceMultiplier: 10, unit: "hợp đồng" },
    ],
    objections: [
      { objection: "Thợ ngoài rẻ hơn", response: "Dạ, bên em báo giá trọn gói, có bảo hành 30 ngày và nhân viên đeo thẻ. Thợ dạo thường phát sinh vật tư và không bảo hành, tính ra bên em không đắt hơn ạ." },
      { objection: "Sợ người lạ vào nhà", response: "Nhân viên bên em có đồng phục, thẻ tên và gửi thông tin trước khi tới. Anh/chị có thể yêu cầu thợ cụ thể đã quen ạ." },
      { objection: "Báo giá qua điện thoại có chính xác không?", response: "Anh/chị gửi ảnh/video, em báo giá trọn gói và cam kết không phát sinh nếu đúng mô tả. Khác mô tả em báo lại trước khi làm." },
      ...COMMON_OBJECTIONS.slice(1, 2),
    ],
    startupCosts: [
      { name: "Dụng cụ & thiết bị", amount: 20_000_000 },
      { name: "Xe máy / phương tiện", amount: 15_000_000, note: "Có thể dùng xe hiện có" },
      { name: "Đồng phục, thẻ tên, bảng hiệu", amount: 2_000_000 },
      { name: "Vật tư đợt đầu", amount: 5_000_000 },
      { name: "Marketing (Google Maps, Facebook)", amount: 3_000_000 },
      { name: "Dự phòng", amount: 10_000_000 },
    ],
    monthlyExpenses: [
      { name: "Xăng xe, đi lại", amount: 2_000_000, category: "Vận hành" },
      { name: "Vật tư tiêu hao", amount: 3_000_000, category: "Hàng hoá" },
      { name: "Quảng cáo Google/Facebook", amount: 2_500_000, category: "Marketing" },
      { name: "Điện thoại, phần mềm đặt lịch", amount: 500_000, category: "Công cụ" },
      { name: "Bảo dưỡng dụng cụ", amount: 500_000, category: "Vận hành" },
    ],
    contentAngles: ["Before – After ca hôm nay", "Mẹo tự kiểm tra tại nhà trước khi gọi thợ", "Bảng giá minh bạch", "Giải thích lỗi thường gặp", "Quy trình làm việc của đội", "Khách nói gì sau 30 ngày", "Khung giờ trống tuần này", "Sai lầm khiến tốn tiền gấp đôi"],
    faq: [
      { q: "Báo giá thế nào?", a: "Gửi ảnh/video qua Zalo, nhận báo giá trọn gói trong 15 phút, không phát sinh nếu đúng mô tả." },
      { q: "Có làm cuối tuần không?", a: "Có, làm cả thứ 7, chủ nhật. Giờ ngoài 20h phụ thu 20%." },
      { q: "Bảo hành bao lâu?", a: "30 ngày với gói cơ bản, 90 ngày với gói nâng cao." },
      { q: "Có xuất hoá đơn không?", a: "Có xuất hoá đơn cho khách doanh nghiệp." },
    ],
    proofPoints: ["2.000+ ca đã hoàn thành", "4.9★ trên Google Maps", "Đúng giờ 97% ca hẹn"],
    launchIdeas: ["Giảm 20% cho 30 khách đầu trong khu vực", "Đăng ký Google Business & xin 20 đánh giá đầu", "Phát tờ rơi/dán mã QR tại chung cư lân cận"],
    leadMagnets: ["Kiểm tra miễn phí tại nhà", "Bảng giá trọn gói (PDF)", "Nhóm Zalo nhắc bảo dưỡng định kỳ"],
    dailyTasks: ["Xác nhận lịch & báo trước 30 phút", "Kiểm tra dụng cụ, vật tư trước khi đi", "Chụp ảnh trước/sau mỗi ca", "Nhắn cảm ơn & xin đánh giá", "Ghi sổ thu chi"],
    weeklyTasks: ["Tổng kết số ca, doanh thu", "Gọi lại khách chưa chốt", "Đăng 2 nội dung", "Bảo dưỡng dụng cụ", "Lên lịch khách định kỳ tuần sau"],
  },
};

/** Ghi đè theo ngành (chỉ những trường khác biệt). */
export const INDUSTRY_OVERRIDES: Record<string, Partial<Pick<TypeProfile, "basePrice" | "unit" | "painPoints" | "outcomes" | "differentiators" | "proofPoints">>> = {
  "website-development": {
    basePrice: 8_000_000,
    painPoints: ["website cũ, chậm, không ra khách", "không biết nên làm WordPress hay code tay", "thuê làm xong không ai bảo trì", "giá báo mỗi nơi một kiểu"],
    outcomes: ["website tải dưới 2 giây, chuẩn SEO", "khách tự liên hệ qua form mỗi tuần", "quản trị nội dung không cần kỹ thuật"],
    differentiators: ["thiết kế riêng, không dùng template đại trà", "tối ưu tốc độ & SEO on-page từ đầu", "bàn giao kèm video hướng dẫn quản trị", "bảo hành 3 tháng, hỗ trợ 24h"],
    proofPoints: ["40+ website đã bàn giao", "Điểm PageSpeed trung bình 90+", "100% khách nhận đủ source code"],
  },
  "graphic-design": { basePrice: 4_000_000, painPoints: ["logo cũ không chuyên nghiệp", "mỗi bài đăng một kiểu, không nhận diện", "không có file gốc để in ấn"], outcomes: ["bộ nhận diện đồng bộ trên mọi kênh", "file gốc đầy đủ định dạng in & số"] },
  copywriting: { basePrice: 3_000_000, painPoints: ["viết nhiều mà không ai đọc", "nội dung không ra chuyển đổi", "không có giọng thương hiệu nhất quán"], outcomes: ["nội dung có cấu trúc, đúng insight, ra chuyển đổi"] },
  "digital-marketing": { basePrice: 6_000_000, painPoints: ["đốt tiền ads không ra đơn", "không đo được kênh nào hiệu quả"], outcomes: ["chi phí/khách hàng giảm, báo cáo minh bạch"] },
  "video-editing": { basePrice: 1_500_000, unit: "video", painPoints: ["video dựng chậm, không kịp lịch đăng", "chất lượng không đồng đều"], outcomes: ["video đúng deadline, đúng style kênh"] },
  "hair-salon": { basePrice: 400_000 },
  "nail-salon": { basePrice: 250_000 },
  "spa-skincare": { basePrice: 500_000 },
  "massage-wellness": { basePrice: 350_000 },
  "fashion-shop": { basePrice: 280_000 },
  "cosmetics-shop": { basePrice: 320_000 },
  "home-decor-shop": { basePrice: 450_000 },
  "mom-baby-shop": { basePrice: 220_000 },
  "handmade-shop": { basePrice: 180_000 },
  "food-shop": { basePrice: 150_000 },
  "coffee-shop": { basePrice: 40_000 },
  "milk-tea": { basePrice: 35_000 },
  "home-kitchen": { basePrice: 55_000 },
  "restaurant-small": { basePrice: 60_000 },
  "english-tutor": { basePrice: 350_000 },
  "life-career-coach": { basePrice: 800_000 },
  "fitness-coach": { basePrice: 400_000 },
  "music-art-class": { basePrice: 300_000 },
  "home-cleaning": { basePrice: 250_000 },
  "repair-service": { basePrice: 350_000 },
  "pet-care": { basePrice: 200_000 },
  "moving-delivery": { basePrice: 500_000 },
  "marketing-agency": { basePrice: 30_000_000 },
  "web-agency": { basePrice: 40_000_000 },
  "design-studio": { basePrice: 25_000_000 },
  "content-production": { basePrice: 20_000_000 },
};

export const PERSONALITY_VOICE: Record<string, { tone: string; do: string[]; dont: string[]; words: string[] }> = {
  professional: { tone: "chuyên nghiệp, rõ ràng, có số liệu", do: ["Dùng câu ngắn, cấu trúc rõ", "Đưa con số và cam kết cụ thể"], dont: ["Dùng teen code, emoji quá nhiều", "Hứa hẹn mơ hồ"], words: ["minh bạch", "cam kết", "quy trình", "kết quả"] },
  friendly: { tone: "thân thiện, gần gũi, như đang trò chuyện", do: ["Xưng hô mình – bạn / em – anh chị", "Đặt câu hỏi gợi mở"], dont: ["Quá trang trọng, khô khan", "Dùng thuật ngữ khó"], words: ["cùng nhau", "nhẹ nhàng", "yên tâm", "chia sẻ"] },
  premium: { tone: "tinh tế, sang trọng, ít lời nhưng chắc", do: ["Nhấn vào trải nghiệm và chi tiết", "Dùng từ chọn lọc"], dont: ["Giảm giá ồ ạt", "Nói quá nhiều"], words: ["tinh tế", "chọn lọc", "riêng", "đẳng cấp"] },
  young: { tone: "trẻ trung, năng động, bắt trend", do: ["Dùng ngôn ngữ đời thường", "Chơi chữ, meme hợp lý"], dont: ["Quá nghiêm túc", "Lạm dụng trend lỗi thời"], words: ["xịn", "đỉnh", "cháy", "liền tay"] },
  minimal: { tone: "tối giản, đi thẳng vào vấn đề", do: ["Một ý mỗi câu", "Bỏ từ thừa"], dont: ["Dài dòng", "Tính từ hoa mỹ"], words: ["rõ", "gọn", "đủ", "đúng"] },
  creative: { tone: "sáng tạo, bất ngờ, giàu hình ảnh", do: ["Mở đầu bằng góc nhìn lạ", "Kể chuyện"], dont: ["Rập khuôn", "Sáo rỗng"], words: ["ý tưởng", "khác biệt", "câu chuyện", "góc nhìn"] },
  trustworthy: { tone: "tin cậy, ổn định, nói là làm", do: ["Nêu bằng chứng, đánh giá thật", "Cam kết bằng văn bản"], dont: ["Phóng đại", "Thay đổi lời hứa"], words: ["bảo hành", "cam kết", "đúng hẹn", "minh bạch"] },
  caring: { tone: "tận tâm, chu đáo, lắng nghe", do: ["Hỏi thăm trước khi bán", "Nhớ chi tiết nhỏ của khách"], dont: ["Thúc ép", "Bỏ rơi sau bán"], words: ["chăm sóc", "lắng nghe", "đồng hành", "chu đáo"] },
};

export const FONT_PAIRS: Record<string, { heading: string; body: string }> = {
  professional: { heading: "Be Vietnam Pro", body: "Inter" },
  friendly: { heading: "Nunito", body: "Be Vietnam Pro" },
  premium: { heading: "Playfair Display", body: "Be Vietnam Pro" },
  young: { heading: "Montserrat", body: "Be Vietnam Pro" },
  minimal: { heading: "Inter", body: "Inter" },
  creative: { heading: "Space Grotesk", body: "Be Vietnam Pro" },
  trustworthy: { heading: "Roboto Slab", body: "Roboto" },
  caring: { heading: "Quicksand", body: "Be Vietnam Pro" },
};

export function getProfile(businessTypeSlug: string, industrySlug: string): TypeProfile {
  const base = TYPE_PROFILES[businessTypeSlug] ?? TYPE_PROFILES.freelancer;
  const override = INDUSTRY_OVERRIDES[industrySlug] ?? {};
  return { ...base, ...override };
}
