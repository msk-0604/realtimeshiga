"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  adminDeletePostAction,
  adminHidePostAction,
  adminShowPostAction,
  adminVerifyShopAction,
} from "@/lib/posts/actions";
import { getCategory } from "@/constants/categories";
import { formatRelativeTime } from "@/lib/time";
import type { Post, Report } from "@/types";
import { REPORT_REASONS } from "@/constants/statuses";

export function AdminPostRow({ post, reported }: { post: Post; reported?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const category = getCategory(post.category);

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <div className={`rounded-xl border p-3 ${reported ? "border-rose-200 bg-rose-50/40" : "border-slate-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-slate-500">
            {category.icon} {category.label}
            {reported && <span className="ml-2 text-rose-600 font-semibold">通報あり</span>}
            {!post.is_active && <span className="ml-2 text-slate-500">非表示</span>}
          </p>
          <Link href={`/posts/${post.id}`} className="mt-0.5 block truncate font-semibold text-slate-900 hover:text-[#1a6b8a]">
            {post.title}
          </Link>
          <p className="text-sm text-slate-600">
            {post.shop_name} · {post.municipality}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            最終更新 {formatRelativeTime(post.last_verified_at)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`/posts/${post.id}/edit`}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium"
        >
          編集
        </Link>
        {post.is_active ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => adminHidePostAction(post.id))}
            className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800"
          >
            非表示
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => adminShowPostAction(post.id))}
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-800"
          >
            再表示
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(() => adminVerifyShopAction(post.id, !post.is_verified_shop))
          }
          className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-800"
        >
          {post.is_verified_shop ? "公式解除" : "店舗認証"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (confirm("この投稿を削除しますか？")) {
              run(() => adminDeletePostAction(post.id));
            }
          }}
          className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700"
        >
          削除
        </button>
      </div>
    </div>
  );
}

export function AdminLoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mx-auto max-w-sm space-y-4 rounded-xl border border-slate-200 bg-white p-6"
      action={(formData) => {
        startTransition(async () => {
          const { adminLoginAction } = await import("@/lib/posts/actions");
          const result = await adminLoginAction(formData);
          if (result.ok) router.refresh();
          else alert(result.error);
        });
      }}
    >
      <h1 className="text-lg font-bold text-slate-900">管理画面ログイン</h1>
      <p className="text-sm text-slate-500">
        管理者パスワードを入力してください。
      </p>
      <input
        type="password"
        name="password"
        className="input"
        placeholder="パスワード"
        required
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[#1a6b8a] py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "確認中..." : "ログイン"}
      </button>
    </form>
  );
}

export function AdminLogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const { adminLogoutAction } = await import("@/lib/posts/actions");
          await adminLogoutAction();
          router.refresh();
        });
      }}
      className="text-sm text-slate-500 underline"
    >
      ログアウト
    </button>
  );
}

export function ReportList({ reports }: { reports: Report[] }) {
  const reasonLabel = (reason: string) =>
    REPORT_REASONS.find((r) => r.value === reason)?.label ?? reason;

  if (reports.length === 0) {
    return <p className="text-sm text-slate-500">通報はまだありません。</p>;
  }

  return (
    <ul className="space-y-2">
      {reports.map((r) => (
        <li key={r.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
          <Link href={`/posts/${r.post_id}`} className="font-medium text-[#1a6b8a]">
            投稿を見る
          </Link>
          <p className="mt-1 text-slate-700">{reasonLabel(r.reason)}</p>
          {r.detail && <p className="text-slate-500">{r.detail}</p>}
          <p className="mt-1 text-xs text-slate-400">
            {formatRelativeTime(r.created_at)}
          </p>
        </li>
      ))}
    </ul>
  );
}
