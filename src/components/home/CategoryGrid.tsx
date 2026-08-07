import Link from "next/link";
import { CATEGORIES } from "@/constants/categories";

export function CategoryGrid({ limit }: { limit?: number }) {
  const items = limit ? CATEGORIES.slice(0, limit) : CATEGORIES;

  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
      {items.map((c) => (
        <Link
          key={c.id}
          href={`/search?category=${c.id}`}
          className="flex flex-col items-center gap-1 rounded-xl border border-slate-100 bg-white px-1 py-3 text-center hover:border-[#b7d7e4] hover:bg-[#f5fafc]"
        >
          <span className="text-2xl leading-none" aria-hidden>
            {c.icon}
          </span>
          <span className="text-[11px] font-medium leading-tight text-slate-700">
            {c.shortLabel}
          </span>
        </Link>
      ))}
    </div>
  );
}
