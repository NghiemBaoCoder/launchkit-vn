"use client";
import * as React from "react";
import { m, useMotionTemplate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

interface TiltCardProps extends Omit<React.ComponentProps<typeof m.div>, "children"> {
  children?: React.ReactNode;
  /** Góc nghiêng tối đa (độ). */
  maxTilt?: number;
  /** Hiện vệt sáng theo con trỏ. */
  glare?: boolean;
}

/**
 * Thẻ nghiêng 3D theo con trỏ (desktop). Trên thiết bị cảm ứng / reduced-motion → tĩnh.
 */
export function TiltCard({ maxTilt = 8, glare = true, className, children, style, ...props }: TiltCardProps) {
  const reduced = useReducedMotion() ?? false;
  const [enabled, setEnabled] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(mq.matches && !reduced);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [reduced]);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [maxTilt, -maxTilt]), { stiffness: 220, damping: 22 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-maxTilt, maxTilt]), { stiffness: 220, damping: 22 });
  const glareX = useTransform(px, (v) => `${v * 100}%`);
  const glareY = useTransform(py, (v) => `${v * 100}%`);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.28), transparent 55%)`;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <m.div
      className={cn("relative [transform-style:preserve-3d] will-change-transform", className)}
      style={enabled ? { rotateX, rotateY, transformPerspective: 900, ...style } : style}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...props}
    >
      {children}
      {glare && enabled ? (
        <m.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: glareBg }}
        />
      ) : null}
    </m.div>
  );
}
