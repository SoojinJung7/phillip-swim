"use client";

import * as React from "react";
import { Badge, Button, Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import { PositionBadge } from "./PositionBadge";
import { formatSessionDate, formatTimeRange } from "./format";
import type { MyWaitlistItem } from "@/app/waitlist/actions";
import { leaveWaitlistAction } from "@/app/waitlist/actions";

export interface WaitlistStatusCardProps {
  item: MyWaitlistItem;
  /** 취소 등 상태가 바뀐 뒤 목록을 새로고침하도록 알림 */
  onChanged: () => void;
}

export function WaitlistStatusCard({ item, onChanged }: WaitlistStatusCardProps) {
  const { entry, swimClass } = item;
  const [pending, startTransition] = React.useTransition();
  const [confirming, setConfirming] = React.useState(false);

  const isCalled = entry.status === "called";
  const isConverted = entry.status === "converted";

  function handleLeave() {
    startTransition(async () => {
      await leaveWaitlistAction(entry.id);
      setConfirming(false);
      onChanged();
    });
  }

  return (
    <Card
      className={cn(
        "overflow-hidden p-0",
        isCalled && "ring-2 ring-teal-400"
      )}
    >
      {/* 호출됨 배너 — 자리가 났을 때 가장 눈에 띄게 */}
      {isCalled && (
        <div className="bg-gradient-to-r from-teal-500 to-water-500 px-5 py-3 text-white">
          <p className="flex items-center gap-2 text-base font-extrabold">
            <span className="text-xl" aria-hidden>
              🏊
            </span>
            자리가 났어요! 지금 입장하세요
          </p>
          <p className="mt-0.5 text-xs text-white/90">
            잠시 후 다음 대기자에게 넘어갈 수 있어요. 서둘러 주세요!
          </p>
        </div>
      )}

      <div className="flex items-center gap-4 p-5">
        {/* 순번 / 상태 표시 */}
        {entry.status === "waiting" ? (
          <PositionBadge position={entry.position} size="md" />
        ) : (
          <div
            className={cn(
              "flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center rounded-full text-white shadow-water ring-4 ring-white/70",
              isCalled
                ? "bg-gradient-to-br from-teal-400 to-teal-600"
                : "bg-gradient-to-br from-slate-300 to-slate-400"
            )}
          >
            <span className="text-3xl" aria-hidden>
              {isCalled ? "🔔" : "✓"}
            </span>
          </div>
        )}

        {/* 강습 정보 */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            {isCalled ? (
              <Badge variant="success">지금 오세요!</Badge>
            ) : isConverted ? (
              <Badge variant="info">예약 완료</Badge>
            ) : (
              <Badge variant="warning">대기중</Badge>
            )}
            {swimClass && (
              <Badge variant="neutral">{swimClass.level}</Badge>
            )}
          </div>
          <h3 className="truncate text-lg font-bold text-water-900">
            {swimClass ? swimClass.title : "강습 정보를 불러올 수 없어요"}
          </h3>
          {swimClass && (
            <p className="mt-0.5 truncate text-sm text-slate-500">
              {formatSessionDate(swimClass.sessionDate)} ·{" "}
              {formatTimeRange(swimClass.startTime, swimClass.endTime)}
            </p>
          )}
          {swimClass && (
            <p className="mt-0.5 truncate text-xs text-slate-400">
              강사 {swimClass.instructor}
            </p>
          )}
          {entry.status === "waiting" && (
            <p className="mt-1 text-sm font-semibold text-water-600">
              현재 {entry.position}번째로 기다리는 중이에요
            </p>
          )}
        </div>
      </div>

      {/* 액션 (전환 완료 항목은 취소 버튼 숨김) */}
      {!isConverted && (
        <div className="border-t border-water-50 px-5 py-3">
          {confirming ? (
            <div className="flex items-center gap-2">
              <span className="mr-auto text-sm text-slate-600">
                대기를 취소할까요?
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirming(false)}
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
              size="sm"
              onClick={() => setConfirming(true)}
              disabled={pending}
            >
              대기 취소
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
