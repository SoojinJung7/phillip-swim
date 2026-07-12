import * as React from "react";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** 상단 아이콘/이모지 등 */
  icon?: React.ReactNode;
  /** 하단 액션 (버튼 등) */
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-water-200 bg-white/60 px-6 py-12 text-center",
        className
      )}
    >
      <div className="mb-3 text-4xl" aria-hidden>
        {icon ?? "🌊"}
      </div>
      <h3 className="text-lg font-bold text-water-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
