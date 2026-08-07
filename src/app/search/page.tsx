import type { Metadata } from "next";
import { Suspense } from "react";
import { LiveSearchClient } from "@/components/search/LiveSearchClient";
import { PostSkeleton } from "@/components/home/HomeWidgets";
import { NearbyMap } from "@/components/map/NearbyMap";
import { listPosts } from "@/lib/posts/queries";
import type { CategoryId, PostFilters } from "@/types";

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

  const filters: PostFilters = {
    q: params.q ?? "",
    category: (params.category as CategoryId | undefined) || "",
    municipality: params.municipality ?? "",
    status: params.status ?? "",
    sort:
      params.sort === "oldest"
        ? "oldest"
        : params.sort === "nearby"
          ? "nearby"
          : params.sort === "popular"
            ? "popular"
            : params.sort === "rising"
              ? "rising"
              : "newest",
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
    radiusKm: params.radiusKm ? Number(params.radiusKm) : 20,
  };

  const posts = await listPosts(filters);
  const center =
    filters.lat != null && filters.lng != null
      ? { lat: filters.lat, lng: filters.lng }
      : null;

  return (
    <div className="page-wrap space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">検索</h1>
        <p className="mt-1 text-sm text-slate-500">リアルタイム絞り込み</p>
      </div>

      {center && <NearbyMap posts={posts} center={center} />}

      <Suspense
        fallback={
          <>
            <PostSkeleton />
            <PostSkeleton />
          </>
        }
      >
        <LiveSearchClient
          initialPosts={posts}
          initialQ={filters.q}
          initialCategory={filters.category || ""}
          initialMunicipality={filters.municipality || ""}
        />
      </Suspense>
    </div>
  );
}
