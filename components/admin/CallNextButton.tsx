"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { callNextAction } from "@/app/admin/actions";
import { formatPhone } from "./format";
import type { WaitlistEntry } from "@/lib/types";

interface CallNextButtonProps {
  classId: string;
  /** 현재 대기 중(waiting)인 인원 수 — 0 이면 버튼 비활성 */
  waitingCount: number;
}

type Result =
  | { kind: "called"; entry: WaitlistEntry }
  | { kind: "empty" }
  | { kind: "error"; message: string };

export function CallNextButton({ classId, waitingCount }: CallNextButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<Result | null>(null);

  function handleClick() {
    setResult(null);
    startTransition(async () => {
      const res = await callNextAction(classId);
      if (!res.ok) {
        setResult({ kind: "error", message: res.error });
        return;
      }
      if (!res.entry) {
        setResult({ kind: "empty" });
      } else {
        setResult({ kind: "called", entry: res.entry });
      }
      router.refresh();
    });
  }

  const disabled = pending || waitingCount === 0;

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="secondary"
        size="lg"
        fullWidth
        disabled={disabled}
        onClick={handleClick}
      >
        {pending
          ? "호출하는 중…"
          : waitingCount === 0
            ? "호출할 대기자가 없어요"
            : "📣 다음 대기자 호출하기"}
      </Button>

      {result?.kind === "called" && (
        <div className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
          <p className="font-bold">
            {result.entry.memberName} 님을 호출했어요! (대기 {result.entry.position}
            번)
          </p>
          <p className="mt-0.5 text-teal-700">
            연락처 {formatPhone(result.entry.memberPhone)} 로 예약 안내를 해주세요.
          </p>
        </div>
      )}
      {result?.kind === "empty" && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
          지금 대기 중인 사람이 없습니다.
        </div>
      )}
      {result?.kind === "error" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {result.message}
        </div>
      )}
    </div>
  );
}
