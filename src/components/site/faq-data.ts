export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqGroup {
  key: string;
  title: string;
  description: string;
  items: FaqItem[];
}

export const FAQ_GROUPS: FaqGroup[] = [
  {
    key: "product",
    title: "Sản phẩm",
    description: "Business Kit là gì và có gì bên trong",
    items: [
      {
        q: "Business Kit là gì?",
        a: "Business Kit là bộ tài liệu khởi nghiệp hoàn chỉnh được tạo riêng cho business của bạn, gồm 10 phần: thương hiệu, dịch vụ, bảng giá, kịch bản bán hàng, kế hoạch marketing 30 ngày, 30 nội dung đa nền tảng, website kit, tài chính, vận hành và 6 mẫu tài liệu. Bạn trả lời khoảng 11 câu hỏi, hệ thống tạo toàn bộ trong vài phút.",
      },
      {
        q: "Nội dung có thực sự cá nhân hoá hay chỉ là mẫu chung?",
        a: "Mọi nội dung được tạo từ câu trả lời của bạn: tên business, loại hình, ngành, khách hàng mục tiêu, sản phẩm, tính cách thương hiệu, bảng màu, kênh bán, mục tiêu doanh thu. Hai business cùng ngành nhưng khác câu trả lời sẽ nhận nội dung khác nhau về định vị, giá, giọng nói và kế hoạch.",
      },
      {
        q: "Tôi có thể chỉnh sửa nội dung sau khi tạo không?",
        a: "Có. Mọi phần đều chỉnh sửa được ngay trong workspace: sửa text, đổi giá, thêm bớt dịch vụ, kéo thả section website, đổi màu. Mỗi lần sửa được lưu lịch sử phiên bản để bạn khôi phục khi cần.",
      },
      {
        q: "LaunchKit phù hợp với loại hình kinh doanh nào?",
        a: "Hiện hỗ trợ 8 loại hình với 38 ngành: Freelancer, Creator, Salon & Spa, Shop online, Agency, F&B nhỏ, Coach & Giáo viên, Dịch vụ tại nhà. Nếu ngành của bạn chưa có, hãy chọn ngành gần nhất và mô tả thêm ở bước thông tin — nội dung vẫn bám theo mô tả của bạn.",
      },
      {
        q: "Bản miễn phí có gì?",
        a: "Bản miễn phí cho 1 business với bản xem trước: thương hiệu & dịch vụ cơ bản, bảng giá cơ bản, 5/30 nội dung, 7/30 ngày marketing, 2 kịch bản xử lý từ chối, 1 mẫu tài liệu và 3 credits tạo nội dung. Đủ để bạn thấy chất lượng trước khi quyết định mua.",
      },
    ],
  },
  {
    key: "payment",
    title: "Thanh toán",
    description: "Giá, mã giảm giá và hoàn tiền",
    items: [
      {
        q: "Giá bao nhiêu và trả một lần hay hàng tháng?",
        a: "Business Kit và Business Kit Pro là thanh toán một lần cho một business, dùng vĩnh viễn. Pro Membership là gói đăng ký hàng tháng cho người làm nhiều dự án: không giới hạn business, 50 credits mỗi tháng và template cao cấp. Xem chi tiết tại trang Bảng giá.",
      },
      {
        q: "Thanh toán bằng cách nào?",
        a: "Bản demo hiện dùng cổng thanh toán mô phỏng (mock): bạn bấm thanh toán, hệ thống xử lý ngay và mở khoá kit, không trừ tiền thật. Khi ra mắt chính thức, LaunchKit hỗ trợ chuyển khoản ngân hàng (VietQR), ví MoMo/ZaloPay và thẻ quốc tế.",
      },
      {
        q: "Có mã giảm giá không?",
        a: "Có. Nhập mã ở bước thanh toán. Trong bản demo bạn có thể dùng mã DEMO50 để giảm 50% đơn đầu tiên. Mã giảm giá chỉ dùng một lần cho mỗi tài khoản.",
      },
      {
        q: "Chính sách hoàn tiền như thế nào?",
        a: "Hoàn tiền 100% trong 7 ngày kể từ khi thanh toán nếu bạn chưa xuất (export) hoặc tải xuống bất kỳ tài liệu nào của kit. Xem đầy đủ tại trang Chính sách hoàn tiền.",
      },
    ],
  },
  {
    key: "account",
    title: "Tài khoản",
    description: "Đăng ký, bảo mật và dữ liệu",
    items: [
      {
        q: "Tôi có cần tài khoản để tạo kit không?",
        a: "Bạn có thể bắt đầu trả lời câu hỏi mà không cần đăng nhập; câu trả lời được lưu tạm trên trình duyệt. Khi tạo kit, bạn cần đăng ký (email hoặc Google) để lưu business và quay lại chỉnh sửa về sau.",
      },
      {
        q: "Dữ liệu của tôi có được bảo mật không?",
        a: "Dữ liệu business được lưu trên Supabase với chính sách phân quyền ở cấp dòng (RLS): chỉ bạn (và admin hỗ trợ khi bạn yêu cầu) đọc được. Chúng tôi không bán hoặc chia sẻ dữ liệu cho bên thứ ba. Xem Chính sách bảo mật.",
      },
      {
        q: "Tôi có thể chia sẻ kit cho đối tác hoặc cộng sự không?",
        a: "Có. Trong workspace, bạn tạo liên kết chia sẻ công khai, chọn phần muốn chia sẻ (ví dụ chỉ thương hiệu và bảng giá) và đặt thời hạn. Người nhận xem được mà không cần tài khoản.",
      },
      {
        q: "Làm sao xoá tài khoản?",
        a: "Vào Cài đặt → Tài khoản → Xoá tài khoản. Toàn bộ business, nội dung, file xuất sẽ bị xoá vĩnh viễn sau 7 ngày (thời gian để bạn đổi ý). Hoá đơn được giữ theo quy định kế toán.",
      },
    ],
  },
  {
    key: "technical",
    title: "Kỹ thuật",
    description: "AI, xuất file, website",
    items: [
      {
        q: "Nội dung được tạo bằng gì? Có dùng AI không?",
        a: "Hệ thống kết hợp thư viện mẫu do chuyên gia Việt Nam biên soạn theo từng ngành với mô hình ngôn ngữ (AI) để cá nhân hoá. Bản demo chạy ở chế độ mock (thư viện mẫu) để bạn trải nghiệm nhanh; bản chính thức dùng AI để nội dung sát hơn với mô tả của bạn.",
      },
      {
        q: "Tôi xuất được những định dạng nào?",
        a: "PDF (báo giá, hợp đồng, brand book), CSV (lịch nội dung, kế hoạch marketing), Markdown và TXT (toàn bộ văn bản). Gói Pro có thêm ZIP trọn bộ để tải tất cả một lần.",
      },
      {
        q: "Website Kit có phải là website thật không?",
        a: "Có. Website Kit tạo landing page 12 section với nội dung viết sẵn, bạn chỉnh trong studio kéo thả rồi bấm Xuất bản để có trang public tại địa chỉ launchkit.vn/site/ten-cua-ban. Bạn cũng có thể xuất HTML để tự host.",
      },
      {
        q: "Credits là gì và dùng để làm gì?",
        a: "Credits dùng để tạo lại một phần nội dung (ví dụ tạo lại 30 bài content hoặc một tài liệu). Bản miễn phí có 3 credits, Business Kit tặng 10, Pro tặng 20, Pro Membership có 50 mỗi tháng và tạo lại không giới hạn.",
      },
    ],
  },
];

/** 4 câu hỏi nổi bật cho trang chủ. */
export const HOME_FAQ: FaqItem[] = [FAQ_GROUPS[0].items[0], FAQ_GROUPS[0].items[1], FAQ_GROUPS[1].items[0], FAQ_GROUPS[1].items[3]];

export const PAYMENT_FAQ: FaqItem[] = [
  ...FAQ_GROUPS[1].items,
  {
    q: "Tôi có thể nâng cấp từ Business Kit lên Business Kit Pro không?",
    a: "Có. Khi mua Pro cho cùng business, bạn chỉ trả phần chênh lệch; các entitlement cũ được giữ nguyên và bổ sung Website Kit, tạo lại nội dung, xuất bản cao cấp.",
  },
  {
    q: "Có xuất hoá đơn VAT không?",
    a: "Có. Sau khi thanh toán thành công, bạn vào Dashboard → Giao dịch để tải hoá đơn điện tử. Nếu cần hoá đơn công ty, điền thông tin xuất hoá đơn trước khi thanh toán.",
  },
];
