import Link from "next/link";
import { getCurrentMember } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { ClassForm } from "@/components/admin/ClassForm";
import { createClassAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function NewClassPage() {
  const member = await getCurrentMember();
  if (!member?.isAdmin) return <AccessDenied />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="새 강습 개설"
        description="강습 정보를 입력하면 회원 예약 목록에 바로 노출됩니다."
      />
      <ClassForm action={createClassAction} submitLabel="강습 개설" />
      <p className="text-center text-sm text-slate-400">
        <Link href="/admin" className="font-semibold text-water-600">
          ← 관리자 콘솔로 돌아가기
        </Link>
      </p>
    </div>
  );
}
