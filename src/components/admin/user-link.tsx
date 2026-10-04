import Link from "next/link";
import { cn } from "@/lib/utils";

/** Link tới trang chi tiết người dùng, hiển thị tên + email. */
export function UserLink({ id, email, name, className }: { id: string | null | undefined; email?: string | null; name?: string | null; className?: string }) {
  if (!id) return <span className="text-muted-foreground">—</span>;
  return (
    <Link href={`/admin/users/${id}`} className={cn("group inline-flex min-w-0 flex-col leading-tight", className)}>
      <span className="truncate font-medium group-hover:underline">{name || email || id.slice(0, 8)}</span>
      {name && email ? <span className="truncate text-xs text-muted-foreground">{email}</span> : null}
    </Link>
  );
}
