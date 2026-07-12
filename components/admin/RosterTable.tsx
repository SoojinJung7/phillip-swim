import { Badge, EmptyState } from "@/components/ui";
import { CancelReservationButton } from "./CancelReservationButton";
import { formatPhone } from "./format";
import type { Reservation, WaitlistEntry } from "@/lib/types";

// ---------------------------------------------------------------------------
// 예약자 명단
// ---------------------------------------------------------------------------

interface ReservationRosterProps {
  reservations: Reservation[];
  /** reservationId -> 취소 서버 액션(bind 완료) */
  cancelActionFor: (reservationId: string) => () => Promise<void>;
}

export function ReservationRoster({
  reservations,
  cancelActionFor,
}: ReservationRosterProps) {
  if (reservations.length === 0) {
    return (
      <EmptyState
        icon="🪑"
        title="아직 예약자가 없어요"
        description="예약이 들어오면 이곳에 명단이 표시됩니다."
      />
    );
  }

  return (
    <ul className="divide-y divide-water-100 overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-water">
      {reservations.map((r, idx) => (
        <li
          key={r.id}
          className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-water-100 text-sm font-bold text-water-700">
              {idx + 1}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-water-900">
                {r.memberName}
              </p>
              <p className="truncate text-sm text-slate-500">
                {formatPhone(r.memberPhone)}
              </p>
            </div>
          </div>
          <CancelReservationButton
            action={cancelActionFor(r.id)}
            memberName={r.memberName}
          />
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// 대기자 명단
// ---------------------------------------------------------------------------

interface WaitlistRosterProps {
  waitlist: WaitlistEntry[];
}

export function WaitlistRoster({ waitlist }: WaitlistRosterProps) {
  if (waitlist.length === 0) {
    return (
      <EmptyState
        icon="🌊"
        title="대기자가 없어요"
        description="정원이 다 차면 회원들이 대기 신청을 할 수 있어요."
      />
    );
  }

  return (
    <ul className="divide-y divide-water-100 overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-water">
      {waitlist.map((w) => (
        <li
          key={w.id}
          className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700">
              {w.position}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-water-900">
                {w.memberName}
              </p>
              <p className="truncate text-sm text-slate-500">
                {formatPhone(w.memberPhone)}
              </p>
            </div>
          </div>
          {w.status === "called" ? (
            <Badge variant="success">호출됨</Badge>
          ) : (
            <Badge variant="info">대기중</Badge>
          )}
        </li>
      ))}
    </ul>
  );
}
