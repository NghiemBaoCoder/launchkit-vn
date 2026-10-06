"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2, Plus, Rocket, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn, formatVND } from "@/lib/utils";
import { BRAND_PERSONALITIES, COLOR_PALETTES, CUSTOMER_SEGMENTS, DEFAULT_DRAFT, EXPERIENCE_LEVELS, ONBOARDING_STEPS, PRIMARY_GOALS, REVENUE_TARGETS, SALES_CHANNELS, STEP_FIELDS, onboardingAnswersSchema, type OnboardingAnswers, type OnboardingDraft } from "@/lib/onboarding/schema";
import { clearLocalDraft, loadLocalDraft, saveLocalDraft } from "@/lib/onboarding/storage";
import { createBusinessFromOnboardingAction, saveOnboardingDraftAction } from "@/lib/actions/onboarding";
import { track } from "@/lib/analytics-client";
import type { BusinessType, Industry } from "@/types";
import * as Icons from "lucide-react";

interface WizardProps {
  businessTypes: BusinessType[];
  industries: Industry[];
  isLoggedIn: boolean;
  serverDraft: OnboardingDraft | null;
  presetType?: string;
  canCreateMore: boolean;
}

function IconByName({ name, className }: { name?: string | null; className?: string }) {
  const Comp = (name && (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name]) || Icons.Briefcase;
  return <Comp className={className} />;
}

export function OnboardingWizard({ businessTypes, industries, isLoggedIn, serverDraft, presetType, canCreateMore }: WizardProps) {
  const router = useRouter();
  const [draft, setDraft] = React.useState<OnboardingDraft>(() => ({ ...DEFAULT_DRAFT, ...(serverDraft ?? {}), ...(presetType ? { businessTypeSlug: presetType } : {}) }));
  const [step, setStep] = React.useState(serverDraft?.step ?? (presetType ? 2 : 0));
  const [hydrated, setHydrated] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [newProduct, setNewProduct] = React.useState("");
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Khôi phục từ localStorage (khách hoặc sau khi đăng nhập quay lại)
  React.useEffect(() => {
    const local = loadLocalDraft();
    const localNewer = local?.updatedAt && (!serverDraft?.updatedAt || new Date(local.updatedAt) > new Date(serverDraft.updatedAt));
    if (local && (localNewer || !serverDraft)) {
      setDraft((d) => ({ ...d, ...local, ...(presetType ? { businessTypeSlug: presetType } : {}) }));
      if (typeof local.step === "number" && !presetType) setStep(local.step);
    }
    setHydrated(true);
    track("generator_start", { path: "/onboarding" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave
  React.useEffect(() => {
    if (!hydrated) return;
    const toSave = { ...draft, step };
    saveLocalDraft(toSave);
    if (!isLoggedIn) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void saveOnboardingDraftAction(toSave), 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [draft, step, hydrated, isLoggedIn]);

  const current = ONBOARDING_STEPS[step];
  const total = ONBOARDING_STEPS.length;
  const progress = Math.round((step / (total - 1)) * 100);
  const update = <K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => {
      const n = { ...e };
      delete n[key];
      return n;
    });
  };

  function validateStep(): boolean {
    const fields = STEP_FIELDS[current.key];
    if (fields.length === 0) return true;
    const partial = onboardingAnswersSchema.pick(Object.fromEntries(fields.map((f) => [f, true])) as Record<keyof OnboardingAnswers, true>);
    const res = partial.safeParse(draft);
    if (res.success) return true;
    const errs: Record<string, string> = {};
    for (const issue of res.error.issues) errs[String(issue.path[0])] = issue.message;
    setErrors(errs);
    return false;
  }

  function next() {
    if (!validateStep()) return;
    setStep((s) => Math.min(total - 1, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function generate() {
    const res = onboardingAnswersSchema.safeParse(draft);
    if (!res.success) {
      const firstField = String(res.error.issues[0]?.path[0] ?? "");
      const stepIdx = ONBOARDING_STEPS.findIndex((s) => (STEP_FIELDS[s.key] as string[]).includes(firstField));
      toast.error(res.error.issues[0]?.message ?? "Thiếu thông tin");
      if (stepIdx >= 0) setStep(stepIdx);
      return;
    }
    track("generator_complete", { path: "/onboarding", business_type: res.data.businessTypeSlug, industry: res.data.industrySlug });
    if (!isLoggedIn) {
      saveLocalDraft({ ...draft, step });
      router.push(`/register?next=${encodeURIComponent("/onboarding?resume=1")}`);
      return;
    }
    setSubmitting(true);
    const result = await createBusinessFromOnboardingAction(res.data);
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    clearLocalDraft();
    if (result.message) toast.warning(result.message);
    else toast.success("Đã lưu business. Bắt đầu tạo nội dung…");
    router.push(`/generate/${result.data.businessId}`);
  }

  const filteredIndustries = industries.filter((i) => {
    const bt = businessTypes.find((b) => b.slug === draft.businessTypeSlug);
    return !bt || i.business_type_id === bt.id;
  });
  const otherIndustries = industries.filter((i) => !filteredIndustries.includes(i));

  const selectableCard = (key: string, selected: boolean, onClick: () => void, children: React.ReactNode, className?: string) => (
    <button key={key} type="button" onClick={onClick} className={cn("group flex w-full flex-col items-start gap-1.5 rounded-xl border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40", selected && "border-primary bg-primary/5 ring-2 ring-primary/30", className)} aria-pressed={selected}>
      {children}
    </button>
  );

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Bước {step + 1}/{total} · {current.label}</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} />
        <div className="mt-3 hidden flex-wrap gap-1 md:flex">
          {ONBOARDING_STEPS.map((s, i) => (
            <button key={s.key} type="button" disabled={i > step} onClick={() => setStep(i)} className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors", i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-primary/10 text-primary hover:bg-primary/20" : "bg-muted text-muted-foreground")}>{s.label}</button>
          ))}
        </div>
      </div>

      <div key={current.key} className="animate-slide-up rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        {current.key === "welcome" && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Rocket className="size-8" /></div>
            <h1 className="text-2xl font-bold sm:text-3xl">Tạo Business Kit trong 10 phút</h1>
            <p className="mx-auto max-w-lg text-muted-foreground">Trả lời 10 câu hỏi ngắn về business của bạn. LaunchKit sẽ tạo thương hiệu, bảng giá, kịch bản bán hàng, kế hoạch marketing, nội dung, website và tài liệu — tất cả bằng tiếng Việt, sẵn sàng dùng.</p>
            <ul className="mx-auto grid max-w-md gap-2 text-left text-sm">
              {["Lưu tiến trình tự động — thoát ra rồi quay lại vẫn còn", "Không cần thẻ tín dụng, xem trước miễn phí", "Chỉnh sửa mọi thứ sau khi tạo"].map((t) => (<li key={t} className="flex items-center gap-2"><Check className="size-4 text-success" /> {t}</li>))}
            </ul>
            {!canCreateMore ? (
              <div className="rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm text-warning-foreground">Gói miễn phí chỉ tạo được 1 business. Bạn vẫn có thể hoàn thành wizard, nhưng cần <Link href="/pricing" className="font-semibold underline">nâng cấp Pro Membership</Link> để lưu thêm business.</div>
            ) : null}
            {draft.businessName ? <p className="text-xs text-muted-foreground">Đang tiếp tục bản nháp: <strong>{draft.businessName}</strong></p> : null}
          </div>
        )}

        {current.key === "business_type" && (
          <div className="space-y-4">
            <StepHeading title="Bạn đang kinh doanh theo hình thức nào?" description="Chọn loại hình gần nhất. Bạn có thể đổi sau." />
            {businessTypes.length === 0 ? (
              <div className="rounded-lg border border-warning/50 bg-warning/10 p-4 text-sm text-warning-foreground">
                Chưa có dữ liệu loại hình kinh doanh. Hệ thống chưa được nạp danh mục (chạy <code className="rounded bg-background px-1">supabase/seed.sql</code>) hoặc quản trị viên chưa thêm loại hình trong Quản trị → Loại hình. Vui lòng liên hệ hỗ trợ.
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              {businessTypes.map((bt) => selectableCard(bt.slug, draft.businessTypeSlug === bt.slug, () => { update("businessTypeSlug", bt.slug); update("industrySlug", ""); }, (
                <>
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><IconByName name={bt.icon} className="size-5" /></span>
                  <span className="font-semibold">{bt.name}</span>
                  <span className="text-xs text-muted-foreground">{bt.description}</span>
                </>
              )))}
            </div>
            <FieldError message={errors.businessTypeSlug} />
          </div>
        )}

        {current.key === "industry" && (
          <div className="space-y-4">
            <StepHeading title="Ngành cụ thể của bạn là gì?" description="Giúp nội dung sát với thực tế ngành." />
            <div className="grid gap-2 sm:grid-cols-2">
              {filteredIndustries.map((ind) => selectableCard(ind.slug, draft.industrySlug === ind.slug, () => update("industrySlug", ind.slug), (
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-md bg-muted text-foreground"><IconByName name={ind.icon} className="size-4" /></span>
                  <div><div className="text-sm font-semibold">{ind.name}</div><div className="text-xs text-muted-foreground">{ind.description}</div></div>
                </div>
              ), "p-3"))}
            </div>
            {otherIndustries.length ? (
              <details className="rounded-lg border p-3 text-sm">
                <summary className="cursor-pointer font-medium">Ngành khác ({otherIndustries.length})</summary>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {otherIndustries.map((ind) => selectableCard(ind.slug, draft.industrySlug === ind.slug, () => update("industrySlug", ind.slug), (<div className="text-sm font-medium">{ind.name}</div>), "p-3"))}
                </div>
              </details>
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor="industryCustom">Mô tả thêm (tuỳ chọn)</Label>
              <Input id="industryCustom" placeholder="Ví dụ: chuyên landing page cho spa" value={draft.industryCustom ?? ""} onChange={(e) => update("industryCustom", e.target.value)} />
            </div>
            <FieldError message={errors.industrySlug} />
          </div>
        )}

        {current.key === "info" && (
          <div className="space-y-4">
            <StepHeading title="Thông tin business" description="Tên có thể là tên bạn, tên thương hiệu hoặc tên dự kiến." />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="businessName">Tên business *</Label><Input id="businessName" placeholder="Ví dụ: Minh Web Studio" value={draft.businessName ?? ""} onChange={(e) => update("businessName", e.target.value)} aria-invalid={!!errors.businessName} /><FieldError message={errors.businessName} /></div>
              <div className="space-y-1.5"><Label htmlFor="ownerName">Tên bạn (tuỳ chọn)</Label><Input id="ownerName" placeholder="Nguyễn Văn A" value={draft.ownerName ?? ""} onChange={(e) => update("ownerName", e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="location">Khu vực</Label><Input id="location" placeholder="TP.HCM, Hà Nội, Đà Nẵng…" value={draft.location ?? ""} onChange={(e) => update("location", e.target.value)} /></div>
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="description">Mô tả ngắn (tuỳ chọn)</Label><Textarea id="description" placeholder="Bạn làm gì, cho ai, điều gì khiến bạn khác biệt?" value={draft.description ?? ""} onChange={(e) => update("description", e.target.value)} /></div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Kinh nghiệm</Label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {EXPERIENCE_LEVELS.map((lv) => selectableCard(lv.key, draft.experience === lv.key, () => update("experience", lv.key), <span className="text-sm font-medium">{lv.label}</span>, "p-3"))}
                </div>
              </div>
            </div>
          </div>
        )}

        {current.key === "customer" && (
          <div className="space-y-4">
            <StepHeading title="Khách hàng mục tiêu của bạn là ai?" description="Càng cụ thể, nội dung càng đúng." />
            <div className="space-y-2">
              <Label>Nhóm khách</Label>
              <div className="grid gap-2 sm:grid-cols-3">{CUSTOMER_SEGMENTS.map((s) => selectableCard(s.key, draft.customerSegment === s.key, () => update("customerSegment", s.key), <span className="text-sm font-medium">{s.label}</span>, "p-3"))}</div>
            </div>
            <div className="space-y-1.5"><Label htmlFor="targetCustomer">Mô tả khách hàng *</Label><Textarea id="targetCustomer" placeholder="Ví dụ: chủ spa nhỏ tại TP.HCM, 28–40 tuổi, muốn có website để nhận đặt lịch" value={draft.targetCustomer ?? ""} onChange={(e) => update("targetCustomer", e.target.value)} aria-invalid={!!errors.targetCustomer} /><FieldError message={errors.targetCustomer} /></div>
            <div className="space-y-1.5"><Label htmlFor="customerPainPoints">Họ đang gặp khó khăn gì? (tuỳ chọn)</Label><Textarea id="customerPainPoints" placeholder="Ví dụ: không biết làm web ở đâu uy tín, sợ bị chặt chém" value={draft.customerPainPoints ?? ""} onChange={(e) => update("customerPainPoints", e.target.value)} /></div>
          </div>
        )}

        {current.key === "products" && (
          <div className="space-y-4">
            <StepHeading title="Bạn bán sản phẩm / dịch vụ gì?" description="Thêm 1–8 mục. Mỗi mục sẽ thành một dịch vụ trong kit." />
            <div className="flex gap-2">
              <Input placeholder="Ví dụ: Thiết kế website" value={newProduct} onChange={(e) => setNewProduct(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addProduct(); } }} />
              <Button type="button" onClick={addProduct} disabled={!newProduct.trim() || (draft.products?.length ?? 0) >= 8}><Plus /> Thêm</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(draft.products ?? []).map((p, i) => (
                <Badge key={`${p}-${i}`} variant="secondary" className="gap-1 py-1 pl-3 pr-1 text-sm">
                  {p}
                  <button type="button" onClick={() => update("products", (draft.products ?? []).filter((_, j) => j !== i))} className="rounded-full p-0.5 hover:bg-background" aria-label={`Xoá ${p}`}><X className="size-3" /></button>
                </Badge>
              ))}
              {(draft.products ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Chưa có mục nào. Gợi ý: {suggestProducts(draft.industrySlug).map((s, i) => (<button key={s} type="button" className="text-primary hover:underline" onClick={() => update("products", [...(draft.products ?? []), s])}>{i > 0 ? ", " : ""}{s}</button>))}</p> : null}
            </div>
            <FieldError message={errors.products} />
          </div>
        )}

        {current.key === "personality" && (
          <div className="space-y-4">
            <StepHeading title="Tính cách thương hiệu" description="Chọn 1–4 tính cách. Cái đầu tiên bạn chọn sẽ là chủ đạo." />
            <div className="grid gap-2 sm:grid-cols-2">
              {BRAND_PERSONALITIES.map((p) => {
                const selected = (draft.brandPersonality ?? []).includes(p.key);
                const idx = (draft.brandPersonality ?? []).indexOf(p.key);
                return selectableCard(p.key, selected, () => {
                  const cur = draft.brandPersonality ?? [];
                  if (selected) update("brandPersonality", cur.filter((k) => k !== p.key));
                  else if (cur.length < 4) update("brandPersonality", [...cur, p.key]);
                  else toast.info("Tối đa 4 tính cách");
                }, (<div className="flex w-full items-start justify-between"><div><div className="font-semibold">{p.label}</div><div className="text-xs text-muted-foreground">{p.hint}</div></div>{selected ? <Badge>{idx === 0 ? "Chủ đạo" : `#${idx + 1}`}</Badge> : null}</div>), "p-3");
              })}
            </div>
            <FieldError message={errors.brandPersonality} />
          </div>
        )}

        {current.key === "color" && (
          <div className="space-y-4">
            <StepHeading title="Bảng màu bạn thích" description="Dùng cho nhận diện và website." />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {COLOR_PALETTES.map((pal) => selectableCard(pal.key, draft.colorPalette === pal.key, () => update("colorPalette", pal.key), (
                <>
                  <div className="flex h-10 w-full overflow-hidden rounded-lg"><span className="flex-1" style={{ background: pal.primary }} /><span className="flex-1" style={{ background: pal.secondary }} /><span className="flex-1" style={{ background: pal.accent }} /><span className="w-6 border" style={{ background: pal.bg }} /></div>
                  <span className="text-sm font-medium">{pal.label}</span>
                </>
              ), "p-3"))}
            </div>
            <FieldError message={errors.colorPalette} />
          </div>
        )}

        {current.key === "channels" && (
          <div className="space-y-4">
            <StepHeading title="Bạn bán hàng qua kênh nào?" description="Chọn các kênh đang dùng hoặc định dùng. Kế hoạch marketing sẽ ưu tiên 2 kênh đầu." />
            <div className="grid gap-2 sm:grid-cols-3">
              {SALES_CHANNELS.map((c) => {
                const cur = draft.salesChannels ?? [];
                const selected = cur.includes(c.key);
                return selectableCard(c.key, selected, () => update("salesChannels", selected ? cur.filter((k) => k !== c.key) : [...cur, c.key]), <span className="text-sm font-medium">{c.label}</span>, "p-3");
              })}
            </div>
            <FieldError message={errors.salesChannels} />
          </div>
        )}

        {current.key === "revenue" && (
          <div className="space-y-4">
            <StepHeading title="Mục tiêu doanh thu hàng tháng" description="Dùng để tính số khách cần có và gợi ý mức giá." />
            <div className="grid gap-2 sm:grid-cols-3">
              {REVENUE_TARGETS.map((r) => selectableCard(String(r.value), draft.revenueTarget === r.value, () => update("revenueTarget", r.value), <span className="text-sm font-medium">{r.label}</span>, "p-3"))}
            </div>
            <div className="space-y-1.5"><Label htmlFor="revenueCustom">Hoặc nhập số cụ thể (VND)</Label><Input id="revenueCustom" type="number" min={1000000} step={1000000} placeholder="Ví dụ: 45000000" value={draft.revenueTarget ?? ""} onChange={(e) => update("revenueTarget", Number(e.target.value))} />{draft.revenueTarget ? <p className="text-xs text-muted-foreground">= {formatVND(draft.revenueTarget)} / tháng</p> : null}</div>
            <FieldError message={errors.revenueTarget} />
          </div>
        )}

        {current.key === "goal" && (
          <div className="space-y-4">
            <StepHeading title="Mục tiêu quan trọng nhất lúc này?" description="Kit sẽ ưu tiên hành động cho mục tiêu này." />
            <div className="grid gap-2 sm:grid-cols-2">
              {PRIMARY_GOALS.map((g) => selectableCard(g.key, draft.primaryGoal === g.key, () => update("primaryGoal", g.key), (<><span className="font-semibold">{g.label}</span><span className="text-xs text-muted-foreground">{g.hint}</span></>), "p-3"))}
            </div>
            <FieldError message={errors.primaryGoal} />
          </div>
        )}

        {current.key === "review" && (
          <div className="space-y-4">
            <StepHeading title="Xem lại trước khi tạo" description="Bấm vào mục bất kỳ để sửa." />
            <dl className="divide-y rounded-xl border">
              {[
                ["Loại hình", businessTypes.find((b) => b.slug === draft.businessTypeSlug)?.name, 1],
                ["Ngành", industries.find((i) => i.slug === draft.industrySlug)?.name, 2],
                ["Tên business", draft.businessName, 3],
                ["Khách hàng", draft.targetCustomer, 4],
                ["Sản phẩm / dịch vụ", (draft.products ?? []).join(", "), 5],
                ["Tính cách", (draft.brandPersonality ?? []).map((k) => BRAND_PERSONALITIES.find((p) => p.key === k)?.label).join(", "), 6],
                ["Màu sắc", COLOR_PALETTES.find((p) => p.key === draft.colorPalette)?.label, 7],
                ["Kênh bán", (draft.salesChannels ?? []).map((k) => SALES_CHANNELS.find((c) => c.key === k)?.label).join(", "), 8],
                ["Doanh thu mục tiêu", draft.revenueTarget ? `${formatVND(draft.revenueTarget)}/tháng` : "", 9],
                ["Mục tiêu", PRIMARY_GOALS.find((g) => g.key === draft.primaryGoal)?.label, 10],
              ].map(([label, value, idx]) => (
                <button key={String(label)} type="button" onClick={() => setStep(Number(idx))} className="flex w-full items-start justify-between gap-4 px-4 py-3 text-left text-sm hover:bg-accent/50">
                  <dt className="w-36 shrink-0 text-muted-foreground">{label}</dt>
                  <dd className={cn("flex-1", !value && "text-destructive")}>{(value as string) || "Chưa điền"}</dd>
                </button>
              ))}
            </dl>
            {!isLoggedIn ? <p className="rounded-lg bg-primary/5 p-3 text-sm">Bạn sẽ được yêu cầu <strong>đăng ký miễn phí</strong> để lưu business và nhận kết quả. Bản nháp này đã được lưu trên thiết bị.</p> : null}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={back} disabled={step === 0 || submitting}><ArrowLeft /> Quay lại</Button>
          {current.key === "review" ? (
            <Button type="button" size="lg" variant="premium" onClick={generate} loading={submitting}>{submitting ? "Đang lưu…" : isLoggedIn ? (<><Sparkles /> Tạo Business Kit</>) : (<><Sparkles /> Đăng ký & tạo kit</>)}</Button>
          ) : (
            <Button type="button" onClick={next} size="lg">{step === 0 ? "Bắt đầu" : "Tiếp tục"} <ArrowRight /></Button>
          )}
        </div>
      </div>
      {step > 0 ? <p className="mt-4 text-center text-xs text-muted-foreground"><Loader2 className="mr-1 inline size-3" /> Tiến trình được lưu tự động. Bạn có thể <Link href="/" className="underline">thoát</Link> và quay lại sau.</p> : null}
    </div>
  );

  function addProduct() {
    const v = newProduct.trim();
    if (!v) return;
    const cur = draft.products ?? [];
    if (cur.length >= 8) return toast.info("Tối đa 8 mục");
    if (cur.some((p) => p.toLowerCase() === v.toLowerCase())) return toast.info("Mục này đã có");
    update("products", [...cur, v]);
    setNewProduct("");
  }
}

function StepHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

function suggestProducts(industry?: string): string[] {
  const map: Record<string, string[]> = {
    "website-development": ["Thiết kế website", "Landing page", "Bảo trì website"],
    "graphic-design": ["Thiết kế logo", "Bộ nhận diện", "Ấn phẩm social"],
    copywriting: ["Viết bài SEO", "Content fanpage", "Kịch bản video"],
    "digital-marketing": ["Chạy quảng cáo Facebook", "SEO website", "Quản lý fanpage"],
    "video-editing": ["Dựng video TikTok", "Video quảng cáo", "Motion graphics"],
    "hair-salon": ["Cắt tạo kiểu", "Uốn/nhuộm", "Phục hồi tóc"],
    "nail-salon": ["Sơn gel", "Nail art", "Nối mi"],
    "spa-skincare": ["Chăm sóc da cơ bản", "Trị mụn", "Massage mặt"],
    "fashion-shop": ["Váy đầm", "Áo thun local brand", "Phụ kiện"],
    "cosmetics-shop": ["Serum", "Kem chống nắng", "Son"],
    "coffee-shop": ["Cà phê muối", "Bạc xỉu", "Bánh ngọt"],
    "milk-tea": ["Trà sữa trân châu", "Trà trái cây", "Topping"],
    "english-tutor": ["Luyện IELTS 1 kèm 1", "Tiếng Anh giao tiếp", "Lớp nhóm nhỏ"],
    "home-cleaning": ["Vệ sinh nhà", "Giặt sofa", "Vệ sinh máy lạnh"],
    "repair-service": ["Sửa máy lạnh", "Sửa điện nước", "Lắp đặt thiết bị"],
  };
  return map[industry ?? ""] ?? ["Dịch vụ chính", "Gói nâng cao", "Gói đồng hành"];
}
