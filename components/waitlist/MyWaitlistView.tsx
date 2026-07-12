"use client";

import * as React from "react";
import Link from "next/link";
import { Button, Card, EmptyState, Spinner } from "@/components/ui";
import type { Member } from "@/lib/types";
import { WaitlistStatusCard } from "./WaitlistStatusCard";
import { LoginForm } from "./LoginForm";
import type { MyWaitlistItem } from "@/app/waitlist/actions";
import { fetchMyWaitlist } from "@/app/waitlist/actions";

const POLL_MS = 5000;

export interface MyWaitlistViewProps {
  initialMember: Member | null;
  initialItems: MyWaitlistItem[];
}

export function MyWaitlistView({
  initialMember,
  initialItems,
}: MyWaitlistViewProps) {
  const [member, setMember] = React.useState<Member | null>(initialMember);
  const [items, setItems] = React.useState<MyWaitlistItem[]>(initialItems);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loaded, setLoaded] = React.useState(initialMember !== null);

  const refresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetchMyWaitlist();
      setMember(res.member);
      setItems(res.items);
      setLoaded(true);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // 5초마다 순번을 새로고침해 실시간처럼 보이게 함
  React.useEffect(() => {
    if (!member) return;
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [member, refresh]);

  // 로그인 안 된 상태
  if (!member) {
    return (
      <Card className="mx-auto max-w-md">
        <h2 className="mb-3 text-lg font-bold text-water-900">로그인이 필요해요</h2>
        <LoginForm
          hint="내 대기 현황을 보려면 이름과 휴대폰 번호로 확인해 주세요."
          onSuccess={() => {
            void refresh();
          }}
        />
      </Card>
    );
  }

  const activeCount = items.filter(
    (i) => i.entry.status === "waiting" || i.entry.status === "called"
  ).length;

  return (
    <div className="space-y-4">
      {/* 실시간 갱신 안내 */}
      <div className="flex items-center justify-between rounded-2xl bg-water-50/80 px-4 py-2.5 text-sm">
        <span className="flex items-center gap-2 font-medium text-water-700">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal-500" />
          </span>
          실시간으로 순번을 확인하고 있어요
        </span>
        {refreshing && <Spinner size="sm" />}
      </div>

      {loaded && items.length === 0 ? (
        <EmptyState
          icon="🏊"
          title="신청한 대기가 없어요"
          description="정원이 찬 강습에서 대기를 걸어두면 자리가 났을 때 알려드려요."
          action={
            <Link href="/classes">
              <Button>강습 둘러보기</Button>
            </Link>
          }
        />
      ) : (
        <>
          {activeCount > 0 && (
            <p className="px-1 text-sm text-slate-500">
              현재 <span className="font-bold text-water-700">{activeCount}건</span>{" "}
              대기 중이에요.
            </p>
          )}
          <div className="space-y-3">
            {items.map((item) => (
              <WaitlistStatusCard
                key={item.entry.id}
                item={item}
                onChanged={() => void refresh()}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
