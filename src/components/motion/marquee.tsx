import * as React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends React.ComponentProps<"div"> {
  /** Giây cho một vòng. */
  speed?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  /** Làm mờ hai mép. */
  fade?: boolean;
}

/**
 * Dải chạy vô tận bằng CSS (không JS). Nội dung được nhân đôi để nối liền.
 * Reduced-motion → đứng yên và cho phép cuộn ngang.
 */
export function Marquee({ speed = 40, reverse = false, pauseOnHover = true, fade = true, className, children, ...props }: MarqueeProps) {
  return (
    <div
      className={cn("group/marquee relative flex w-full overflow-hidden", fade && "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]", "motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]", className)}
      {...props}
    >
      <div
        className={cn("flex w-max shrink-0 items-center gap-4 pr-4 animate-marquee motion-reduce:animate-none", reverse && "[animation-direction:reverse]", pauseOnHover && "group-hover/marquee:[animation-play-state:paused]")}
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
        <span aria-hidden className="contents">
          {children}
        </span>
      </div>
    </div>
  );
}
