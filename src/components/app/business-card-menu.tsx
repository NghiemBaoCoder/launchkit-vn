"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Copy, MoreHorizontal, Settings, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { archiveBusinessAction, deleteBusinessAction, duplicateBusinessAction } from "@/lib/actions/business";
import Link from "next/link";

export function BusinessCardMenu({ id, name, status }: { id: string; name: string; status: string }) {
  const router = useRouter();
  const [archiveOpen, setArchiveOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const archived = status === "archived";
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="Thao tác"><MoreHorizontal /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link href={`/business/${id}/settings`}><Settings /> Cài đặt</Link></DropdownMenuItem>
          <DropdownMenuItem onSelect={async () => { const r = await duplicateBusinessAction(id); if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.error, r.code === "limit" ? { action: { label: "Nâng cấp", onClick: () => router.push("/pricing") } } : undefined); }}><Copy /> Nhân bản</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setArchiveOpen(true)}>{archived ? <><ArchiveRestore /> Khôi phục</> : <><Archive /> Lưu trữ</>}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}><Trash2 /> Xoá</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog open={archiveOpen} onOpenChange={setArchiveOpen} title={archived ? `Khôi phục "${name}"?` : `Lưu trữ "${name}"?`} description={archived ? "Business sẽ hoạt động trở lại." : "Business sẽ bị ẩn và website public tạm ngưng. Có thể khôi phục sau."} confirmLabel={archived ? "Khôi phục" : "Lưu trữ"} onConfirm={async () => { const r = await archiveBusinessAction(id, !archived); if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.error); }} />
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title={`Xoá vĩnh viễn "${name}"?`} description="Toàn bộ nội dung, tài liệu, website và file xuất sẽ bị xoá vĩnh viễn." confirmLabel="Xoá vĩnh viễn" destructive typeToConfirm={name} onConfirm={async () => { const r = await deleteBusinessAction(id); if (r.ok) { toast.success(r.message); router.refresh(); } else toast.error(r.error); }} />
    </>
  );
}
