/** 将来の全国展開を見据えた地域マスターデータ */

export const CURRENT_PREFECTURE = {
  id: "shiga",
  name: "滋賀県",
  nameShort: "滋賀",
} as const;

export const MUNICIPALITIES = [
  "大津市",
  "彦根市",
  "長浜市",
  "近江八幡市",
  "草津市",
  "守山市",
  "栗東市",
  "甲賀市",
  "野洲市",
  "湖南市",
  "高島市",
  "東近江市",
  "米原市",
  "日野町",
  "竜王町",
  "愛荘町",
  "豊郷町",
  "甲良町",
  "多賀町",
] as const;

export type Municipality = (typeof MUNICIPALITIES)[number];

export const SITE = {
  name: "リアルタイム滋賀",
  catchCopy: "滋賀の“今”が、すぐわかる。",
  subCopy: "お店・イベント・交通・地域情報を、みんなでリアルタイム共有。",
  searchPlaceholder: "店名・場所・情報を検索",
} as const;

/** 一定時間（分）以上更新がない場合に古い情報警告を出す */
export const STALE_THRESHOLD_MINUTES = 180;
