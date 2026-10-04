import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="container-x py-20 text-center">
      <h1 className="text-4xl font-bold">LaunchKit VN</h1>
      <p className="mt-3 text-muted-foreground">Trang chủ đang được xây dựng.</p>
      <Button asChild className="mt-6"><Link href="/onboarding">Tạo Business Kit</Link></Button>
    </section>
  );
}
