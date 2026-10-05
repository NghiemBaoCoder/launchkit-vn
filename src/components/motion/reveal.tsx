"use client";
import * as React from "react";
import { m, useReducedMotion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none" | "scale";

const OFFSET = 24;

function variantsFor(direction: Direction, reduced: boolean): Variants {
  if (reduced) return { hidden: { opacity: 0 }, show: { opacity: 1 } };
  const hidden: Record<string, number> = { opacity: 0 };
  if (direction === "up") hidden.y = OFFSET;
  if (direction === "down") hidden.y = -OFFSET;
  if (direction === "left") hidden.x = OFFSET;
  if (direction === "right") hidden.x = -OFFSET;
  if (direction === "scale") hidden.scale = 0.94;
  return { hidden, show: { opacity: 1, x: 0, y: 0, scale: 1 } };
}

interface RevealProps extends Omit<React.ComponentProps<typeof m.div>, "variants" | "initial" | "whileInView" | "viewport"> {
  direction?: Direction;
  delay?: number;
  duration?: number;
  /** Chỉ chạy một lần khi cuộn tới (mặc định true). */
  once?: boolean;
  /** Phần tử hiển thị bao nhiêu % thì bắt đầu (0–1). */
  amount?: number;
  /** Chạy ngay khi mount (dùng cho nội dung trên màn hình đầu, không chờ IntersectionObserver). */
  immediate?: boolean;
  as?: "div" | "section" | "li" | "span" | "article" | "figure";
}

/**
 * Hiện dần khi cuộn tới. Tôn trọng prefers-reduced-motion (chỉ fade).
 * Dùng `m.*` của motion (LazyMotion) để bundle nhẹ.
 */
export function Reveal({ direction = "up", delay = 0, duration = 0.55, once = true, amount = 0.2, immediate = false, className, children, as = "div", ...props }: RevealProps) {
  const reduced = useReducedMotion() ?? false;
  const Comp = (m as unknown as Record<string, typeof m.div>)[as] ?? m.div;
  const trigger = immediate ? { animate: "show" as const } : { whileInView: "show" as const, viewport: { once, amount, margin: "0px 0px -8% 0px" } };
  return (
    <Comp
      data-reveal=""
      className={cn(className)}
      variants={variantsFor(direction, reduced)}
      initial="hidden"
      {...trigger}
      transition={{ duration: reduced ? 0.2 : duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </Comp>
  );
}

interface StaggerProps extends Omit<React.ComponentProps<typeof m.div>, "variants" | "initial" | "whileInView" | "viewport"> {
  /** Khoảng cách giữa các phần tử con (giây). */
  gap?: number;
  delay?: number;
  once?: boolean;
  amount?: number;
  as?: "div" | "ul" | "ol" | "section";
}

/** Container: các <StaggerItem> bên trong lần lượt hiện ra. */
export function Stagger({ gap = 0.08, delay = 0, once = true, amount = 0.15, className, children, as = "div", ...props }: StaggerProps) {
  const Comp = (m as unknown as Record<string, typeof m.div>)[as] ?? m.div;
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount, margin: "0px 0px -8% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
      {...props}
    >
      {children}
    </Comp>
  );
}

interface StaggerItemProps extends Omit<React.ComponentProps<typeof m.div>, "variants"> {
  direction?: Direction;
  as?: "div" | "li" | "article" | "figure" | "span";
}

export function StaggerItem({ direction = "up", className, children, as = "div", ...props }: StaggerItemProps) {
  const reduced = useReducedMotion() ?? false;
  const Comp = (m as unknown as Record<string, typeof m.div>)[as] ?? m.div;
  return (
    <Comp data-reveal="" className={className} variants={variantsFor(direction, reduced)} transition={{ duration: reduced ? 0.2 : 0.5, ease: [0.22, 1, 0.36, 1] }} {...props}>
      {children}
    </Comp>
  );
}
