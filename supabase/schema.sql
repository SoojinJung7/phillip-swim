-- ===========================================================================
-- 필립 수영 예약 — Supabase 스키마
--
-- 사용법: Supabase SQL Editor 에 이 파일 전체를 붙여넣고 실행하세요.
-- 컬럼은 snake_case, 앱(lib/data.ts)에서 camelCase 로 매핑됩니다.
--
-- RLS(Row Level Security) 는 기본 비활성입니다. 프로토타입/데모 단계에서는
-- 이대로 사용하고, 실서비스 전에 파일 하단의 RLS 예시를 참고해 정책을 추가하세요.
-- ===========================================================================

-- 회원 -----------------------------------------------------------------------
create table if not exists public.members (
  id          text primary key,
  name        text not null,
  phone       text not null,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists idx_members_phone on public.members (phone);

-- 수영 강습 -------------------------------------------------------------------
create table if not exists public.swim_classes (
  id            text primary key default gen_random_uuid()::text,
  title         text not null,
  instructor    text not null,
  level         text not null,
  session_date  date not null,
  start_time    text not null,          -- HH:MM
  end_time      text not null,          -- HH:MM
  capacity      integer not null check (capacity > 0),
  description   text not null default '',
  created_at    timestamptz not null default now()
);

create index if not exists idx_swim_classes_date
  on public.swim_classes (session_date, start_time);

-- 예약 -----------------------------------------------------------------------
create table if not exists public.reservations (
  id            text primary key default gen_random_uuid()::text,
  class_id      text not null references public.swim_classes (id) on delete cascade,
  member_id     text not null,
  member_name   text not null,
  member_phone  text not null,
  status        text not null default 'confirmed'
                  check (status in ('confirmed', 'cancelled')),
  created_at    timestamptz not null default now()
);

create index if not exists idx_reservations_class on public.reservations (class_id);
create index if not exists idx_reservations_member on public.reservations (member_id);

-- 같은 회원이 같은 강습에 확정 예약을 중복으로 갖지 못하도록 방지
create unique index if not exists uniq_reservation_confirmed
  on public.reservations (class_id, member_id)
  where status = 'confirmed';

-- 대기열 ---------------------------------------------------------------------
create table if not exists public.waitlist (
  id            text primary key default gen_random_uuid()::text,
  class_id      text not null references public.swim_classes (id) on delete cascade,
  member_id     text not null,
  member_name   text not null,
  member_phone  text not null,
  position      integer not null,
  status        text not null default 'waiting'
                  check (status in ('waiting', 'called', 'converted', 'left')),
  created_at    timestamptz not null default now()
);

create index if not exists idx_waitlist_class_pos
  on public.waitlist (class_id, position);
create index if not exists idx_waitlist_member on public.waitlist (member_id);

-- ===========================================================================
-- 시드 데이터 — 인메모리 mock 과 동일한 6개 샘플 강습
-- (오늘 기준 앞으로 며칠 뒤로 날짜를 자동 계산)
-- ===========================================================================
insert into public.swim_classes
  (id, title, instructor, level, session_date, start_time, end_time, capacity, description)
values
  ('class_beginner_free_am', '초급 자유형 오전반', '김하늘', '초급',
   (current_date + 1), '07:00', '07:50', 10,
   '물이 처음이거나 자유형 기초를 다지고 싶은 분을 위한 오전 강습입니다. 호흡과 발차기부터 차근차근 배워요.'),
  ('class_intermediate_fly', '중급 접영반', '이도윤', '중급',
   (current_date + 2), '19:00', '19:50', 8,
   '자유형·배영을 익힌 분들이 접영 동작을 완성하는 저녁 강습입니다. 웨이브와 타이밍 집중 지도.'),
  ('class_aqua_robics', '아쿠아로빅', '박서진', '전연령',
   (current_date + 3), '10:30', '11:20', 12,
   '물속에서 즐기는 신나는 유산소 운동! 관절 부담은 적고 운동 효과는 큰 아쿠아로빅 클래스입니다.'),
  ('class_dawn_masters', '새벽 마스터즈', '정민재', '상급',
   (current_date + 4), '05:30', '06:30', 6,
   '기록 향상을 목표로 하는 상급자 훈련반입니다. 인터벌과 페이스 훈련 위주로 강도 높게 진행합니다.'),
  ('class_weekend_family', '주말 가족반', '최유나', '초급',
   (current_date + 6), '14:00', '14:50', 12,
   '부모와 아이가 함께 물놀이하며 배우는 주말 강습입니다. 안전하게 물과 친해지는 시간이에요.'),
  ('class_adult_survival', '성인 생존수영', '한지우', '초급',
   (current_date + 8), '20:00', '20:50', 9,
   '위급 상황에서 스스로를 지키는 생존수영 기술을 배웁니다. 뜨기·이동·구조 요청까지 실전 위주 강습.')
on conflict (id) do nothing;

-- ===========================================================================
-- RLS 참고 (실서비스 전 적용 권장) — 필요 시 주석 해제 후 조정하세요.
-- ---------------------------------------------------------------------------
-- alter table public.members       enable row level security;
-- alter table public.swim_classes  enable row level security;
-- alter table public.reservations  enable row level security;
-- alter table public.waitlist      enable row level security;
--
-- 예: 강습은 누구나 읽기 가능, 쓰기는 관리자만 (별도 인증 연동 필요)
-- create policy "swim_classes_read" on public.swim_classes
--   for select using (true);
-- ===========================================================================
