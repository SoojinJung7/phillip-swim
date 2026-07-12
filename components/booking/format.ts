// 강습 예약 화면 전용 표시 헬퍼 (booking 기능 내부 전용)

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;

/** "YYYY-MM-DD" → "7월 14일 (월)" */
export function formatSessionDate(sessionDate: string): string {
  const [y, m, d] = sessionDate.split("-").map((v) => parseInt(v, 10));
  if (!y || !m || !d) return sessionDate;
  const dt = new Date(y, m - 1, d);
  const weekday = WEEKDAYS[dt.getDay()];
  return `${m}월 ${d}일 (${weekday})`;
}

/** 오늘/내일이면 상대 표현, 아니면 빈 문자열 */
export function relativeDayLabel(sessionDate: string): string {
  const [y, m, d] = sessionDate.split("-").map((v) => parseInt(v, 10));
  if (!y || !m || !d) return "";
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "오늘";
  if (diff === 1) return "내일";
  if (diff === 2) return "모레";
  return "";
}

/** "07:00" ~ "07:50" → "07:00 – 07:50" */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} – ${endTime}`;
}

/** 레벨 문자열에 맞는 Badge variant */
export function levelBadgeVariant(
  level: string
): "info" | "success" | "warning" | "neutral" {
  switch (level) {
    case "초급":
      return "info";
    case "중급":
      return "success";
    case "상급":
      return "warning";
    default:
      return "neutral";
  }
}
