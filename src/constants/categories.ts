import type { CategoryId } from "@/types";

export interface CategoryDef {
  id: CategoryId;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  examples: string[];
}

/** ホーム横スクロール用カテゴリ */
export const CATEGORIES: CategoryDef[] = [
  {
    id: "gourmet",
    label: "グルメ",
    shortLabel: "グルメ",
    icon: "🍜",
    description: "飲食店の空き・混雑・限定メニュー",
    examples: ["空席", "待ち時間", "限定"],
  },
  {
    id: "event",
    label: "イベント",
    shortLabel: "イベント",
    icon: "🎉",
    description: "地域イベント・お祭り",
    examples: ["開催中", "まもなく"],
  },
  {
    id: "construction",
    label: "工事",
    shortLabel: "工事",
    icon: "🚧",
    description: "道路工事・規制",
    examples: ["工事中", "車線規制"],
  },
  {
    id: "accident",
    label: "事故",
    shortLabel: "事故",
    icon: "🚓",
    description: "交通事故情報",
    examples: ["事故", "渋滞起因"],
  },
  {
    id: "traffic",
    label: "交通",
    shortLabel: "交通",
    icon: "🚗",
    description: "渋滞・遅延・通行止め",
    examples: ["渋滞", "遅延"],
  },
  {
    id: "sale",
    label: "セール",
    shortLabel: "セール",
    icon: "🛍",
    description: "特売・タイムセール・在庫",
    examples: ["特売", "入荷"],
  },
  {
    id: "tourism",
    label: "観光",
    shortLabel: "観光",
    icon: "🌸",
    description: "観光地の混雑・見どころ",
    examples: ["混雑", "穴場"],
  },
  {
    id: "hospital",
    label: "病院",
    shortLabel: "病院",
    icon: "🏥",
    description: "診療・休日夜間",
    examples: ["診療中", "休日診療"],
  },
  {
    id: "disaster",
    label: "災害",
    shortLabel: "災害",
    icon: "⚡",
    description: "災害・注意情報",
    examples: ["警報", "避難"],
  },
  {
    id: "shop",
    label: "お店",
    shortLabel: "お店",
    icon: "🏪",
    description: "店舗・施設のリアルタイム情報",
    examples: ["空き", "受付中"],
  },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<string, CategoryDef>;

const LEGACY_MAP: Record<string, CategoryId> = {
  food: "gourmet",
  shopping: "sale",
  beauty: "shop",
  parking: "shop",
  gas: "shop",
  recruit: "shop",
  local: "shop",
};

export function normalizeCategory(id: string): CategoryId {
  if (CATEGORY_MAP[id]) return id as CategoryId;
  return LEGACY_MAP[id] ?? "shop";
}

export function getCategory(id: CategoryId | string): CategoryDef {
  const normalized = normalizeCategory(id);
  return CATEGORY_MAP[normalized] ?? CATEGORIES[CATEGORIES.length - 1];
}
