import Link from "next/link";
import { Button } from "@/components/ui";
import { listUpcomingClasses, getAvailability } from "@/lib/data";
import { ClassCard } from "@/components/booking/ClassCard";

export const dynamic = "force-dynamic";

/** 홈에 미리 보여줄 강습 개수 */
const PREVIEW_COUNT = 3;

export default async function HomePage() {
  const classes = await listUpcomingClasses();
  const preview = classes.slice(0, PREVIEW_COUNT);
  const withAvailability = await Promise.all(
    preview.map(async (swimClass) => ({
      swimClass,
      availability: await getAvailability(swimClass.id),
    }))
  );

  return (
    <div className="space-y-10">
      {/* 히어로 */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-water-500 to-teal-500 p-8 text-white shadow-water sm:p-10">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-10 text-[10rem] opacity-15"
        >
          🌊
        </span>
        <p className="text-sm font-semibold opacity-90">필립 수영 스튜디오</p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
          물살을 가르는 하루,
          <br />
          예약은 간편하게 🏊
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
          원하는 수영 강습을 고르고 이름·전화번호만으로 바로 예약하세요. 자리가
          다 찼다면 대기 신청으로 순번을 잡아 취소 자리가 났을 때 가장 먼저
          연락받을 수 있어요.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/classes" className="sm:flex-initial">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              className="bg-white text-water-700 hover:bg-white/90 active:bg-white/80"
            >
              강습 둘러보기
            </Button>
          </Link>
          <Link href="/mypage" className="sm:flex-initial">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              className="border-white/60 bg-white/10 text-white hover:bg-white/20 active:bg-white/25"
            >
              내 예약·대기
            </Button>
          </Link>
        </div>
      </section>

      {/* 이용 안내: 예약하기 / 대기 걸기 */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-water backdrop-blur-sm">
          <div className="text-3xl" aria-hidden>
            📅
          </div>
          <h2 className="mt-3 text-lg font-bold text-water-900">예약하기</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            강습마다 정원이 정해져 있어요. 빈자리가 있으면 바로 예약이 확정되고,
            <span className="font-semibold text-water-700"> 내 예약</span>에서
            언제든 확인·취소할 수 있어요.
          </p>
        </div>
        <div className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-water backdrop-blur-sm">
          <div className="text-3xl" aria-hidden>
            ⏳
          </div>
          <h2 className="mt-3 text-lg font-bold text-water-900">대기 걸기</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            자리가 다 찼어도 걱정 마세요. 대기 신청을 하면 내 순번이 몇 번째인지
            보이고, 취소 자리가 나면
            <span className="font-semibold text-water-700"> 순서대로 호출</span>
            해 드려요.
          </p>
        </div>
      </section>

      {/* 다가오는 강습 미리보기 */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-water-900">
              다가오는 강습
            </h2>
            <p className="text-sm text-slate-500">
              가까운 날짜의 강습부터 보여드려요.
            </p>
          </div>
          <Link
            href="/classes"
            className="flex-shrink-0 text-sm font-semibold text-water-700 hover:underline"
          >
            전체 보기 →
          </Link>
        </div>

        {withAvailability.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-water-200 bg-white/60 px-6 py-12 text-center">
            <div className="mb-3 text-4xl" aria-hidden>
              🏊
            </div>
            <h3 className="text-lg font-bold text-water-900">
              아직 예정된 강습이 없어요
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              새로운 강습이 열리면 이곳에서 바로 예약할 수 있어요.
            </p>
          </div>
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

        {classes.length > PREVIEW_COUNT && (
          <div className="pt-2 text-center">
            <Link href="/classes">
              <Button variant="outline" size="lg">
                강습 {classes.length}개 모두 보기
              </Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
