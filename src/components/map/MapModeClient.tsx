"use client";

import { useMemo, useState } from "react";
import { CATEGORIES } from "@/constants/categories";
import { NearbyMap } from "@/components/map/NearbyMap";
import { PostCard } from "@/components/posts/PostCard";
import { distanceKm, resolvePostCoords } from "@/lib/geo";
import type { CategoryId, PostWithDistance } from "@/types";

export function MapModeClient({ posts }: { posts: PostWithDistance[] }) {
  const [category, setCategory] = useState<string>("");
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = posts;
    if (category) list = list.filter((p) => p.category === category);
    if (nearbyOnly && center) {
      list = list
        .map((p) => {
          const c = resolvePostCoords(p);
          if (!c) return { ...p, distance_km: undefined };
          return {
            ...p,
            distance_km: distanceKm(center.lat, center.lng, c.lat, c.lng),
          };
        })
        .filter((p) => p.distance_km != null && p.distance_km <= 20)
        .sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99));
    } else if (center) {
      list = list
        .map((p) => {
          const c = resolvePostCoords(p);
          if (!c) return p;
          return {
            ...p,
            distance_km: distanceKm(center.lat, center.lng, c.lat, c.lng),
          };
        })
        .sort((a, b) => (a.distance_km ?? 99) - (b.distance_km ?? 99));
    }
    return list;
  }, [posts, category, nearbyOnly, center]);

  function useLocation() {
    setError(null);
    if (!navigator.geolocation) {
      setError("位置情報が使えません");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNearbyOnly(true);
        setLocating(false);
      },
      () => {
        setError("位置情報の取得に失敗しました");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={useLocation}
          disabled={locating}
          className="rounded-full bg-[#1a6b8a] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {locating ? "取得中…" : "📍 現在地周辺"}
        </button>
        <button
          type="button"
          onClick={() => setNearbyOnly(false)}
          className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium dark:border-slate-700"
        >
          全域
        </button>
        <button
          type="button"
          onClick={() => setCategory("")}
          className={`rounded-full px-3 py-2 text-xs font-medium ${
            !category ? "bg-slate-900 text-white" : "border border-slate-200 dark:border-slate-700"
          }`}
        >
          すべて
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id as CategoryId)}
            className={`rounded-full px-3 py-2 text-xs font-medium ${
              category === c.id
                ? "bg-[#1a6b8a] text-white"
                : "border border-slate-200 dark:border-slate-700"
            }`}
          >
            {c.icon} {c.shortLabel}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}

      <NearbyMap
        posts={filtered}
        center={center ?? { lat: 35.1, lng: 136.05 }}
      />

      <p className="text-sm text-slate-600">{filtered.length}件 · 距離順</p>
      <div className="space-y-3">
        {filtered.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
