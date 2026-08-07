import Link from "next/link";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { SearchFilters } from "@/components/home/SearchFilters";
import { PostCard } from "@/components/posts/PostCard";
import { SITE } from "@/constants/region";
import { listPosts } from "@/lib/posts/queries";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await listPosts({ sort: "newest" });

  return (
    <div className="page-wrap space-y-6">
      <section className="rounded-2xl bg-white border border-slate-100 p-5">
        <p className="text-xs font-semibold tracking-wide text-[#1a6b8a]">
          {SITE.name}
        </p>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-900">
          {SITE.catchCopy}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {SITE.subCopy}
        </p>
        {!isSupabaseConfigured() && (
          <p className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
            デモモード：Supabase未設定のため、ローカルのダミーデータで動作しています。
          </p>
        )}
      </section>

      <section>
        <SearchFilters action="/search" />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-slate-800">カテゴリー</h2>
        <CategoryGrid />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">滋賀の最新情報</h2>
          <Link href="/search" className="text-sm font-medium text-[#1a6b8a]">
            すべて見る
          </Link>
        </div>
        <div className="space-y-3">
          {posts.length === 0 ? (
            <p className="text-sm text-slate-500">まだ投稿がありません。</p>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </section>
    </div>
  );
}
