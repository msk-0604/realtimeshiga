import { formatDistanceToNowStrict, differenceInMinutes } from "date-fns";
import { ja } from "date-fns/locale";
import { STALE_THRESHOLD_MINUTES } from "@/constants/region";

export function formatRelativeTime(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return "不明";

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60_000) return "たった今";

  return formatDistanceToNowStrict(date, { addSuffix: true, locale: ja });
}

export function isStale(
  dateInput: string | Date,
  thresholdMinutes = STALE_THRESHOLD_MINUTES
): boolean {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return true;
  return differenceInMinutes(new Date(), date) >= thresholdMinutes;
}

export function minutesSince(dateInput: string | Date): number {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return differenceInMinutes(new Date(), date);
}
