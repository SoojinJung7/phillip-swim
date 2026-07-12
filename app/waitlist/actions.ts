"use server";

// ===========================================================================
// 대기(웨이팅) 기능 전용 서버 액션
// - 클라이언트 컴포넌트에서 직접 호출합니다 (폴링/버튼).
// - 공유 계약(lib/*)의 함수만 사용하고 재정의하지 않습니다.
// ===========================================================================

import { getCurrentMember, loginOrRegister } from "@/lib/auth";
import {
  getAvailability,
  getClass,
  getWaitlistByMember,
  joinWaitlist,
  leaveWaitlist,
  listWaitlist,
} from "@/lib/data";
import type {
  ClassAvailability,
  Member,
  SwimClass,
  WaitlistEntry,
} from "@/lib/types";

/** "내 대기 현황" 한 줄 — 대기 항목 + 해당 강습 정보 */
export interface MyWaitlistItem {
  entry: WaitlistEntry;
  swimClass: SwimClass | null;
}

/** 특정 강습의 대기 화면 상태 스냅샷 */
export interface ClassWaitlistState {
  member: Member | null;
  swimClass: SwimClass | null;
  availability: ClassAvailability | null;
  /** 로그인 회원의 이 강습 대기 항목 (없으면 null) */
  myEntry: WaitlistEntry | null;
  /** 현재 대기 인원 수 (waiting + called) */
  waitlistCount: number;
}

/** 이름 + 전화번호로 로그인/가입 */
export async function loginAction(
  name: string,
  phone: string
): Promise<{ ok: true; member: Member } | { ok: false; error: string }> {
  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();
  if (!trimmedName) return { ok: false, error: "이름을 입력해 주세요." };
  const digits = trimmedPhone.replace(/[^0-9]/g, "");
  if (digits.length < 10) {
    return { ok: false, error: "휴대폰 번호를 정확히 입력해 주세요." };
  }
  const member = await loginOrRegister(trimmedName, trimmedPhone);
  return { ok: true, member };
}

/** 대기열 등록 */
export async function joinWaitlistAction(
  classId: string
): Promise<
  | { ok: true; entry: WaitlistEntry }
  | { ok: false; reason: "duplicate" | "notFull" | "auth" }
> {
  const member = await getCurrentMember();
  if (!member) return { ok: false, reason: "auth" };
  return joinWaitlist(classId, {
    id: member.id,
    name: member.name,
    phone: member.phone,
  });
}

/** 대기 취소 (남은 순번 자동 재정렬은 lib/data 가 처리, 본인 항목만 취소 가능) */
export async function leaveWaitlistAction(
  entryId: string
): Promise<{ ok: true } | { ok: false; reason: "auth" | "forbidden" }> {
  const member = await getCurrentMember();
  if (!member) return { ok: false, reason: "auth" };

  // 본인 소유 대기 항목인지 확인 (남의 항목 취소·순번 조작 방지)
  const mine = await getWaitlistByMember(member.id);
  if (!mine.some((w) => w.id === entryId)) {
    return { ok: false, reason: "forbidden" };
  }

  await leaveWaitlist(entryId);
  return { ok: true };
}

/** 특정 강습의 대기 화면 상태를 최신으로 조회 (폴링용) */
export async function fetchClassWaitlistState(
  classId: string
): Promise<ClassWaitlistState> {
  const [member, swimClass, availability, waitlist] = await Promise.all([
    getCurrentMember(),
    getClass(classId),
    getAvailability(classId),
    listWaitlist(classId),
  ]);

  const myEntry = member
    ? waitlist.find(
        (w) =>
          w.memberId === member.id &&
          (w.status === "waiting" || w.status === "called")
      ) ?? null
    : null;

  return {
    member,
    swimClass,
    availability,
    myEntry,
    waitlistCount: waitlist.length,
  };
}

/** 로그인 회원의 전체 대기 현황 조회 (폴링용) */
export async function fetchMyWaitlist(): Promise<{
  member: Member | null;
  items: MyWaitlistItem[];
}> {
  const member = await getCurrentMember();
  if (!member) return { member: null, items: [] };

  const entries = await getWaitlistByMember(member.id);
  // 대기중/호출됨/전환완료만 노출 (취소된 항목은 숨김)
  const visible = entries.filter((e) => e.status !== "left");

  const items = await Promise.all(
    visible.map(async (entry) => ({
      entry,
      swimClass: await getClass(entry.classId),
    }))
  );

  // 활성(대기중/호출됨) 항목을 위로, 그 안에서는 순번 오름차순
  const rank = (e: WaitlistEntry) =>
    e.status === "called" ? 0 : e.status === "waiting" ? 1 : 2;
  items.sort((a, b) => {
    const ra = rank(a.entry);
    const rb = rank(b.entry);
    if (ra !== rb) return ra - rb;
    return a.entry.position - b.entry.position;
  });

  return { member, items };
}
