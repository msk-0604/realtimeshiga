"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AuthResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

export async function signUpAction(formData: FormData): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabaseが設定されていません" };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const asShop = String(formData.get("as_shop") ?? "") === "1";

  if (!email || !password) {
    return { ok: false, error: "メールアドレスとパスワードは必須です" };
  }
  if (password.length < 6) {
    return { ok: false, error: "パスワードは6文字以上にしてください" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split("@")[0],
        requested_role: asShop ? "shop" : "user",
      },
    },
  });

  if (error) return { ok: false, error: error.message };

  // 店舗希望の場合は profiles.role を更新（管理者承認前でも shop として記録）
  if (data.user && asShop) {
    await supabase
      .from("profiles")
      .update({
        role: "shop",
        display_name: displayName || email.split("@")[0],
      })
      .eq("id", data.user.id);
  } else if (data.user && displayName) {
    await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", data.user.id);
  }

  revalidatePath("/", "layout");
  return {
    ok: true,
    message: data.session
      ? "登録しました"
      : "確認メールを送信しました。メール内のリンクから認証してください。",
  };
}

export async function signInAction(formData: FormData): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabaseが設定されていません" };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, error: "メールアドレスとパスワードは必須です" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true, message: "ログインしました" };
}

export async function signOutAction(): Promise<void> {
  if (!isSupabaseConfigured()) {
    redirect("/mypage");
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/mypage");
}
