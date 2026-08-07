import type { Metadata } from "next";
import { SearchFilters } from "@/components/home/SearchFilters";
import { PostCard } from "@/components/posts/PostCard";
import { listPosts } from "@/lib/posts/queries";
import type { CategoryId, PostFilters } from "@/types";
import { getCategory } from "@/constants/categories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "検索",
};

type SearchParams = Promise<{
  q?: string;
  category?: string;
  municipality?: string;
  status?: string;
}>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const filters: PostFilters = {
    q: params.q ?? "",
    category: (params.category as CategoryId | undefined) || "",
    municipality: params.municipality ?? "",
    status: params.status ?? "",
    sort: "newest",
  };

  const posts = await listPosts(filters);
  const categoryLabel = filters.category
    ? getCategory(filters.category as CategoryId).label
    : null;

  return (
    <div className="page-wrap space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">検索・絞り込み</h1>
        <p className="mt-1 text-sm text-slate-500">
          新しい順に表示します
          {categoryLabel ? ` · ${categoryLabel}` : ""}
          {filters.municipality ? ` · ${filters.municipality}` : ""}
        </p>
      </div>

      <SearchFilters
        q={filters.q}
        category={filters.category}
        municipality={filters.municipality}
        status={filters.status}
      />

      <p className="text-sm text-slate-600">{posts.length}件ヒット</p>

      <div className="space-y-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
        {posts.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            条件に合う投稿が見つかりませんでした。
          </p>
        )}
      </div>
    </div>
  );
}
