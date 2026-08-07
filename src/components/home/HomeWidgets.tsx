import Link from "next/link";
import { CATEGORIES } from "@/constants/categories";
import type { TodayShigaSummary } from "@/types";

export function FeedTabs({ active }: { active: string }) {
  const tabs = [
    { id: "popular", label: "🔥 今日人気" },
    { id: "rising", label: "📈 急上昇" },
    { id: "recommend", label: "⭐ おすすめ" },
  ] as const;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <Link
            key={t.id}
            href={`/?tab=${t.id}`}
            className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? "bg-[#1a6b8a] text-white"
                : "border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

export function CategoryScroller() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {CATEGORIES.map((c) => (
        <Link
          key={c.id}
          href={`/search?category=${c.id}`}
          className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1 rounded-2xl border border-slate-100 bg-white px-1 py-2.5 text-center dark:border-slate-700 dark:bg-slate-900"
        >
          <span className="text-2xl leading-none" aria-hidden>
            {c.icon}
          </span>
          <span className="text-[11px] font-medium text-slate-700 dark:text-slate-200">
            {c.shortLabel}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function TodayShigaCards({ summary }: { summary: TodayShigaSummary }) {
  const cards = [
    { label: "本日のイベント", value: `${summary.eventCount}件`, icon: "🎉" },
    { label: "新着投稿", value: `${summary.newPostCount}件`, icon: "✨" },
    { label: "人気スポット", value: summary.popularSpot, icon: "⭐" },
    { label: "交通情報", value: `${summary.trafficCount}件`, icon: "🚗" },
    {
      label: "今日の天気",
      value: `${summary.weatherTemp}`,
      sub: summary.weatherLabel,
      icon: "🌤",
    },
  ];

  return (
    <section>
      <h2 className="mb-2 text-base font-bold text-slate-900 dark:text-white">
        今日の滋賀
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cards.map((c) => (
          <div
            key={c.label}
            className="min-w-[8.5rem] shrink-0 rounded-2xl border border-slate-100 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
          >
            <p className="text-lg" aria-hidden>
              {c.icon}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">{c.label}</p>
            <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
              {c.value}
            </p>
            {"sub" in c && c.sub && (
              <p className="mt-0.5 text-[10px] text-slate-400 line-clamp-1">{c.sub}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function PostSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="h-48 bg-slate-200 dark:bg-slate-700" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}
