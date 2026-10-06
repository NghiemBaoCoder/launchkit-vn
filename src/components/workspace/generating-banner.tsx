import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function GeneratingBanner({ businessId, status }: { businessId: string; status: "generating" | "draft" }) {
  return (
    <Alert variant="info" className="items-center">
      {status === "generating" ? <Loader2 className="animate-spin" /> : <Sparkles />}
      <AlertTitle>{status === "generating" ? "Business Kit đang được tạo" : "Business Kit chưa được tạo"}</AlertTitle>
      <AlertDescription className="flex w-full flex-wrap items-center justify-between gap-2">
        <span>{status === "generating" ? "Tiến trình tiếp tục chạy khi bạn ở trong app; một số mục sẽ đầy đủ sau khi hoàn tất." : "Hãy chạy trình tạo để có nội dung cho mọi mục."}</span>
        <Button asChild size="sm" variant="outline"><Link href={`/generate/${businessId}`}>{status === "generating" ? "Xem tiến trình" : "Tạo ngay"}</Link></Button>
      </AlertDescription>
    </Alert>
  );
}
