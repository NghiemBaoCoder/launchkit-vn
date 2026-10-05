"use client";
import * as React from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

interface AnimatedNumberProps {
  value: number;
  /** Hậu tố / tiền tố hiển thị kèm (ví dụ "+", "%", " phút"). */
  prefix?: string;
  suffix?: string;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

const defaultFormat = (n: number) => new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Math.round(n));

/** Số đếm chạy từ 0 → value khi cuộn tới; reduced-motion thì hiển thị ngay. */
export function AnimatedNumber({ value, prefix = "", suffix = "", duration = 1.4, format = defaultFormat, className }: AnimatedNumberProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotion() ?? false;
  const [display, setDisplay] = React.useState(() => format(reduced ? value : 0));

  React.useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setDisplay(format(value));
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(format(latest)),
    });
    return () => controls.stop();
  }, [inView, value, duration, reduced, format]);

  return (
    <span ref={ref} className={className} aria-label={`${prefix}${format(value)}${suffix}`}>
      {prefix}
      <span aria-hidden>{display}</span>
      {suffix}
    </span>
  );
}
