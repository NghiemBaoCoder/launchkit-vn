import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, type LegalSection } from "@/components/site/legal-document";
import { SITE } from "@/lib/constants";

/** ISR: trang public được cache và làm mới mỗi 3600s (admin đổi dữ liệu sẽ revalidate ngay). */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Chính sách hoàn tiền",
  description: "Hoàn tiền 100% trong 7 ngày cho Business Kit nếu bạn chưa xuất hoặc tải xuống tài liệu. Điều kiện, cách yêu cầu và thời gian xử lý.",
};

const UPDATED_AT = "01/10/2026";

const SECTIONS: LegalSection[] = [
  {
    id: "pham-vi",
    title: "Phạm vi áp dụng",
    content: (
      <p>Chính sách này áp dụng cho các sản phẩm kỹ thuật số bán trên {SITE.name}: Business Kit, Business Kit Pro (thanh toán một lần) và Pro Membership (đăng ký hàng tháng). Bản miễn phí không phát sinh thanh toán nên không thuộc phạm vi hoàn tiền.</p>
    ),
  },
  {
    id: "dieu-kien",
    title: "Điều kiện hoàn tiền 7 ngày",
    content: (
      <>
        <p>Bạn được hoàn <strong>100% số tiền đã thanh toán</strong> cho Business Kit hoặc Business Kit Pro khi đáp ứng đồng thời:</p>
        <ul>
          <li>Yêu cầu được gửi trong vòng <strong>7 ngày</strong> kể từ thời điểm thanh toán thành công.</li>
          <li>Bạn <strong>chưa xuất (export) hoặc tải xuống</strong> bất kỳ tài liệu nào của business đã mở khoá: PDF, CSV, Markdown, TXT, ZIP hoặc HTML website.</li>
          <li>Không có dấu hiệu lạm dụng: tạo nhiều tài khoản để dùng ưu đãi, yêu cầu hoàn tiền lặp lại cho cùng một business.</li>
        </ul>
        <p>Lý do: Business Kit là sản phẩm kỹ thuật số được tạo riêng cho bạn. Việc xuất hoặc tải xuống đồng nghĩa bạn đã nhận trọn vẹn giá trị sản phẩm. Bạn vẫn có thể xem toàn bộ nội dung trong workspace để đánh giá trước khi quyết định xuất.</p>
      </>
    ),
  },
  {
    id: "khong-hoan",
    title: "Trường hợp không hoàn tiền",
    content: (
      <ul>
        <li>Quá 7 ngày kể từ khi thanh toán.</li>
        <li>Đã xuất hoặc tải xuống bất kỳ tài liệu nào (hệ thống ghi nhận tự động ở mục Tải xuống).</li>
        <li>Đã xuất bản Website Kit thành trang public.</li>
        <li>Không hài lòng với nội dung nhưng chưa dùng tính năng tạo lại hoặc chỉnh sửa, và không phản hồi khi bộ phận hỗ trợ đề nghị khắc phục.</li>
        <li>Đơn hàng dùng mã giảm giá 100% (ví dụ mã kiểm thử) — không có số tiền để hoàn.</li>
      </ul>
    ),
  },
  {
    id: "cach-yeu-cau",
    title: "Cách yêu cầu hoàn tiền",
    content: (
      <>
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>Gửi email tới {SITE.supportEmail} hoặc dùng trang <Link href="/contact" className="text-primary hover:underline">Liên hệ</Link>, chọn chủ đề “Thanh toán & hoá đơn”.</li>
          <li>Ghi rõ: email tài khoản, mã đơn hàng (xem tại Dashboard → Giao dịch) và lý do.</li>
          <li>Bộ phận hỗ trợ xác nhận điều kiện và phản hồi trong 2 ngày làm việc.</li>
        </ol>
        <p>Sau khi hoàn tiền, quyền truy cập gói sẽ bị thu hồi; business và nội dung quay về bản xem trước miễn phí (không bị xoá).</p>
      </>
    ),
  },
  {
    id: "thoi-gian",
    title: "Thời gian xử lý",
    content: (
      <p>Tiền được hoàn về phương thức thanh toán ban đầu trong <strong>5–10 ngày làm việc</strong> kể từ khi yêu cầu được chấp thuận, tuỳ ngân hàng hoặc ví điện tử. Chúng tôi không thu phí hoàn tiền; phí (nếu có) do đơn vị thanh toán quy định sẽ được thông báo trước.</p>
    ),
  },
  {
    id: "membership",
    title: "Pro Membership",
    content: (
      <>
        <p>Kỳ đầu tiên của Pro Membership được hoàn tiền theo điều kiện 7 ngày nêu trên. Các kỳ gia hạn tiếp theo không được hoàn tiền; bạn có thể huỷ gia hạn bất cứ lúc nào trong Dashboard → Gói & thanh toán và tiếp tục dùng đến hết kỳ đã trả.</p>
        <p>Nếu bị trừ tiền gia hạn do lỗi hệ thống (ví dụ đã huỷ nhưng vẫn bị tính), chúng tôi hoàn toàn bộ kỳ đó.</p>
      </>
    ),
  },
  {
    id: "demo",
    title: "Lưu ý về thanh toán mô phỏng (bản demo)",
    content: (
      <p>Trong giai đoạn demo, {SITE.name} sử dụng cổng thanh toán mô phỏng (mock). Các đơn hàng và giao dịch chỉ nhằm mục đích trải nghiệm luồng mua hàng; <strong>không có tiền thật được thu</strong> và do đó không phát sinh hoàn tiền thực tế. Chính sách này sẽ áp dụng đầy đủ khi cổng thanh toán chính thức được kích hoạt.</p>
    ),
  },
  {
    id: "lien-he",
    title: "Liên hệ",
    content: <p>Bộ phận hỗ trợ: {SITE.supportEmail} — thứ Hai đến thứ Sáu, 9:00–18:00 (giờ Việt Nam).</p>,
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalDocument
      eyebrow="Pháp lý"
      title="Chính sách hoàn tiền"
      intro="Chúng tôi muốn bạn mua vì thấy hợp, không phải vì bị ép. Nếu Business Kit không phù hợp, bạn có 7 ngày để nhận lại tiền — miễn là chưa xuất tài liệu."
      updatedAt={UPDATED_AT}
      sections={SECTIONS}
      related={[
        { href: "/pricing", label: "Bảng giá" },
        { href: "/terms", label: "Điều khoản sử dụng" },
        { href: "/faq", label: "Câu hỏi thường gặp" },
      ]}
    />
  );
}
