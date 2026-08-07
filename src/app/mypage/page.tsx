import type { Metadata } from "next";
import Link from "next/link";
import { FavoriteList } from "@/components/posts/FavoriteList";
import { listPosts } from "@/lib/posts/queries";
import { SITE } from "@/constants/region";
import { getCurrentProfile, getSessionUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { signOutAction } from "@/lib/auth/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "マイページ",
};

export default async function MyPage() {
  const posts = await listPosts({ sort: "newest" });
  const configured = isSupabaseConfigured();
  const user = configured ? await getSessionUser() : null;
  const profile = configured ? await getCurrentProfile() : null;

  return (
    <div className="page-wrap space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h1 className="text-xl font-bold text-slate-900">マイページ</h1>

        {user && profile ? (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-slate-700">
              <span className="font-semibold">
                {profile.display_name || "ユーザー"}
              </span>
              <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                {profile.role === "shop"
                  ? "店舗アカウント"
                  : profile.role === "admin"
                    ? "管理者"
                    : "一般ユーザー"}
              </span>
            </p>
            <p className="text-xs text-slate-500">{user.email}</p>
            {profile.role === "shop" && (
              <p className="text-xs text-[#1a6b8a]">
                店舗アカウントで投稿すると「公式店舗」扱いになります（管理者認証と併用）。
              </p>
            )}
            <form action={signOutAction}>
              <button
                type="submit"
                className="mt-2 text-sm text-slate-500 underline"
              >
                ログアウト
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-slate-600">
              ログインなしでも閲覧・投稿・お気に入りは利用できます。
              店舗オーナーはログインを推奨します。
            </p>
            <Link
              href="/login"
              className="inline-flex rounded-xl bg-[#1a6b8a] px-4 py-2.5 text-sm font-semibold text-white"
            >
              ログイン / 新規登録
            </Link>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <Link
            href="/posts/new"
            className="rounded-xl bg-[#1a6b8a] py-3 text-center font-semibold text-white"
          >
            投稿する
          </Link>
          <Link
            href="/favorites"
            className="rounded-xl border border-slate-200 py-3 text-center font-semibold text-slate-700"
          >
            お気に入り
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold text-slate-900">お気に入り</h2>
        <FavoriteList allPosts={posts} />
      </section>

      <section className="rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-500">
        <p className="font-medium text-slate-700">{SITE.name}</p>
        <p className="mt-1">{SITE.catchCopy}</p>
        <Link href="/admin" className="mt-3 inline-block text-xs text-slate-400 underline">
          管理画面
        </Link>
      </section>
    </div>
  );
}
