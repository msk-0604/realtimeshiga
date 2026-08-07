import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostForm } from "@/components/posts/PostForm";
import { getPostById } from "@/lib/posts/queries";

type Params = Promise<{ id: string }>;

export const metadata: Metadata = {
  title: "投稿を編集",
};

export default async function EditPostPage({ params }: { params: Params }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <div className="page-wrap space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">投稿を編集</h1>
        <p className="mt-1 text-sm text-slate-500">
          内容を更新すると最終更新時刻も更新されます。
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <PostForm mode="edit" post={post} />
      </div>
    </div>
  );
}
