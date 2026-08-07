import type { CategoryId } from "@/types";

export type StatusTone = "available" | "busy" | "full" | "closed" | "info" | "alert";

export interface StatusOption {
  value: string;
  label: string;
  tone: StatusTone;
}

export const STATUS_BY_CATEGORY: Record<CategoryId, StatusOption[]> = {
  food: [
    { value: "available", label: "空いている", tone: "available" },
    { value: "slightly_busy", label: "少し混雑", tone: "busy" },
    { value: "busy", label: "混雑", tone: "busy" },
    { value: "full", label: "満席", tone: "full" },
    { value: "closed", label: "営業終了", tone: "closed" },
  ],
  event: [
    { value: "ongoing", label: "開催中", tone: "available" },
    { value: "starting_soon", label: "まもなく開始", tone: "busy" },
    { value: "ended", label: "終了", tone: "closed" },
  ],
  shopping: [
    { value: "sale", label: "特売中", tone: "available" },
    { value: "in_stock", label: "入荷あり", tone: "available" },
    { value: "limited", label: "残りわずか", tone: "busy" },
    { value: "sold_out", label: "売り切れ", tone: "full" },
  ],
  beauty: [
    { value: "bookable", label: "当日予約可能", tone: "available" },
    { value: "one_slot", label: "残り1枠", tone: "busy" },
    { value: "full", label: "満席", tone: "full" },
    { value: "closed", label: "受付終了", tone: "closed" },
  ],
  hospital: [
    { value: "open", label: "診療中", tone: "available" },
    { value: "waiting", label: "待ちあり", tone: "busy" },
    { value: "holiday", label: "休日診療", tone: "info" },
    { value: "night", label: "夜間診療", tone: "info" },
    { value: "closed", label: "休診", tone: "closed" },
  ],
  parking: [
    { value: "available", label: "空車あり", tone: "available" },
    { value: "few", label: "残りわずか", tone: "busy" },
    { value: "full", label: "満車", tone: "full" },
  ],
  gas: [
    { value: "quiet", label: "混雑なし", tone: "available" },
    { value: "busy", label: "混雑", tone: "busy" },
    { value: "car_wash_wait", label: "洗車待ちあり", tone: "busy" },
  ],
  traffic: [
    { value: "smooth", label: "順調", tone: "available" },
    { value: "congested", label: "渋滞", tone: "busy" },
    { value: "accident", label: "事故", tone: "alert" },
    { value: "construction", label: "工事", tone: "busy" },
    { value: "closed", label: "通行止め", tone: "full" },
    { value: "delay", label: "電車遅延", tone: "busy" },
  ],
  recruit: [
    { value: "recruiting", label: "募集中", tone: "available" },
    { value: "urgent", label: "急募", tone: "alert" },
    { value: "closed", label: "募集終了", tone: "closed" },
  ],
  local: [
    { value: "active", label: "募集・公開中", tone: "available" },
    { value: "resolved", label: "解決・終了", tone: "closed" },
    { value: "info", label: "お知らせ", tone: "info" },
  ],
};

export function getStatusOptions(category: CategoryId): StatusOption[] {
  return STATUS_BY_CATEGORY[category] ?? [];
}

export function getStatusLabel(category: CategoryId, status: string): string {
  const found = getStatusOptions(category).find((s) => s.value === status);
  return found?.label ?? status;
}

export function getStatusTone(category: CategoryId, status: string): StatusTone {
  const found = getStatusOptions(category).find((s) => s.value === status);
  return found?.tone ?? "info";
}

export const REPORT_REASONS: { value: import("@/types").ReportReason; label: string }[] = [
  { value: "incorrect", label: "情報が間違っている" },
  { value: "outdated", label: "古い情報" },
  { value: "inappropriate", label: "不適切" },
  { value: "spam", label: "スパム" },
  { value: "other", label: "その他" },
];

export const AUTHOR_TYPE_LABELS: Record<string, string> = {
  general: "一般ユーザー",
  verified_shop: "認証店舗",
  admin: "運営",
};
