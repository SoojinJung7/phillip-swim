import type { Metadata } from "next";
import { PageHeader, EmptyState } from "@/components/ui";
import { listUpcomingClasses, getAvailability } from "@/lib/data";
import { ClassCard } from "@/components/booking/ClassCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "강습 예약 · 필립 수영",
  description: "예정된 수영 강습을 둘러보고 원하는 시간에 예약하세요.",
};

export default async function ClassesPage() {
  const classes = await listUpcomingClasses();
  const withAvailability = await Promise.all(
    classes.map(async (swimClass) => ({
      swimClass,
      availability: await getAvailability(swimClass.id),
    }))
  );

  const openCount = withAvailability.filter((c) => !c.availability.isFull).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="강습 예약"
        description={
          classes.length > 0
            ? `예정된 강습 ${classes.length}개 · 예약 가능 ${openCount}개`
            : "예정된 강습을 둘러보세요."
        }
      />

      {withAvailability.length === 0 ? (
        <EmptyState
          icon="🏊"
          title="아직 예정된 강습이 없어요"
          description="새로운 강습이 열리면 이곳에서 바로 예약할 수 있어요. 조금만 기다려 주세요."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {withAvailability.map(({ swimClass, availability }) => (
            <ClassCard
              key={swimClass.id}
              swimClass={swimClass}
              availability={availability}
            />
          ))}
        </div>
      )}
    </div>
  );
}
