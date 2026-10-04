import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { Link2Off } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsTracker } from "@/components/app/analytics-tracker";
import { ShareKitView, type SharedKit } from "@/components/site/share-kit-view";

type Params = { params: Promise<{ token: string }> };

const loadSharedKit = cache(async (token: string): Promise<SharedKit | null> => {
  if (!token || token.length > 128) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_shared_kit", { p_token: token });
  if (error || !data || typeof data !== "object" || Array.isArray(data)) return null;
  const kit = data as unknown as SharedKit;
  if (!kit.business?.name) return null;
  return {
    business: kit.business,
    sections: Array.isArray(kit.sections) ? kit.sections : [],
    assets: Array.isArray(kit.assets) ? kit.assets : [],
    services: Array.isArray(kit.services) ? kit.services : [],
    packages: Array.isArray(kit.packages) ? kit.packages : [],
  };
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { token } = await params;
  const kit = await loadSharedKit(token);
  return {
    title: kit ? `${kit.business.name} — Business Kit` : "Liên kết chia sẻ",
    description: kit ? `Business Kit của ${kit.business.name}${kit.business.industry ? ` (${kit.business.industry})` : ""} được chia sẻ từ LaunchKit VN.` : "Liên kết chia sẻ Business Kit.",
    robots: { index: false, follow: false },
  };
}

function ShareUnavailable() {
  return (
    <div className="surface-glow">
      <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <span className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Link2Off className="size-8" aria-hidden />
        </span>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Liên kết không tồn tại hoặc đã hết hạn</h1>
        <p className="mt-3 max-w-md text-muted-foreground">Chủ kit có thể đã tắt chia sẻ, đặt thời hạn cho liên kết hoặc lưu trữ business này. Hãy liên hệ người gửi để nhận liên kết mới.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/onboarding">Tạo Business Kit của bạn</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/examples">Xem ví dụ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default async function SharePage({ params }: Params) {
  const { token } = await params;
  const kit = await loadSharedKit(token);
  if (!kit) return <ShareUnavailable />;
  const supabase = await createClient();
  await supabase.rpc("increment_share_view", { p_token: token });
  return (
    <>
      <React.Suspense fallback={null}>
        <AnalyticsTracker event="share_view" properties={{ business_id: kit.business.id }} />
      </React.Suspense>
      <ShareKitView kit={kit} />
    </>
  );
}
