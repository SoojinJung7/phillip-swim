"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui";
import { cancelReservationAction } from "@/app/mypage/actions";

function Inner({ title }: { title: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(`'${title}' 예약을 취소할까요?`)) {
          e.preventDefault();
        }
      }}
    >
      {pending ? "취소 중…" : "예약 취소"}
    </Button>
  );
}

export function CancelReservationButton({
  reservationId,
  classTitle,
}: {
  reservationId: string;
  classTitle: string;
}) {
  return (
    <form action={cancelReservationAction}>
      <input type="hidden" name="reservationId" value={reservationId} />
      <Inner title={classTitle} />
    </form>
  );
}
