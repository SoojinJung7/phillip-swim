import { PageHeader } from "@/components/ui";
import { MyWaitlistView } from "@/components/waitlist/MyWaitlistView";
import { fetchMyWaitlist } from "./actions";

export const dynamic = "force-dynamic";

export default async function MyWaitlistPage() {
  const { member, items } = await fetchMyWaitlist();

  return (
    <div className="space-y-6">
      <PageHeader
        title="내 대기 현황"
        description="신청한 대기의 순번과 호출 상태를 실시간으로 확인하세요."
      />
      <MyWaitlistView initialMember={member} initialItems={items} />
    </div>
  );
}
