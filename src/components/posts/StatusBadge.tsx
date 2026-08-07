import { getStatusOptions, type StatusTone } from "@/constants/statuses";
import { normalizeCategory } from "@/constants/categories";
import type { CategoryId } from "@/types";

const TONE_CLASSES: Record<StatusTone, string> = {
  available: "bg-emerald-50 text-emerald-800 border-emerald-200",
  busy: "bg-amber-50 text-amber-800 border-amber-200",
  full: "bg-rose-50 text-rose-800 border-rose-200",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
  info: "bg-sky-50 text-sky-800 border-sky-200",
  alert: "bg-orange-50 text-orange-800 border-orange-200",
};

const TONE_DOT: Record<StatusTone, string> = {
  available: "bg-emerald-500",
  busy: "bg-amber-500",
  full: "bg-rose-500",
  closed: "bg-slate-400",
  info: "bg-sky-500",
  alert: "bg-orange-500",
};

export function StatusBadge({
  category,
  status,
  size = "md",
}: {
  category: CategoryId | string;
  status: string;
  size?: "sm" | "md";
}) {
  const normalized = normalizeCategory(category);
  const option = getStatusOptions(normalized).find((s) => s.value === status);
  const tone = option?.tone ?? "info";
  const label = option?.label ?? status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${TONE_CLASSES[tone]} ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
      }`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${TONE_DOT[tone]}`} aria-hidden />
      {label}
    </span>
  );
}
