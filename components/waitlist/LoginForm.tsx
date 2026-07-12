"use client";

import * as React from "react";
import { Button, Input, Label } from "@/components/ui";
import type { Member } from "@/lib/types";
import { loginAction } from "@/app/waitlist/actions";

export interface LoginFormProps {
  /** 로그인 성공 시 회원 정보를 전달 */
  onSuccess: (member: Member) => void;
  /** 폼 위에 보여줄 안내 문구 */
  hint?: string;
}

/**
 * 이름 + 휴대폰 번호만으로 로그인/가입하는 경량 폼.
 * (비밀번호 없음 — 공유 auth 계약을 그대로 사용)
 */
export function LoginForm({ onSuccess, hint }: LoginFormProps) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await loginAction(name, phone);
      if (res.ok) {
        onSuccess(res.member);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-slate-600">
        {hint ?? "대기 신청을 위해 간단히 확인할게요. 이름과 휴대폰 번호만 입력하면 돼요."}
      </p>
      <div>
        <Label htmlFor="wl-name">이름</Label>
        <Input
          id="wl-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
          autoComplete="name"
          required
        />
      </div>
      <div>
        <Label htmlFor="wl-phone">휴대폰 번호</Label>
        <Input
          id="wl-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="010-1234-5678"
          inputMode="tel"
          autoComplete="tel"
          required
        />
      </div>
      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
          {error}
        </p>
      )}
      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "확인 중…" : "확인하고 계속하기"}
      </Button>
    </form>
  );
}
