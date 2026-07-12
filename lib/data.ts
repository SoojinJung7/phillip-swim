// ===========================================================================
// 필립 수영 예약 — 데이터 접근 계층 (SHARED CONTRACT)
//
// - NEXT_PUBLIC_SUPABASE_URL 이 있으면 Supabase 를 사용합니다.
// - 없으면 6개의 현실적인 샘플 수영 강습이 담긴 인메모리(mock) 저장소로 동작합니다.
// - import / build 시점에 절대 throw 하지 않습니다.
//
// 기능 에이전트는 이 파일의 함수를 그대로 사용하세요. 재정의 금지.
// ===========================================================================

import type {
  SwimClass,
  Reservation,
  WaitlistEntry,
  Member,
  ClassAvailability,
} from "./types";
import { getSupabaseServerClient, isSupabaseConfigured } from "./supabase/server";

// ---------------------------------------------------------------------------
// 공용 유틸
// ---------------------------------------------------------------------------

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

/** 오늘 기준 offsetDays 일 뒤의 날짜를 YYYY-MM-DD 로 반환 */
function dateFromToday(offsetDays: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ===========================================================================
// 인메모리(MOCK) 저장소
// ===========================================================================

interface MockStore {
  classes: SwimClass[];
  reservations: Reservation[];
  waitlist: WaitlistEntry[];
  members: Member[];
}

// Next.js dev 환경의 HMR / 모듈 재평가에도 저장소가 유지되도록 globalThis 에 보관
const globalForMock = globalThis as unknown as {
  __phillipSwimMock?: MockStore;
};

function seedClasses(): SwimClass[] {
  return [
    {
      id: "class_beginner_free_am",
      title: "초급 자유형 오전반",
      instructor: "김하늘",
      level: "초급",
      sessionDate: dateFromToday(1),
      startTime: "07:00",
      endTime: "07:50",
      capacity: 10,
      description:
        "물이 처음이거나 자유형 기초를 다지고 싶은 분을 위한 오전 강습입니다. 호흡과 발차기부터 차근차근 배워요.",
    },
    {
      id: "class_intermediate_fly",
      title: "중급 접영반",
      instructor: "이도윤",
      level: "중급",
      sessionDate: dateFromToday(2),
      startTime: "19:00",
      endTime: "19:50",
      capacity: 8,
      description:
        "자유형·배영을 익힌 분들이 접영 동작을 완성하는 저녁 강습입니다. 웨이브와 타이밍 집중 지도.",
    },
    {
      id: "class_aqua_robics",
      title: "아쿠아로빅",
      instructor: "박서진",
      level: "전연령",
      sessionDate: dateFromToday(3),
      startTime: "10:30",
      endTime: "11:20",
      capacity: 12,
      description:
        "물속에서 즐기는 신나는 유산소 운동! 관절 부담은 적고 운동 효과는 큰 아쿠아로빅 클래스입니다.",
    },
    {
      id: "class_dawn_masters",
      title: "새벽 마스터즈",
      instructor: "정민재",
      level: "상급",
      sessionDate: dateFromToday(4),
      startTime: "05:30",
      endTime: "06:30",
      capacity: 6,
      description:
        "기록 향상을 목표로 하는 상급자 훈련반입니다. 인터벌과 페이스 훈련 위주로 강도 높게 진행합니다.",
    },
    {
      id: "class_weekend_family",
      title: "주말 가족반",
      instructor: "최유나",
      level: "초급",
      sessionDate: dateFromToday(6),
      startTime: "14:00",
      endTime: "14:50",
      capacity: 12,
      description:
        "부모와 아이가 함께 물놀이하며 배우는 주말 강습입니다. 안전하게 물과 친해지는 시간이에요.",
    },
    {
      id: "class_adult_survival",
      title: "성인 생존수영",
      instructor: "한지우",
      level: "초급",
      sessionDate: dateFromToday(8),
      startTime: "20:00",
      endTime: "20:50",
      capacity: 9,
      description:
        "위급 상황에서 스스로를 지키는 생존수영 기술을 배웁니다. 뜨기·이동·구조 요청까지 실전 위주 강습.",
    },
  ];
}

function getMockStore(): MockStore {
  if (!globalForMock.__phillipSwimMock) {
    globalForMock.__phillipSwimMock = {
      classes: seedClasses(),
      reservations: [],
      waitlist: [],
      members: [],
    };
  }
  return globalForMock.__phillipSwimMock;
}

function compareClass(a: SwimClass, b: SwimClass): number {
  if (a.sessionDate !== b.sessionDate) {
    return a.sessionDate < b.sessionDate ? -1 : 1;
  }
  return a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0;
}

// ---------------------------------------------------------------------------
// MOCK 구현
// ---------------------------------------------------------------------------

const mockImpl = {
  async listUpcomingClasses(): Promise<SwimClass[]> {
    const store = getMockStore();
    const today = dateFromToday(0);
    return store.classes
      .filter((c) => c.sessionDate >= today)
      .sort(compareClass);
  },

  async getClass(id: string): Promise<SwimClass | null> {
    const store = getMockStore();
    return store.classes.find((c) => c.id === id) ?? null;
  },

  async createClass(input: Omit<SwimClass, "id">): Promise<SwimClass> {
    const store = getMockStore();
    const cls: SwimClass = { id: makeId("class"), ...input };
    store.classes.push(cls);
    return cls;
  },

  async updateClass(
    id: string,
    input: Partial<Omit<SwimClass, "id">>
  ): Promise<SwimClass> {
    const store = getMockStore();
    const idx = store.classes.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`강습을 찾을 수 없습니다: ${id}`);
    store.classes[idx] = { ...store.classes[idx], ...input, id };
    return store.classes[idx];
  },

  async deleteClass(id: string): Promise<void> {
    const store = getMockStore();
    store.classes = store.classes.filter((c) => c.id !== id);
    store.reservations = store.reservations.filter((r) => r.classId !== id);
    store.waitlist = store.waitlist.filter((w) => w.classId !== id);
  },

  async getAvailability(classId: string): Promise<ClassAvailability> {
    const store = getMockStore();
    const cls = store.classes.find((c) => c.id === classId);
    const capacity = cls?.capacity ?? 0;
    const reservedCount = store.reservations.filter(
      (r) => r.classId === classId && r.status === "confirmed"
    ).length;
    const waitlistCount = store.waitlist.filter(
      (w) => w.classId === classId && w.status === "waiting"
    ).length;
    const remaining = Math.max(0, capacity - reservedCount);
    return {
      capacity,
      reservedCount,
      remaining,
      isFull: remaining <= 0,
      waitlistCount,
    };
  },

  async listReservations(classId?: string): Promise<Reservation[]> {
    const store = getMockStore();
    return store.reservations
      .filter((r) => (classId ? r.classId === classId : true))
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  },

  async getReservationsByMember(memberId: string): Promise<Reservation[]> {
    const store = getMockStore();
    return store.reservations
      .filter((r) => r.memberId === memberId)
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  },

  async createReservation(
    classId: string,
    member: Pick<Member, "id" | "name" | "phone">
  ): Promise<
    | { ok: true; reservation: Reservation }
    | { ok: false; reason: "full" | "duplicate" }
  > {
    const store = getMockStore();
    const dup = store.reservations.find(
      (r) =>
        r.classId === classId &&
        r.memberId === member.id &&
        r.status === "confirmed"
    );
    if (dup) return { ok: false, reason: "duplicate" };

    const availability = await this.getAvailability(classId);
    if (availability.isFull) return { ok: false, reason: "full" };

    const reservation: Reservation = {
      id: makeId("resv"),
      classId,
      memberId: member.id,
      memberName: member.name,
      memberPhone: member.phone,
      status: "confirmed",
      createdAt: nowIso(),
    };
    store.reservations.push(reservation);
    return { ok: true, reservation };
  },

  async cancelReservation(id: string): Promise<void> {
    const store = getMockStore();
    const resv = store.reservations.find((r) => r.id === id);
    if (resv) resv.status = "cancelled";
  },

  async listWaitlist(classId: string): Promise<WaitlistEntry[]> {
    const store = getMockStore();
    return store.waitlist
      .filter(
        (w) =>
          w.classId === classId &&
          (w.status === "waiting" || w.status === "called")
      )
      .sort((a, b) => a.position - b.position);
  },

  async getWaitlistByMember(memberId: string): Promise<WaitlistEntry[]> {
    const store = getMockStore();
    return store.waitlist
      .filter((w) => w.memberId === memberId)
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  },

  async joinWaitlist(
    classId: string,
    member: Pick<Member, "id" | "name" | "phone">
  ): Promise<
    | { ok: true; entry: WaitlistEntry }
    | { ok: false; reason: "duplicate" | "notFull" }
  > {
    const store = getMockStore();

    const availability = await this.getAvailability(classId);
    if (!availability.isFull) return { ok: false, reason: "notFull" };

    const dup = store.waitlist.find(
      (w) =>
        w.classId === classId &&
        w.memberId === member.id &&
        (w.status === "waiting" || w.status === "called")
    );
    if (dup) return { ok: false, reason: "duplicate" };

    const active = store.waitlist.filter(
      (w) =>
        w.classId === classId &&
        (w.status === "waiting" || w.status === "called")
    );
    const nextPosition =
      active.reduce((max, w) => Math.max(max, w.position), 0) + 1;

    const entry: WaitlistEntry = {
      id: makeId("wait"),
      classId,
      memberId: member.id,
      memberName: member.name,
      memberPhone: member.phone,
      position: nextPosition,
      status: "waiting",
      createdAt: nowIso(),
    };
    store.waitlist.push(entry);
    return { ok: true, entry };
  },

  async leaveWaitlist(id: string): Promise<void> {
    const store = getMockStore();
    const entry = store.waitlist.find((w) => w.id === id);
    if (!entry) return;
    const classId = entry.classId;
    entry.status = "left";

    // 남은 대기자 순번 재정렬
    const remaining = store.waitlist
      .filter(
        (w) =>
          w.classId === classId &&
          (w.status === "waiting" || w.status === "called")
      )
      .sort((a, b) => a.position - b.position);
    remaining.forEach((w, i) => {
      w.position = i + 1;
    });
  },

  async callNextWaitlist(classId: string): Promise<WaitlistEntry | null> {
    const store = getMockStore();
    const next = store.waitlist
      .filter((w) => w.classId === classId && w.status === "waiting")
      .sort((a, b) => a.position - b.position)[0];
    if (!next) return null;
    next.status = "called";
    return next;
  },
};

// ===========================================================================
// SUPABASE 구현
// ===========================================================================

// DB(snake_case) <-> 앱(camelCase) 매핑 헬퍼
// (Supabase 행은 동적 형태이므로 Record 로 받아 매핑합니다)

type Row = Record<string, any>;

function rowToClass(r: Row): SwimClass {
  return {
    id: r.id,
    title: r.title,
    instructor: r.instructor,
    level: r.level,
    sessionDate: r.session_date,
    startTime: r.start_time,
    endTime: r.end_time,
    capacity: r.capacity,
    description: r.description ?? "",
  };
}

function classToRow(input: Partial<Omit<SwimClass, "id">>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (input.title !== undefined) row.title = input.title;
  if (input.instructor !== undefined) row.instructor = input.instructor;
  if (input.level !== undefined) row.level = input.level;
  if (input.sessionDate !== undefined) row.session_date = input.sessionDate;
  if (input.startTime !== undefined) row.start_time = input.startTime;
  if (input.endTime !== undefined) row.end_time = input.endTime;
  if (input.capacity !== undefined) row.capacity = input.capacity;
  if (input.description !== undefined) row.description = input.description;
  return row;
}

function rowToReservation(r: Row): Reservation {
  return {
    id: r.id,
    classId: r.class_id,
    memberId: r.member_id,
    memberName: r.member_name,
    memberPhone: r.member_phone,
    status: r.status,
    createdAt: r.created_at,
  };
}

function rowToWaitlist(r: Row): WaitlistEntry {
  return {
    id: r.id,
    classId: r.class_id,
    memberId: r.member_id,
    memberName: r.member_name,
    memberPhone: r.member_phone,
    position: r.position,
    status: r.status,
    createdAt: r.created_at,
  };
}

function requireClient() {
  const client = getSupabaseServerClient();
  if (!client) throw new Error("Supabase 클라이언트를 사용할 수 없습니다.");
  return client;
}

const supabaseImpl = {
  async listUpcomingClasses(): Promise<SwimClass[]> {
    const client = requireClient();
    const today = dateFromToday(0);
    const { data, error } = await client
      .from("swim_classes")
      .select("*")
      .gte("session_date", today)
      .order("session_date", { ascending: true })
      .order("start_time", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToClass);
  },

  async getClass(id: string): Promise<SwimClass | null> {
    const client = requireClient();
    const { data, error } = await client
      .from("swim_classes")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToClass(data) : null;
  },

  async createClass(input: Omit<SwimClass, "id">): Promise<SwimClass> {
    const client = requireClient();
    const { data, error } = await client
      .from("swim_classes")
      .insert(classToRow(input))
      .select("*")
      .single();
    if (error) throw error;
    return rowToClass(data);
  },

  async updateClass(
    id: string,
    input: Partial<Omit<SwimClass, "id">>
  ): Promise<SwimClass> {
    const client = requireClient();
    const { data, error } = await client
      .from("swim_classes")
      .update(classToRow(input))
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return rowToClass(data);
  },

  async deleteClass(id: string): Promise<void> {
    const client = requireClient();
    const { error } = await client.from("swim_classes").delete().eq("id", id);
    if (error) throw error;
  },

  async getAvailability(classId: string): Promise<ClassAvailability> {
    const client = requireClient();
    const cls = await this.getClass(classId);
    const capacity = cls?.capacity ?? 0;

    const { count: reservedCount, error: rErr } = await client
      .from("reservations")
      .select("*", { count: "exact", head: true })
      .eq("class_id", classId)
      .eq("status", "confirmed");
    if (rErr) throw rErr;

    const { count: waitlistCount, error: wErr } = await client
      .from("waitlist")
      .select("*", { count: "exact", head: true })
      .eq("class_id", classId)
      .eq("status", "waiting");
    if (wErr) throw wErr;

    const reserved = reservedCount ?? 0;
    const remaining = Math.max(0, capacity - reserved);
    return {
      capacity,
      reservedCount: reserved,
      remaining,
      isFull: remaining <= 0,
      waitlistCount: waitlistCount ?? 0,
    };
  },

  async listReservations(classId?: string): Promise<Reservation[]> {
    const client = requireClient();
    let query = client
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: true });
    if (classId) query = query.eq("class_id", classId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(rowToReservation);
  },

  async getReservationsByMember(memberId: string): Promise<Reservation[]> {
    const client = requireClient();
    const { data, error } = await client
      .from("reservations")
      .select("*")
      .eq("member_id", memberId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToReservation);
  },

  async createReservation(
    classId: string,
    member: Pick<Member, "id" | "name" | "phone">
  ): Promise<
    | { ok: true; reservation: Reservation }
    | { ok: false; reason: "full" | "duplicate" }
  > {
    const client = requireClient();

    const { data: existing, error: exErr } = await client
      .from("reservations")
      .select("id")
      .eq("class_id", classId)
      .eq("member_id", member.id)
      .eq("status", "confirmed")
      .maybeSingle();
    if (exErr) throw exErr;
    if (existing) return { ok: false, reason: "duplicate" };

    const availability = await this.getAvailability(classId);
    if (availability.isFull) return { ok: false, reason: "full" };

    const { data, error } = await client
      .from("reservations")
      .insert({
        class_id: classId,
        member_id: member.id,
        member_name: member.name,
        member_phone: member.phone,
        status: "confirmed",
      })
      .select("*")
      .single();
    if (error) throw error;
    return { ok: true, reservation: rowToReservation(data) };
  },

  async cancelReservation(id: string): Promise<void> {
    const client = requireClient();
    const { error } = await client
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (error) throw error;
  },

  async listWaitlist(classId: string): Promise<WaitlistEntry[]> {
    const client = requireClient();
    const { data, error } = await client
      .from("waitlist")
      .select("*")
      .eq("class_id", classId)
      .in("status", ["waiting", "called"])
      .order("position", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToWaitlist);
  },

  async getWaitlistByMember(memberId: string): Promise<WaitlistEntry[]> {
    const client = requireClient();
    const { data, error } = await client
      .from("waitlist")
      .select("*")
      .eq("member_id", memberId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToWaitlist);
  },

  async joinWaitlist(
    classId: string,
    member: Pick<Member, "id" | "name" | "phone">
  ): Promise<
    | { ok: true; entry: WaitlistEntry }
    | { ok: false; reason: "duplicate" | "notFull" }
  > {
    const client = requireClient();

    const availability = await this.getAvailability(classId);
    if (!availability.isFull) return { ok: false, reason: "notFull" };

    const { data: existing, error: exErr } = await client
      .from("waitlist")
      .select("id")
      .eq("class_id", classId)
      .eq("member_id", member.id)
      .in("status", ["waiting", "called"])
      .maybeSingle();
    if (exErr) throw exErr;
    if (existing) return { ok: false, reason: "duplicate" };

    const { data: last, error: lastErr } = await client
      .from("waitlist")
      .select("position")
      .eq("class_id", classId)
      .in("status", ["waiting", "called"])
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lastErr) throw lastErr;
    const nextPosition = (last?.position ?? 0) + 1;

    const { data, error } = await client
      .from("waitlist")
      .insert({
        class_id: classId,
        member_id: member.id,
        member_name: member.name,
        member_phone: member.phone,
        position: nextPosition,
        status: "waiting",
      })
      .select("*")
      .single();
    if (error) throw error;
    return { ok: true, entry: rowToWaitlist(data) };
  },

  async leaveWaitlist(id: string): Promise<void> {
    const client = requireClient();

    const { data: entry, error: getErr } = await client
      .from("waitlist")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (getErr) throw getErr;
    if (!entry) return;

    const { error: updErr } = await client
      .from("waitlist")
      .update({ status: "left" })
      .eq("id", id);
    if (updErr) throw updErr;

    // 남은 대기자 순번 재정렬
    const { data: remaining, error: remErr } = await client
      .from("waitlist")
      .select("*")
      .eq("class_id", entry.class_id)
      .in("status", ["waiting", "called"])
      .order("position", { ascending: true });
    if (remErr) throw remErr;

    let pos = 1;
    for (const w of remaining ?? []) {
      if (w.position !== pos) {
        const { error } = await client
          .from("waitlist")
          .update({ position: pos })
          .eq("id", w.id);
        if (error) throw error;
      }
      pos += 1;
    }
  },

  async callNextWaitlist(classId: string): Promise<WaitlistEntry | null> {
    const client = requireClient();
    const { data: next, error: getErr } = await client
      .from("waitlist")
      .select("*")
      .eq("class_id", classId)
      .eq("status", "waiting")
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (getErr) throw getErr;
    if (!next) return null;

    const { data, error } = await client
      .from("waitlist")
      .update({ status: "called" })
      .eq("id", next.id)
      .select("*")
      .single();
    if (error) throw error;
    return rowToWaitlist(data);
  },
};

// ===========================================================================
// 디스패치 — 환경변수 유무에 따라 Supabase / mock 선택
// ===========================================================================

function impl() {
  return isSupabaseConfigured() ? supabaseImpl : mockImpl;
}

export function listUpcomingClasses(): Promise<SwimClass[]> {
  return impl().listUpcomingClasses();
}

export function getClass(id: string): Promise<SwimClass | null> {
  return impl().getClass(id);
}

export function createClass(input: Omit<SwimClass, "id">): Promise<SwimClass> {
  return impl().createClass(input);
}

export function updateClass(
  id: string,
  input: Partial<Omit<SwimClass, "id">>
): Promise<SwimClass> {
  return impl().updateClass(id, input);
}

export function deleteClass(id: string): Promise<void> {
  return impl().deleteClass(id);
}

export function getAvailability(classId: string): Promise<ClassAvailability> {
  return impl().getAvailability(classId);
}

export function listReservations(classId?: string): Promise<Reservation[]> {
  return impl().listReservations(classId);
}

export function getReservationsByMember(
  memberId: string
): Promise<Reservation[]> {
  return impl().getReservationsByMember(memberId);
}

export function createReservation(
  classId: string,
  member: Pick<Member, "id" | "name" | "phone">
): Promise<
  | { ok: true; reservation: Reservation }
  | { ok: false; reason: "full" | "duplicate" }
> {
  return impl().createReservation(classId, member);
}

export function cancelReservation(id: string): Promise<void> {
  return impl().cancelReservation(id);
}

export function listWaitlist(classId: string): Promise<WaitlistEntry[]> {
  return impl().listWaitlist(classId);
}

export function getWaitlistByMember(
  memberId: string
): Promise<WaitlistEntry[]> {
  return impl().getWaitlistByMember(memberId);
}

export function joinWaitlist(
  classId: string,
  member: Pick<Member, "id" | "name" | "phone">
): Promise<
  | { ok: true; entry: WaitlistEntry }
  | { ok: false; reason: "duplicate" | "notFull" }
> {
  return impl().joinWaitlist(classId, member);
}

export function leaveWaitlist(id: string): Promise<void> {
  return impl().leaveWaitlist(id);
}

export function callNextWaitlist(
  classId: string
): Promise<WaitlistEntry | null> {
  return impl().callNextWaitlist(classId);
}
