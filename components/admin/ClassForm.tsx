"use client";

import * as React from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Button, Card, Input, Label } from "@/components/ui";
import type { SwimClass } from "@/lib/types";
import type { ClassFormState } from "@/app/admin/actions";

const LEVEL_OPTIONS = ["초급", "중급", "상급", "전연령", "기타"];

type FormAction = (
  prev: ClassFormState,
  fd: FormData
) => Promise<ClassFormState>;

interface ClassFormProps {
  action: FormAction;
  initial?: Partial<SwimClass>;
  submitLabel: string;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" fullWidth disabled={pending}>
      {pending ? "저장하는 중…" : label}
    </Button>
  );
}

export function ClassForm({ action, initial, submitLabel }: ClassFormProps) {
  const [state, formAction] = useFormState<ClassFormState, FormData>(action, {});

  const levelInList =
    initial?.level && LEVEL_OPTIONS.includes(initial.level);
  const levelOptions =
    initial?.level && !levelInList
      ? [initial.level, ...LEVEL_OPTIONS]
      : LEVEL_OPTIONS;

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {state.error}
        </div>
      )}

      <Card className="space-y-5">
        <div>
          <Label htmlFor="title">강습 이름</Label>
          <Input
            id="title"
            name="title"
            required
            maxLength={60}
            defaultValue={initial?.title ?? ""}
            placeholder="예) 초급 자유형 오전반"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="instructor">강사</Label>
            <Input
              id="instructor"
              name="instructor"
              required
              maxLength={30}
              defaultValue={initial?.instructor ?? ""}
              placeholder="예) 김하늘"
            />
          </div>
          <div>
            <Label htmlFor="level">난이도</Label>
            <select
              id="level"
              name="level"
              required
              defaultValue={initial?.level ?? ""}
              className="h-11 w-full rounded-2xl border border-water-200 bg-white px-4 text-base text-slate-800 shadow-sm transition focus:border-water-400 focus:outline-none focus:ring-2 focus:ring-water-200"
            >
              <option value="" disabled>
                난이도 선택
              </option>
              {levelOptions.map((lv) => (
                <option key={lv} value={lv}>
                  {lv}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="sessionDate">강습 날짜</Label>
          <Input
            id="sessionDate"
            name="sessionDate"
            type="date"
            required
            defaultValue={initial?.sessionDate ?? ""}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="startTime">시작 시간</Label>
            <Input
              id="startTime"
              name="startTime"
              type="time"
              required
              defaultValue={initial?.startTime ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="endTime">종료 시간</Label>
            <Input
              id="endTime"
              name="endTime"
              type="time"
              required
              defaultValue={initial?.endTime ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="capacity">정원 (명)</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              inputMode="numeric"
              min={1}
              max={200}
              required
              defaultValue={initial?.capacity ?? ""}
              placeholder="예) 10"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">강습 소개</Label>
          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={500}
            defaultValue={initial?.description ?? ""}
            placeholder="강습 내용을 간단히 소개해 주세요. (선택)"
            className="w-full rounded-2xl border border-water-200 bg-white px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 shadow-sm transition focus:border-water-400 focus:outline-none focus:ring-2 focus:ring-water-200"
          />
        </div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <SubmitButton label={submitLabel} />
        <Link href="/admin" className="sm:w-auto">
          <Button type="button" variant="outline" size="lg" fullWidth>
            취소
          </Button>
        </Link>
      </div>
    </form>
  );
}
