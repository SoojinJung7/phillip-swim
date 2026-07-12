import Link from "next/link";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import {
  formatSessionDate,
  formatTimeRange,
} from "@/components/waitlist/format";
import { JoinWaitlistPanel } from "@/components/waitlist/JoinWaitlistPanel";
import { fetchClassWaitlistState } from "@/app/waitlist/actions";

export const dynamic = "force-dynamic";

export default async function ClassWaitlistPage({
  params,
}: {
  params: { id: string };
}) {
  const state = await fetchClassWaitlistState(params.id);
  const { swimClass, availability, waitlistCount } = state;

  if (!swimClass) {
    return (
      <div className="space-y-6">
        <PageHeader title="대기 신청" />
        <EmptyState
          icon="🔍"
          title="강습을 찾을 수 없어요"
          description="이미 종료되었거나 삭제된 강습일 수 있어요."
          action={
            <Link
              href="/classes"
              className="text-sm font-semibold text-water-600 hover:underline"
            >
              강습 목록으로 돌아가기 →
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/classes/${swimClass.id}`}
          className="text-sm font-semibold text-water-600 hover:underline"
        >
          ← 강습 상세로
        </Link>
      </div>

      <PageHeader
        title="대기 신청"
        description="정원이 찬 강습의 자리가 나면 순번대로 알려드려요."
      />

      {/* 강습 요약 카드 */}
      <Card className="bg-gradient-to-br from-water-500 to-teal-500 text-white">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-semibold text-white">
            {swimClass.level}
          </span>
          {availability?.isFull ? (
            <span className="inline-flex items-center rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-semibold text-white">
              정원 마감
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-semibold text-white">
              여유 있음
            </span>
          )}
        </div>
        <h2 className="text-xl font-extrabold">{swimClass.title}</h2>
        <p className="mt-1 text-sm text-white/90">
          {formatSessionDate(swimClass.sessionDate)} ·{" "}
          {formatTimeRange(swimClass.startTime, swimClass.endTime)}
        </p>
        <p className="mt-0.5 text-sm text-white/80">
          강사 {swimClass.instructor}
        </p>

        <div className="mt-4 flex gap-3">
          <div className="flex-1 rounded-2xl bg-white/15 px-3 py-2 text-center backdrop-blur-sm">
            <p className="text-xs text-white/80">정원</p>
            <p className="text-lg font-extrabold">
              {availability?.capacity ?? swimClass.capacity}명
            </p>
          </div>
          <div className="flex-1 rounded-2xl bg-white/15 px-3 py-2 text-center backdrop-blur-sm">
            <p className="text-xs text-white/80">예약</p>
            <p className="text-lg font-extrabold">
              {availability?.reservedCount ?? 0}명
            </p>
          </div>
          <div className="flex-1 rounded-2xl bg-white/15 px-3 py-2 text-center backdrop-blur-sm">
            <p className="text-xs text-white/80">대기</p>
            <p className="text-lg font-extrabold">{waitlistCount}명</p>
          </div>
        </div>
      </Card>

      {/* 대기 신청 / 순번 패널 */}
      <JoinWaitlistPanel classId={swimClass.id} initial={state} />
    </div>
  );
}
