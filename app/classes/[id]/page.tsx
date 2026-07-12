import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, Badge } from "@/components/ui";
import { getClass, getAvailability } from "@/lib/data";
import { getCurrentMember } from "@/lib/auth";
import { AvailabilityBadge } from "@/components/booking/AvailabilityBadge";
import { ReservePanel } from "@/components/booking/ReservePanel";
import {
  formatSessionDate,
  relativeDayLabel,
  formatTimeRange,
  levelBadgeVariant,
} from "@/components/booking/format";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const swimClass = await getClass(params.id);
  if (!swimClass) return { title: "강습을 찾을 수 없어요 · 필립 수영" };
  return {
    title: `${swimClass.title} · 필립 수영`,
    description: swimClass.description,
  };
}

export default async function ClassDetailPage({ params }: PageProps) {
  const swimClass = await getClass(params.id);
  if (!swimClass) notFound();

  const [availability, member] = await Promise.all([
    getAvailability(swimClass.id),
    getCurrentMember(),
  ]);

  const { id, title, instructor, level, sessionDate, startTime, endTime, capacity, description } =
    swimClass;
  const relLabel = relativeDayLabel(sessionDate);

  const detailPath = `/classes/${id}`;
  const loginHref = `/login?returnTo=${encodeURIComponent(detailPath)}`;
  const waitlistHref = `/classes/${id}/waitlist`;

  const infoRows: { label: string; value: string; icon: string }[] = [
    { icon: "🗓️", label: "날짜", value: formatSessionDate(sessionDate) },
    {
      icon: "⏰",
      label: "시간",
      value: formatTimeRange(startTime, endTime),
    },
    { icon: "🧑‍🏫", label: "강사", value: instructor },
    { icon: "📊", label: "레벨", value: level },
    { icon: "👥", label: "정원", value: `${capacity}명` },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/classes"
        className="inline-flex items-center gap-1 text-sm font-semibold text-water-700 hover:text-water-800"
      >
        <span aria-hidden>←</span> 강습 목록
      </Link>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={levelBadgeVariant(level)}>{level}</Badge>
          {relLabel && <Badge variant="default">{relLabel}</Badge>}
          <AvailabilityBadge availability={availability} showWaitlist />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-water-900 sm:text-3xl">
          {title}
        </h1>
        <p className="text-sm text-slate-500">강사 {instructor}</p>
      </div>

      <Card>
        <dl className="divide-y divide-water-50">
          {infoRows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
            >
              <dt className="flex items-center gap-2 text-sm text-slate-500">
                <span aria-hidden>{row.icon}</span>
                {row.label}
              </dt>
              <dd className="text-sm font-semibold text-water-900">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      {description && (
        <Card>
          <h2 className="mb-2 text-base font-bold text-water-900">
            강습 소개
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">{description}</p>
        </Card>
      )}

      <ReservePanel
        classId={id}
        isFull={availability.isFull}
        remaining={availability.remaining}
        waitlistCount={availability.waitlistCount}
        isLoggedIn={Boolean(member)}
        memberName={member?.name}
        loginHref={loginHref}
        waitlistHref={waitlistHref}
      />
    </div>
  );
}
