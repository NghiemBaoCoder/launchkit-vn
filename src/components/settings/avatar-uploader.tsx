"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createClient } from "@/lib/supabase/client";
import { updateAvatarAction } from "@/lib/actions/settings";
import { initials } from "@/lib/utils";

const MAX_SIZE = 2 * 1024 * 1024;
const EXT_BY_TYPE: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

interface AvatarUploaderProps {
  userId: string;
  avatarUrl: string | null;
  fullName: string | null;
}

export function AvatarUploader({ userId, avatarUrl, fullName }: AvatarUploaderProps) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [current, setCurrent] = React.useState<string | null>(avatarUrl);
  const [busy, setBusy] = React.useState(false);
  const [confirmRemove, setConfirmRemove] = React.useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const ext = EXT_BY_TYPE[file.type];
    if (!ext) return void toast.error("Chỉ hỗ trợ ảnh PNG, JPG hoặc WebP.");
    if (file.size > MAX_SIZE) return void toast.error("Ảnh vượt quá 2MB. Hãy chọn ảnh nhỏ hơn.");

    setBusy(true);
    try {
      const supabase = createClient();
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: false });
      if (error) return void toast.error(`Tải ảnh thất bại: ${error.message}`);
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const res = await updateAvatarAction(data.publicUrl);
      if (!res.ok) return void toast.error(res.error);
      setCurrent(res.data.avatar_url);
      toast.success(res.message ?? "Đã cập nhật ảnh đại diện");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    const res = await updateAvatarAction(null);
    if (!res.ok) return void toast.error(res.error);
    setCurrent(null);
    toast.success(res.message ?? "Đã gỡ ảnh đại diện");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      <Avatar className="size-20 border">
        <AvatarImage src={current ?? undefined} alt={fullName ?? "Ảnh đại diện"} />
        <AvatarFallback className="text-xl">{initials(fullName)}</AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} loading={busy}>
            <Upload /> {current ? "Đổi ảnh" : "Tải ảnh lên"}
          </Button>
          {current ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmRemove(true)} disabled={busy}>
              <Trash2 /> Gỡ ảnh
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">PNG, JPG hoặc WebP · tối đa 2MB. Ảnh đại diện hiển thị công khai.</p>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleFile} aria-label="Chọn ảnh đại diện" tabIndex={-1} />
      </div>
      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title="Gỡ ảnh đại diện?"
        description="Ảnh sẽ được xoá khỏi hồ sơ và thay bằng chữ cái viết tắt tên bạn."
        confirmLabel="Gỡ ảnh"
        destructive
        onConfirm={remove}
      />
    </div>
  );
}
