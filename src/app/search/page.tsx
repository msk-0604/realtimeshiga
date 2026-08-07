import type { Metadata } from "next";
import { SearchFilters } from "@/components/home/SearchFilters";
import { PostCard } from "@/components/posts/PostCard";
import { NearbyMap } from "@/components/map/NearbyMap";
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
  sort?: string;
  lat?: string;
  lng?: string;
  radiusKm?: string;
}>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const lat = params.lat ? Number(params.lat) : undefined;
  const lng = params.lng ? Number(params.lng) : undefined;
  const sortParam = params.sort ?? "newest";

  const filters: PostFilters = {
    q: params.q ?? "",
    category: (params.category as CategoryId | undefined) || "",
    municipality: params.municipality ?? "",
    status: params.status ?? "",
    sort:
      sortParam === "oldest"
        ? "oldest"
        : sortParam === "nearby"
          ? "nearby"
          : "newest",
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
    radiusKm: params.radiusKm ? Number(params.radiusKm) : 20,
  };

  const posts = await listPosts(filters);
  const categoryLabel = filters.category
    ? getCategory(filters.category as CategoryId).label
    : null;

  const center =
    filters.lat != null && filters.lng != null
      ? { lat: filters.lat, lng: filters.lng }
      : null;

  return (
    <div className="page-wrap space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">検索・絞り込み</h1>
        <p className="mt-1 text-sm text-slate-500">
          {filters.sort === "nearby" ? "現在地から近い順" : "新しい順に表示します"}
          {categoryLabel ? ` · ${categoryLabel}` : ""}
          {filters.municipality ? ` · ${filters.municipality}` : ""}
          {center ? ` · 半径${filters.radiusKm ?? 20}km` : ""}
        </p>
      </div>

      <SearchFilters
        q={filters.q}
        category={filters.category}
        municipality={filters.municipality}
        status={filters.status}
        sort={filters.sort}
        lat={params.lat ?? ""}
        lng={params.lng ?? ""}
        radiusKm={params.radiusKm ?? "20"}
      />

      <NearbyMap posts={posts} center={center} />

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
