"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button, Input, Label } from "@/components/ui";
import { loginAction, type LoginState } from "@/app/login/actions";

/** 전화번호를 010-1234-5678 형태로 자동 정리 */
function formatPhone(value: string): string {
  const d = value.replace(/[^0-9]/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" fullWidth disabled={pending}>
      {pending ? "확인하는 중…" : "로그인 / 시작하기"}
    </Button>
  );
}

export function LoginForm({ returnTo }: { returnTo: string }) {
  const initial: LoginState = {};
  const [state, formAction] = useFormState(loginAction, initial);
  const [phone, setPhone] = React.useState("");

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="returnTo" value={returnTo} />

      <div>
        <Label htmlFor="name">이름</Label>
        <Input
          id="name"
          name="name"
          placeholder="예약자 이름"
          autoComplete="name"
          maxLength={20}
          required
        />
      </div>

      <div>
        <Label htmlFor="phone">휴대폰 번호</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          placeholder="010-1234-5678"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          required
        />
        <p className="mt-1.5 text-xs text-slate-500">
          예약·대기 확인에 사용돼요. 번호로 회원을 찾기 때문에 정확히 입력해
          주세요.
        </p>
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600"
        >
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
