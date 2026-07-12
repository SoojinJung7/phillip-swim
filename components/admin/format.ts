// 관리자 화면용 날짜/시간 표시 헬퍼 (순수 함수)

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** "2026-07-14" -> "7월 14일 (화)" */
export function formatKoreanDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(y, m - 1, d);
  const wd = WEEKDAYS[date.getDay()] ?? "";
  return `${m}월 ${d}일 (${wd})`;
}

/** "07:00", "07:50" -> "07:00 ~ 07:50" */
export function formatTimeRange(start: string, end: string): string {
  return `${start} ~ ${end}`;
}

/** "01012345678" 또는 "010-1234-5678" -> "010-1234-5678" (표시용) */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length === 11)
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length === 10)
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return phone;
}
