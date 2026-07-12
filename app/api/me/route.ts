import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * 현재 로그인한 회원의 공개 가능한 최소 정보만 반환합니다.
 * (AuthStatus 같은 클라이언트 컴포넌트가 로그인 상태를 표시하는 데 사용)
 */
export async function GET() {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ member: null });
  }
  return NextResponse.json({
    member: {
      name: member.name,
      isAdmin: member.isAdmin,
    },
  });
}
