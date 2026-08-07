-- リアルタイム滋賀 - RLS強化 / verify RPC / Storage強化
-- schema.sql 実行後に、このファイルを SQL Editor で実行してください

-- 1) 「この情報はまだ正しい」専用RPC（誰でも最終確認時刻のみ更新可）
create or replace function public.verify_post(post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts
  set
    last_verified_at = now(),
    updated_at = now()
  where id = post_id
    and is_active = true;
end;
$$;

revoke all on function public.verify_post(uuid) from public;
grant execute on function public.verify_post(uuid) to anon, authenticated;

-- 2) 投稿ポリシーを厳格化
drop policy if exists "posts_select_all" on public.posts;
drop policy if exists "posts_select_active" on public.posts;
create policy "posts_select_public" on public.posts
  for select using (
    is_active = true
    or public.is_admin()
    or (auth.uid() is not null and auth.uid() = user_id)
  );

drop policy if exists "posts_insert_anon" on public.posts;
create policy "posts_insert" on public.posts
  for insert with check (
    -- 匿名投稿可。ログイン時は自分の user_id のみ
    (auth.uid() is null and user_id is null)
    or (auth.uid() is not null and user_id = auth.uid())
  );

drop policy if exists "posts_update_verify" on public.posts;
create policy "posts_update_owner" on public.posts
  for update using (
    public.is_admin()
    or (auth.uid() is not null and auth.uid() = user_id)
    -- 匿名投稿（user_id null）はログインユーザーが編集可能（MVP）
    or (user_id is null and auth.uid() is not null)
  )
  with check (
    public.is_admin()
    or (auth.uid() is not null and auth.uid() = user_id)
    or (user_id is null and auth.uid() is not null)
  );

-- 匿名のまま全文更新したい場合の緩和（未ログイン編集）
-- ※荒らし対策のため、未ログインの UPDATE は禁止。確認は verify_post RPC を使う。
drop policy if exists "posts_update_anon_legacy" on public.posts;

drop policy if exists "posts_delete_admin" on public.posts;
create policy "posts_delete_admin" on public.posts
  for delete using (public.is_admin());

-- 3) reports: 自分の通報は読める / 管理者は全部
drop policy if exists "reports_select_admin" on public.reports;
create policy "reports_select" on public.reports
  for select using (
    public.is_admin()
    or (auth.uid() is not null and auth.uid() = user_id)
  );

-- 4) Storage: 画像アップロード制限を強化
drop policy if exists "post_images_insert" on storage.objects;
create policy "post_images_insert" on storage.objects
  for insert with check (
    bucket_id = 'post-images'
    and (storage.extension(name) in ('jpg', 'jpeg', 'png', 'webp', 'gif'))
    and (
      -- 匿名・認証どちらも可（投稿と同様）ただし拡張子制限
      true
    )
  );

drop policy if exists "post_images_update_own" on storage.objects;
create policy "post_images_update_own" on storage.objects
  for update using (
    bucket_id = 'post-images'
    and (auth.role() = 'authenticated' or auth.role() = 'anon')
  );

drop policy if exists "post_images_delete_admin" on storage.objects;
create policy "post_images_delete_admin" on storage.objects
  for delete using (
    bucket_id = 'post-images'
    and public.is_admin()
  );

-- 5) 店舗ロール希望者の profiles 更新は本人のみ（roleをadminに上げるのは不可）
create or replace function public.prevent_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if new.role = 'admin' and old.role is distinct from 'admin' and not public.is_admin() then
      raise exception 'admin role cannot be self-assigned';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_no_self_admin on public.profiles;
create trigger profiles_no_self_admin
before update on public.profiles
for each row execute function public.prevent_privilege_escalation();

-- 既存シードに緯度経度を補完（市町村中心）
update public.posts set latitude = 35.0131, longitude = 135.9600 where shop_name = '近江食堂' and latitude is null;
update public.posts set latitude = 35.0131, longitude = 135.9600 where shop_name = '草津駅前パーキング' and latitude is null;
update public.posts set latitude = 35.0178, longitude = 135.8547 where shop_name = '大津湖畔公園特設会場' and latitude is null;
update public.posts set latitude = 35.0586, longitude = 135.9942 where shop_name = '守山フレッシュマーケット' and latitude is null;
update public.posts set latitude = 35.0178, longitude = 135.8547 where shop_name = 'ヘアサロン びわこ' and latitude is null;
update public.posts set latitude = 35.2744, longitude = 136.2597 where shop_name = '彦根中央クリニック' and latitude is null;
update public.posts set latitude = 35.3808, longitude = 136.2783 where shop_name = '琵琶湖石油 長浜店' and latitude is null;
update public.posts set latitude = 35.2744, longitude = 136.2597 where shop_name like '国道8号%' and latitude is null;
update public.posts set latitude = 35.1283, longitude = 136.0978 where shop_name = '近江八幡フードホール' and latitude is null;
update public.posts set latitude = 35.0586, longitude = 135.9942 where shop_name = '守山市駅周辺' and latitude is null;
update public.posts set latitude = 35.0178, longitude = 135.8547 where shop_name = 'びわこカフェ' and latitude is null;
update public.posts set latitude = 35.2744, longitude = 136.2597 where shop_name = '彦根城下パーキング' and latitude is null;
