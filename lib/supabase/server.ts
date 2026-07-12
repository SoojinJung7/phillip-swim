import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 서버(서버 컴포넌트 / route handler / 서버 액션)용 Supabase 팩토리.
 * 환경변수가 없으면 null 을 반환합니다 (인메모리 mock 로 동작).
 * 지연 생성(lazy) — 모듈 import 시점에 절대 throw 하지 않습니다.
 *
 * 키 우선순위: SUPABASE_SERVICE_ROLE_KEY(서버 전용) > NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * 실서비스에서는 RLS 를 켜고(schema.sql 하단 참고) 서버는 service_role 키를 쓰는 것을
 * 권장합니다. 이 키는 서버에서만 쓰이며 브라우저로 절대 노출되지 않습니다.
 */
let serverClient: SupabaseClient | null = null;

/** 서버에서 쓸 Supabase 키 (service_role 우선, 없으면 anon) */
function getServerKey(): string | undefined {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && getServerKey());
}

export function getSupabaseServerClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (serverClient) return serverClient;
  serverClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    getServerKey() as string,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
  return serverClient;
}
