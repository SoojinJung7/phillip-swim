import Link from "next/link";
import { Button, EmptyState } from "@/components/ui";

/** 관리자가 아닐 때 노출하는 접근 제한 화면 */
export function AccessDenied() {
  return (
    <div className="mx-auto max-w-md py-6">
      <EmptyState
        icon="🔒"
        title="관리자만 접근할 수 있어요"
        description="이 페이지는 필립 수영 운영자 전용입니다. 관리자 계정으로 로그인한 뒤 다시 시도해 주세요."
        action={
          <Link href="/login">
            <Button>로그인하러 가기</Button>
          </Link>
        }
      />
    </div>
  );
}
