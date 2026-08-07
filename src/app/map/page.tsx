import type { Metadata } from "next";
import { MapModeClient } from "@/components/map/MapModeClient";
import { listPosts } from "@/lib/posts/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "地図モード",
};

export default async function MapPage() {
  const posts = await listPosts({ sort: "newest" });

  return (
    <div className="page-wrap space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">地図モード</h1>
        <p className="mt-1 text-sm text-slate-500">
          投稿をマップ上で確認。現在地周辺・カテゴリ・距離順に対応。
        </p>
      </div>
      <MapModeClient posts={posts} />
    </div>
  );
}
