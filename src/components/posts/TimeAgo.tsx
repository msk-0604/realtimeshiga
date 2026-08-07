import { formatRelativeTime, isStale } from "@/lib/time";

/** 表示を「最終更新 ○分前」形式に統一 */
export function LastUpdatedLabel({ date }: { date: string }) {
  const relative = formatRelativeTime(date);
  const stale = isStale(date);

  return (
    <div>
      <p className="text-sm font-bold tracking-tight text-[#1a6b8a]">
        最終更新 {relative}
      </p>
      {stale && (
        <p className="mt-1 text-xs text-amber-700">情報が古い可能性があります</p>
      )}
    </div>
  );
}
