import type { Metadata } from "next";
import Link from "next/link";
import { FavoriteList } from "@/components/posts/FavoriteList";
import { listPosts } from "@/lib/posts/queries";
import { SITE } from "@/constants/region";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "マイページ",
};

export default async function MyPage() {
  const posts = await listPosts({ sort: "newest" });

  return (
    <div className="page-wrap space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h1 className="text-xl font-bold text-slate-900">マイページ</h1>
        <p className="mt-2 text-sm text-slate-600">
          MVPではログインなしで閲覧・投稿・お気に入りが利用できます。
          将来の店舗オーナー機能ではログイン必須になります。
        </p>
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
