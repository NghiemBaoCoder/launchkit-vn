import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber, formatVND } from "@/lib/utils";

/**
 * Hiển thị nội dung jsonb bất kỳ của business_assets một cách dễ đọc:
 * - string → đoạn văn (mã màu hex → swatch)
 * - mảng string → danh sách gạch đầu dòng
 * - mảng object → thẻ (card) với từng dòng khoá/giá trị
 * - object → danh sách định nghĩa, nhãn tiếng Việt cho các khoá đã biết
 */

const LABELS: Record<string, string> = {
  // Thương hiệu
  statement: "Tuyên bố định vị",
  for_whom: "Dành cho",
  what: "Cung cấp",
  unlike: "Khác với",
  because: "Bởi vì",
  category: "Ngành",
  headline: "Tiêu đề",
  subheadline: "Tiêu đề phụ",
  pillars: "Trụ cột giá trị",
  title: "Tiêu đề",
  description: "Mô tả",
  options: "Các phương án",
  selected: "Phương án đã chọn",
  short: "Mô tả ngắn",
  long: "Mô tả đầy đủ",
  elevator: "Giới thiệu nhanh",
  tone: "Giọng điệu",
  do: "Nên",
  dont: "Không nên",
  words: "Từ khoá thường dùng",
  sample_sentences: "Câu mẫu",
  name: "Tên",
  age_range: "Độ tuổi",
  occupation: "Nghề nghiệp",
  goals: "Mục tiêu",
  pains: "Nỗi đau",
  channels: "Kênh",
  quote: "Trích dẫn",
  buying_triggers: "Yếu tố thúc đẩy mua",
  messages: "Thông điệp",
  message: "Thông điệp",
  proof: "Bằng chứng",
  label: "Tên bảng màu",
  primary: "Màu chính",
  secondary: "Màu phụ",
  accent: "Màu nhấn",
  bg: "Màu nền",
  muted: "Màu mờ",
  usage: "Cách sử dụng",
  heading: "Font tiêu đề",
  body: "Font nội dung",
  scale: "Thang chữ",
  notes: "Ghi chú",
  h1: "H1",
  h2: "H2",
  h3: "H3",
  small: "Chữ nhỏ",
  // Phân tích
  summary: "Tóm tắt",
  strengths: "Điểm mạnh",
  opportunities: "Cơ hội",
  risks: "Rủi ro",
  positioning_angle: "Góc định vị",
  recommended_focus: "Trọng tâm đề xuất",
  units_needed_per_month: "Số đơn vị cần mỗi tháng",
  avg_price: "Giá trung bình",
  // Bán hàng
  text: "Nội dung",
  duration: "Thời lượng",
  variants: "Biến thể",
  channel_notes: "Lưu ý theo kênh",
  zalo: "Zalo",
  facebook: "Facebook",
  email: "Email",
  steps: "Các bước",
  phase: "Giai đoạn",
  script: "Lời thoại",
  tips: "Mẹo",
  questions: "Câu hỏi",
  question: "Câu hỏi",
  why: "Vì sao hỏi",
  items: "Danh sách",
  objection: "Khách từ chối",
  response: "Cách phản hồi",
  sequence: "Chuỗi tin nhắn",
  day: "Ngày",
  channel: "Kênh",
  rules: "Nguyên tắc",
  situation: "Tình huống",
  // Marketing
  kpis: "KPI",
  target: "Mục tiêu",
  budget_monthly: "Ngân sách / tháng",
  budget_split: "Phân bổ ngân sách",
  pct: "Tỷ lệ",
  segments: "Phân khúc",
  where: "Tìm thấy ở",
  size: "Tỷ trọng",
  role: "Vai trò",
  tactics: "Chiến thuật",
  budget_pct: "Ngân sách (%)",
  priority: "Ưu tiên",
  phases: "Giai đoạn",
  actions: "Hành động",
  goal: "Mục tiêu",
  mechanics: "Cơ chế",
  offer: "Ưu đãi",
  condition: "Điều kiện",
  when: "Thời điểm",
  format: "Định dạng",
  hook: "Câu mở đầu",
  delivery: "Cách gửi",
  // Bảng giá
  strategy: "Chiến lược",
  anchor: "Giá mỏ neo",
  target_margin: "Biên lợi nhuận mục tiêu",
  units_needed: "Số đơn vị cần bán",
  revenue_target: "Mục tiêu doanh thu",
  psychology: "Tâm lý giá",
  cost_items: "Khoản chi phí",
  amount: "Số tiền",
  hours_per_unit: "Giờ làm / đơn vị",
  hourly_rate_target: "Giá theo giờ mục tiêu",
  // Dịch vụ / gói
  price: "Giá",
  sale_price: "Giá ưu đãi",
  unit: "Đơn vị",
  billing_unit: "Đơn vị tính",
  delivery_time: "Thời gian bàn giao",
  features: "Bao gồm",
  benefits: "Lợi ích",
  target_customer: "Khách hàng mục tiêu",
  upsell: "Bán thêm",
  recommended: "Khuyến nghị",
  tier: "Hạng",
  // Nội dung / website
  caption: "Nội dung bài",
  cta: "Kêu gọi hành động",
  platform: "Nền tảng",
  content_type: "Loại nội dung",
  eyebrow: "Dòng dẫn",
  subtitle: "Phụ đề",
  cta_label: "Nút chính",
  secondary_label: "Nút phụ",
  badge: "Nhãn",
  stats: "Số liệu",
  note: "Ghi chú",
};

const MONEY_KEYS = new Set(["price", "sale_price", "amount", "budget_monthly", "anchor", "revenue_target", "avg_price", "hourly_rate_target", "price_from", "monthly_target", "avg_order_value", "fixed_costs", "revenue", "price_per_unit", "variable_cost_per_unit", "total", "subtotal", "deposit"]);
const RATE_KEYS = new Set(["target_margin", "cogs_rate", "tax_rate", "conversion_rate"]);
const HIDDEN_KEYS = new Set(["id", "key", "enabled", "is_premium"]);
const TITLE_KEYS = ["title", "name", "phase", "question", "objection", "situation", "channel", "label"];
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function humanize(key: string): string {
  const s = key.replace(/[_-]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function labelFor(key: string): string {
  return LABELS[key] ?? humanize(key);
}

function formatNumberByKey(n: number, key?: string): string {
  if (key && MONEY_KEYS.has(key)) return formatVND(n);
  if (key && RATE_KEYS.has(key)) return `${Math.round(n * 100)}%`;
  if (key && (key.endsWith("_pct") || key === "pct")) return `${n}%`;
  return formatNumber(n);
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isPrimitive(v: unknown): v is string | number | boolean {
  return typeof v === "string" || typeof v === "number" || typeof v === "boolean";
}

function isPaletteLike(obj: Record<string, unknown>): boolean {
  return ["primary", "secondary", "accent"].every((k) => typeof obj[k] === "string" && HEX.test(obj[k] as string));
}

export function Swatch({ color, label, size = "sm" }: { color: string; label?: string; size?: "sm" | "lg" }) {
  if (size === "lg") {
    return (
      <div className="flex flex-col gap-2">
        <span className="block h-16 w-full rounded-xl border shadow-xs" style={{ backgroundColor: color }} aria-hidden />
        <div className="min-w-0">
          {label ? <p className="truncate text-xs font-medium">{label}</p> : null}
          <p className="font-mono text-xs uppercase text-muted-foreground">{color}</p>
        </div>
      </div>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 align-middle">
      <span className="inline-block size-4 rounded-full border shadow-xs" style={{ backgroundColor: color }} aria-hidden />
      {label ? <span className="text-sm">{label}</span> : null}
      <span className="font-mono text-xs uppercase text-muted-foreground">{color}</span>
    </span>
  );
}

export function PaletteSwatches({ palette, className }: { palette: Record<string, unknown>; className?: string }) {
  const keys = ["primary", "secondary", "accent", "bg", "text", "muted"].filter((k) => typeof palette[k] === "string" && HEX.test(palette[k] as string));
  const colorLabel: Record<string, string> = { primary: "Màu chính", secondary: "Màu phụ", accent: "Màu nhấn", bg: "Màu nền", text: "Màu chữ", muted: "Màu mờ" };
  return (
    <div className={cn("grid grid-cols-3 gap-3 sm:grid-cols-6", className)}>
      {keys.map((k) => (
        <Swatch key={k} color={palette[k] as string} label={colorLabel[k]} size="lg" />
      ))}
    </div>
  );
}

function PrimitiveValue({ value, keyName }: { value: string | number | boolean; keyName?: string }) {
  if (typeof value === "boolean") return <span className="text-sm">{value ? "Có" : "Không"}</span>;
  if (typeof value === "number") return <span className="text-sm font-medium tabular-nums">{formatNumberByKey(value, keyName)}</span>;
  if (HEX.test(value)) return <Swatch color={value} />;
  if (keyName === "day") return <Badge variant="secondary">Ngày {value}</Badge>;
  return <p className="whitespace-pre-line text-sm leading-relaxed">{value}</p>;
}

function ListValue({ items }: { items: (string | number | boolean)[] }) {
  return (
    <ul className="space-y-1.5 pl-5">
      {items.map((v, i) => (
        <li key={i} className="list-disc text-sm leading-relaxed">
          {typeof v === "string" && HEX.test(v) ? <Swatch color={v} /> : String(v)}
        </li>
      ))}
    </ul>
  );
}

function ObjectCard({ obj, index, depth }: { obj: Record<string, unknown>; index: number; depth: number }) {
  const titleKey = TITLE_KEYS.find((k) => typeof obj[k] === "string" && (obj[k] as string).trim());
  const title = titleKey ? (obj[titleKey] as string) : null;
  const day = typeof obj.day === "number" || typeof obj.day === "string" ? obj.day : null;
  const entries = Object.entries(obj).filter(([k]) => k !== titleKey && k !== "day" && !HIDDEN_KEYS.has(k));
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      {title || day !== null ? (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {day !== null ? <Badge variant="secondary">Ngày {String(day)}</Badge> : <Badge variant="outline">{index + 1}</Badge>}
          {title ? <h4 className="text-sm font-semibold">{title}</h4> : null}
        </div>
      ) : null}
      <Entries entries={entries} depth={depth} compact />
    </div>
  );
}

function Entries({ entries, depth, compact = false }: { entries: [string, unknown][]; depth: number; compact?: boolean }) {
  if (entries.length === 0) return null;
  return (
    <dl className={cn("space-y-3", compact && "space-y-2")}>
      {entries.map(([k, v]) => {
        if (v === null || v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) return null;
        const label = labelFor(k);
        const inline = isPrimitive(v) && !(typeof v === "string" && v.length > 120);
        if (inline) {
          return (
            <div key={k} className={cn("grid gap-1", compact ? "sm:grid-cols-[120px_1fr]" : "sm:grid-cols-[180px_1fr]")}>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:pt-0.5">{label}</dt>
              <dd className="min-w-0">
                <PrimitiveValue value={v as string | number | boolean} keyName={k} />
              </dd>
            </div>
          );
        }
        return (
          <div key={k}>
            <dt className={cn("mb-1.5 font-semibold", depth === 0 ? "text-sm" : "text-xs uppercase tracking-wide text-muted-foreground")}>{label}</dt>
            <dd className="min-w-0">
              <ContentValue value={v} keyName={k} depth={depth + 1} />
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

export function ContentValue({ value, keyName, depth = 0 }: { value: unknown; keyName?: string; depth?: number }) {
  if (value === null || value === undefined || value === "") return <span className="text-sm text-muted-foreground">—</span>;
  if (isPrimitive(value)) return <PrimitiveValue value={value} keyName={keyName} />;
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-sm text-muted-foreground">—</span>;
    if (value.every(isPrimitive)) return <ListValue items={value as (string | number | boolean)[]} />;
    return (
      <div className={cn("grid gap-3", depth <= 1 && "sm:grid-cols-2")}>
        {value.map((v, i) =>
          isPlainObject(v) ? (
            <ObjectCard key={i} obj={v} index={i} depth={depth + 1} />
          ) : (
            <div key={i} className="rounded-xl border bg-muted/20 p-4">
              <ContentValue value={v} depth={depth + 1} />
            </div>
          ),
        )}
      </div>
    );
  }
  if (isPlainObject(value)) {
    if (isPaletteLike(value)) {
      const rest = Object.entries(value).filter(([k, v]) => !HIDDEN_KEYS.has(k) && !(typeof v === "string" && HEX.test(v)));
      return (
        <div className="space-y-4">
          <PaletteSwatches palette={value} />
          <Entries entries={rest} depth={depth} />
        </div>
      );
    }
    const entries = Object.entries(value).filter(([k]) => !HIDDEN_KEYS.has(k));
    return <Entries entries={entries} depth={depth} />;
  }
  return <span className="text-sm">{String(value)}</span>;
}

export function AssetContentView({ content, className }: { content: unknown; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <ContentValue value={content} depth={0} />
    </div>
  );
}
