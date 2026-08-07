import Link from "next/link";
import { SITE } from "@/constants/region";

export function Header({ compact = false }: { compact?: boolean }) {
  return (
    <header className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <Link href="/" className="min-w-0">
          <p className="text-lg font-bold tracking-tight text-[#1a6b8a]">
            {SITE.name}
          </p>
          {!compact && (
            <p className="truncate text-xs text-slate-500">{SITE.catchCopy}</p>
          )}
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/login"
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600"
          >
            ログイン
          </Link>
          <Link
            href="/posts/new"
            className="rounded-full bg-[#1a6b8a] px-3 py-1.5 text-xs font-semibold text-white"
          >
            ＋ 投稿する
          </Link>
        </div>
      </div>
    </header>
  );
}

