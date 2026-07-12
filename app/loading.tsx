import { Spinner } from "@/components/ui";

// 라우트 전환/데이터 로딩 중 빈 화면 대신 보여줄 기본 로딩 UI
export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <Spinner size="lg" />
      <p className="text-sm font-medium text-water-700">불러오는 중…</p>
    </div>
  );
}
