import type { CategoryId } from "@/types";
import { normalizeCategory } from "@/constants/categories";

export type StatusTone = "available" | "busy" | "full" | "closed" | "info" | "alert";

export interface StatusOption {
  value: string;
  label: string;
  tone: StatusTone;
}

const DEFAULT_STATUSES: StatusOption[] = [
  { value: "available", label: "空き・平常", tone: "available" },
  { value: "busy", label: "混雑・注意", tone: "busy" },
  { value: "full", label: "満員・不可", tone: "full" },
  { value: "info", label: "お知らせ", tone: "info" },
];

export const STATUS_BY_CATEGORY: Record<string, StatusOption[]> = {
  gourmet: [
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
  construction: [
    { value: "ongoing", label: "工事中", tone: "busy" },
    { value: "lane_closed", label: "車線規制", tone: "alert" },
    { value: "ended", label: "終了", tone: "closed" },
  ],
  accident: [
    { value: "active", label: "発生中", tone: "alert" },
    { value: "cleared", label: "処理済", tone: "available" },
  ],
  traffic: [
    { value: "smooth", label: "順調", tone: "available" },
    { value: "congested", label: "渋滞", tone: "busy" },
    { value: "closed", label: "通行止め", tone: "full" },
    { value: "delay", label: "遅延", tone: "busy" },
  ],
  sale: [
    { value: "sale", label: "特売中", tone: "available" },
    { value: "in_stock", label: "入荷あり", tone: "available" },
    { value: "limited", label: "残りわずか", tone: "busy" },
    { value: "sold_out", label: "売り切れ", tone: "full" },
  ],
  tourism: [
    { value: "quiet", label: "空いている", tone: "available" },
    { value: "busy", label: "混雑", tone: "busy" },
    { value: "packed", label: "大混雑", tone: "full" },
  ],
  hospital: [
    { value: "open", label: "診療中", tone: "available" },
    { value: "waiting", label: "待ちあり", tone: "busy" },
    { value: "holiday", label: "休日診療", tone: "info" },
    { value: "closed", label: "休診", tone: "closed" },
  ],
  disaster: [
    { value: "advisory", label: "注意報", tone: "busy" },
    { value: "warning", label: "警報", tone: "alert" },
    { value: "safe", label: "落ち着き", tone: "available" },
  ],
  shop: [
    { value: "available", label: "空きあり", tone: "available" },
    { value: "busy", label: "混雑", tone: "busy" },
    { value: "closed", label: "受付終了", tone: "closed" },
    { value: "info", label: "お知らせ", tone: "info" },
  ],
};

export function getStatusOptions(category: CategoryId | string): StatusOption[] {
  const id = normalizeCategory(category);
  return STATUS_BY_CATEGORY[id] ?? DEFAULT_STATUSES;
}

export function getStatusLabel(category: CategoryId | string, status: string): string {
  return getStatusOptions(category).find((s) => s.value === status)?.label ?? status;
}

export function getStatusTone(category: CategoryId | string, status: string): StatusTone {
  return getStatusOptions(category).find((s) => s.value === status)?.tone ?? "info";
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
