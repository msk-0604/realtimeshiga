"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { verifyPostAction } from "@/lib/posts/actions";

export function VerifyButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await verifyPostAction(postId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage(result.message ?? "確認しました");
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="w-full rounded-xl border-2 border-[#1a6b8a] bg-white py-3.5 text-base font-semibold text-[#1a6b8a] hover:bg-[#e8f4f8] disabled:opacity-60"
      >
        {pending ? "更新中..." : "この情報はまだ正しい"}
      </button>
      {message && <p className="text-sm text-emerald-700">{message}</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <p className="text-xs text-slate-500">
        押すと「最終確認日時」が今の時刻に更新され、新しい情報として優先表示されます。
      </p>
    </div>
  );
}
