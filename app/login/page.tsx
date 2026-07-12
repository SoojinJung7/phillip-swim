import Link from "next/link";
import { Card, CardContent, PageHeader, Button } from "@/components/ui";
import { getCurrentMember } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { logoutAction } from "@/app/mypage/actions";

export const dynamic = "force-dynamic";

function safeReturnTo(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return "/";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { returnTo?: string | string[] };
}) {
  const returnTo = safeReturnTo(searchParams?.returnTo);
  const member = await getCurrentMember();

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageHeader
        title="로그인"
        description="비밀번호 없이 이름과 휴대폰 번호만으로 간편하게 시작해요."
      />

      {member ? (
        <Card>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="mb-2 text-3xl" aria-hidden>
                👋
              </div>
              <p className="text-lg font-bold text-water-900">
                {member.name}님, 이미 로그인되어 있어요
              </p>
              <p className="mt-1 text-sm text-slate-500">{member.phone}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Link href={returnTo}>
                <Button fullWidth>계속하기</Button>
              </Link>
              <Link href="/mypage">
                <Button variant="outline" fullWidth>
                  내 예약·대기 보기
                </Button>
              </Link>
              <form action={logoutAction}>
                <input type="hidden" name="returnTo" value="/login" />
                <Button type="submit" variant="ghost" fullWidth>
                  다른 번호로 로그인
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent>
              <LoginForm returnTo={returnTo} />
            </CardContent>
          </Card>

          <Card className="bg-water-50/70">
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p className="flex items-start gap-2">
                <span aria-hidden>🔑</span>
                <span>
                  <b className="text-water-800">비밀번호가 없는 간편 로그인</b>
                  이에요. 처음이면 자동으로 가입되고, 다음부터는 같은 번호로 바로
                  들어올 수 있어요.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span aria-hidden>📱</span>
                <span>
                  입력한 휴대폰 번호로 내 예약과 대기 순번을 찾아요.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span aria-hidden>🛠️</span>
                <span>
                  스튜디오 <b>관리자 번호</b>로 로그인하면 강습을 관리하는 관리자
                  권한이 함께 켜져요.
                </span>
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
