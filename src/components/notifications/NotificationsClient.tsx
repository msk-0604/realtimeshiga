"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useDeviceId } from "@/hooks/useFavorites";
import {
  listNotifications,
  markNotificationsReadAction,
} from "@/lib/social/actions";
import { formatRelativeTime } from "@/lib/time";
import type { NotificationItem } from "@/types";

export function NotificationsClient() {
  const deviceId = useDeviceId();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!deviceId) return;
    startTransition(async () => {
      const data = await listNotifications(deviceId);
      setItems(data);
    });
  }, [deviceId]);

  function markAllRead() {
    startTransition(async () => {
      await markNotificationsReadAction(deviceId);
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">通知</h1>
        <button
          type="button"
          onClick={markAllRead}
          disabled={pending}
          className="text-sm text-[#1a6b8a]"
        >
          すべて既読
        </button>
      </div>

      <ul className="space-y-2">
        {items.map((n) => (
          <li key={n.id}>
            <Link
              href={n.link || "/"}
              className={`block rounded-xl border p-4 ${
                n.is_read
                  ? "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
                  : "border-[#b7d7e4] bg-[#f5fafc] dark:border-slate-600 dark:bg-slate-800"
              }`}
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {n.title}
              </p>
              {n.body && (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{n.body}</p>
              )}
              <p className="mt-2 text-xs text-slate-400">
                {formatRelativeTime(n.created_at)}
              </p>
            </Link>
          </li>
        ))}
        {items.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            通知はまだありません
          </p>
        )}
      </ul>
    </div>
  );
}

export function NotificationBell() {
  return (
    <Link
      href="/notifications"
      className="relative rounded-full border border-slate-200 px-2.5 py-1.5 text-sm dark:border-slate-700"
      aria-label="通知"
    >
      🔔
    </Link>
  );
}
