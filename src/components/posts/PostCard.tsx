import Link from "next/link";
import { getCategory } from "@/constants/categories";
import { AUTHOR_TYPE_LABELS } from "@/constants/statuses";
import { StatusBadge } from "@/components/posts/StatusBadge";
import { LastUpdatedLabel } from "@/components/posts/TimeAgo";
import { FavoriteButton } from "@/components/posts/FavoriteButton";
import type { Post } from "@/types";

export function PostCard({ post }: { post: Post }) {
  const category = getCategory(post.category);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <span aria-hidden>{category.icon}</span>
          <span>{category.label}</span>
        </div>
        <FavoriteButton postId={post.id} />
      </div>

      <h2 className="mt-2 text-base font-bold leading-snug text-slate-900">
        <Link href={`/posts/${post.id}`} className="hover:text-[#1a6b8a]">
          {post.title}
        </Link>
      </h2>

      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-slate-700">
        <span className="font-medium">{post.shop_name}</span>
        {post.is_verified_shop && (
          <span className="rounded bg-[#e8f4f8] px-1.5 py-0.5 text-xs font-semibold text-[#1a6b8a]">
            ✓ 公式店舗
          </span>
        )}
      </div>

      <p className="mt-1 text-sm text-slate-500">
        {post.municipality}
        <span className="mx-1">·</span>
        {post.address}
      </p>

      <div className="mt-3">
        <StatusBadge category={post.category} status={post.status} />
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-700">
        {post.content}
      </p>

      <div className="mt-3 flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
        <div>
          <LastUpdatedLabel date={post.last_verified_at} />
          <p className="mt-1 text-xs text-slate-400">
            {AUTHOR_TYPE_LABELS[post.author_type] ?? "一般ユーザー"}
          </p>
        </div>
        <Link
          href={`/posts/${post.id}`}
          className="shrink-0 rounded-lg bg-[#1a6b8a] px-3 py-2 text-sm font-medium text-white hover:bg-[#155a74]"
        >
          詳細を見る
        </Link>
      </div>
    </article>
  );
}
