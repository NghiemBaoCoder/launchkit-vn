import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument, type LegalSection } from "@/components/site/legal-document";
import { SITE } from "@/lib/constants";

/** ISR: trang public được cache và làm mới mỗi 3600s (admin đổi dữ liệu sẽ revalidate ngay). */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Điều khoản sử dụng",
  description: "Điều khoản sử dụng dịch vụ LaunchKit VN: tài khoản, nội dung tạo tự động, thanh toán, quyền sở hữu trí tuệ, giới hạn trách nhiệm.",
};

const UPDATED_AT = "01/10/2026";

const SECTIONS: LegalSection[] = [
  {
    id: "chap-nhan",
    title: "Chấp nhận điều khoản",
    content: (
      <>
        <p>Bằng việc truy cập hoặc sử dụng website {SITE.name} (sau đây gọi là “Dịch vụ”), bạn xác nhận đã đọc, hiểu và đồng ý bị ràng buộc bởi Điều khoản sử dụng này cùng <Link href="/privacy" className="text-primary hover:underline">Chính sách bảo mật</Link> và <Link href="/refund-policy" className="text-primary hover:underline">Chính sách hoàn tiền</Link>.</p>
        <p>Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng Dịch vụ. Việc tiếp tục sử dụng sau khi điều khoản được cập nhật đồng nghĩa với việc bạn chấp nhận phiên bản mới.</p>
      </>
    ),
  },
  {
    id: "dinh-nghia",
    title: "Định nghĩa",
    content: (
      <ul>
        <li><strong>“LaunchKit”, “chúng tôi”</strong>: đơn vị vận hành website {SITE.name} và các dịch vụ liên quan.</li>
        <li><strong>“Người dùng”, “bạn”</strong>: cá nhân hoặc tổ chức đăng ký tài khoản hoặc sử dụng Dịch vụ.</li>
        <li><strong>“Business Kit”</strong>: bộ nội dung được tạo tự động cho một business, gồm thương hiệu, dịch vụ, bảng giá, kịch bản bán hàng, marketing, nội dung, website kit, tài chính, vận hành và tài liệu.</li>
        <li><strong>“Credits”</strong>: đơn vị dùng để tạo lại nội dung trong Dịch vụ, không có giá trị tiền tệ và không được quy đổi thành tiền.</li>
        <li><strong>“Gói”</strong>: các sản phẩm trả phí (Business Kit, Business Kit Pro, Pro Membership) mở khoá quyền truy cập tính năng.</li>
      </ul>
    ),
  },
  {
    id: "tai-khoan",
    title: "Tài khoản",
    content: (
      <>
        <p>Bạn phải từ đủ 18 tuổi hoặc có sự đồng ý của người giám hộ hợp pháp để đăng ký tài khoản. Bạn cam kết cung cấp thông tin chính xác và cập nhật khi có thay đổi.</p>
        <p>Bạn chịu trách nhiệm bảo mật mật khẩu và mọi hoạt động diễn ra dưới tài khoản của mình. Hãy thông báo ngay cho chúng tôi qua {SITE.supportEmail} nếu phát hiện truy cập trái phép.</p>
        <p>Chúng tôi có quyền tạm khoá hoặc chấm dứt tài khoản vi phạm điều khoản, có dấu hiệu gian lận hoặc gây hại cho hệ thống và người dùng khác.</p>
      </>
    ),
  },
  {
    id: "noi-dung-tu-dong",
    title: "Dịch vụ và nội dung tạo tự động",
    content: (
      <>
        <p>Nội dung trong Business Kit được tạo tự động từ thư viện mẫu và mô hình ngôn ngữ dựa trên câu trả lời của bạn. Nội dung <strong>mang tính tham khảo</strong>, không phải tư vấn pháp lý, tài chính, thuế hay kế toán chuyên nghiệp.</p>
        <p>Bạn có trách nhiệm xem xét, chỉnh sửa và kiểm chứng nội dung trước khi sử dụng với khách hàng, đối tác hoặc công bố. Đặc biệt với các mẫu hợp đồng, hoá đơn và số liệu tài chính, hãy tham khảo chuyên gia khi cần.</p>
        <p>Chúng tôi nỗ lực duy trì Dịch vụ ổn định nhưng không cam kết Dịch vụ không bị gián đoạn hoặc không có lỗi. Các tính năng có thể được thay đổi, bổ sung hoặc ngừng cung cấp với thông báo hợp lý.</p>
      </>
    ),
  },
  {
    id: "thanh-toan",
    title: "Thanh toán và gói dịch vụ",
    content: (
      <>
        <p>Giá các gói được niêm yết tại trang <Link href="/pricing" className="text-primary hover:underline">Bảng giá</Link> bằng đồng Việt Nam (VND) và có thể thay đổi; thay đổi không áp dụng hồi tố cho đơn hàng đã thanh toán.</p>
        <ul>
          <li><strong>Business Kit / Business Kit Pro</strong>: thanh toán một lần, áp dụng cho một business cụ thể, không hết hạn.</li>
          <li><strong>Pro Membership</strong>: gói đăng ký gia hạn hàng tháng cho đến khi bạn huỷ. Việc huỷ có hiệu lực từ kỳ thanh toán tiếp theo; không hoàn tiền phần chưa dùng của kỳ hiện tại trừ trường hợp nêu tại Chính sách hoàn tiền.</li>
          <li><strong>Mã giảm giá</strong>: có điều kiện và thời hạn riêng, mỗi mã chỉ dùng một lần cho mỗi tài khoản trừ khi có quy định khác.</li>
        </ul>
        <p>Trong giai đoạn demo, Dịch vụ sử dụng cổng thanh toán mô phỏng; không có giao dịch tiền thật nào được thực hiện. Khi vận hành chính thức, giao dịch được xử lý bởi đối tác thanh toán được cấp phép tại Việt Nam.</p>
      </>
    ),
  },
  {
    id: "so-huu-tri-tue",
    title: "Quyền sở hữu trí tuệ",
    content: (
      <>
        <p><strong>Nội dung của bạn</strong>: bạn sở hữu câu trả lời, thông tin business và mọi nội dung bạn tải lên. Bạn cấp cho chúng tôi quyền sử dụng các dữ liệu này chỉ nhằm mục đích cung cấp Dịch vụ cho bạn.</p>
        <p><strong>Nội dung tạo ra</strong>: trong phạm vi pháp luật cho phép, bạn được toàn quyền sử dụng nội dung Business Kit được tạo cho business của mình, kể cả mục đích thương mại, mà không cần ghi nguồn.</p>
        <p><strong>Nền tảng</strong>: mã nguồn, giao diện, thư viện mẫu, thương hiệu {SITE.name} và các tài sản liên quan thuộc sở hữu của chúng tôi. Bạn không được sao chép, bán lại, cho thuê hoặc dùng để xây dựng dịch vụ cạnh tranh.</p>
      </>
    ),
  },
  {
    id: "hanh-vi-bi-cam",
    title: "Hành vi bị cấm",
    content: (
      <ul>
        <li>Dùng Dịch vụ cho mục đích bất hợp pháp, lừa đảo hoặc vi phạm quyền của bên thứ ba.</li>
        <li>Tạo nội dung xúc phạm, kích động, phân biệt đối xử hoặc vi phạm thuần phong mỹ tục.</li>
        <li>Can thiệp vào hệ thống: dò quét lỗ hổng, tấn công từ chối dịch vụ, truy cập dữ liệu không thuộc về bạn.</li>
        <li>Dùng công cụ tự động để tạo tài khoản hàng loạt, lạm dụng credits hoặc mã giảm giá.</li>
        <li>Chia sẻ tài khoản trả phí cho nhiều người ngoài phạm vi gói đã mua.</li>
      </ul>
    ),
  },
  {
    id: "gioi-han-trach-nhiem",
    title: "Giới hạn trách nhiệm",
    content: (
      <>
        <p>Dịch vụ được cung cấp “nguyên trạng”. Trong phạm vi tối đa pháp luật cho phép, chúng tôi không chịu trách nhiệm cho các thiệt hại gián tiếp, ngẫu nhiên hoặc hệ quả (mất doanh thu, mất dữ liệu, mất cơ hội kinh doanh) phát sinh từ việc sử dụng hoặc không thể sử dụng Dịch vụ, kể cả khi đã được cảnh báo.</p>
        <p>Tổng trách nhiệm của chúng tôi đối với bạn trong mọi trường hợp không vượt quá số tiền bạn đã thanh toán cho Dịch vụ trong 12 tháng gần nhất.</p>
      </>
    ),
  },
  {
    id: "cham-dut",
    title: "Chấm dứt",
    content: (
      <>
        <p>Bạn có thể xoá tài khoản bất cứ lúc nào trong phần Cài đặt. Dữ liệu được xoá vĩnh viễn sau 7 ngày; hoá đơn và lịch sử giao dịch được lưu theo quy định kế toán.</p>
        <p>Chúng tôi có thể chấm dứt hoặc tạm ngừng quyền truy cập của bạn nếu bạn vi phạm điều khoản. Các điều khoản về sở hữu trí tuệ, giới hạn trách nhiệm và luật áp dụng vẫn có hiệu lực sau khi chấm dứt.</p>
      </>
    ),
  },
  {
    id: "thay-doi",
    title: "Thay đổi điều khoản",
    content: (
      <p>Chúng tôi có thể cập nhật Điều khoản này. Với thay đổi quan trọng, chúng tôi sẽ thông báo qua email hoặc thông báo trong ứng dụng ít nhất 7 ngày trước khi có hiệu lực. Ngày cập nhật gần nhất được ghi ở đầu trang.</p>
    ),
  },
  {
    id: "luat-ap-dung",
    title: "Luật áp dụng và liên hệ",
    content: (
      <>
        <p>Điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Tranh chấp phát sinh sẽ được ưu tiên giải quyết thông qua thương lượng; nếu không thành, sẽ được đưa ra Toà án có thẩm quyền tại TP. Hồ Chí Minh.</p>
        <p>Mọi thắc mắc về Điều khoản, vui lòng liên hệ: {SITE.supportEmail}.</p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="Pháp lý"
      title="Điều khoản sử dụng"
      intro={`Các điều khoản này điều chỉnh việc bạn sử dụng ${SITE.name} — dịch vụ tạo Business Kit cho freelancer, creator và chủ shop nhỏ tại Việt Nam. Vui lòng đọc kỹ trước khi sử dụng.`}
      updatedAt={UPDATED_AT}
      sections={SECTIONS}
      related={[
        { href: "/privacy", label: "Chính sách bảo mật" },
        { href: "/refund-policy", label: "Chính sách hoàn tiền" },
        { href: "/faq", label: "Câu hỏi thường gặp" },
      ]}
    />
  );
}
