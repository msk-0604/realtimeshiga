"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const startY = useRef(0);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  return (
    <div
      onTouchStart={(e) => {
        if (window.scrollY <= 0) startY.current = e.touches[0].clientY;
      }}
      onTouchMove={(e) => {
        if (window.scrollY > 0 || refreshing) return;
        const dy = e.touches[0].clientY - startY.current;
        if (dy > 0) setPull(Math.min(dy, 80));
      }}
      onTouchEnd={() => {
        if (pull > 56) {
          setRefreshing(true);
          router.refresh();
          window.setTimeout(() => {
            setRefreshing(false);
            setPull(0);
          }, 600);
        } else {
          setPull(0);
        }
      }}
    >
      <div
        className="pointer-events-none text-center text-xs text-[#1a6b8a] transition-all"
        style={{ height: pull || (refreshing ? 28 : 0), opacity: pull || refreshing ? 1 : 0 }}
      >
        {refreshing ? "更新中…" : pull > 56 ? "離して更新" : "引っ張って更新"}
      </div>
      {children}
    </div>
  );
}
