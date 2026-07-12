"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { AuthStatus } from "@/components/auth/AuthStatus";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "홈" },
  { href: "/classes", label: "강습" },
  { href: "/mypage", label: "내 예약·대기" },
  { href: "/admin", label: "관리자" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * 상단 내비게이션 (자기완결형).
 * - 데스크톱: 링크를 가로로 나열
 * - 모바일: 햄버거 버튼으로 펼치는 메뉴
 * 로그인 상태 표시기(AuthStatus)를 함께 포함합니다.
 */
export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // 경로가 바뀌면 모바일 메뉴 닫기
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="flex items-center gap-2">
        {/* 데스크톱 링크 */}
        <nav
          aria-label="주요 메뉴"
          className="hidden items-center gap-1 text-sm font-semibold sm:flex"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={cn(
                "rounded-xl px-3 py-2 transition-colors",
                isActive(pathname, item.href)
                  ? "bg-water-50 text-water-800"
                  : "text-water-700 hover:bg-water-50"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <AuthStatus />

        {/* 모바일 햄버거 */}
        <button
          type="button"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-water-700 transition-colors hover:bg-water-50 sm:hidden"
        >
          <span aria-hidden className="text-xl leading-none">
            {open ? "✕" : "☰"}
          </span>
        </button>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {open && (
        <div className="absolute inset-x-0 top-full z-30 border-t border-white/50 bg-white/95 shadow-water backdrop-blur-md sm:hidden">
          <nav
            aria-label="모바일 메뉴"
            className="container-app flex flex-col gap-1 py-3 text-sm font-semibold"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  isActive(pathname, item.href) ? "page" : undefined
                }
                className={cn(
                  "rounded-xl px-3 py-2.5 transition-colors",
                  isActive(pathname, item.href)
                    ? "bg-water-50 text-water-800"
                    : "text-water-700 hover:bg-water-50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
