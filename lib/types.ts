// ===========================================================================
// 필립 수영 예약 — 공유 타입 정의 (SHARED CONTRACT)
// 기능 에이전트는 이 파일을 읽고 그대로 사용해야 합니다. 재정의 금지.
// ===========================================================================

/** 수영 강습(세션) 한 건 */
export interface SwimClass {
  id: string;
  title: string;
  instructor: string;
  level: string;
  /** YYYY-MM-DD */
  sessionDate: string;
  /** HH:MM */
  startTime: string;
  /** HH:MM */
  endTime: string;
  capacity: number;
  description: string;
}

/** 예약 한 건 */
export interface Reservation {
  id: string;
  classId: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  status: "confirmed" | "cancelled";
  createdAt: string;
}

/** 대기열(웨이팅) 항목 한 건 */
export interface WaitlistEntry {
  id: string;
  classId: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  /** 대기 순번 (1부터 시작) */
  position: number;
  status: "waiting" | "called" | "converted" | "left";
  createdAt: string;
}

/** 회원 */
export interface Member {
  id: string;
  name: string;
  phone: string;
  isAdmin: boolean;
  createdAt: string;
}

/** 특정 강습의 예약 가능 현황 */
export interface ClassAvailability {
  capacity: number;
  reservedCount: number;
  remaining: number;
  isFull: boolean;
  waitlistCount: number;
}
