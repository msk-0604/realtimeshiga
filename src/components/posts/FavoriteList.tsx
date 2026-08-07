"use client";

import { PostCard } from "@/components/posts/PostCard";
import { useFavorites, useHasMounted } from "@/hooks/useFavorites";
import type { Post } from "@/types";

export function FavoriteList({ allPosts }: { allPosts: Post[] }) {
  const { favorites } = useFavorites();
  const mounted = useHasMounted();

  if (!mounted) {
    return <p className="text-sm text-slate-500">読み込み中...</p>;
  }

  const posts = favorites
    .map((id) => allPosts.find((p) => p.id === id))
    .filter((p): p is Post => Boolean(p));

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm text-slate-600">お気に入りはまだありません。</p>
        <p className="mt-1 text-xs text-slate-400">
          投稿カードの ♡ をタップするとここに表示されます。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
