-- schema_v3 再実行時のポリシー衝突だけ解消するパッチ
-- これを先に実行してから schema_v3.sql を再実行してもOK
-- またはこのファイル単体で足りる場合もあります（途中まで成功している場合）

drop policy if exists "comment_likes_all" on public.comment_likes;
drop policy if exists "comment_likes_select" on public.comment_likes;
drop policy if exists "comment_likes_insert" on public.comment_likes;
drop policy if exists "comment_likes_delete" on public.comment_likes;
create policy "comment_likes_select" on public.comment_likes for select using (true);
create policy "comment_likes_insert" on public.comment_likes for insert with check (true);
create policy "comment_likes_delete" on public.comment_likes for delete using (true);

drop policy if exists "notifications_own" on public.notifications;
drop policy if exists "notifications_select" on public.notifications;
drop policy if exists "notifications_insert" on public.notifications;
drop policy if exists "notifications_update" on public.notifications;
create policy "notifications_select" on public.notifications for select using (
  public.is_admin() or (auth.uid() is not null and auth.uid() = user_id) or true
);
create policy "notifications_insert" on public.notifications for insert with check (true);
create policy "notifications_update" on public.notifications for update using (
  public.is_admin() or (auth.uid() is not null and auth.uid() = user_id) or true
);

drop policy if exists "follows_all" on public.follows;
drop policy if exists "follows_select" on public.follows;
drop policy if exists "follows_insert" on public.follows;
drop policy if exists "follows_delete" on public.follows;
create policy "follows_select" on public.follows for select using (true);
create policy "follows_insert" on public.follows for insert with check (true);
create policy "follows_delete" on public.follows for delete using (true);

drop policy if exists "shop_apps" on public.shop_applications;
drop policy if exists "shop_apps_insert" on public.shop_applications;
drop policy if exists "shop_apps_select" on public.shop_applications;
drop policy if exists "shop_apps_update_admin" on public.shop_applications;
create policy "shop_apps_insert" on public.shop_applications for insert with check (true);
create policy "shop_apps_select" on public.shop_applications for select using (
  public.is_admin() or (auth.uid() is not null and auth.uid() = user_id)
);
create policy "shop_apps_update_admin" on public.shop_applications for update using (public.is_admin());

drop policy if exists "ads_select" on public.ads;
drop policy if exists "ads_admin" on public.ads;
create policy "ads_select" on public.ads for select using (is_active = true or public.is_admin());
create policy "ads_admin" on public.ads for all using (public.is_admin());

drop policy if exists "analytics_insert" on public.analytics_events;
drop policy if exists "analytics_select_admin" on public.analytics_events;
create policy "analytics_insert" on public.analytics_events for insert with check (true);
create policy "analytics_select_admin" on public.analytics_events for select using (public.is_admin());

insert into public.shops (id, name, municipality, address, category, verified, plan, phone, website, google_maps_url, business_hours, description)
values
(
  '22222222-2222-4222-8222-222222222201',
  '近江食堂',
  '草津市',
  '草津市渋川1-2-3',
  'gourmet',
  true,
  'standard',
  '077-000-0001',
  'https://example.com/omi',
  'https://maps.google.com/?q=草津市渋川',
  '11:00-21:00（月曜定休）',
  '近江牛と地元野菜の食堂。公式アカウント。'
),
(
  '22222222-2222-4222-8222-222222222202',
  'びわこカフェ',
  '大津市',
  '大津市におの浜1-4',
  'gourmet',
  true,
  'premium',
  '077-000-0002',
  'https://example.com/biwako-cafe',
  'https://maps.google.com/?q=大津市におの浜',
  '9:00-18:00',
  '湖畔テラスのカフェ。'
)
on conflict (id) do nothing;

update public.posts set is_verified_shop = true where shop_name in ('近江食堂', 'びわこカフェ');
