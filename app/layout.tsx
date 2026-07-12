import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { SiteNav } from "@/components/layout/SiteNav";

export const metadata: Metadata = {
  title: "필립 수영 예약",
  description:
    "필립 수영 스튜디오의 수영 강습 예약과 대기 신청을 한 곳에서. 원하는 시간에 간편하게 예약하세요.",
};

export const viewport: Viewport = {
  themeColor: "#00a2f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <div className="flex min-h-screen flex-col">
          {/* 상단 네비게이션 셸 — 실제 링크는 Integration 에서 마무리 */}
          <header className="sticky top-0 z-30 border-b border-white/50 bg-white/70 backdrop-blur-md">
            <div className="container-app flex h-16 items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-extrabold"
              >
                <span aria-hidden className="text-2xl">
                  🏊
                </span>
                <span className="text-gradient-water">필립 수영</span>
              </Link>
              <SiteNav />
            </div>
          </header>

          <main className="container-app flex-1 py-6 sm:py-8">{children}</main>

          <footer className="border-t border-white/50 bg-white/50">
            <div className="container-app flex h-16 items-center justify-center text-xs text-slate-400">
              © {new Date().getFullYear()} 필립 수영 스튜디오
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
