import type { AssetPayload, GenerationContext } from "../types";
import { makeGen, upperFirst } from "./helpers";

export function genSales(ctx: GenerationContext): { assets: AssetPayload[] } {
  const g = makeGen(ctx, "sales");
  const { profile, rng } = g;
  const p = g.product.toLowerCase();
  const customer = g.fill("{customer}");
  const diff = profile.differentiators[0];
  const pain = profile.painPoints[0];
  const outcome = profile.outcomes[0];
  const pronoun = ctx.answers.customerSegment === "smb" ? "anh/chị" : "bạn";
  const me = ctx.answers.customerSegment === "smb" ? "em" : "mình";

  const objections = rng.shuffle(profile.objections).slice(0, 6).map((o) => ({ objection: o.objection, response: g.fill(o.response) }));

  return {
    assets: [
      {
        key: "elevator_pitch",
        title: "Elevator pitch",
        content: {
          text: `${g.name} giúp ${customer} ${outcome} bằng ${p}. Khác với ${profile.painPoints[2] ?? pain}, ${me} ${diff}. Nếu ${pronoun} đang ${pain}, ${me} có thể cho ${pronoun} xem cách ${me} làm trong 15 phút.`,
          duration: "30 giây",
          variants: [
            `Mình là ${g.name}, chuyên ${p} cho ${customer}. Một câu thôi: ${outcome} — và ${diff}.`,
            `Nếu ${pronoun} từng ${pain}, ${me} hiểu. ${g.name} làm ${p} theo cách khác: ${diff}, ${profile.differentiators[1] ?? outcome}.`,
          ],
        },
      },
      {
        key: "short_message",
        title: "Tin nhắn bán hàng ngắn",
        content: {
          text: `Chào ${pronoun}, ${me} là ${g.name} — chuyên ${p} cho ${customer}. ${upperFirst(diff)}, ${profile.differentiators[1] ?? outcome}. ${pronoun === "bạn" ? "Bạn" : "Anh/chị"} đang cần ${p} cho việc gì ạ? ${me === "em" ? "Em" : "Mình"} tư vấn nhanh 15 phút, không mất phí.`,
          variants: [
            `Hi ${pronoun}! ${g.name} đang mở ${rng.int(3, 5)} suất ${p} tháng này với ưu đãi cho khách mới. ${upperFirst(outcome)} — nhắn "${upperFirst(p)}" để ${me} gửi bảng giá nhé.`,
            `${upperFirst(pronoun)} ơi, ${me} thấy ${pronoun} quan tâm ${p}. ${me === "em" ? "Em" : "Mình"} gửi 2 ví dụ gần nhất ${me} làm để ${pronoun} tham khảo được không?`,
          ],
          channel_notes: { zalo: "Ngắn, có emoji nhẹ, kết thúc bằng câu hỏi", facebook: "Thêm 1 hình case study", email: "Có tiêu đề rõ, 3 đoạn ngắn" },
        },
      },
      {
        key: "long_message",
        title: "Tin nhắn bán hàng dài",
        content: {
          text: [
            `Chào ${pronoun}, cảm ơn ${pronoun} đã quan tâm đến ${p} của ${g.name}.`,
            `${me === "em" ? "Em" : "Mình"} làm việc chủ yếu với ${customer}. Vấn đề ${me} gặp nhiều nhất là ${pain} — và thường do ${profile.painPoints[1] ?? "thiếu quy trình"}.`,
            `Cách ${g.name} làm: (1) ${diff}; (2) ${profile.differentiators[1] ?? outcome}; (3) ${profile.differentiators[2] ?? "bàn giao kèm hướng dẫn"}. Kết quả ${pronoun} nhận được là ${outcome}.`,
            `Hiện ${me} có 3 gói: Cơ bản – Tiêu chuẩn – Cao cấp, ${pronoun} chọn theo nhu cầu, không bị ép lên gói cao. ${profile.proofPoints[0]}.`,
            `Nếu ${pronoun} thấy hợp, ${me} đề xuất một buổi trao đổi 15–20 phút để hiểu rõ mục tiêu, sau đó gửi báo giá chi tiết trong ngày. ${upperFirst(pronoun)} rảnh khung giờ nào tuần này ạ?`,
          ].join("\n\n"),
        },
      },
      {
        key: "consultation_script",
        title: "Kịch bản tư vấn",
        content: {
          duration: "20–30 phút",
          steps: [
            { phase: "Mở đầu (2 phút)", script: `Chào ${pronoun}, cảm ơn ${pronoun} dành thời gian. Hôm nay ${me} muốn hiểu rõ ${pronoun} đang cần gì về ${p}, rồi ${me} sẽ nói thẳng là ${me} giúp được đến đâu. Không sao nếu cuối buổi mình thấy chưa hợp.`, tips: "Tạo không khí thoải mái, hạ phòng thủ." },
            { phase: "Khám phá (8 phút)", script: `${upperFirst(pronoun)} kể ${me} nghe tình hình hiện tại được không? Điều gì khiến ${pronoun} tìm ${p} lúc này? Nếu làm xong, ${pronoun} mong kết quả cụ thể là gì?`, tips: "Hỏi mở, lắng nghe 70%, ghi chú từ khoá khách dùng." },
            { phase: "Xác nhận vấn đề (3 phút)", script: `Để ${me} tóm lại: ${pronoun} đang ${pain}, muốn ${outcome} trong khoảng [thời gian]. Đúng không ạ?`, tips: "Dùng chính từ của khách." },
            { phase: "Đề xuất (7 phút)", script: `Với tình hình này ${me} đề xuất gói [Tiêu chuẩn]. Lý do: [3 lý do gắn với vấn đề]. ${upperFirst(diff)} nên ${pronoun} không lo [rủi ro khách sợ].`, tips: "Chỉ đề xuất 1 gói chính + 1 gói thay thế." },
            { phase: "Xử lý băn khoăn (5 phút)", script: `${upperFirst(pronoun)} còn băn khoăn điều gì không? Về giá, thời gian hay cách làm việc?`, tips: "Dùng bộ xử lý từ chối bên dưới." },
            { phase: "Chốt & bước tiếp theo (3 phút)", script: `Nếu ${pronoun} ok, bước tiếp theo là ${me} gửi báo giá + lịch trình hôm nay, ${pronoun} xác nhận và mình bắt đầu từ [ngày]. ${upperFirst(pronoun)} muốn bắt đầu sớm hay cần thêm thời gian?`, tips: "Luôn chốt bằng một hành động cụ thể có ngày giờ." },
          ],
        },
      },
      {
        key: "discovery_questions",
        title: "Câu hỏi khám phá",
        content: {
          questions: [
            { question: `Điều gì khiến ${pronoun} tìm ${p} ngay lúc này?`, why: "Hiểu tính cấp bách và động lực mua." },
            { question: "Nếu mọi thứ diễn ra tốt, 3 tháng nữa kết quả trông như thế nào?", why: "Định nghĩa thành công bằng lời của khách." },
            { question: `${upperFirst(pronoun)} đã thử cách nào rồi? Vì sao chưa hiệu quả?`, why: "Tránh lặp lại sai lầm và biết đối thủ." },
            { question: "Ai là người quyết định cuối cùng và ai sẽ làm việc với mình hàng ngày?", why: "Xác định người ra quyết định." },
            { question: "Ngân sách dự kiến của mình nằm trong khoảng nào?", why: "Đề xuất gói phù hợp, tránh lãng phí thời gian hai bên." },
            { question: `Thời hạn ${pronoun} cần có kết quả là khi nào?`, why: "Xếp lịch và báo giá đúng mức độ ưu tiên." },
            { question: "Điều gì khiến mình lo lắng nhất khi thuê ngoài?", why: "Lộ ra rào cản cần xử lý trước khi chốt." },
          ],
        },
      },
      { key: "objections", title: "Xử lý từ chối", content: { items: objections } },
      {
        key: "follow_up",
        title: "Chuỗi follow-up",
        content: {
          sequence: [
            { day: 0, channel: "Zalo/Email", message: `Cảm ơn ${pronoun} đã trao đổi hôm nay. Như đã hứa, ${me} gửi báo giá & lịch trình đính kèm. Có gì chưa rõ ${pronoun} cứ hỏi ${me} nhé.` },
            { day: 2, channel: "Zalo", message: `${upperFirst(pronoun)} ơi, ${pronoun} đã xem qua báo giá chưa ạ? Nếu cần ${me} điều chỉnh phạm vi cho hợp ngân sách, ${me} làm được.` },
            { day: 5, channel: "Zalo", message: `${me === "em" ? "Em" : "Mình"} gửi ${pronoun} thêm 1 ví dụ gần giống trường hợp của ${pronoun}: [link case study]. Kết quả là ${outcome}.` },
            { day: 9, channel: "Gọi điện", message: `Gọi 3 phút: hỏi thăm, xác nhận còn nhu cầu không, đề xuất lịch bắt đầu cụ thể.` },
            { day: 14, channel: "Zalo", message: `${upperFirst(pronoun)} ơi, ${me} đóng lịch tháng này vào [ngày]. Nếu ${pronoun} muốn giữ suất, ${me} giữ đến [ngày]. Không thì ${me} xin phép nhắn lại vào tháng sau nhé.` },
            { day: 30, channel: "Email/Zalo", message: `Chia sẻ 1 nội dung hữu ích (không bán hàng) + hỏi thăm tiến độ của ${pronoun}.` },
          ],
          rules: ["Mỗi lần follow-up phải mang thêm giá trị (ví dụ, tài liệu, gợi ý)", "Tối đa 5 lần trong 30 ngày", "Luôn cho khách lối thoát lịch sự"],
        },
      },
      {
        key: "closing",
        title: "Câu chốt",
        content: {
          messages: [
            { situation: "Khách đã hài lòng nhưng còn chần chừ", message: `Vậy mình chốt gói Tiêu chuẩn và bắt đầu ${rng.pick(["thứ Hai", "thứ Tư", "đầu tuần sau"])} nhé? ${me === "em" ? "Em" : "Mình"} gửi hợp đồng ngay bây giờ.` },
            { situation: "Khách băn khoăn giá", message: `Nếu ngân sách là vấn đề, mình bắt đầu bằng gói Cơ bản trước, sau 2 tuần thấy ổn thì nâng lên — phần đã trả được trừ vào gói mới.` },
            { situation: "Khách muốn 'suy nghĩ thêm'", message: `Dạ, ${pronoun} cứ cân nhắc. Để ${me} giữ suất đến [ngày], sau đó ${me} mở cho khách khác. ${upperFirst(pronoun)} thấy ok không ạ?` },
            { situation: "Khách so sánh với bên khác", message: `${upperFirst(pronoun)} so sánh đúng là nên. Chỉ cần so 3 thứ: phạm vi, cam kết, và ai trực tiếp làm. Nếu bên ${me} không hơn ở 2/3 điểm, ${pronoun} chọn bên kia ${me} hoàn toàn ủng hộ.` },
            { situation: "Chốt mềm (soft close)", message: `${upperFirst(pronoun)} muốn ${me} gửi hợp đồng bản mềm trước để xem điều khoản không? Không ràng buộc gì đâu ạ.` },
          ],
        },
      },
    ],
  };
}
