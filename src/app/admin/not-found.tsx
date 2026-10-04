import Link from "next/link";
import { LayoutDashboard, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed px-4 py-16 text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><SearchX className="size-7" /></div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lỗi 404</p>
      <h1 className="mt-1 text-xl font-bold">Không tìm thấy dữ liệu</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">Bản ghi bạn tìm không tồn tại hoặc đã bị xoá. Kiểm tra lại đường dẫn hoặc quay về trang tổng quan.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild><Link href="/admin"><LayoutDashboard /> Về tổng quan</Link></Button>
        <Button asChild variant="outline"><Link href="/admin/users">Danh sách người dùng</Link></Button>
      </div>
    </div>
  );
}
