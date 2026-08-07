import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory } from "@/constants/categories";
import { AUTHOR_TYPE_LABELS } from "@/constants/statuses";
import { StatusBadge } from "@/components/posts/StatusBadge";
import { LastUpdatedLabel } from "@/components/posts/TimeAgo";
import { FavoriteButton } from "@/components/posts/FavoriteButton";
import { VerifyButton } from "@/components/posts/VerifyButton";
import { ReportForm } from "@/components/posts/ReportForm";
import { PostEngagementBar } from "@/components/posts/PostEngagementBar";
import { CommentSection } from "@/components/posts/CommentSection";
import { ViewRecorder } from "@/components/posts/ViewRecorder";
import { getPostById } from "@/lib/posts/queries";
import { listComments } from "@/lib/social/actions";
import { formatRelativeTime } from "@/lib/time";
import { sanitizeUrl } from "@/lib/validation";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return { title: "投稿が見つかりません" };
  return {
    title: post.title,
    description: `${post.shop_name}（${post.municipality}）のリアルタイム情報`,
  };
}

export default async function PostDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post || !post.is_active) notFound();

  const category = getCategory(post.category);
  const safeUrl = sanitizeUrl(post.url);
  const safeImage = sanitizeUrl(post.image_url);
  const comments = await listComments(id, "latest");

  return (
    <div className="page-wrap space-y-5">
      <ViewRecorder postId={post.id} />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <span aria-hidden>{category.icon}</span> {category.label}
          </p>
          <h1 className="mt-1 text-xl font-bold leading-snug text-slate-900 dark:text-white">
            {post.title}
          </h1>
        </div>
        <FavoriteButton postId={post.id} />
      </div>

      {safeImage && !safeImage.startsWith("data:") && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safeImage}
          alt=""
          className="max-h-72 w-full rounded-2xl object-cover border border-slate-100"
        />
      )}

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-slate-900 dark:text-white">{post.shop_name}</p>
          {post.is_verified_shop && (
            <span className="rounded-full bg-[#1a6b8a] px-1.5 py-0.5 text-xs font-semibold text-white">
              ✓ 公式
            </span>
          )}
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {post.municipality}
          <br />
          {post.address}
        </p>
        <StatusBadge category={post.category} status={post.status} />
        <LastUpdatedLabel date={post.last_verified_at} />
        <p className="text-xs text-slate-400">
          投稿者：{AUTHOR_TYPE_LABELS[post.author_type] ?? "一般ユーザー"}
        </p>
        <PostEngagementBar post={post} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">詳細</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          {post.content}
        </p>
        {safeUrl && (
          <a
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium text-[#1a6b8a] underline"
          >
            関連リンクを開く
          </a>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 space-y-1">
        <p>作成：{formatRelativeTime(post.created_at)}</p>
        <p>更新：{formatRelativeTime(post.updated_at)}</p>
        <p>最終確認：{formatRelativeTime(post.last_verified_at)}</p>
      </section>

      <VerifyButton postId={post.id} />

      <CommentSection postId={post.id} initialComments={comments} />

      <div className="flex gap-2">
        <Link
          href={`/posts/${post.id}/edit`}
          className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          編集する
        </Link>
      </div>

      <ReportForm postId={post.id} />
    </div>
  );
}
