import type { Metadata } from "next";
import { FavoriteList } from "@/components/posts/FavoriteList";
import { listPosts } from "@/lib/posts/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "お気に入り",
};

export default async function FavoritesPage() {
  const posts = await listPosts({ sort: "newest" });

  return (
    <div className="page-wrap space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">お気に入り</h1>
        <p className="mt-1 text-sm text-slate-500">
          この端末の localStorage に保存されます（ログイン不要）。
        </p>
      </div>
      <FavoriteList allPosts={posts} />
    </div>
  );
}
