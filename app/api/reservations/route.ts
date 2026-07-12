import { NextResponse } from "next/server";
import { getCurrentMember } from "@/lib/auth";
import { createReservation } from "@/lib/data";

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

  return NextResponse.json(result, { status: 200 });
}
