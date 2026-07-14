"use server";

// ===========================================================================
// 관리자 서버 액션 — 강습 생성/수정/삭제, 예약 취소, 대기자 호출
// 모든 액션은 관리자 권한을 재확인합니다(UI 게이트 + 서버 방어).
// ===========================================================================

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/auth";
import {
  createClass,
  updateClass,
  deleteClass,
  cancelReservation,
  callNextWaitlist,
} from "@/lib/data";
import { notifyWaitlistCalled, notifyReservationConfirmed } from "@/lib/notify";
import type { SwimClass, WaitlistEntry } from "@/lib/types";

export type ClassFormState = { error?: string };

/** 관리자 여부 확인. 아니면 관리자 페이지로 돌려보냅니다(게이트 화면 노출). */
async function assertAdmin() {
  const member = await getCurrentMember();
  if (!member?.isAdmin) redirect("/admin");
  return member;
}

/** 폼 데이터를 SwimClass 입력으로 파싱 + 검증 */
function parseClassInput(
  fd: FormData
): { ok: true; value: Omit<SwimClass, "id"> } | { ok: false; error: string } {
  const title = String(fd.get("title") ?? "").trim();
  const instructor = String(fd.get("instructor") ?? "").trim();
  const level = String(fd.get("level") ?? "").trim();
  const sessionDate = String(fd.get("sessionDate") ?? "").trim();
  const startTime = String(fd.get("startTime") ?? "").trim();
  const endTime = String(fd.get("endTime") ?? "").trim();
  const capacityRaw = String(fd.get("capacity") ?? "").trim();
  const description = String(fd.get("description") ?? "").trim();

  if (!title) return { ok: false, error: "강습 이름을 입력해 주세요." };
  if (!instructor) return { ok: false, error: "강사 이름을 입력해 주세요." };
  if (!level) return { ok: false, error: "난이도를 선택해 주세요." };
  if (!sessionDate) return { ok: false, error: "강습 날짜를 선택해 주세요." };
  if (!startTime) return { ok: false, error: "시작 시간을 입력해 주세요." };
  if (!endTime) return { ok: false, error: "종료 시간을 입력해 주세요." };
  if (endTime <= startTime)
    return { ok: false, error: "종료 시간은 시작 시간보다 늦어야 합니다." };

  const capacity = Number(capacityRaw);
  if (!Number.isInteger(capacity) || capacity < 1)
    return { ok: false, error: "정원은 1명 이상의 숫자로 입력해 주세요." };
  if (capacity > 200)
    return { ok: false, error: "정원이 너무 큽니다. 200명 이하로 입력해 주세요." };

  return {
    ok: true,
    value: {
      title,
      instructor,
      level,
      sessionDate,
      startTime,
      endTime,
      capacity,
      description,
    },
  };
}

/** 새 강습 개설 (useFormState 용 시그니처) */
export async function createClassAction(
  _prev: ClassFormState,
  fd: FormData
): Promise<ClassFormState> {
  await assertAdmin();
  const parsed = parseClassInput(fd);
  if (!parsed.ok) return { error: parsed.error };
  await createClass(parsed.value);
  revalidatePath("/admin");
  redirect("/admin");
}

/** 강습 수정 (id 를 bind 로 고정해 useFormState 시그니처로 사용) */
export async function updateClassAction(
  id: string,
  _prev: ClassFormState,
  fd: FormData
): Promise<ClassFormState> {
  await assertAdmin();
  const parsed = parseClassInput(fd);
  if (!parsed.ok) return { error: parsed.error };
  await updateClass(id, parsed.value);
  revalidatePath("/admin");
  revalidatePath(`/admin/classes/${id}`);
  redirect("/admin");
}

/** 강습 삭제 (form action 으로 사용, id 는 bind) */
export async function deleteClassAction(id: string): Promise<void> {
  await assertAdmin();
  await deleteClass(id);
  revalidatePath("/admin");
  redirect("/admin");
}

/** 예약 취소 (form action 으로 사용, classId/reservationId 는 bind) */
export async function cancelReservationAction(
  classId: string,
  reservationId: string
): Promise<void> {
  await assertAdmin();
  // 취소로 자리가 나면 대기 1번이 자동 예약전환됩니다. 전환되면 확정 알림톡 발송.
  const promoted = await cancelReservation(reservationId);
  if (promoted) {
    await notifyReservationConfirmed(promoted);
  }
  revalidatePath(`/admin/classes/${classId}`);
  revalidatePath("/admin");
}

/** 다음 대기자 호출 — 호출된 대기자 정보를 반환 */
export async function callNextAction(
  classId: string
): Promise<
  | { ok: true; entry: WaitlistEntry | null }
  | { ok: false; error: string }
> {
  const member = await getCurrentMember();
  if (!member?.isAdmin)
    return { ok: false, error: "관리자 권한이 필요합니다." };
  const entry = await callNextWaitlist(classId);
  // 대기자 호출 시 카카오 알림톡(best-effort). 미설정이면 조용히 생략됩니다.
  if (entry) {
    await notifyWaitlistCalled(entry);
  }
  revalidatePath(`/admin/classes/${classId}`);
  revalidatePath("/admin");
  return { ok: true, entry };
}
