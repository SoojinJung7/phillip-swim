"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui";

function Inner({ memberName }: { memberName: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={(e) => {
        if (
          !window.confirm(`${memberName} 님의 예약을 취소할까요?`)
        ) {
          e.preventDefault();
        }
      }}
    >
      {pending ? "취소 중…" : "예약 취소"}
    </Button>
  );
}

interface CancelReservationButtonProps {
  /** classId, reservationId 를 bind 한 서버 액션 */
  action: () => Promise<void>;
  memberName: string;
}

export function CancelReservationButton({
  action,
  memberName,
}: CancelReservationButtonProps) {
  return (
    <form action={action}>
      <Inner memberName={memberName} />
    </form>
  );
}
