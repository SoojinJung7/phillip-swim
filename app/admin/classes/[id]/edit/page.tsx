import Link from "next/link";
import { getCurrentMember } from "@/lib/auth";
import { getClass } from "@/lib/data";
import { Button, Card, EmptyState, PageHeader } from "@/components/ui";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { ClassForm } from "@/components/admin/ClassForm";
import { DeleteClassButton } from "@/components/admin/DeleteClassButton";
import { updateClassAction, deleteClassAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function EditClassPage({
  params,
}: {
  params: { id: string };
}) {
  const member = await getCurrentMember();
  if (!member?.isAdmin) return <AccessDenied />;

  const cls = await getClass(params.id);
  if (!cls) {
    return (
      <div className="py-6">
        <EmptyState
          icon="🔍"
          title="강습을 찾을 수 없어요"
          description="이미 삭제되었거나 잘못된 주소일 수 있습니다."
          action={
            <Link href="/admin">
              <Button>관리자 콘솔로</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const updateAction = updateClassAction.bind(null, cls.id);
  const deleteAction = deleteClassAction.bind(null, cls.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="강습 수정"
        description={`'${cls.title}' 강습 정보를 수정합니다.`}
      />

      <ClassForm
        action={updateAction}
        initial={cls}
        submitLabel="수정 저장"
      />

      <Card className="space-y-3 border-rose-100 bg-rose-50/50">
        <div>
          <h3 className="text-base font-bold text-rose-700">강습 삭제</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            강습을 삭제하면 관련된 예약자·대기자 정보도 모두 삭제됩니다. 이 작업은
            되돌릴 수 없습니다.
          </p>
        </div>
        <DeleteClassButton action={deleteAction} title={cls.title} />
      </Card>

      <p className="text-center text-sm text-slate-400">
        <Link
          href={`/admin/classes/${cls.id}`}
          className="font-semibold text-water-600"
        >
          ← 명단 관리로 돌아가기
        </Link>
      </p>
    </div>
  );
}
