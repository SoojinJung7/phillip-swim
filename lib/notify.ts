// ===========================================================================
// 필립 수영 — 카카오 알림톡 발송 계층 (Solapi)
//
// 설계 원칙
//  - lib/data.ts 의 mock/Supabase 자동전환과 같은 철학:
//    환경변수가 없으면 "발송 생략"(로그만) 하고 절대 throw 하지 않습니다.
//    → 키를 넣기 전에도 예약/대기 기능은 그대로 동작합니다.
//  - 알림 발송은 항상 best-effort 입니다. 실패해도 예약·대기 처리를 막지 않습니다.
//
// 필요한 환경변수(모두 Solapi 콘솔에서 발급/확인, 서버 전용 — NEXT_PUBLIC_ 금지)
//  - SOLAPI_API_KEY                        API 키
//  - SOLAPI_API_SECRET                     API 시크릿
//  - SOLAPI_SENDER_PHONE                   등록된 발신번호 (예: 0212345678)
//  - SOLAPI_KAKAO_PFID                     카카오 발신프로필 ID (pfId)
//  - SOLAPI_TEMPLATE_WAITLIST_CALLED       "대기 자리 안내" 승인 템플릿 ID
//  - SOLAPI_TEMPLATE_RESERVATION_CONFIRMED "예약 확정 안내" 승인 템플릿 ID
//
// 템플릿 본문/변수와 등록 방법은 ALIMTALK.md 를 참고하세요.
// ===========================================================================

import crypto from "crypto";
import type { Reservation, WaitlistEntry, SwimClass } from "./types";
import { getClass } from "./data";

const SOLAPI_BASE = "https://api.solapi.com";

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

/** 알림톡을 실제로 보낼 수 있는 상태인지(공통 키가 모두 있는지) */
export function isAlimtalkConfigured(): boolean {
  return Boolean(
    env("SOLAPI_API_KEY") &&
      env("SOLAPI_API_SECRET") &&
      env("SOLAPI_SENDER_PHONE") &&
      env("SOLAPI_KAKAO_PFID")
  );
}

/** 전화번호에서 숫자만 남깁니다. "010-1234-5678" → "01012345678" */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Solapi HMAC-SHA256 인증 헤더를 만듭니다. */
function authHeader(apiKey: string, apiSecret: string): string {
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(32).toString("hex");
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(date + salt)
    .digest("hex");
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

interface AlimtalkParams {
  /** 받는 사람 전화번호(형식 자유, 내부에서 숫자만 추출) */
  to: string;
  /** Solapi에 등록된 승인 템플릿 ID */
  templateId: string;
  /** 템플릿 치환 변수. 키는 템플릿의 "#{변수}" 토큰과 정확히 일치해야 합니다. */
  variables: Record<string, string>;
  /** 알림톡 실패 시 SMS로 대체발송할 본문(있으면 대체발송 활성화) */
  fallbackText?: string;
}

/**
 * 알림톡 1건 발송. 미설정이거나 templateId가 없으면 조용히 생략합니다.
 * 반환값은 결과 요약일 뿐, 호출부는 결과에 의존하지 않아도 됩니다.
 */
export async function sendAlimtalk(
  params: AlimtalkParams
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  if (!isAlimtalkConfigured() || !params.templateId) {
    console.info("[notify] 알림톡 미설정/템플릿없음 — 발송 생략", {
      to: normalizePhone(params.to),
      templateId: params.templateId || "(none)",
    });
    return { ok: false, skipped: true };
  }

  const apiKey = env("SOLAPI_API_KEY")!;
  const apiSecret = env("SOLAPI_API_SECRET")!;
  const from = normalizePhone(env("SOLAPI_SENDER_PHONE")!);
  const pfId = env("SOLAPI_KAKAO_PFID")!;

  const body = {
    message: {
      to: normalizePhone(params.to),
      from,
      // 알림톡 실패 시 SMS 대체발송이 없으면 대체발송을 끕니다.
      ...(params.fallbackText ? { text: params.fallbackText } : {}),
      kakaoOptions: {
        pfId,
        templateId: params.templateId,
        variables: params.variables,
        disableSms: params.fallbackText ? false : true,
      },
    },
  };

  try {
    const res = await fetch(`${SOLAPI_BASE}/messages/v4/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader(apiKey, apiSecret),
      },
      body: JSON.stringify(body),
    });
    const json: unknown = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("[notify] 알림톡 발송 실패:", res.status, json);
      return { ok: false, error: `HTTP ${res.status}` };
    }
    console.info("[notify] 알림톡 발송 요청 완료:", {
      to: normalizePhone(params.to),
      templateId: params.templateId,
    });
    return { ok: true };
  } catch (err) {
    console.error("[notify] 알림톡 발송 예외:", err);
    return { ok: false, error: String(err) };
  }
}

/** "2026-07-15" + "07:00" → "7월 15일(화) 07:00" */
function formatWhen(cls: SwimClass): string {
  const parts = cls.sessionDate.split("-").map(Number);
  const m = parts[1];
  const d = parts[2];
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  let dow = "";
  try {
    const idx = new Date(`${cls.sessionDate}T00:00:00`).getDay();
    if (!Number.isNaN(idx)) dow = `(${dayNames[idx]})`;
  } catch {
    dow = "";
  }
  return `${m}월 ${d}일${dow} ${cls.startTime}`;
}

/**
 * 예약 확정 알림. 예약 성공 직후 호출하세요.
 * 실패해도 예외를 던지지 않습니다(예약 처리에 영향 없음).
 */
export async function notifyReservationConfirmed(
  reservation: Reservation
): Promise<void> {
  try {
    const cls = await getClass(reservation.classId);
    if (!cls) return;
    const when = formatWhen(cls);
    await sendAlimtalk({
      to: reservation.memberPhone,
      templateId: env("SOLAPI_TEMPLATE_RESERVATION_CONFIRMED") ?? "",
      variables: {
        "#{이름}": reservation.memberName,
        "#{강습명}": cls.title,
        "#{일시}": when,
      },
      fallbackText: `[필립 수영] ${reservation.memberName}님, '${cls.title}' ${when} 예약이 확정되었습니다. 시간에 맞춰 방문해 주세요.`,
    });
  } catch (err) {
    console.error("[notify] 예약확정 알림 처리 실패:", err);
  }
}

/**
 * 대기 자리 안내 알림. 운영자가 "다음 대기자 호출"로 대기자를 호출한 직후 호출하세요.
 * 실패해도 예외를 던지지 않습니다(호출 처리에 영향 없음).
 */
export async function notifyWaitlistCalled(
  entry: WaitlistEntry
): Promise<void> {
  try {
    const cls = await getClass(entry.classId);
    if (!cls) return;
    const when = formatWhen(cls);
    await sendAlimtalk({
      to: entry.memberPhone,
      templateId: env("SOLAPI_TEMPLATE_WAITLIST_CALLED") ?? "",
      variables: {
        "#{이름}": entry.memberName,
        "#{강습명}": cls.title,
        "#{일시}": when,
      },
      fallbackText: `[필립 수영] ${entry.memberName}님, '${cls.title}' ${when} 대기 자리가 났습니다. 예약 페이지에서 확정해 주세요.`,
    });
  } catch (err) {
    console.error("[notify] 대기호출 알림 처리 실패:", err);
  }
}
