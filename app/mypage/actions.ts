"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentMember, logout } from "@/lib/auth";
import { cancelReservation, getReservationsByMember } from "@/lib/data";
import { notifyReservationConfirmed } from "@/lib/notify";

function safeReturnTo(raw: string): string {
  if (!raw) return "/";
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/";
}

/** 로그아웃 후 지정 경로(기본 홈)로 이동 */
export async function logoutAction(formData: FormData): Promise<void> {
  await logout();
  const returnTo = safeReturnTo(String(formData.get("returnTo") ?? "/"));
  redirect(returnTo);
}

/** 예약 취소 후 마이페이지 갱신 (본인 예약만 취소 가능) */
export async function cancelReservationAction(
  formData: FormData
): Promise<void> {
  const id = String(formData.get("reservationId") ?? "").trim();
  if (!id) return;

  // 로그인 + 본인 소유 확인 (로그아웃 상태이거나 남의 예약이면 무시)
  const member = await getCurrentMember();
  if (!member) return;
  const mine = await getReservationsByMember(member.id);
  if (!mine.some((r) => r.id === id)) return;

  // 취소로 자리가 나면 대기 1번이 자동 예약전환됩니다. 전환되면 확정 알림톡 발송.
  const promoted = await cancelReservation(id);
  if (promoted) {
    await notifyReservationConfirmed(promoted);
  }
  revalidatePath("/mypage");
}
