import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import type { SwimClass, ClassAvailability } from "@/lib/types";
import { AvailabilityBadge } from "./AvailabilityBadge";
import {
  formatSessionDate,
  relativeDayLabel,
  formatTimeRange,
  levelBadgeVariant,
} from "./format";

export interface ClassCardProps {
  swimClass: SwimClass;
  availability: ClassAvailability;
}

/** 강습 목록에서 한 강습을 보여주는 카드 */
export function ClassCard({ swimClass, availability }: ClassCardProps) {
  const { id, title, instructor, level, sessionDate, startTime, endTime } =
    swimClass;
  const relLabel = relativeDayLabel(sessionDate);
  const isFull = availability.isFull;

  return (
    <Card interactive className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={levelBadgeVariant(level)}>{level}</Badge>
            {relLabel && <Badge variant="default">{relLabel}</Badge>}
          </div>
          <h3 className="truncate text-lg font-bold text-water-900">{title}</h3>
          <p className="text-sm text-slate-500">강사 {instructor}</p>
        </div>
        <div className="flex-shrink-0 pt-0.5">
          <AvailabilityBadge availability={availability} showWaitlist />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm font-medium text-water-700">
        <span aria-hidden>🗓️</span>
        <span>{formatSessionDate(sessionDate)}</span>
        <span className="text-slate-300">·</span>
        <span aria-hidden>⏰</span>
        <span>{formatTimeRange(startTime, endTime)}</span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={`/classes/${id}`}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl bg-water-500 px-5 text-base font-semibold text-white shadow-water transition-colors hover:bg-water-600 active:bg-water-700"
        >
          {isFull ? "강습 정보 보기" : "예약하기"}
        </Link>
        {isFull && (
          <Link
            href={`/classes/${id}/waitlist`}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl border border-water-300 bg-white/70 px-5 text-base font-semibold text-water-700 transition-colors hover:bg-water-50 active:bg-water-100"
          >
            대기 등록
          </Link>
        )}
      </div>
    </Card>
  );
}
