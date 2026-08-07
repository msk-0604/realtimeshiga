"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useDeviceId } from "@/hooks/useFavorites";
import {
  recordShareAction,
  toggleLikeAction,
} from "@/lib/social/actions";
import type { Post } from "@/types";

export function PostEngagementBar({ post }: { post: Post }) {
  const deviceId = useDeviceId();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [shareCount, setShareCount] = useState(post.share_count);
  const [pending, startTransition] = useTransition();

  function onLike() {
    startTransition(async () => {
      const result = await toggleLikeAction(post.id, deviceId);
      if (result.ok && result.data) {
        setLiked(result.data.liked);
        setLikeCount(result.data.like_count);
      }
    });
  }

  async function onShare() {
    const url = `${window.location.origin}/posts/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: post.content, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("リンクをコピーしました");
      }
      await recordShareAction(post.id);
      setShareCount((c) => c + 1);
    } catch {
      // cancelled
    }
  }

  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
      <button
        type="button"
        disabled={pending || !deviceId}
        onClick={onLike}
        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 ${
          liked ? "text-rose-600" : "hover:bg-slate-50 dark:hover:bg-slate-800"
        }`}
        aria-label="いいね"
      >
        <span>{liked ? "❤️" : "♡"}</span>
        <span>{likeCount}</span>
      </button>

      <Link
        href={`/posts/${post.id}#comments`}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800"
        aria-label="コメント"
      >
        <span>💬</span>
        <span>{post.comment_count}</span>
      </Link>

      <span className="inline-flex items-center gap-1 px-2 py-1" aria-label="閲覧数">
        <span>👀</span>
        <span>{post.view_count}</span>
      </span>

      <button
        type="button"
        onClick={onShare}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-800"
        aria-label="共有"
      >
        <span>📤</span>
        <span>{shareCount}</span>
      </button>
    </div>
  );
}
