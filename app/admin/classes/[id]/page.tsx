import Link from "next/link";
import { getCurrentMember } from "@/lib/auth";
import {
  getClass,
  getAvailability,
  listReservations,
  listWaitlist,
} from "@/lib/data";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
} from "@/components/ui";
import { AccessDenied } from "@/components/admin/AccessDenied";
import {
  ReservationRoster,
  WaitlistRoster,
} from "@/components/admin/RosterTable";
import { CallNextButton } from "@/components/admin/CallNextButton";
import { formatKoreanDate, formatTimeRange } from "@/components/admin/format";
import { cancelReservationAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function ClassRosterPage({
  params,
}: {
  params: { id: string };
}) {
  const member = await getCurrentMember();
  if (!member?.isAdmin) return <AccessDenied />;

  const cls = await getClass(params.id);
  if (!cls) {
    return (
      <div className="py-6">
        <EmptyState
          icon="🔍"
          title="강습을 찾을 수 없어요"
          description="이미 삭제되었거나 잘못된 주소일 수 있습니다."
          action={
            <Link href="/admin">
              <Button>관리자 콘솔로</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const [availability, allReservations, waitlist] = await Promise.all([
    getAvailability(cls.id),
    listReservations(cls.id),
    listWaitlist(cls.id),
  ]);

  const confirmed = allReservations.filter((r) => r.status === "confirmed");
  const waitingCount = waitlist.filter((w) => w.status === "waiting").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={cls.title}
        description={`${formatKoreanDate(cls.sessionDate)} · ${formatTimeRange(
          cls.startTime,
          cls.endTime
        )} · 강사 ${cls.instructor}`}
        action={
          <Link href={`/admin/classes/${cls.id}/edit`}>
            <Button variant="outline">강습 수정</Button>
          </Link>
        }
      />

      {/* 현황 요약 */}
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-400">예약</p>
            <p className="text-2xl font-extrabold text-water-900">
              {availability.reservedCount}
              <span className="text-base font-bold text-slate-400">
                {" "}
                / {availability.capacity}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">남은 자리</p>
            <p className="text-2xl font-extrabold text-water-900">
              {availability.remaining}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">대기</p>
            <p className="text-2xl font-extrabold text-water-900">
              {availability.waitlistCount}
            </p>
          </div>
        </div>
        {availability.isFull ? (
          <Badge variant="danger">정원 마감</Badge>
        ) : (
          <Badge variant="success">예약 가능</Badge>
        )}
      </Card>

      {/* 다음 대기자 호출 */}
      <Card className="space-y-3 bg-gradient-to-br from-teal-50 to-water-50">
        <div>
          <h2 className="text-lg font-bold text-water-900">대기자 호출</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            자리가 나면 대기 순번 1번 회원을 호출하세요. 호출한 회원 연락처가
            표시됩니다.
          </p>
        </div>
        <CallNextButton classId={cls.id} waitingCount={waitingCount} />
      </Card>

      {/* 예약자 명단 */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-water-900">예약자 명단</h2>
          <Badge variant="default">{confirmed.length}명</Badge>
        </div>
        <ReservationRoster
          reservations={confirmed}
          cancelActionFor={(reservationId) =>
            cancelReservationAction.bind(null, cls.id, reservationId)
          }
        />
      </section>

      {/* 대기자 명단 */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-water-900">대기자 명단</h2>
          <Badge variant="info">{waitlist.length}명</Badge>
        </div>
        <WaitlistRoster waitlist={waitlist} />
      </section>

      <p className="text-center text-sm text-slate-400">
        <Link href="/admin" className="font-semibold text-water-600">
          ← 관리자 콘솔로 돌아가기
        </Link>
      </p>
    </div>
  );
}
