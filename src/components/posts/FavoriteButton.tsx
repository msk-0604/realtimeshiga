"use client";

import { useFavorites } from "@/hooks/useFavorites";

export function FavoriteButton({
  postId,
  className = "",
}: {
  postId: string;
  className?: string;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(postId);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(postId)}
      aria-label={active ? "お気に入り解除" : "お気に入り登録"}
      aria-pressed={active}
      className={`rounded-lg border px-2.5 py-1.5 text-sm transition-colors ${
        active
          ? "border-rose-200 bg-rose-50 text-rose-600"
          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
      } ${className}`}
    >
      {active ? "♥" : "♡"}
    </button>
  );
}
