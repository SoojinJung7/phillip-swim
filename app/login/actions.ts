"use server";

import { redirect } from "next/navigation";
import { loginOrRegister } from "@/lib/auth";

export interface LoginState {
  error?: string;
}

/** 안전한 내부 경로만 허용 (오픈 리다이렉트 방지) */
function safeReturnTo(raw: string): string {
  if (!raw) return "/";
  // 반드시 "/"로 시작하고 "//"(외부 URL) 로 시작하지 않아야 함
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/";
}

/**
 * 이름 + 전화번호로 로그인/가입하고 returnTo 로 이동합니다.
 * useFormState 와 함께 사용합니다.
 */
export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const returnTo = safeReturnTo(String(formData.get("returnTo") ?? "/"));

  if (!name) {
    return { error: "이름을 입력해 주세요." };
  }
  if (name.length > 20) {
    return { error: "이름은 20자 이하로 입력해 주세요." };
  }

  const digits = phone.replace(/[^0-9]/g, "");
  if (!phone) {
    return { error: "전화번호를 입력해 주세요." };
  }
  if (digits.length < 9 || digits.length > 11) {
    return { error: "전화번호를 정확히 입력해 주세요. (예: 010-1234-5678)" };
  }

  await loginOrRegister(name, phone);

  // redirect 는 내부적으로 예외를 던지므로 이 아래 코드는 실행되지 않습니다.
  redirect(returnTo);
}
