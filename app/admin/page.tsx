import Link from "next/link";
import { getCurrentMember } from "@/lib/auth";
import { listUpcomingClasses, getAvailability } from "@/lib/data";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
} from "@/components/ui";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { formatKoreanDate, formatTimeRange } from "@/components/admin/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const member = await getCurrentMember();
  if (!member?.isAdmin) return <AccessDenied />;

  const classes = await listUpcomingClasses();
  const availabilities = await Promise.all(
    classes.map((c) => getAvailability(c.id))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="관리자 콘솔"
        description="강습을 개설하고 예약·대기 명단을 관리하세요."
        action={
          <Link href="/admin/classes/new">
            <Button size="lg">+ 새 강습 개설</Button>
          </Link>
        }
      />

      {classes.length === 0 ? (
        <EmptyState
          icon="🏊"
          title="아직 개설된 강습이 없어요"
          description="첫 강습을 개설하고 회원들의 예약을 받아보세요."
          action={
            <Link href="/admin/classes/new">
              <Button>+ 새 강습 개설</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {classes.map((c, i) => {
            const a = availabilities[i];
            return (
              <Link key={c.id} href={`/admin/classes/${c.id}`} className="block">
                <Card interactive className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold text-water-900">
                        {c.title}
                      </h3>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {formatKoreanDate(c.sessionDate)} ·{" "}
                        {formatTimeRange(c.startTime, c.endTime)}
                      </p>
                    </div>
                    <Badge variant="default">{c.level}</Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-slate-500">강사 {c.instructor}</span>
                    <span
                      className={
                        a.isFull
                          ? "inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700"
                          : "inline-flex items-center gap-1 rounded-full bg-water-100 px-2.5 py-0.5 text-xs font-semibold text-water-700"
                      }
                    >
                      예약 {a.reservedCount}/{a.capacity}
                      {a.isFull ? " · 마감" : ` · ${a.remaining}자리 남음`}
                    </span>
                    {a.waitlistCount > 0 && (
                      <Badge variant="warning">대기 {a.waitlistCount}명</Badge>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-water-600">
                    명단 관리 →
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
