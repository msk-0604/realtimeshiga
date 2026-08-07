"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signInAction, signUpAction } from "@/lib/auth/actions";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const title = useMemo(
    () => (mode === "signin" ? "ログイン" : "新規登録"),
    [mode]
  );

  function handleSubmit(formData: FormData) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result =
        mode === "signin"
          ? await signInAction(formData)
          : await signUpAction(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setMessage(result.message ?? "完了しました");
      if (mode === "signin" || result.message === "登録しました") {
        router.push("/mypage");
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
      <div className="flex gap-2 rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 rounded-md py-2 text-sm font-medium ${
            mode === "signin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          ログイン
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-md py-2 text-sm font-medium ${
            mode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          新規登録
        </button>
      </div>

      <h1 className="text-lg font-bold text-slate-900">{title}</h1>
      <p className="text-sm text-slate-500">
        一般の閲覧・投稿はログインなしでも可能です。店舗アカウントはログイン推奨です。
      </p>

      <form action={handleSubmit} className="space-y-3">
        {mode === "signup" && (
          <input
            name="display_name"
            className="input"
            placeholder="表示名"
            maxLength={40}
          />
        )}
        <input
          name="email"
          type="email"
          className="input"
          placeholder="メールアドレス"
          required
          autoComplete="email"
        />
        <input
          name="password"
          type="password"
          className="input"
          placeholder="パスワード（6文字以上）"
          required
          minLength={6}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
        />
        {mode === "signup" && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" name="as_shop" value="1" className="rounded" />
            店舗・施設オーナーとして登録する
          </label>
        )}

        {error && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-[#1a6b8a] py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "処理中..." : title}
        </button>
      </form>
    </div>
  );
}
