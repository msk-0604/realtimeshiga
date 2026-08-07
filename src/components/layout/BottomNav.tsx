"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS: {
  href: string;
  label: string;
  icon: string;
  primary?: boolean;
}[] = [
  { href: "/", label: "ホーム", icon: "🏠" },
  { href: "/search", label: "検索", icon: "🔍" },
  { href: "/posts/new", label: "投稿", icon: "＋", primary: true },
  { href: "/favorites", label: "お気に入り", icon: "♡" },
  { href: "/mypage", label: "マイページ", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]"
      aria-label="メインナビゲーション"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1">
        {ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          if (item.primary) {
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className="-mt-3 flex flex-col items-center gap-0.5"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1a6b8a] text-xl font-bold text-white shadow-md shadow-[#1a6b8a]/30">
                    {item.icon}
                  </span>
                  <span className="text-[10px] font-semibold text-[#1a6b8a]">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-2 text-[10px] ${
                  active ? "font-semibold text-[#1a6b8a]" : "text-slate-500"
                }`}
              >
                <span className="text-lg leading-none" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
