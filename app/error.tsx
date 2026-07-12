"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

// 예기치 못한 오류 발생 시 빈 화면 대신 보여줄 안내 + 다시 시도
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 실제 서비스에서는 여기서 오류 로깅(Sentry 등)을 연동할 수 있어요.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 text-center">
      <div className="text-5xl" aria-hidden>
        🌊
      </div>
      <div>
        <h1 className="text-xl font-bold text-water-900">
          앗, 문제가 생겼어요
        </h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          잠시 후 다시 시도해 주세요. 문제가 계속되면 스튜디오로 문의해 주세요.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => reset()}>다시 시도</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          홈으로
        </Button>
      </div>
    </div>
  );
}
