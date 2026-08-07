import Link from "next/link";
import { getCategory } from "@/constants/categories";
import { formatRelativeTime } from "@/lib/time";
import { StatusBadge } from "@/components/posts/StatusBadge";
import { PostEngagementBar } from "@/components/posts/PostEngagementBar";
import type { PostWithDistance } from "@/types";

export function PostCard({ post }: { post: PostWithDistance }) {
  const category = getCategory(post.category);
  const placeholder =
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d7ebf3"/><stop offset="1" stop-color="#1a6b8a" stop-opacity=".35"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="52%" text-anchor="middle" font-size="64">${category.icon}</text></svg>`
    );

  const imageSrc =
    post.image_url && !post.image_url.startsWith("data:")
      ? post.image_url
      : placeholder;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm animate-fade-in dark:border-slate-700 dark:bg-slate-900">
      <Link href={`/posts/${post.id}`} className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          className="h-48 w-full object-cover bg-slate-100 dark:bg-slate-800"
        />
      </Link>

      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-200">
            <span aria-hidden>{category.icon}</span>
            {category.label}
          </span>
          <time dateTime={post.last_verified_at}>
            {formatRelativeTime(post.last_verified_at)}
          </time>
        </div>

        <h2 className="text-base font-bold leading-snug text-slate-900 dark:text-white">
          <Link href={`/posts/${post.id}`}>{post.title}</Link>
        </h2>

        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <span className="font-medium">{post.shop_name}</span>
          {post.is_verified_shop && (
            <span className="inline-flex items-center rounded-full bg-[#1a6b8a] px-1.5 py-0.5 text-[10px] font-bold text-white">
              ✓ 公式
            </span>
          )}
          <span className="text-slate-400">·</span>
          <span>{post.municipality}</span>
          {post.distance_km != null && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">
              {post.distance_km < 1
                ? `${Math.round(post.distance_km * 1000)}m`
                : `${post.distance_km.toFixed(1)}km`}
            </span>
          )}
        </div>

        <StatusBadge category={post.category} status={post.status} size="sm" />

        <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {post.content}
        </p>

        <PostEngagementBar post={post} />
      </div>
    </article>
  );
}
