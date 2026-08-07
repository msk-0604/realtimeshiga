"use client";

import { useMemo, useState } from "react";
import { MUNICIPALITIES, SITE } from "@/constants/region";
import { CATEGORIES } from "@/constants/categories";
import { getStatusOptions } from "@/constants/statuses";
import type { CategoryId } from "@/types";

export function SearchFilters({
  q = "",
  category = "",
  municipality = "",
  status = "",
  action = "/search",
}: {
  q?: string;
  category?: string;
  municipality?: string;
  status?: string;
  action?: string;
}) {
  const [selectedCategory, setSelectedCategory] = useState(category);
  const statusOptions = useMemo(
    () =>
      selectedCategory
        ? getStatusOptions(selectedCategory as CategoryId)
        : [],
    [selectedCategory]
  );

  return (
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

      <button
        type="submit"
        className="w-full rounded-xl bg-[#1a6b8a] py-3 text-sm font-semibold text-white hover:bg-[#155a74]"
      >
        検索する
      </button>
    </form>
  );
}
