"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  adminDeletePost,
  adminSetActive,
  adminSetVerified,
  createPost,
  createReport,
  updatePost,
  verifyPost,
} from "@/lib/posts/queries";
import { postFormSchema, reportFormSchema } from "@/lib/validation";
import type { PostFormInput } from "@/types";

export type ActionResult =
  | { ok: true; id?: string; message?: string }
  | { ok: false; error: string };

function toFormInput(raw: Record<string, FormDataEntryValue>): unknown {
  return {
    category: String(raw.category ?? ""),
    title: String(raw.title ?? ""),
    shop_name: String(raw.shop_name ?? ""),
    municipality: String(raw.municipality ?? ""),
    address: String(raw.address ?? ""),
    status: String(raw.status ?? ""),
    content: String(raw.content ?? ""),
    url: String(raw.url ?? ""),
    image_url: String(raw.image_url ?? ""),
  };
}

export async function createPostAction(formData: FormData): Promise<ActionResult> {
  const parsed = postFormSchema.safeParse(toFormInput(Object.fromEntries(formData)));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }

  try {
    const post = await createPost(parsed.data as PostFormInput);
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/admin");
    return { ok: true, id: post.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "投稿に失敗しました" };
  }
}

export async function updatePostAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const parsed = postFormSchema.safeParse(toFormInput(Object.fromEntries(formData)));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }

  try {
    await updatePost(id, parsed.data as PostFormInput);
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath(`/posts/${id}`);
    revalidatePath("/admin");
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "更新に失敗しました" };
  }
}

export async function verifyPostAction(id: string): Promise<ActionResult> {
  try {
    await verifyPost(id);
    revalidatePath("/");
    revalidatePath(`/posts/${id}`);
    return { ok: true, message: "確認済みとして更新しました" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "確認更新に失敗しました" };
  }
}

export async function reportPostAction(formData: FormData): Promise<ActionResult> {
  const parsed = reportFormSchema.safeParse({
    post_id: String(formData.get("post_id") ?? ""),
    reason: String(formData.get("reason") ?? ""),
    detail: String(formData.get("detail") ?? ""),
    device_id: String(formData.get("device_id") ?? "") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "通報内容を確認してください" };
  }

  const result = await createReport(parsed.data);
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/admin");
  return { ok: true, message: "通報を受け付けました" };
}

const ADMIN_COOKIE = "rts_admin";

export async function adminLoginAction(formData: FormData): Promise<ActionResult> {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD || "admin123";

  if (password !== expected) {
    return { ok: false, error: "パスワードが違います" };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  revalidatePath("/admin");
  return { ok: true };
}

export async function adminLogoutAction(): Promise<ActionResult> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  revalidatePath("/admin");
  return { ok: true };
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === "1";
}

export async function adminHidePostAction(id: string): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) return { ok: false, error: "権限がありません" };
  try {
    await adminSetActive(id, false);
    revalidatePath("/admin");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "失敗しました" };
  }
}

export async function adminShowPostAction(id: string): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) return { ok: false, error: "権限がありません" };
  try {
    await adminSetActive(id, true);
    revalidatePath("/admin");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "失敗しました" };
  }
}

export async function adminDeletePostAction(id: string): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) return { ok: false, error: "権限がありません" };
  try {
    await adminDeletePost(id);
    revalidatePath("/admin");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "失敗しました" };
  }
}

export async function adminVerifyShopAction(
  id: string,
  verified: boolean
): Promise<ActionResult> {
  if (!(await isAdminAuthenticated())) return { ok: false, error: "権限がありません" };
  try {
    await adminSetVerified(id, verified);
    revalidatePath("/admin");
    revalidatePath(`/posts/${id}`);
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "失敗しました" };
  }
}
