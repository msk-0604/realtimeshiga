"use client";

import { useMemo, useState } from "react";
import { PostCard } from "@/components/posts/PostCard";
import type { PostWithDistance } from "@/types";

const PAGE = 5;

export function InfiniteFeed({
  initialPosts,
}: {
  initialPosts: PostWithDistance[];
}) {
  const [visible, setVisible] = useState(PAGE);
  const posts = useMemo(
    () => initialPosts.slice(0, visible),
    [initialPosts, visible]
  );
  const hasMore = visible < initialPosts.length;

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {hasMore && (
        <button
          type="button"
          onClick={() => setVisible((v) => v + PAGE)}
          className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
        >
          もっと見る
        </button>
      )}
    </div>
  );
}
