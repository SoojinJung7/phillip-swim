import Link from "next/link";
import { Button } from "@/components/ui";

// 존재하지 않는 페이지(404) 안내
export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 text-center">
      <div className="text-5xl" aria-hidden>
        🏊
      </div>
      <div>
        <h1 className="text-xl font-bold text-water-900">
          찾는 페이지가 없어요
        </h1>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          주소가 바뀌었거나 사라진 페이지일 수 있어요.
        </p>
      </div>
      <Link href="/">
        <Button>강습 둘러보러 가기</Button>
      </Link>
    </div>
  );
}
