"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Briefcase, FileText, LayoutDashboard, Plus, Search, Sparkles, CalendarDays, Settings, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { globalSearchAction, type SearchHit } from "@/lib/actions/search";

const KIND_LABEL: Record<SearchHit["kind"], string> = { business: "Business", document: "Tài liệu", content: "Nội dung", asset: "Nội dung kit" };
const KIND_ICON: Record<SearchHit["kind"], React.ComponentType<{ className?: string }>> = { business: Briefcase, document: FileText, content: CalendarDays, asset: Sparkles };

export function CommandSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [hits, setHits] = React.useState<SearchHit[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await globalSearchAction(q);
      if (cancelled) return;
      setLoading(false);
      setHits(res.ok ? res.data : []);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, open]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const grouped = hits.reduce<Record<string, SearchHit[]>>((acc, h) => ((acc[h.kind] ??= []).push(h), acc), {});

  return (
    <>
      <Button variant="outline" className="hidden w-64 justify-between text-muted-foreground md:flex" onClick={() => setOpen(true)}>
        <span className="flex items-center gap-2"><Search className="size-4" /> Tìm kiếm…</span>
        <Kbd>⌘K</Kbd>
      </Button>
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)} aria-label="Tìm kiếm"><Search /></Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Tìm kiếm" description="Tìm business, tài liệu, nội dung">
        <CommandInput placeholder="Tìm business, tài liệu, nội dung…" value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandEmpty>{loading ? "Đang tìm…" : query.trim().length < 2 ? "Nhập ít nhất 2 ký tự để tìm." : "Không tìm thấy kết quả phù hợp."}</CommandEmpty>
          {Object.entries(grouped).map(([kind, items]) => (
            <CommandGroup key={kind} heading={KIND_LABEL[kind as SearchHit["kind"]]}>
              {items.map((h) => {
                const Icon = KIND_ICON[h.kind];
                return (
                  <CommandItem key={`${h.kind}-${h.id}`} value={`${h.kind}-${h.id}-${h.title}`} onSelect={() => go(h.href)}>
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="truncate">{h.title}</span>
                    <span className="ml-auto truncate text-xs text-muted-foreground">{h.subtitle}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading="Đi tới">
            <CommandItem value="goto-dashboard" onSelect={() => go("/dashboard")}><LayoutDashboard className="size-4" /> Dashboard</CommandItem>
            <CommandItem value="goto-businesses" onSelect={() => go("/dashboard/businesses")}><Briefcase className="size-4" /> Business của tôi</CommandItem>
            <CommandItem value="goto-new" onSelect={() => go("/onboarding")}><Plus className="size-4" /> Tạo business mới</CommandItem>
            <CommandItem value="goto-billing" onSelect={() => go("/dashboard/billing")}><CreditCard className="size-4" /> Gói & thanh toán</CommandItem>
            <CommandItem value="goto-settings" onSelect={() => go("/settings/profile")}><Settings className="size-4" /> Cài đặt tài khoản</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
