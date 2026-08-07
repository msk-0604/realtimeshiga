import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プレミアム",
};

const FEATURES = [
  "広告なし",
  "通知無制限",
  "お気に入り無制限",
  "人気ランキング閲覧",
  "AIおすすめ",
  "市町村フォロー",
];

export default function PremiumPage() {
  return (
    <div className="page-wrap space-y-5">
      <section className="rounded-2xl border border-[#1a6b8a]/25 bg-gradient-to-b from-[#e8f4f8] to-white p-6 dark:from-slate-900 dark:to-slate-950">
        <p className="text-xs font-semibold text-[#1a6b8a]">PREMIUM</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
          プレミアム会員
        </h1>
        <p className="mt-2 text-3xl font-bold text-[#1a6b8a]">
          月額 550円
          <span className="ml-1 text-sm font-medium text-slate-500">（税込）</span>
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          滋賀の“今”をもっと快適に。決済連携は準備中です。
        </p>
      </section>

      <ul className="space-y-2">
        {FEATURES.map((f) => (
          <li
            key={f}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium dark:border-slate-700 dark:bg-slate-900"
          >
            ✓ {f}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="w-full rounded-xl bg-[#1a6b8a] py-3.5 text-sm font-semibold text-white opacity-80"
        disabled
      >
        まもなく公開（決済準備中）
      </button>

      <section className="rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        <h2 className="font-bold text-slate-900 dark:text-white">収益化メニュー</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>公式店舗プラン</li>
          <li>広告掲載</li>
          <li>クーポン配信</li>
          <li>イベント / 求人掲載</li>
          <li>おすすめ表示</li>
        </ul>
        <Link href="/shops/apply" className="mt-3 inline-block text-[#1a6b8a] underline">
          店舗向けはこちら
        </Link>
      </section>
    </div>
  );
}
