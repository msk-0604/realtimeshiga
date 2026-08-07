import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getShop } from "@/lib/social/actions";
import { getCategory } from "@/constants/categories";
import { listPosts } from "@/lib/posts/queries";
import { PostCard } from "@/components/posts/PostCard";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const shop = await getShop(id);
  return { title: shop ? `${shop.name}｜公式店舗` : "店舗" };
}

export default async function ShopDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const shop = await getShop(id);
  if (!shop) notFound();
  const cat = getCategory(shop.category);
  const related = (await listPosts({ sort: "newest" })).filter(
    (p) => p.shop_name === shop.name
  );

  return (
    <div className="page-wrap space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm text-slate-500">
          {cat.icon} {cat.label}
        </p>
        <h1 className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          {shop.name}
          <span className="rounded-full bg-[#1a6b8a] px-2 py-0.5 text-xs font-bold text-white">
            ✓ 公式
          </span>
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {shop.description}
        </p>

        <dl className="mt-4 space-y-2 text-sm">
          <div>
            <dt className="text-slate-400">住所</dt>
            <dd>
              {shop.municipality} {shop.address}
            </dd>
          </div>
          {shop.business_hours && (
            <div>
              <dt className="text-slate-400">営業時間</dt>
              <dd>{shop.business_hours}</dd>
            </div>
          )}
          {shop.phone && (
            <div>
              <dt className="text-slate-400">電話</dt>
              <dd>
                <a href={`tel:${shop.phone}`} className="text-[#1a6b8a]">
                  {shop.phone}
                </a>
              </dd>
            </div>
          )}
          {shop.website && (
            <div>
              <dt className="text-slate-400">ホームページ</dt>
              <dd>
                <a
                  href={shop.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1a6b8a] underline"
                >
                  サイトを開く
                </a>
              </dd>
            </div>
          )}
          {shop.google_maps_url && (
            <div>
              <dt className="text-slate-400">Googleマップ</dt>
              <dd>
                <a
                  href={shop.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1a6b8a] underline"
                >
                  地図で見る
                </a>
              </dd>
            </div>
          )}
        </dl>
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold">この店舗の投稿</h2>
        <div className="space-y-3">
          {related.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
          {related.length === 0 && (
            <p className="text-sm text-slate-500">投稿はまだありません</p>
          )}
        </div>
      </section>
    </div>
  );
}
