// 대기 기능에서 쓰는 작은 표시용 포맷터 (공유 lib 을 건드리지 않기 위해 로컬 보관)

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** "2026-07-14" -> "7월 14일 (월)" */
export function formatSessionDate(sessionDate: string): string {
  const [y, m, d] = sessionDate.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return sessionDate;
  const date = new Date(y, m - 1, d);
  const wd = WEEKDAYS[date.getDay()] ?? "";
  return `${m}월 ${d}일 (${wd})`;
}

/** "07:00" + "07:50" -> "오전 7:00 – 7:50" */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${to12h(startTime)} – ${strip(endTime)}`;
}

function to12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(h)) return hhmm;
  const period = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${h12}:${String(m).padStart(2, "0")}`;
}

function strip(hhmm: string): string {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(h)) return hhmm;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")}`;
}
