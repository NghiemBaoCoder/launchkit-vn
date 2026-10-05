import { Star } from "lucide-react";
import { cn, initials } from "@/lib/utils";

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  /** slug loại hình để lọc theo trang landing */
  type?: string;
  result?: string;
}

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200",
  "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
  "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-200",
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Nguyễn Minh Khoa",
    role: "Freelancer thiết kế web, Đà Nẵng",
    type: "freelancer",
    quote: "Trước đây mình báo giá theo cảm tính, khách trả giá là mình xuống. Có bảng giá 3 gói và kịch bản xử lý từ chối, tháng vừa rồi mình chốt 4 dự án với giá cao hơn 30%.",
    result: "+30% giá trung bình / dự án",
  },
  {
    name: "Trần Thu Hà",
    role: "Chủ tiệm nail, Quận 7",
    type: "salon",
    quote: "Mình không biết viết content. LaunchKit cho mình 30 bài đăng sẵn, chỉ việc thay ảnh thật của tiệm. Khách inbox hỏi combo đều hơn hẳn, tuần nào cũng kín lịch cuối tuần.",
    result: "Kín lịch cuối tuần sau 3 tuần",
  },
  {
    name: "Lê Hoàng Phúc",
    role: "Beauty creator, 48k followers",
    type: "creator",
    quote: "Media kit và bảng giá booking làm mình tự tin pitch nhãn hàng. Kịch bản gửi brand viết sẵn, mình chỉnh lại chút là gửi được ngay. Đã ký 2 hợp đồng trong tháng đầu.",
    result: "2 hợp đồng brand trong 30 ngày",
  },
  {
    name: "Phạm Ngọc Mai",
    role: "Chủ shop thời trang local brand",
    type: "online-shop",
    quote: "Kịch bản inbox chốt đơn hay thật sự — không nghe giống bot. Quy trình xử lý đổi trả giúp mình bớt cãi nhau với khách. Tất cả nằm trong một chỗ, in ra dán ở kho luôn.",
    result: "Tỷ lệ chốt inbox tăng từ 18% lên 31%",
  },
  {
    name: "Đỗ Quang Huy",
    role: "Đồng sáng lập Bright Agency",
    type: "agency",
    quote: "Proposal mẫu và gói retainer giúp team mình chuẩn hoá cách chào giá. Trước mỗi người một kiểu, giờ gửi khách 1 bản thống nhất, chuyên nghiệp hơn hẳn.",
    result: "Rút thời gian làm proposal từ 2 ngày xuống 2 giờ",
  },
  {
    name: "Võ Thị Lan Anh",
    role: "Chủ quán cà phê, Bình Thạnh",
    type: "fnb",
    quote: "Lần đầu mở quán nên mình rất lo. Checklist khai trương và máy tính giá vốn giúp mình biết bán bao nhiêu ly một ngày mới hoà vốn. Thực tế sau tháng 2 đã vượt mốc đó.",
    result: "Hoà vốn tháng thứ 2",
  },
  {
    name: "Bùi Anh Tuấn",
    role: "Gia sư tiếng Anh online",
    type: "coach",
    quote: "Kịch bản tư vấn phụ huynh viết đúng chỗ mình hay lúng túng nhất: lúc nói giá. Giờ mình có lộ trình, gói học phí rõ ràng, phụ huynh thấy yên tâm hơn.",
    result: "Lớp 1-kèm-3 đầy sau 2 tuần",
  },
  {
    name: "Hoàng Văn Nam",
    role: "Dịch vụ vệ sinh máy lạnh tại nhà",
    type: "local-service",
    quote: "Bảng giá minh bạch theo hạng mục giúp mình báo giá qua Zalo trong 1 phút. Khách không còn hỏi 'sao đắt vậy' vì thấy rõ từng mục làm gì.",
    result: "Báo giá nhanh hơn, ít kỳ kèo hơn",
  },
];

export function pickTestimonials(type?: string, limit = 3): Testimonial[] {
  if (!type) return TESTIMONIALS.slice(0, limit);
  const own = TESTIMONIALS.filter((t) => t.type === type);
  const others = TESTIMONIALS.filter((t) => t.type !== type);
  return [...own, ...others].slice(0, limit);
}

export function TestimonialCard({ item, index = 0, className }: { item: Testimonial; index?: number; className?: string }) {
  return (
    <figure className={cn("flex h-full flex-col rounded-2xl border bg-card p-6 shadow-xs", className)}>
      <div className="flex items-center gap-1 text-amber-500" aria-label="5 trên 5 sao">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="size-4 fill-current" aria-hidden />
        ))}
      </div>
      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">“{item.quote}”</blockquote>
      {item.result ? <p className="mt-4 inline-flex w-fit rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">{item.result}</p> : null}
      <figcaption className="mt-5 flex items-center gap-3 border-t pt-4">
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold", AVATAR_COLORS[index % AVATAR_COLORS.length])} aria-hidden>
          {initials(item.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{item.name}</p>
          <p className="truncate text-xs text-muted-foreground">{item.role}</p>
        </div>
      </figcaption>
    </figure>
  );
}

/** Ghi chú minh bạch: các câu chuyện là kịch bản sử dụng điển hình (bản demo). */
export function TestimonialNote({ className }: { className?: string }) {
  return <p className={cn("text-center text-xs text-muted-foreground", className)}>Câu chuyện minh hoạ dựa trên các kịch bản sử dụng điển hình của sản phẩm. Kết quả thực tế tuỳ thuộc vào ngành và cách bạn triển khai.</p>;
}

export function TestimonialGrid({ items, className }: { items: Testimonial[]; className?: string }) {
  return (
    <div className={className}>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((t, i) => (
          <TestimonialCard key={t.name} item={t} index={i} />
        ))}
      </div>
      <TestimonialNote className="mt-6" />
    </div>
  );
}
