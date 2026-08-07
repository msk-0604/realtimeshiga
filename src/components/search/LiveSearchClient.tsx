"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/constants/categories";
import { MUNICIPALITIES } from "@/constants/region";
import { PostCard } from "@/components/posts/PostCard";
import { PostSkeleton } from "@/components/home/HomeWidgets";
import type { CategoryId, PostWithDistance } from "@/types";

export function LiveSearchClient({
  initialPosts,
  initialQ = "",
  initialCategory = "",
  initialMunicipality = "",
}: {
  initialPosts: PostWithDistance[];
  initialQ?: string;
  initialCategory?: string;
  initialMunicipality?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [municipality, setMunicipality] = useState(initialMunicipality);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (category) params.set("category", category);
      if (municipality) params.set("municipality", municipality);
      startTransition(() => {
        router.replace(`/search?${params.toString()}`);
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [q, category, municipality, router]);

  const filtered = useMemo(() => {
    let list = initialPosts;
    if (category) list = list.filter((p) => p.category === category);
    if (municipality) list = list.filter((p) => p.municipality === municipality);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((p) =>
        [p.title, p.shop_name, p.content, p.municipality, p.address]
          .join(" ")
          .toLowerCase()
          .includes(needle)
      );
    }
    return list;
  }, [initialPosts, q, category, municipality]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="店名・場所・情報を検索"
          className="input"
          aria-label="リアルタイム検索"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input text-sm"
          >
            <option value="">すべてのカテゴリー</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
          <select
            value={municipality}
            onChange={(e) => setMunicipality(e.target.value)}
            className="input text-sm"
          >
            <option value="">すべての市町村</option>
            {MUNICIPALITIES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-slate-500">
          入力するとリアルタイムで絞り込みます
          {pending ? " …更新中" : ""}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() =>
              setCategory((prev) => (prev === c.id ? "" : (c.id as CategoryId)))
            }
            className={`flex w-[4.25rem] shrink-0 flex-col items-center gap-1 rounded-2xl border px-1 py-2 text-center ${
              category === c.id
                ? "border-[#1a6b8a] bg-[#e8f4f8]"
                : "border-slate-100 bg-white dark:border-slate-700 dark:bg-slate-900"
            }`}
          >
            <span className="text-xl">{c.icon}</span>
            <span className="text-[10px] font-medium">{c.shortLabel}</span>
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-600">{filtered.length}件ヒット</p>

      <div className="space-y-3">
        {pending && filtered.length === 0 ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : (
          filtered.map((post) => <PostCard key={post.id} post={post} />)
        )}
        {filtered.length === 0 && !pending && (
          <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            条件に合う投稿がありません
          </p>
        )}
      </div>
    </div>
  );
}
