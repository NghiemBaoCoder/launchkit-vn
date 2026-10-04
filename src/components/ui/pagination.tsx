"use client";
import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  /** Hàm tạo href cho trang, ví dụ (p) => `?page=${p}` */
  hrefFor?: (page: number) => string;
  onPageChange?: (page: number) => void;
  className?: string;
}

function Pagination({ page, pageSize, total, hrefFor, onPageChange, className }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  const renderBtn = (target: number, label: React.ReactNode, disabled: boolean) => {
    const cls = cn(buttonVariants({ variant: "outline", size: "sm" }), disabled && "pointer-events-none opacity-50");
    if (hrefFor && !disabled) {
      return (
        <Link href={hrefFor(target)} className={cls} aria-disabled={disabled}>
          {label}
        </Link>
      );
    }
    return (
      <button type="button" className={cls} disabled={disabled} onClick={() => onPageChange?.(target)}>
        {label}
      </button>
    );
  };

  return (
    <div className={cn("flex flex-col items-center justify-between gap-3 sm:flex-row", className)}>
      <p className="text-xs text-muted-foreground">
        Hiển thị {from}–{to} trên {total}
      </p>
      <div className="flex items-center gap-2">
        {renderBtn(page - 1, <><ChevronLeft /> Trước</>, page <= 1)}
        <span className="text-xs text-muted-foreground">
          Trang {page}/{totalPages}
        </span>
        {renderBtn(page + 1, <>Sau <ChevronRight /></>, page >= totalPages)}
      </div>
    </div>
  );
}

export { Pagination };
