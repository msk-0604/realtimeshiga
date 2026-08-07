import Link from "next/link";
import { CATEGORIES } from "@/constants/categories";

export function CategoryGrid({ limit }: { limit?: number }) {
  const items = limit ? CATEGORIES.slice(0, limit) : CATEGORIES;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((c) => (
        <Link
          key={c.id}
          href={`/search?category=${c.id}`}
          className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1 rounded-2xl border border-slate-100 bg-white px-1 py-3 text-center dark:border-slate-700 dark:bg-slate-900"
        >
          <span className="text-2xl leading-none" aria-hidden>
            {c.icon}
          </span>
          <span className="text-[11px] font-medium leading-tight text-slate-700 dark:text-slate-200">
            {c.shortLabel}
          </span>
        </Link>
      ))}
    </div>
  );
}
