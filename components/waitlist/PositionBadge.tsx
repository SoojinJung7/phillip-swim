import * as React from "react";
import { cn } from "@/lib/cn";

export interface PositionBadgeProps {
  /** 대기 순번 (1부터) */
  position: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses: Record<NonNullable<PositionBadgeProps["size"]>, string> = {
  sm: "h-14 w-14",
  md: "h-20 w-20",
  lg: "h-28 w-28",
};

const numberClasses: Record<NonNullable<PositionBadgeProps["size"]>, string> = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-5xl",
};

/**
 * 대기 순번을 물방울 느낌의 원형 배지로 크게 보여줍니다.
 * "대기 / N / 번째" 형태.
 */
export function PositionBadge({
  position,
  size = "md",
  className,
}: PositionBadgeProps) {
  return (
    <div
      className={cn(
        "relative flex flex-shrink-0 flex-col items-center justify-center rounded-full",
        "bg-gradient-to-br from-water-400 to-teal-500 text-white shadow-water",
        "ring-4 ring-white/70",
        sizeClasses[size],
        className
      )}
      aria-label={`대기 ${position}번째`}
    >
      <span className="text-[0.6rem] font-semibold uppercase tracking-wide opacity-80">
        대기
      </span>
      <span className={cn("font-extrabold leading-none", numberClasses[size])}>
        {position}
      </span>
      <span className="text-[0.6rem] font-semibold opacity-80">번째</span>
    </div>
  );
}
