"use client";
import * as React from "react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface RotatingWordsProps {
  words: string[];
  interval?: number;
  className?: string;
  /** Class cho chính từ đang hiển thị (đặt gradient-text ở đây — transform/filter của motion
   *  tách layer nên background-clip:text ở phần tử cha sẽ không hiện). */
  wordClassName?: string;
}

/** Đổi từ khoá trong tiêu đề theo chu kỳ (lật lên). Reduced-motion → đứng yên ở từ đầu. */
export function RotatingWords({ words, interval = 2400, className, wordClassName }: RotatingWordsProps) {
  const reduced = useReducedMotion() ?? false;
  const [index, setIndex] = React.useState(0);
  const longest = React.useMemo(() => words.reduce((a, b) => (b.length > a.length ? b : a), ""), [words]);

  React.useEffect(() => {
    if (reduced || words.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [reduced, words.length, interval]);

  return (
    <span className={cn("relative inline-grid overflow-hidden align-baseline", className)} aria-live="polite">
      {/* giữ chỗ theo từ dài nhất để không nhảy layout */}
      <span className="invisible col-start-1 row-start-1 whitespace-nowrap" aria-hidden>
        {longest}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <m.span
          key={words[index]}
          className={cn("col-start-1 row-start-1 whitespace-nowrap", wordClassName)}
          initial={reduced ? { opacity: 0 } : { y: "110%", opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={reduced ? { opacity: 0 } : { y: "-110%", opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {words[index]}
        </m.span>
      </AnimatePresence>
    </span>
  );
}
