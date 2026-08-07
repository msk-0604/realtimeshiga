import type { CategoryId } from "@/types";

export interface CategoryDef {
  id: CategoryId;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  examples: string[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: "food",
    label: "食べる",
    shortLabel: "食べる",
    icon: "🍚",
    description: "飲食店の待ち時間・空席・限定メニューなど",
    examples: ["飲食店", "ラーメン", "焼肉", "居酒屋", "カフェ", "テイクアウト"],
  },
  {
    id: "event",
    label: "遊ぶ・イベント",
    shortLabel: "遊ぶ",
    icon: "🎪",
    description: "地域イベント・お祭り・展示会など",
    examples: ["地域イベント", "マルシェ", "花火", "お祭り", "子ども向け", "スポーツ"],
  },
  {
    id: "shopping",
    label: "買う",
    shortLabel: "買う",
    icon: "🛒",
    description: "特売・在庫・タイムセールなど",
    examples: ["スーパー", "ドラッグストア", "商業施設", "特売", "タイムセール"],
  },
  {
    id: "beauty",
    label: "美容",
    shortLabel: "美容",
    icon: "💇",
    description: "美容院・ネイルの空き枠など",
    examples: ["美容院", "理容室", "ネイル", "エステ"],
  },
  {
    id: "hospital",
    label: "病院",
    shortLabel: "病院",
    icon: "🏥",
    description: "診療・休日夜間対応など",
    examples: ["病院", "クリニック", "歯科", "休日診療", "夜間診療"],
  },
  {
    id: "parking",
    label: "駐車場",
    shortLabel: "駐車場",
    icon: "🅿️",
    description: "空車・満車のリアルタイム状況",
    examples: ["空車あり", "残りわずか", "満車"],
  },
  {
    id: "gas",
    label: "ガソリン",
    shortLabel: "ガソリン",
    icon: "⛽",
    description: "給油価格・混雑状況",
    examples: ["レギュラー価格", "混雑なし", "洗車待ち"],
  },
  {
    id: "traffic",
    label: "交通・道路",
    shortLabel: "交通",
    icon: "🚗",
    description: "渋滞・事故・工事・遅延情報",
    examples: ["渋滞", "事故", "工事", "通行止め", "電車遅延"],
  },
  {
    id: "recruit",
    label: "求人・募集",
    shortLabel: "求人",
    icon: "💼",
    description: "アルバイト・単発・メンバー募集",
    examples: ["本日アルバイト募集", "単発募集", "スタッフ急募"],
  },
  {
    id: "local",
    label: "地域情報",
    shortLabel: "地域",
    icon: "📢",
    description: "不用品・迷子・落とし物・お知らせ",
    examples: ["不用品譲渡", "迷子ペット", "落とし物", "地域のお知らせ"],
  },
];

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<CategoryId, CategoryDef>;

export function getCategory(id: CategoryId): CategoryDef {
  return CATEGORY_MAP[id];
}
