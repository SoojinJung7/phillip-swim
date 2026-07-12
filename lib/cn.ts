/** 클래스명을 조건부로 합치는 작은 유틸 (clsx 대체) */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
