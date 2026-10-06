import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Download, FileDown, Link2, LoaderCircle, PenLine, RefreshCw, Share2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GENERATION_STAGES } from "@/lib/ai/types";
import { Reveal } from "@/components/motion/reveal";
import { Section, SectionHeading, CtaBanner, PageIntro } from "@/components/site/section";
import { KIT_MODULES, EXPORT_FORMATS } from "@/components/site/kit-modules";
import { cn } from "@/lib/utils";

/** ISR: trang public được cache và làm mới mỗi 3600s (admin đổi dữ liệu sẽ revalidate ngay). */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Cách hoạt động",
  description: "4 bước từ câu hỏi đến Business Kit hoàn chỉnh: trả lời 11 câu hỏi, hệ thống tạo 11 phần nội dung, chỉnh sửa trong workspace, xuất PDF/CSV/Markdown và chia sẻ.",
};

/* ---------- Minh hoạ bằng UI thuần ---------- */

function IllustrationFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative", className)} aria-hidden>
      <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/15 via-transparent to-fuchsia-400/15 blur-xl" />
      <div className="relative overflow-hidden rounded-2xl border bg-card shadow-xl">{children}</div>
    </div>
  );
}

function StepOneIllustration() {
  return (
    <IllustrationFrame>
      <div className="border-b px-5 py-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Bước 5 / 11 · Khách hàng</span>
          <span>≈ 2 phút còn lại</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[45%] rounded-full bg-primary" />
        </div>
      </div>
      <div className="space-y-4 p-5">
        <p className="text-base font-semibold">Khách hàng mục tiêu của bạn là ai?</p>
        <div className="rounded-lg border bg-background p-3 text-sm text-foreground/80">Chủ shop online và doanh nghiệp nhỏ cần website chuyên nghiệp để chạy quảng cáo…</div>
        <div>
          <p className="mb-2 text-xs text-muted-foreground">Phân khúc</p>
          <div className="flex flex-wrap gap-2">
            {["Khách cá nhân", "Doanh nghiệp nhỏ / Chủ shop", "Cả hai"].map((t, i) => (
              <span key={t} className={cn("rounded-full border px-3 py-1 text-xs", i === 1 ? "border-primary bg-primary/10 font-medium text-primary" : "bg-background")}>{t}</span>
            ))}
          </div>
        </div>
        <div className="flex justify-between pt-1">
          <span className="rounded-md border px-3 py-1.5 text-xs">Quay lại</span>
          <span className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">Tiếp tục →</span>
        </div>
      </div>
    </IllustrationFrame>
  );
}

function StepTwoIllustration() {
  const done = 6;
  return (
    <IllustrationFrame>
      <div className="flex items-center justify-between border-b px-5 py-3">
        <p className="text-sm font-semibold">Đang tạo Business Kit…</p>
        <span className="text-xs text-muted-foreground">{done}/11</span>
      </div>
      <ul className="divide-y">
        {GENERATION_STAGES.slice(0, 9).map((s, i) => (
          <li key={s.key} className="flex items-center gap-3 px-5 py-2.5 text-sm">
            {i < done ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-success text-success-foreground"><Check className="size-3" /></span>
            ) : i === done ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary"><LoaderCircle className="size-3 animate-spin" /></span>
            ) : (
              <span className="size-5 rounded-full border-2 border-dashed border-muted-foreground/30" />
            )}
            <span className={cn(i > done && "text-muted-foreground")}>{s.label}</span>
            {i === done ? <span className="ml-auto text-xs text-primary">đang viết…</span> : null}
          </li>
        ))}
      </ul>
    </IllustrationFrame>
  );
}

function StepThreeIllustration() {
  return (
    <IllustrationFrame>
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="size-4 text-primary" />
          <span className="font-semibold">Tagline</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border px-2 py-0.5">v3</span>
          <RefreshCw className="size-3.5" />
          <span>Tạo lại</span>
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div className="rounded-lg border border-primary/40 bg-background p-3 ring-2 ring-primary/15">
          <p className="text-sm">
            Website lên nhanh, <mark className="rounded bg-primary/15 px-0.5 text-foreground">bán được ngay</mark>.<span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-foreground align-middle" />
          </p>
        </div>
        <div className="space-y-1.5">
          {["Làm đúng ngay từ đầu", "Bắt đầu đúng, lớn bền"].map((t) => (
            <div key={t} className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              {t}
              <PenLine className="size-3.5" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Đã lưu 2 giây trước</span>
          <span className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground">Lưu</span>
        </div>
      </div>
    </IllustrationFrame>
  );
}

function StepFourIllustration() {
  return (
    <IllustrationFrame>
      <div className="grid gap-3 p-5 sm:grid-cols-2">
        {[
          { name: "Bao-gia-Minh-Web-Studio.pdf", meta: "PDF · 2 trang", color: "bg-rose-500" },
          { name: "Lich-noi-dung-30-ngay.csv", meta: "CSV · 30 dòng", color: "bg-emerald-500" },
          { name: "Business-Kit.md", meta: "Markdown · 48 KB", color: "bg-sky-500" },
          { name: "Tron-bo.zip", meta: "ZIP · 11 file", color: "bg-amber-500" },
        ].map((f) => (
          <div key={f.name} className="flex items-center gap-3 rounded-lg border bg-background p-3">
            <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-md text-white", f.color)}><FileDown className="size-4" /></span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">{f.name}</p>
              <p className="text-[11px] text-muted-foreground">{f.meta}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t bg-muted/30 px-5 py-3">
        <p className="mb-1.5 text-xs text-muted-foreground">Liên kết chia sẻ</p>
        <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs">
          <Link2 className="size-3.5 text-muted-foreground" />
          <span className="flex-1 truncate">launchkit.vn/share/k8s2…9fQ</span>
          <span className="rounded-md bg-primary px-2 py-1 text-[11px] font-medium text-primary-foreground">Sao chép</span>
        </div>
      </div>
    </IllustrationFrame>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Trả lời 11 câu hỏi về business của bạn",
    time: "≈ 5 phút",
    description: "Loại hình, ngành, tên, khách hàng mục tiêu, sản phẩm/dịch vụ, tính cách thương hiệu, bảng màu, kênh bán, mục tiêu doanh thu và mục tiêu chính. Mỗi câu có gợi ý và ví dụ; câu trả lời được lưu tự động nên bạn có thể dừng rồi quay lại.",
    bullets: ["Không cần tài khoản để bắt đầu", "Lưu nháp tự động trên trình duyệt", "Có thể sửa câu trả lời bất cứ lúc nào"],
    Illustration: StepOneIllustration,
  },
  {
    n: "02",
    title: "Hệ thống tạo Business Kit theo 11 giai đoạn",
    time: "≈ 3 phút",
    description: "Từ câu trả lời, hệ thống phân tích business rồi lần lượt tạo 10 phần nội dung. Mỗi giai đoạn chạy độc lập và hiển thị tiến độ; nếu một giai đoạn lỗi, bạn chỉ cần tạo lại giai đoạn đó.",
    bullets: ["Nội dung nhất quán: tên, giá, giọng nói xuyên suốt", "Giá được tính từ ngành, kinh nghiệm và mục tiêu doanh thu", "Theo dõi tiến độ theo thời gian thực"],
    Illustration: StepTwoIllustration,
  },
  {
    n: "03",
    title: "Chỉnh sửa trong workspace",
    time: "Tuỳ bạn",
    description: "Mọi phần đều sửa được: đổi tagline, thêm bớt dịch vụ, chỉnh giá, kéo thả section website, đổi bảng màu. Mỗi lần lưu tạo một phiên bản để khôi phục khi cần. Không ưng phần nào thì tạo lại riêng phần đó.",
    bullets: ["Lịch sử phiên bản cho từng tài sản", "Tạo lại từng phần bằng credits", "Máy tính tài chính cập nhật theo bảng giá"],
    Illustration: StepThreeIllustration,
  },
  {
    n: "04",
    title: "Xuất, chia sẻ và xuất bản",
    time: "1 phút",
    description: "Tải PDF báo giá gửi khách, CSV lịch nội dung để lên lịch đăng, Markdown cho Notion. Tạo link chia sẻ cho cộng sự chỉ với những phần bạn chọn, hoặc xuất bản Website Kit thành trang public.",
    bullets: ["PDF · CSV · Markdown · TXT · ZIP trọn bộ", "Link chia sẻ có thời hạn, chọn phần hiển thị", "Website public tại launchkit.vn/site/ten-ban"],
    Illustration: StepFourIllustration,
  },
];

const EDITABLE = [
  "Tên, tagline, định vị, giọng nói thương hiệu",
  "Danh sách dịch vụ: tên, mô tả, giá, hạng mục",
  "3 gói giá và tính năng từng gói",
  "Từng kịch bản bán hàng & câu trả lời từ chối",
  "Kế hoạch marketing từng ngày (kéo thả, đánh dấu xong)",
  "30 bài nội dung: hook, caption, CTA, trạng thái",
  "12 section website: bật/tắt, sắp xếp, sửa nội dung, đổi theme",
  "Số liệu tài chính: chi phí, giá, tỷ lệ chuyển đổi",
  "Checklist vận hành: thêm / bỏ / hoàn thành",
  "Tài liệu: điền thông tin khách, điều khoản, số tiền",
];

export default function HowItWorksPage() {
  return (
    <>
      <PageIntro eyebrow="Cách hoạt động" title="Từ 11 câu hỏi đến Business Kit hoàn chỉnh" description="Không cần kinh nghiệm marketing hay thiết kế. Bạn biết mình bán gì cho ai — LaunchKit biến điều đó thành thương hiệu, bảng giá, kịch bản và kế hoạch cụ thể." />

      <Section>
        <div className="container-x space-y-20 lg:space-y-28">
          {STEPS.map((s, i) => (
            <div key={s.n} className={cn("grid items-center gap-10 lg:grid-cols-2 lg:gap-16", i % 2 === 1 && "lg:[&>*:first-child]:order-2")}>
              <div className="max-w-xl">
                <div className="flex items-center gap-3">
                  <span className="text-5xl font-black text-primary/20">{s.n}</span>
                  <Badge variant="secondary">{s.time}</Badge>
                </div>
                <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{s.title}</h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">{s.description}</p>
                <ul className="mt-5 space-y-2">
                  {s.bullets.map((b) => (
                    <li key={b} className="flex gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mx-auto w-full max-w-md lg:max-w-none">
                <s.Illustration />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section className="border-y bg-muted/30" id="stages">
        <div className="container-x">
          <Reveal>
            <SectionHeading eyebrow="11 giai đoạn tạo nội dung" title="Mỗi giai đoạn, một phần của kit" description="Thứ tự được thiết kế để phần sau kế thừa phần trước: bảng giá dùng dịch vụ, kịch bản bán hàng dùng định vị, website dùng tất cả." />
          </Reveal>
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {GENERATION_STAGES.map((s, i) => {
              const mod = KIT_MODULES.find((m) => m.key === s.key);
              const Icon = mod?.icon ?? Sparkles;
              return (
                <li key={s.key} className="flex gap-4 rounded-2xl border bg-card p-5 shadow-xs">
                  <div className="flex flex-col items-center gap-2">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{s.label}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </Section>

      <Section id="editable">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div>
            <Reveal>
              <SectionHeading align="left" eyebrow="Chỉnh sửa được gì" title="Mọi thứ. Thật đấy." description="Nội dung tạo tự động là điểm bắt đầu, không phải điểm kết thúc. Bạn luôn là người quyết định cuối cùng." />
            </Reveal>
            <ul className="mt-8 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
              {EDITABLE.map((e) => (
                <li key={e} className="flex gap-2 rounded-xl border bg-card px-4 py-3 text-sm">
                  <PenLine className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden /> {e}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Reveal>
              <SectionHeading align="left" eyebrow="Định dạng xuất" title="Mang kit đi bất cứ đâu" description="Xuất từng phần hoặc trọn bộ. File được tạo trong vài giây và lưu ở mục Tải xuống." />
            </Reveal>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {EXPORT_FORMATS.map((f) => (
                <div key={f.key} className="flex gap-3 rounded-xl border bg-card p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent font-mono text-xs font-bold uppercase text-accent-foreground">{f.key}</span>
                  <div>
                    <p className="font-semibold">{f.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{f.description}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-3 rounded-xl border border-dashed bg-muted/30 p-4 sm:col-span-2">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Share2 className="size-5" aria-hidden /></span>
                <div>
                  <p className="font-semibold">Link chia sẻ & website public</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Không cần xuất file: gửi link cho cộng sự, hoặc xuất bản Website Kit thành trang web thật.</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href="/examples">
                  <Download /> Xem ví dụ kit đã tạo
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/pricing">
                  Gói nào xuất được gì <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section className="pt-0">
        <div className="container-x">
          <CtaBanner title="Thử ngay, mất 10 phút" description="Bản xem trước miễn phí, không cần thẻ. Mở khoá toàn bộ khi bạn thấy hợp." secondaryHref="/examples" secondaryLabel="Xem ví dụ trước" />
        </div>
      </Section>
    </>
  );
}
