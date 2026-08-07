import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";
import { getSessionUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ログイン",
};

export default async function LoginPage() {
  if (isSupabaseConfigured()) {
    const user = await getSessionUser();
    if (user) redirect("/mypage");
  }

  return (
    <div className="page-wrap">
      {!isSupabaseConfigured() && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Supabase未設定のため、ログイン機能は利用できません。
        </p>
      )}
      <AuthForm />
    </div>
  );
}
