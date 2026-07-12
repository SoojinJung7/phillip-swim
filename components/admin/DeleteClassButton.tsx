"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui";

function Inner({ title }: { title: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="danger"
      size="lg"
      fullWidth
      disabled={pending}
      onClick={(e) => {
        if (
          !window.confirm(
            `'${title}' 강습을 삭제할까요?\n예약자와 대기자 정보도 함께 삭제되며 되돌릴 수 없습니다.`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      {pending ? "삭제하는 중…" : "강습 삭제"}
    </Button>
  );
}

interface DeleteClassButtonProps {
  /** id 를 bind 한 서버 액션 */
  action: () => Promise<void>;
  title: string;
}

export function DeleteClassButton({ action, title }: DeleteClassButtonProps) {
  return (
    <form action={action}>
      <Inner title={title} />
    </form>
  );
}
