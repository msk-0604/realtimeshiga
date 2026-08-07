import type { Metadata } from "next";
import { PostForm } from "@/components/posts/PostForm";

export const metadata: Metadata = {
  title: "新規投稿",
};

export default function NewPostPage() {
  return (
    <div className="page-wrap space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">＋ 投稿する</h1>
        <p className="mt-1 text-sm text-slate-500">
          滋賀の「今」を共有してください。ログインなしでも投稿できます。
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <PostForm mode="create" />
      </div>
    </div>
  );
}
