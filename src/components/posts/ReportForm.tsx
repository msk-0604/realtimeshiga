"use client";

import { useState, useTransition } from "react";
import { REPORT_REASONS } from "@/constants/statuses";
import { reportPostAction } from "@/lib/posts/actions";
import { useDeviceId } from "@/hooks/useFavorites";

export function ReportForm({ postId }: { postId: string }) {
  const deviceId = useDeviceId();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setMessage(null);
    setError(null);
    formData.set("post_id", postId);
    formData.set("device_id", deviceId);

    startTransition(async () => {
      const result = await reportPostAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage(result.message ?? "通報を受け付けました");
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm text-slate-500 underline underline-offset-2 hover:text-slate-700"
        >
          この投稿を通報
        </button>
        {message && <p className="mt-2 text-sm text-emerald-700">{message}</p>}
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      <p className="text-sm font-semibold text-slate-800">通報理由</p>
      <select name="reason" className="input" required defaultValue="incorrect">
        {REPORT_REASONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <textarea
        name="detail"
        className="input min-h-20"
        placeholder="詳細（任意）"
        maxLength={500}
      />
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending || !deviceId}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "送信中..." : "通報する"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
