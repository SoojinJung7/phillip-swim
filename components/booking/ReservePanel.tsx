"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Spinner } from "@/components/ui";

export interface ReservePanelProps {
  classId: string;
  /** 현재 마감 여부 (서버에서 계산한 초기값) */
  isFull: boolean;
  remaining: number;
  waitlistCount: number;
  /** 로그인 여부 */
  isLoggedIn: boolean;
  memberName?: string;
  /** 로그인 페이지로 이동할 때 돌아올 경로 포함 링크 */
  loginHref: string;
  /** 대기 등록 링크 */
  waitlistHref: string;
}

type Phase = "idle" | "submitting" | "success" | "error";
type ErrorKind = "full" | "duplicate" | "auth" | "network";

const ERROR_MESSAGE: Record<ErrorKind, string> = {
  full: "아쉽게도 방금 자리가 모두 찼어요. 대기 등록으로 순번을 잡아보세요.",
  duplicate: "이미 이 강습을 예약하셨어요. ‘내 예약’에서 확인할 수 있어요.",
  auth: "로그인이 필요해요. 로그인 후 다시 시도해 주세요.",
  network: "예약 처리 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.",
};

export function ReservePanel({
  classId,
  isFull,
  remaining,
  waitlistCount,
  isLoggedIn,
  memberName,
  loginHref,
  waitlistHref,
}: ReservePanelProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);

  async function handleReserve() {
    setPhase("submitting");
    setErrorKind(null);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId }),
      });
      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        setErrorKind("auth");
        setPhase("error");
        return;
      }
      if (data?.ok) {
        setPhase("success");
        // 목록/현황이 최신 상태로 반영되도록 갱신
        router.refresh();
        return;
      }
      const reason = data?.reason;
      setErrorKind(reason === "full" || reason === "duplicate" ? reason : "network");
      setPhase("error");
    } catch {
      setErrorKind("network");
      setPhase("error");
    }
  }

  // 1) 예약 성공 화면
  if (phase === "success") {
    return (
      <div className="rounded-3xl border border-teal-200 bg-teal-50/70 p-6 text-center">
        <div className="text-4xl" aria-hidden>
          🎉
        </div>
        <h3 className="mt-2 text-lg font-bold text-teal-800">예약 완료!</h3>
        <p className="mt-1 text-sm text-teal-700">
          {memberName ? `${memberName}님, ` : ""}자리가 확정되었어요. 강습 시간에
          맞춰 오시면 됩니다.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link href="/mypage" className="flex-1">
            <Button variant="secondary" fullWidth>
              내 예약 보기
            </Button>
          </Link>
          <Link href="/classes" className="flex-1">
            <Button variant="outline" fullWidth>
              다른 강습 보기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 2) 마감 → 대기 등록 유도
  if (isFull) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6">
        <h3 className="text-base font-bold text-rose-700">
          예약이 마감되었어요
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          지금은 빈자리가 없지만, 대기 등록을 해두면 취소 자리가 생겼을 때
          순서대로 연락드려요. 현재 대기 인원은 {waitlistCount}명이에요.
        </p>
        <Link href={waitlistHref} className="mt-4 block">
          <Button variant="primary" fullWidth size="lg">
            대기 등록하기
          </Button>
        </Link>
      </div>
    );
  }

  // 3) 비로그인 → 로그인 유도
  if (!isLoggedIn) {
    return (
      <div className="rounded-3xl border border-water-200 bg-water-50/60 p-6">
        <h3 className="text-base font-bold text-water-800">
          로그인하고 예약하기
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          이름과 전화번호만 입력하면 바로 예약할 수 있어요. 남은 자리는 지금
          {" "}
          {remaining}자리예요.
        </p>
        <Link href={loginHref} className="mt-4 block">
          <Button variant="primary" fullWidth size="lg">
            로그인하고 예약하기
          </Button>
        </Link>
      </div>
    );
  }

  // 4) 로그인 + 빈자리 있음 → 예약 CTA
  return (
    <div className="rounded-3xl border border-water-200 bg-white/80 p-6 shadow-water">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">남은 자리</p>
          <p className="text-2xl font-extrabold text-water-700">
            {remaining}
            <span className="ml-1 text-base font-semibold text-slate-400">
              자리
            </span>
          </p>
        </div>
        {memberName && (
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-water-700">{memberName}</span>
            님으로 예약
          </p>
        )}
      </div>

      {phase === "error" && errorKind && (
        <div
          role="alert"
          className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {ERROR_MESSAGE[errorKind]}
          {errorKind === "full" && (
            <Link
              href={waitlistHref}
              className="mt-1 block font-semibold text-water-700 underline"
            >
              대기 등록하러 가기 →
            </Link>
          )}
          {errorKind === "duplicate" && (
            <Link
              href="/mypage"
              className="mt-1 block font-semibold text-water-700 underline"
            >
              내 예약 보러 가기 →
            </Link>
          )}
          {errorKind === "auth" && (
            <Link
              href={loginHref}
              className="mt-1 block font-semibold text-water-700 underline"
            >
              로그인하러 가기 →
            </Link>
          )}
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        fullWidth
        className="mt-5"
        disabled={phase === "submitting"}
        onClick={handleReserve}
      >
        {phase === "submitting" ? (
          <>
            <Spinner size="sm" className="border-white/40 border-t-white" />
            예약 중…
          </>
        ) : (
          "이 강습 예약하기"
        )}
      </Button>
    </div>
  );
}
