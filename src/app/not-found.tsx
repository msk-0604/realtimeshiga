import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-wrap text-center space-y-4">
      <h1 className="text-xl font-bold text-slate-900">ページが見つかりません</h1>
      <p className="text-sm text-slate-500">
        お探しの投稿またはページは存在しないか、削除された可能性があります。
      </p>
      <Link
        href="/"
        className="inline-block rounded-xl bg-[#1a6b8a] px-5 py-3 text-sm font-semibold text-white"
      >
        ホームへ戻る
      </Link>
    </div>
  );
}
