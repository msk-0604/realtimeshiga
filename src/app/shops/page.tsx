import type { Metadata } from "next";
import Link from "next/link";
import { listShops } from "@/lib/social/actions";
import { getCategory } from "@/constants/categories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "公式店舗",
};

export default async function ShopsPage() {
  const shops = await listShops();

  return (
    <div className="page-wrap space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">公式店舗</h1>
        <p className="mt-1 text-sm text-slate-500">認証済みの店舗アカウント</p>
      </div>
      <div className="space-y-3">
        {shops.map((shop) => {
          const cat = getCategory(shop.category);
          return (
            <Link
              key={shop.id}
              href={`/shops/${shop.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {shop.name}{" "}
                    <span className="ml-1 rounded-full bg-[#1a6b8a] px-1.5 py-0.5 text-[10px] font-bold text-white">
                      ✓ 公式
                    </span>
                  </p>
                  <p className="text-sm text-slate-500">
                    {shop.municipality} · {shop.plan}
                  </p>
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                {shop.description}
              </p>
            </Link>
          );
        })}
      </div>
      <Link
        href="/shops/apply"
        className="block rounded-xl bg-[#1a6b8a] py-3 text-center text-sm font-semibold text-white"
      >
        公式店舗を申請する
      </Link>
    </div>
  );
}
