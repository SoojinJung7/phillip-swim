import { Badge } from "@/components/ui";
import type { ClassAvailability } from "@/lib/types";

export interface AvailabilityBadgeProps {
  availability: ClassAvailability;
  /** true 면 대기 인원까지 함께 노출 */
  showWaitlist?: boolean;
}

/** 남은 자리 상태를 색으로 구분해 보여주는 배지 */
export function AvailabilityBadge({
  availability,
  showWaitlist = false,
}: AvailabilityBadgeProps) {
  const { remaining, isFull, waitlistCount } = availability;

  if (isFull) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <Badge variant="danger">예약 마감</Badge>
        {showWaitlist && waitlistCount > 0 && (
          <Badge variant="neutral">대기 {waitlistCount}명</Badge>
        )}
      </span>
    );
  }

  // 잔여 자리가 적으면 강조
  const variant = remaining <= 2 ? "warning" : "success";
  const label = remaining <= 2 ? `마감 임박 · ${remaining}자리` : `${remaining}자리 남음`;

  return <Badge variant={variant}>{label}</Badge>;
}
