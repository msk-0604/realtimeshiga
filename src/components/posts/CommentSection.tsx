"use client";

import { useState, useTransition } from "react";
import { useDeviceId } from "@/hooks/useFavorites";
import {
  addCommentAction,
  toggleCommentLikeAction,
} from "@/lib/social/actions";
import { formatRelativeTime } from "@/lib/time";
import type { Comment } from "@/types";

export function CommentSection({
  postId,
  initialComments,
}: {
  postId: string;
  initialComments: Comment[];
}) {
  const deviceId = useDeviceId();
  const [extra, setExtra] = useState<Comment[]>([]);
  const [sort, setSort] = useState<"latest" | "popular">("latest");
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [likeOverrides, setLikeOverrides] = useState<Record<string, number>>({});

  const merged = [...extra, ...initialComments].filter(
    (c, i, arr) => arr.findIndex((x) => x.id === c.id) === i
  );

  const sorted = [...merged].sort((a, b) =>
    sort === "popular"
      ? (likeOverrides[b.id] ?? b.like_count) - (likeOverrides[a.id] ?? a.like_count)
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const totalCount = sorted.reduce(
    (n, c) => n + 1 + (c.replies?.length ?? 0),
    0
  );

  function submit() {
    setError(null);
    const fd = new FormData();
    fd.set("post_id", postId);
    fd.set("content", content);
    fd.set("device_id", deviceId);
    fd.set("author_name", "ゲスト");
    if (replyTo) fd.set("parent_id", replyTo);

    const text = content;
    startTransition(async () => {
      const result = await addCommentAction(fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setContent("");
      setReplyTo(null);
      const optimistic: Comment = {
        id: result.data?.id ?? crypto.randomUUID(),
        post_id: postId,
        user_id: null,
        parent_id: replyTo,
        device_id: deviceId,
        author_name: "ゲスト",
        content: text,
        like_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        replies: [],
      };
      if (replyTo) {
        setExtra((prev) => {
          const updatedRoots = merged.map((c) =>
            c.id === replyTo
              ? { ...c, replies: [...(c.replies ?? []), optimistic] }
              : c
          );
          return updatedRoots.filter((c) => !initialComments.some((i) => i.id === c.id));
        });
        // also patch replies onto a synthetic extra root copy
        setExtra((prev) => [
          {
            ...(merged.find((c) => c.id === replyTo) as Comment),
            replies: [
              ...((merged.find((c) => c.id === replyTo)?.replies as Comment[]) ?? []),
              optimistic,
            ],
          },
          ...prev.filter((c) => c.id !== replyTo),
        ]);
      } else {
        setExtra((prev) => [optimistic, ...prev]);
      }
    });
  }

  return (
    <section
      id="comments"
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          コメント {totalCount}
        </h2>
        <div className="flex gap-1 text-xs">
          <button
            type="button"
            onClick={() => setSort("latest")}
            className={`rounded-full px-2.5 py-1 ${sort === "latest" ? "bg-[#1a6b8a] text-white" : "bg-slate-100 dark:bg-slate-800"}`}
          >
            最新順
          </button>
          <button
            type="button"
            onClick={() => setSort("popular")}
            className={`rounded-full px-2.5 py-1 ${sort === "popular" ? "bg-[#1a6b8a] text-white" : "bg-slate-100 dark:bg-slate-800"}`}
          >
            人気順
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {replyTo && (
          <p className="text-xs text-[#1a6b8a]">
            返信モード{" "}
            <button type="button" className="underline" onClick={() => setReplyTo(null)}>
              解除
            </button>
          </p>
        )}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="input min-h-20"
          placeholder="コメントを書く…"
          maxLength={500}
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="button"
          disabled={pending || !content.trim()}
          onClick={submit}
          className="rounded-xl bg-[#1a6b8a] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "送信中..." : "コメントする"}
        </button>
      </div>

      <ul className="space-y-3">
        {sorted.map((c) => {
          const likes = likeOverrides[c.id] ?? c.like_count;
          return (
            <li
              key={c.id}
              className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {c.author_name}
                </p>
                <p className="text-xs text-slate-400">
                  {formatRelativeTime(c.created_at)}
                </p>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
                {c.content}
              </p>
              <div className="mt-2 flex gap-3 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() =>
                    startTransition(async () => {
                      const r = await toggleCommentLikeAction(c.id, deviceId);
                      if (r.ok && r.data) {
                        setLikeOverrides((prev) => ({
                          ...prev,
                          [c.id]: r.data!.like_count,
                        }));
                      }
                    })
                  }
                >
                  ❤️ {likes}
                </button>
                <button type="button" onClick={() => setReplyTo(c.id)}>
                  返信
                </button>
              </div>
              {c.replies && c.replies.length > 0 && (
                <ul className="mt-3 space-y-2 border-l-2 border-slate-200 pl-3 dark:border-slate-600">
                  {c.replies.map((r) => (
                    <li key={r.id}>
                      <p className="text-xs font-semibold">{r.author_name}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-200">
                        {r.content}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
        {sorted.length === 0 && (
          <p className="text-sm text-slate-500">まだコメントはありません</p>
        )}
      </ul>
    </section>
  );
}
