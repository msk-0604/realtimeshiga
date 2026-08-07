import Link from "next/link";
import { Suspense } from "react";
import { PostCard } from "@/components/posts/PostCard";
import {
  CategoryScroller,
  FeedTabs,
  PostSkeleton,
  TodayShigaCards,
} from "@/components/home/HomeWidgets";
import { InfiniteFeed } from "@/components/home/InfiniteFeed";
import { PullToRefresh } from "@/components/ux/PullToRefresh";
import { SITE } from "@/constants/region";
import { listPosts } from "@/lib/posts/queries";
import { getTodayShiga } from "@/lib/social/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { FeedTab, PostFilters } from "@/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ tab?: string }>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const tab = (params.tab as FeedTab | undefined) ?? "popular";

  const sort: PostFilters["sort"] =
    tab === "rising" ? "rising" : tab === "recommend" ? "newest" : "popular";

  const [posts, today] = await Promise.all([
    listPosts({ sort }),
    getTodayShiga(),
  ]);

  const latest = await listPosts({ sort: "newest" });
  const rising = await listPosts({ sort: "rising" });
  const popular = await listPosts({ sort: "popular" });

  return (
    <PullToRefresh>
      <div className="page-wrap space-y-6">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold tracking-wide text-[#1a6b8a]">
            {SITE.name}
          </p>
          <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-900 dark:text-white">
            {SITE.catchCopy}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {SITE.subCopy}
          </p>
          {!isSupabaseConfigured() && (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              デモモード：Supabase未設定のためダミーデータで動作中
            </p>
          )}
        </section>

        <TodayShigaCards summary={today} />

        <section className="space-y-2">
          <FeedTabs active={tab} />
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              カテゴリー
            </h2>
            <Link href="/map" className="text-xs font-medium text-[#1a6b8a]">
              地図で見る
            </Link>
          </div>
          <CategoryScroller />
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {tab === "rising"
              ? "📈 急上昇"
              : tab === "recommend"
                ? "⭐ おすすめ"
                : "🔥 今日人気"}
          </h2>
          <Suspense
            fallback={
              <>
                <PostSkeleton />
                <PostSkeleton />
              </>
            }
          >
            <InfiniteFeed initialPosts={posts} />
          </Suspense>
        </section>

        <FeedSection title="最新投稿" posts={latest.slice(0, 5)} href="/search?sort=newest" />
        <FeedSection title="急上昇" posts={rising.slice(0, 5)} href="/?tab=rising" />
        <FeedSection title="人気投稿" posts={popular.slice(0, 5)} href="/?tab=popular" />

        <div className="grid grid-cols-2 gap-2 text-sm">
          <Link
            href="/premium"
            className="rounded-xl border border-[#1a6b8a]/30 bg-[#e8f4f8] py-3 text-center font-semibold text-[#1a6b8a]"
          >
            プレミアム
          </Link>
          <Link
            href="/shops"
            className="rounded-xl border border-slate-200 py-3 text-center font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
          >
            公式店舗
          </Link>
        </div>
      </div>
    </PullToRefresh>
  );
}

function FeedSection({
  title,
  posts,
  href,
}: {
  title: string;
  posts: Awaited<ReturnType<typeof listPosts>>;
  href: string;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
        <Link href={href} className="text-sm font-medium text-[#1a6b8a]">
          もっと見る
        </Link>
      </div>
      <div className="space-y-3">
        {posts.map((post) => (
          <PostCard key={`${title}-${post.id}`} post={post} />
        ))}
      </div>
    </section>
  );
}
