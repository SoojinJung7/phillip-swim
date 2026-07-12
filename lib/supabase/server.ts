import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 서버(서버 컴포넌트 / route handler)용 Supabase 팩토리.
 * 환경변수가 없으면 null 을 반환합니다 (인메모리 mock 로 동작).
 * 지연 생성(lazy) — 모듈 import 시점에 절대 throw 하지 않습니다.
 */
let serverClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getSupabaseServerClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (serverClient) return serverClient;
  serverClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
  return serverClient;
}
