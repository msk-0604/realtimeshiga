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
import { getAnalyticsDashboard, listShops } from "@/lib/social/actions";
import { isAdminAuthenticated } from "@/lib/posts/actions";
import { getCategory } from "@/constants/categories";
import Link from "next/link";

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

  const [stats, posts, reports, analytics, shops] = await Promise.all([
    getAdminStats(),
    listAllPostsAdmin(),
    listReportsAdmin(),
    getAnalyticsDashboard(),
    listShops(),
  ]);

  const reportedIds = new Set(reports.map((r) => r.post_id));
  const reportedPosts = posts.filter((p) => reportedIds.has(p.id));

  return (
    <div className="page-wrap space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">管理画面</h1>
          <p className="mt-1 text-sm text-slate-500">
            投稿・ユーザー・通報・広告・店舗・分析
          </p>
        </div>
        <AdminLogoutButton />
      </div>

      <section>
        <h2 className="mb-2 text-sm font-bold">分析ダッシュボード</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatCard label="DAU" value={analytics.dau} />
          <StatCard label="MAU" value={analytics.mau} />
          <StatCard label="投稿数" value={analytics.postCount} />
          <StatCard label="コメント" value={analytics.commentCount} />
          <StatCard label="通報" value={stats.reportCount} />
          <StatCard label="ユーザー" value={stats.userCount || analytics.activeUsers} />
          <StatCard label="公式店舗" value={shops.length} />
          <StatCard label="アクティブ" value={analytics.activeUsers} />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-sm font-bold">人気カテゴリ</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {analytics.popularCategories.map((c) => (
              <li key={c.name} className="flex justify-between">
                <span>
                  {getCategory(c.name).icon} {getCategory(c.name).label}
                </span>
                <span className="text-slate-500">{c.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-sm font-bold">人気市町村</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {analytics.popularMunicipalities.map((m) => (
              <li key={m.name} className="flex justify-between">
                <span>{m.name}</span>
                <span className="text-slate-500">{m.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold">閲覧数ランキング</h2>
        <ul className="space-y-2">
          {analytics.topViewed.map((p, i) => (
            <li key={p.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
              <Link href={`/posts/${p.id}`} className="font-medium text-[#1a6b8a]">
                {i + 1}. {p.title}
              </Link>
              <span className="ml-2 text-slate-400">👀 {p.view_count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold">店舗公式</h2>
        <div className="space-y-2">
          {shops.map((s) => (
            <Link
              key={s.id}
              href={`/shops/${s.id}`}
              className="block rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              ✓ {s.name}（{s.municipality} / {s.plan}）
            </Link>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          広告管理・店舗申請の詳細審査は今後の拡張ポイントです。
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold">通報された投稿</h2>
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
        <h2 className="mb-3 text-base font-bold">通報一覧</h2>
        <ReportList reports={reports} />
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold">投稿管理</h2>
        <div className="space-y-3">
          {posts.slice(0, 30).map((post) => (
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
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-700 dark:bg-slate-900">
      <p className="text-2xl font-bold text-[#1a6b8a]">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </div>
  );
}
