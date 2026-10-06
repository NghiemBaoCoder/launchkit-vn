"use client";
import { LazyMotion, domAnimation } from "motion/react";

/**
 * Nạp motion theo kiểu lazy (chỉ gói domAnimation ~ nhỏ) — các component dùng `m.*`
 * thay cho `motion.*` để giữ bundle nhẹ. Bọc ở layout public & auth.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
