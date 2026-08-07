import type { Metadata } from "next";
import {
  AdminLoginForm,
  AdminLogoutButton,
  AdminPostRow,
  ReportList,
} from "@/components/admin/AdminPanel";
import {
  getAdminStats,
  listAllPostsAdmin,
  listReportsAdmin,
} from "@/lib/posts/queries";
import { isAdminAuthenticated } from "@/lib/posts/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "管理画面",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return (
      <div className="page-wrap">
        <AdminLoginForm />
      </div>
    );
  }

  const [stats, posts, reports] = await Promise.all([
    getAdminStats(),
    listAllPostsAdmin(),
    listReportsAdmin(),
  ]);

  const reportedIds = new Set(reports.map((r) => r.post_id));
  const reportedPosts = posts.filter((p) => reportedIds.has(p.id));

  return (
    <div className="page-wrap space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">管理画面</h1>
          <p className="mt-1 text-sm text-slate-500">投稿・通報・店舗認証の管理</p>
        </div>
        <AdminLogoutButton />
      </div>

      <section className="grid grid-cols-3 gap-2">
        <StatCard label="投稿数" value={stats.postCount} />
        <StatCard label="通報数" value={stats.reportCount} />
        <StatCard label="ユーザー" value={stats.userCount} />
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold text-slate-900">通報された投稿</h2>
        {reportedPosts.length === 0 ? (
          <p className="text-sm text-slate-500">該当なし</p>
        ) : (
          <div className="space-y-3">
            {reportedPosts.map((post) => (
              <AdminPostRow key={post.id} post={post} reported />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold text-slate-900">通報一覧</h2>
        <ReportList reports={reports} />
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold text-slate-900">最新投稿</h2>
        <div className="space-y-3">
          {posts.slice(0, 20).map((post) => (
            <AdminPostRow
              key={post.id}
              post={post}
              reported={reportedIds.has(post.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
      <p className="text-2xl font-bold text-[#1a6b8a]">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </div>
  );
}
