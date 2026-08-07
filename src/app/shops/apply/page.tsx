import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "公式店舗申請",
};

export default function ShopApplyPage() {
  return (
    <div className="page-wrap space-y-4">
      <h1 className="text-xl font-bold">公式店舗申請</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        店舗オーナーはログイン後に申請できます。審査後、青バッジ付き公式アカウントになります。
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
        <li>店舗情報・営業時間・電話・HP・Googleマップを掲載</li>
        <li>公式投稿で信頼バッジ表示</li>
        <li>スタンダード / プレミアムプラン対応（準備中）</li>
      </ul>
      <Link
        href="/login"
        className="block rounded-xl bg-[#1a6b8a] py-3 text-center text-sm font-semibold text-white"
      >
        ログインして申請
      </Link>
    </div>
  );
}
