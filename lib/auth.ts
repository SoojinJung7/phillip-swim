// ===========================================================================
// 필립 수영 예약 — 경량 세션/인증 (SHARED CONTRACT)
//
// - 이름 + 전화번호만으로 로그인/가입 (비밀번호 없음).
// - 쿠키에 회원 정보를 저장합니다. 외부 인증 제공자 불필요.
// - ADMIN_PHONE 환경변수와 전화번호가 일치하면 isAdmin=true.
//
// 기능 에이전트는 이 파일의 함수를 그대로 사용하세요. 재정의 금지.
// ===========================================================================

import { cookies } from "next/headers";
import type { Member } from "./types";
import {
  getSupabaseServerClient,
  isSupabaseConfigured,
} from "./supabase/server";

const COOKIE_NAME = "phillip_swim_member";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30일
const DEFAULT_ADMIN_PHONE = "010-0000-0000";

/** 전화번호에서 숫자만 남겨 비교용으로 정규화 */
function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

function isAdminPhone(phone: string): boolean {
  const adminPhone = process.env.ADMIN_PHONE || DEFAULT_ADMIN_PHONE;
  return normalizePhone(phone) === normalizePhone(adminPhone);
}

function makeMemberId(phone: string): string {
  return `member_${normalizePhone(phone)}`;
}

/**
 * 이름 + 전화번호로 로그인하거나 신규 가입합니다.
 * 결과 회원 정보를 쿠키에 저장합니다.
 */
export async function loginOrRegister(
  name: string,
  phone: string
): Promise<Member> {
  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();

  const member: Member = {
    id: makeMemberId(trimmedPhone),
    name: trimmedName,
    phone: trimmedPhone,
    isAdmin: isAdminPhone(trimmedPhone),
    createdAt: new Date().toISOString(),
  };

  // Supabase 사용 시 members 테이블에 upsert (best-effort)
  if (isSupabaseConfigured()) {
    try {
      const client = getSupabaseServerClient();
      if (client) {
        await client.from("members").upsert(
          {
            id: member.id,
            name: member.name,
            phone: member.phone,
            is_admin: member.isAdmin,
          },
          { onConflict: "id" }
        );
      }
    } catch {
      // DB 저장 실패해도 로그인 자체는 진행 (쿠키 기반)
    }
  }

  cookies().set(COOKIE_NAME, JSON.stringify(member), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return member;
}

/** 현재 로그인한 회원을 쿠키에서 읽어옵니다. 없으면 null. */
export async function getCurrentMember(): Promise<Member | null> {
  const raw = cookies().get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Member;
    if (!parsed || !parsed.id || !parsed.phone) return null;
    // 관리자 여부는 항상 최신 환경변수 기준으로 재계산
    parsed.isAdmin = isAdminPhone(parsed.phone);
    return parsed;
  } catch {
    return null;
  }
}

/** 로그아웃 — 쿠키 삭제 */
export async function logout(): Promise<void> {
  cookies().delete(COOKIE_NAME);
}
