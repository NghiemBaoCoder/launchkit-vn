import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, type LegalSection } from "@/components/site/legal-document";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Chính sách bảo mật",
  description: "Cách LaunchKit VN thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân và dữ liệu business của bạn.",
};

const UPDATED_AT = "01/10/2026";

const SECTIONS: LegalSection[] = [
  {
    id: "pham-vi",
    title: "Phạm vi áp dụng",
    content: (
      <p>Chính sách này mô tả cách {SITE.name} (“chúng tôi”) thu thập, sử dụng, chia sẻ và bảo vệ thông tin khi bạn truy cập website, đăng ký tài khoản, tạo Business Kit hoặc liên hệ với chúng tôi. Chính sách áp dụng cho mọi người dùng, kể cả khách chưa đăng nhập.</p>
    ),
  },
  {
    id: "du-lieu-thu-thap",
    title: "Dữ liệu chúng tôi thu thập",
    content: (
      <>
        <p><strong>Thông tin bạn cung cấp</strong></p>
        <ul>
          <li>Thông tin tài khoản: họ tên, email, mật khẩu (được băm), ảnh đại diện nếu đăng nhập bằng Google.</li>
          <li>Thông tin business: tên, loại hình, ngành, địa điểm, mô tả, khách hàng mục tiêu, sản phẩm, mục tiêu doanh thu và các câu trả lời onboarding khác.</li>
          <li>Nội dung bạn chỉnh sửa, tải lên (logo) và tin nhắn gửi qua trang Liên hệ.</li>
          <li>Thông tin xuất hoá đơn nếu bạn yêu cầu.</li>
        </ul>
        <p><strong>Thông tin thu thập tự động</strong></p>
        <ul>
          <li>Dữ liệu kỹ thuật: địa chỉ IP, loại trình duyệt, thiết bị, trang giới thiệu (referrer).</li>
          <li>Sự kiện sử dụng: trang đã xem, bước onboarding đã hoàn thành, tính năng đã dùng — để cải thiện sản phẩm.</li>
          <li>Mã giới thiệu (ref) và nguồn truy cập (utm) để ghi nhận chương trình affiliate.</li>
        </ul>
      </>
    ),
  },
  {
    id: "muc-dich",
    title: "Mục đích sử dụng",
    content: (
      <ul>
        <li>Cung cấp Dịch vụ: tạo và lưu Business Kit, đồng bộ nội dung giữa các thiết bị, xuất file, chia sẻ.</li>
        <li>Xử lý thanh toán, cấp quyền truy cập gói, xuất hoá đơn và hỗ trợ hoàn tiền.</li>
        <li>Gửi thông báo liên quan đến tài khoản, giao dịch và thay đổi dịch vụ.</li>
        <li>Hỗ trợ khách hàng và phản hồi yêu cầu liên hệ.</li>
        <li>Phân tích tổng hợp (ẩn danh) để cải thiện chất lượng nội dung và trải nghiệm.</li>
        <li>Phát hiện, ngăn chặn gian lận và lạm dụng.</li>
      </ul>
    ),
  },
  {
    id: "cookie",
    title: "Cookie và công cụ phân tích",
    content: (
      <>
        <p>Chúng tôi dùng cookie cần thiết để duy trì phiên đăng nhập và cookie chức năng để ghi nhớ tuỳ chọn (ví dụ giao diện sáng/tối, nháp onboarding). Các cookie này không dùng để theo dõi bạn trên website khác.</p>
        <p>Sự kiện sử dụng được gửi tới hệ thống phân tích nội bộ của {SITE.name} kèm một mã ẩn danh lưu trên trình duyệt. Chúng tôi không dùng mạng quảng cáo bên thứ ba để theo dõi người dùng.</p>
      </>
    ),
  },
  {
    id: "luu-tru-bao-mat",
    title: "Lưu trữ và bảo mật",
    content: (
      <>
        <p>Dữ liệu được lưu trên hạ tầng Supabase (PostgreSQL và Storage) với mã hoá khi truyền (TLS) và khi lưu trữ. Mọi bảng dữ liệu áp dụng chính sách bảo mật cấp dòng (Row Level Security) để đảm bảo chỉ chủ tài khoản truy cập được dữ liệu của mình.</p>
        <p>Nhân sự của chúng tôi chỉ truy cập dữ liệu khi cần hỗ trợ theo yêu cầu của bạn hoặc để xử lý sự cố; mọi thao tác admin đều được ghi nhật ký kiểm toán.</p>
        <p>Dữ liệu được lưu trong suốt thời gian tài khoản hoạt động. Sau khi bạn xoá tài khoản, dữ liệu bị xoá vĩnh viễn trong 7 ngày, trừ hồ sơ giao dịch phải lưu theo quy định pháp luật.</p>
      </>
    ),
  },
  {
    id: "chia-se",
    title: "Chia sẻ với bên thứ ba",
    content: (
      <>
        <p>Chúng tôi <strong>không bán</strong> dữ liệu cá nhân. Dữ liệu chỉ được chia sẻ trong các trường hợp:</p>
        <ul>
          <li>Nhà cung cấp hạ tầng và dịch vụ cần thiết để vận hành (lưu trữ, gửi email, thanh toán, mô hình AI) — theo hợp đồng xử lý dữ liệu và chỉ trong phạm vi cần thiết.</li>
          <li>Khi bạn chủ động chia sẻ: tạo liên kết chia sẻ Business Kit hoặc xuất bản Website Kit; nội dung trong phạm vi bạn chọn sẽ công khai với người có liên kết.</li>
          <li>Theo yêu cầu hợp pháp của cơ quan nhà nước có thẩm quyền.</li>
        </ul>
        <p>Khi dùng nhà cung cấp AI, chúng tôi chỉ gửi nội dung cần thiết để tạo kit (câu trả lời onboarding) và không gửi thông tin đăng nhập hay thanh toán.</p>
      </>
    ),
  },
  {
    id: "quyen-cua-ban",
    title: "Quyền của bạn",
    content: (
      <>
        <ul>
          <li><strong>Truy cập & chỉnh sửa</strong>: xem và cập nhật thông tin trong phần Cài đặt.</li>
          <li><strong>Xuất dữ liệu</strong>: tải toàn bộ Business Kit ở định dạng PDF, CSV, Markdown.</li>
          <li><strong>Xoá</strong>: xoá từng business hoặc toàn bộ tài khoản.</li>
          <li><strong>Rút đồng ý</strong>: huỷ nhận email marketing bằng liên kết trong email; thông báo giao dịch vẫn được gửi.</li>
          <li><strong>Khiếu nại</strong>: liên hệ {SITE.supportEmail}; chúng tôi phản hồi trong 7 ngày làm việc.</li>
        </ul>
      </>
    ),
  },
  {
    id: "tre-em",
    title: "Trẻ em",
    content: <p>Dịch vụ không dành cho người dưới 16 tuổi. Nếu bạn cho rằng chúng tôi đã thu thập dữ liệu của trẻ em mà không có sự đồng ý của người giám hộ, hãy liên hệ để chúng tôi xoá ngay.</p>,
  },
  {
    id: "thay-doi",
    title: "Thay đổi chính sách",
    content: <p>Chúng tôi có thể cập nhật Chính sách này khi Dịch vụ thay đổi hoặc theo yêu cầu pháp luật. Thay đổi quan trọng sẽ được thông báo qua email hoặc trong ứng dụng trước khi có hiệu lực.</p>,
  },
  {
    id: "lien-he",
    title: "Liên hệ",
    content: (
      <p>
        Mọi câu hỏi về quyền riêng tư, vui lòng gửi tới {SITE.supportEmail} hoặc qua trang <Link href="/contact" className="text-primary hover:underline">Liên hệ</Link> với chủ đề “Bảo mật dữ liệu”.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Pháp lý"
      title="Chính sách bảo mật"
      intro="Chúng tôi chỉ thu thập những gì cần để tạo Business Kit cho bạn, lưu trữ an toàn và không bao giờ bán dữ liệu của bạn."
      updatedAt={UPDATED_AT}
      sections={SECTIONS}
      related={[
        { href: "/terms", label: "Điều khoản sử dụng" },
        { href: "/refund-policy", label: "Chính sách hoàn tiền" },
      ]}
    />
  );
}
