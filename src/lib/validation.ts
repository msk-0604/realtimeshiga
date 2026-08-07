import { z } from "zod";
import { CATEGORIES } from "@/constants/categories";
import { MUNICIPALITIES } from "@/constants/region";
import type { CategoryId } from "@/types";

const categoryIds = CATEGORIES.map((c) => c.id) as [CategoryId, ...CategoryId[]];

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined))
  .refine(
    (v) => !v || /^https?:\/\/.+/i.test(v),
    "URLは http:// または https:// で始めてください"
  );

export const postFormSchema = z.object({
  category: z.enum(categoryIds, { message: "カテゴリーを選択してください" }),
  title: z
    .string()
    .trim()
    .min(1, "タイトルは必須です")
    .max(80, "タイトルは80文字以内です"),
  shop_name: z
    .string()
    .trim()
    .min(1, "店舗・施設名は必須です")
    .max(80, "店舗・施設名は80文字以内です"),
  municipality: z
    .string()
    .refine((v) => (MUNICIPALITIES as readonly string[]).includes(v), "市町村を選択してください"),
  address: z
    .string()
    .trim()
    .min(1, "住所は必須です")
    .max(120, "住所は120文字以内です"),
  status: z.string().trim().min(1, "ステータスを選択してください"),
  content: z
    .string()
    .trim()
    .min(1, "内容は必須です")
    .max(1000, "内容は1000文字以内です"),
  url: optionalUrl,
  image_url: optionalUrl,
});

export const reportFormSchema = z.object({
  post_id: z.string().uuid("投稿IDが不正です"),
  reason: z.enum(["incorrect", "outdated", "inappropriate", "spam", "other"]),
  detail: z
    .string()
    .trim()
    .max(500, "詳細は500文字以内です")
    .optional()
    .or(z.literal("")),
  device_id: z.string().min(8).max(64).optional(),
});

export type PostFormValues = z.infer<typeof postFormSchema>;
export type ReportFormValues = z.infer<typeof reportFormSchema>;

/** XSS対策: 表示用に危険な文字をエスケープ */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}
