import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardContent,
  EmptyState,
  PageHeader,
} from "@/components/ui";
import { getCurrentMember } from "@/lib/auth";
import { getReservationsByMember, getClass } from "@/lib/data";
import type { Reservation, SwimClass } from "@/lib/types";
import { logoutAction } from "@/app/mypage/actions";
import { CancelReservationButton } from "@/components/auth/CancelReservationButton";

export const dynamic = "force-dynamic";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** YYYY-MM-DD → "7월 14일 (월)" */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return `${m}월 ${d}일 (${WEEKDAYS[date.getDay()]})`;
}

export default async function MyPage() {
  const member = await getCurrentMember();

  // 로그인하지 않은 경우 안내
  if (!member) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <PageHeader title="내 예약·대기" />
        <EmptyState
          icon="🔐"
          title="로그인이 필요해요"
          description="이름과 휴대폰 번호만 입력하면 바로 내 예약과 대기 순번을 볼 수 있어요."
          action={
            <Link href="/login?returnTo=/mypage">
              <Button>로그인하러 가기</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const reservations = await getReservationsByMember(member.id);
  const confirmed = reservations.filter((r) => r.status === "confirmed");

  // 예약에 연결된 강습 정보 불러오기
  const classMap = new Map<string, SwimClass | null>();
  await Promise.all(
    confirmed.map(async (r) => {
      if (!classMap.has(r.classId)) {
        classMap.set(r.classId, await getClass(r.classId));
      }
    })
  );

  // 다가오는 순으로 정렬 (강습 정보 없으면 뒤로)
  const sorted = [...confirmed].sort((a, b) => {
    const ca = classMap.get(a.classId);
    const cb = classMap.get(b.classId);
    if (!ca) return 1;
    if (!cb) return -1;
    if (ca.sessionDate !== cb.sessionDate) {
      return ca.sessionDate < cb.sessionDate ? -1 : 1;
    }
    return ca.startTime < cb.startTime ? -1 : 1;
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="내 예약·대기"
        description="예약 현황을 확인하고 관리해요."
      />

      {/* 회원 정보 */}
      <Card>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-water-400 to-teal-400 text-2xl"
              aria-hidden
            >
              🏊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-water-900">
                  {member.name}
                </p>
                {member.isAdmin && <Badge variant="info">관리자</Badge>}
              </div>
              <p className="text-sm text-slate-500">{member.phone}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <input type="hidden" name="returnTo" value="/" />
            <Button type="submit" variant="ghost" size="sm">
              로그아웃
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 대기 현황 바로가기 */}
      <Link href="/waitlist" className="block">
        <Card interactive className="bg-water-50/70">
          <CardContent className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden>
                ⏳
              </span>
              <div>
                <p className="font-bold text-water-900">대기 현황 보기</p>
                <p className="text-sm text-slate-500">
                  내가 신청한 대기 순번을 확인해요.
                </p>
              </div>
            </div>
            <span className="text-water-400" aria-hidden>
              →
            </span>
          </CardContent>
        </Card>
      </Link>

      {/* 예약 목록 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-bold text-water-900">
            예약한 강습{" "}
            <span className="text-water-500">{sorted.length}</span>
          </h2>
          <Link
            href="/classes"
            className="text-sm font-semibold text-water-600 hover:text-water-700"
          >
            강습 더 보기
          </Link>
        </div>

        {sorted.length === 0 ? (
          <EmptyState
            icon="🗓️"
            title="아직 예약한 강습이 없어요"
            description="마음에 드는 수영 강습을 골라 예약해 보세요."
            action={
              <Link href="/classes">
                <Button>강습 둘러보기</Button>
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {sorted.map((r) => (
              <ReservationItem
                key={r.id}
                reservation={r}
                swimClass={classMap.get(r.classId) ?? null}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ReservationItem({
  reservation,
  swimClass,
}: {
  reservation: Reservation;
  swimClass: SwimClass | null;
}) {
  return (
    <li>
      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Badge variant="success">예약 확정</Badge>
              {swimClass && (
                <Badge variant="neutral">{swimClass.level}</Badge>
              )}
            </div>
            <p className="truncate text-base font-bold text-water-900">
              {swimClass ? swimClass.title : "삭제된 강습"}
            </p>
            {swimClass ? (
              <p className="mt-0.5 text-sm text-slate-500">
                {formatDate(swimClass.sessionDate)} · {swimClass.startTime}~
                {swimClass.endTime} · {swimClass.instructor} 강사
              </p>
            ) : (
              <p className="mt-0.5 text-sm text-slate-400">
                강습 정보가 더 이상 없어요.
              </p>
            )}
          </div>
          <div className="flex-shrink-0 self-end sm:self-center">
            <CancelReservationButton
              reservationId={reservation.id}
              classTitle={swimClass ? swimClass.title : "이 강습"}
            />
          </div>
        </CardContent>
      </Card>
    </li>
  );
}
