"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MeInfo {
  name: string;
  isAdmin: boolean;
}

/**
 * 로그인 상태 표시기 (네비게이션용, 자기완결형).
 * - 로그인 전: "로그인" 링크
 * - 로그인 후: 회원 이름 + /mypage 링크
 *
 * /api/me 로 현재 로그인 상태를 조회합니다.
 * pathname 이 바뀔 때마다 다시 조회해 로그인/로그아웃 직후에도 최신 상태를 반영합니다.
 */
export function AuthStatus() {
  const pathname = usePathname();
  const [member, setMember] = React.useState<MeInfo | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    fetch("/api/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { member: null }))
      .then((data: { member: MeInfo | null }) => {
        if (active) {
          setMember(data.member);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [pathname]);

  // 첫 로딩 전에는 레이아웃이 튀지 않도록 자리만 잡아둠
  if (!loaded) {
    return (
      <span
        aria-hidden
        className="h-8 w-16 rounded-full bg-water-100/60"
      />
    );
  }

  if (!member) {
    return (
      <Link
        href="/login"
        className="inline-flex h-9 items-center rounded-xl px-3 font-semibold text-water-700 transition-colors hover:bg-water-50"
      >
        로그인
      </Link>
    );
  }

  return (
    <Link
      href="/mypage"
      className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-water-50 px-3 font-semibold text-water-800 transition-colors hover:bg-water-100"
    >
      <span aria-hidden>🏊</span>
      <span className="max-w-[7rem] truncate">{member.name}</span>
      {member.isAdmin && (
        <span className="rounded-full bg-water-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
          관리자
        </span>
      )}
    </Link>
  );
}
