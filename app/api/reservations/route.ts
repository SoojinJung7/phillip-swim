import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/auth";
import { createReservation } from "@/lib/data";
import { notifyReservationConfirmed } from "@/lib/notify";

export const dynamic = "force-dynamic";

/**
 * 강습 예약 생성.
 * body: { classId: string }
 * 응답:
 *  - 401 { ok:false, reason:"auth" }        로그인 필요
 *  - 400 { ok:false, reason:"invalid" }     잘못된 요청
 *  - 200 { ok:true, reservation }           예약 성공
 *  - 200 { ok:false, reason:"full"|"duplicate" }  마감/중복
 */
export async function POST(request: Request) {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ ok: false, reason: "auth" }, { status: 401 });
  }

  let classId: unknown;
  try {
    const body = await request.json();
    classId = body?.classId;
  } catch {
    classId = undefined;
  }

  if (typeof classId !== "string" || classId.length === 0) {
    return NextResponse.json(
      { ok: false, reason: "invalid" },
      { status: 400 }
    );
  }

  const result = await createReservation(classId, {
    id: member.id,
    name: member.name,
    phone: member.phone,
  });

  // 예약 확정 시 카카오 알림톡(best-effort). 미설정이면 조용히 생략됩니다.
  if (result.ok) {
    await notifyReservationConfirmed(result.reservation);
  }

  return NextResponse.json(result, { status: 200 });
}
