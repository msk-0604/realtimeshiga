"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MUNICIPALITIES, SITE } from "@/constants/region";
import { CATEGORIES } from "@/constants/categories";
import { getStatusOptions } from "@/constants/statuses";
import type { CategoryId } from "@/types";

export function SearchFilters({
  q = "",
  category = "",
  municipality = "",
  status = "",
  sort = "newest",
  lat = "",
  lng = "",
  radiusKm = "20",
  action = "/search",
}: {
  q?: string;
  category?: string;
  municipality?: string;
  status?: string;
  sort?: string;
  lat?: string;
  lng?: string;
  radiusKm?: string;
  action?: string;
}) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const statusOptions = useMemo(
    () =>
      selectedCategory ? getStatusOptions(selectedCategory as CategoryId) : [],
    [selectedCategory]
  );

  function searchNearby() {
    setLocError(null);
    if (!navigator.geolocation) {
      setLocError("この端末では位置情報が使えません");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (selectedCategory) params.set("category", selectedCategory);
        if (municipality) params.set("municipality", municipality);
        if (status) params.set("status", status);
        params.set("sort", "nearby");
        params.set("lat", pos.coords.latitude.toFixed(6));
        params.set("lng", pos.coords.longitude.toFixed(6));
        params.set("radiusKm", radiusKm || "20");
        setLocating(false);
        router.push(`/search?${params.toString()}`);
      },
      () => {
        setLocError("位置情報の取得に失敗しました");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="space-y-3">
      <form action={action} method="get" className="space-y-3">
        <div>
          <label htmlFor="q" className="sr-only">
            検索
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder={SITE.searchPlaceholder}
            className="input"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select
            name="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
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
            name="municipality"
            defaultValue={municipality}
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

        {statusOptions.length > 0 && (
          <select name="status" defaultValue={status} className="input text-sm">
            <option value="">すべてのステータス</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        )}

        <select name="sort" defaultValue={sort === "nearby" ? "nearby" : sort} className="input text-sm">
          <option value="newest">新しい順</option>
          <option value="oldest">古い順</option>
          <option value="nearby">現在地から近い順</option>
        </select>

        <input type="hidden" name="lat" value={lat} />
        <input type="hidden" name="lng" value={lng} />
        <input type="hidden" name="radiusKm" value={radiusKm} />

        <button
          type="submit"
          className="w-full rounded-xl bg-[#1a6b8a] py-3 text-sm font-semibold text-white hover:bg-[#155a74]"
        >
          検索する
        </button>
      </form>

      <button
        type="button"
        onClick={searchNearby}
        disabled={locating}
        className="w-full rounded-xl border-2 border-[#1a6b8a] bg-white py-3 text-sm font-semibold text-[#1a6b8a] disabled:opacity-60"
      >
        {locating ? "位置情報を取得中..." : "📍 現在地周辺を検索"}
      </button>
      {locError && <p className="text-xs text-rose-600">{locError}</p>}
    </div>
  );
}
