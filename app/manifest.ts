import type { MetadataRoute } from "next";

// PWA 매니페스트 — 홈 화면에 "필립 수영"을 앱처럼 설치할 수 있게 해줍니다.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "필립 수영 예약",
    short_name: "필립 수영",
    description:
      "필립 수영 스튜디오의 수영 강습 예약과 대기 신청을 한 곳에서.",
    start_url: "/",
    display: "standalone",
    background_color: "#eff9ff",
    theme_color: "#00a2f0",
    lang: "ko",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
