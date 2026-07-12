"use client";

import * as React from "react";
import Link from "next/link";
import { Badge, Button, Card, Spinner } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Member } from "@/lib/types";
import { PositionBadge } from "./PositionBadge";
import { LoginForm } from "./LoginForm";
import type { ClassWaitlistState } from "@/app/waitlist/actions";
import {
  fetchClassWaitlistState,
  joinWaitlistAction,
  leaveWaitlistAction,
} from "@/app/waitlist/actions";

const POLL_MS = 5000;

export interface JoinWaitlistPanelProps {
  classId: string;
  initial: ClassWaitlistState;
}

export function JoinWaitlistPanel({ classId, initial }: JoinWaitlistPanelProps) {
  const [state, setState] = React.useState<ClassWaitlistState>(initial);
  const [refreshing, setRefreshing] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [notice, setNotice] = React.useState<string | null>(null);
  const [confirmingLeave, setConfirmingLeave] = React.useState(false);

  const refresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const next = await fetchClassWaitlistState(classId);
      setState(next);
    } finally {
      setRefreshing(false);
    }
  }, [classId]);

  // 로그인 상태에서만 실시간 폴링 (순번 변화 반영)
  React.useEffect(() => {
    if (!state.member) return;
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [state.member, refresh]);

  const { member, availability, myEntry, waitlistCount } = state;

  function handleJoin() {
    setNotice(null);
    startTransition(async () => {
      const res = await joinWaitlistAction(classId);
      if (res.ok) {
        await refresh();
      } else if (res.reason === "duplicate") {
        setNotice("이미 이 강습의 대기자 명단에 있어요.");
        await refresh();
      } else if (res.reason === "notFull") {
        setNotice("지금은 자리가 남아 있어요! 대기 없이 바로 예약할 수 있어요.");
        await refresh();
      } else if (res.reason === "auth") {
        setNotice("로그인이 필요해요.");
        await refresh();
      }
    });
  }

  function handleLeave() {
    if (!myEntry) return;
    startTransition(async () => {
      await leaveWaitlistAction(myEntry.id);
      setConfirmingLeave(false);
      await refresh();
    });
  }

  // 1) 로그인 안 됨
  if (!member) {
    return (
      <Card>
        <h2 className="mb-3 text-lg font-bold text-water-900">
          대기 신청하려면 로그인해 주세요
        </h2>
        <LoginForm
          hint="이름과 휴대폰 번호만 입력하면 대기 순번을 잡아드려요."
          onSuccess={() => {
            void refresh();
          }}
        />
      </Card>
    );
  }

  // 2) 이미 대기 중 — 순번 / 호출 상태 표시
  if (myEntry) {
    const isCalled = myEntry.status === "called";
    return (
      <Card className={cn("p-0 overflow-hidden", isCalled && "ring-2 ring-teal-400")}>
        {isCalled ? (
          <div className="bg-gradient-to-r from-teal-500 to-water-500 px-6 py-5 text-center text-white">
            <p className="text-3xl" aria-hidden>
              🏊
            </p>
            <p className="mt-1 text-xl font-extrabold">자리가 났어요!</p>
            <p className="text-sm text-white/90">지금 입장하세요</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 pt-7 pb-2 text-center">
            <PositionBadge position={myEntry.position} size="lg" />
            <div>
              <p className="text-lg font-extrabold text-water-900">
                현재 {myEntry.position}번째 대기 중
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                앞선 대기자가 취소하거나 자리가 나면 순번이 올라가요.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 text-sm font-medium text-water-700">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-500" />
            </span>
            실시간 업데이트 중
          </span>
          {refreshing && <Spinner size="sm" />}
        </div>

        {notice && (
          <p className="mx-6 mb-3 rounded-xl bg-water-50 px-3 py-2 text-sm text-water-700">
            {notice}
          </p>
        )}

        <div className="border-t border-water-50 px-6 py-4">
          {confirmingLeave ? (
            <div className="flex items-center gap-2">
              <span className="mr-auto text-sm text-slate-600">
                대기를 취소할까요?
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingLeave(false)}
                disabled={pending}
              >
                아니요
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleLeave}
                disabled={pending}
              >
                {pending ? "취소 중…" : "네, 취소할게요"}
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              fullWidth
              onClick={() => setConfirmingLeave(true)}
              disabled={pending}
            >
              대기 취소하기
            </Button>
          )}
          <div className="mt-3 text-center">
            <Link
              href="/waitlist"
              className="text-sm font-semibold text-water-600 hover:underline"
            >
              내 대기 현황 전체 보기 →
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  // 3) 로그인은 했지만 아직 대기 신청 안 함
  const isFull = availability?.isFull ?? true;
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">현재 대기 인원</p>
          <p className="text-2xl font-extrabold text-water-900">
            {waitlistCount}명
          </p>
        </div>
        {isFull ? (
          <Badge variant="danger">정원 마감</Badge>
        ) : (
          <Badge variant="success">예약 가능</Badge>
        )}
      </div>

      <p className="text-sm text-slate-600">
        {isFull ? (
          <>
            지금 대기를 걸면{" "}
            <span className="font-bold text-water-700">
              {waitlistCount + 1}번째
            </span>{" "}
            순번을 받아요. 자리가 나면 바로 알려드릴게요.
          </>
        ) : (
          <>이 강습은 아직 자리가 남아 있어요. 대기 없이 바로 예약할 수 있어요.</>
        )}
      </p>

      {notice && (
        <p className="rounded-xl bg-water-50 px-3 py-2 text-sm text-water-700">
          {notice}
        </p>
      )}

      {isFull ? (
        <Button fullWidth size="lg" onClick={handleJoin} disabled={pending}>
          {pending ? "신청 중…" : "대기 신청하기"}
        </Button>
      ) : (
        <Link href={`/classes/${classId}`} className="block">
          <Button fullWidth size="lg" variant="secondary">
            예약 페이지로 가기
          </Button>
        </Link>
      )}
    </Card>
  );
}
