export type DocType = "quotation" | "proposal" | "service_agreement" | "client_brief" | "invoice" | "intake_form";

export const DOC_TYPES: { type: DocType; label: string; description: string }[] = [
  { type: "quotation", label: "Báo giá", description: "Bảng báo giá có hạng mục, thời hạn hiệu lực, điều khoản thanh toán." },
  { type: "proposal", label: "Đề xuất hợp tác", description: "Proposal 7 phần: bối cảnh, giải pháp, phạm vi, lộ trình, chi phí." },
  { type: "service_agreement", label: "Hợp đồng dịch vụ", description: "Mẫu hợp đồng 9 điều khoản cho dịch vụ nhỏ." },
  { type: "client_brief", label: "Brief khách hàng", description: "Bộ câu hỏi thu thập yêu cầu trước khi làm." },
  { type: "invoice", label: "Hoá đơn", description: "Hoá đơn thanh toán nội bộ có thông tin chuyển khoản." },
  { type: "intake_form", label: "Form tiếp nhận", description: "Form 2 phút để tư vấn đúng gói." },
];
