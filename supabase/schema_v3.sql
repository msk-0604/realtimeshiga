-- リアルタイム滋賀 v3 - SNS化・通知・店舗・広告・分析
-- schema.sql / rls_v2.sql の後に実行

-- posts にカウント列を追加
alter table public.posts
  add column if not exists like_count int not null default 0,
  add column if not exists comment_count int not null default 0,
  add column if not exists view_count int not null default 0,
  add column if not exists share_count int not null default 0;

-- カテゴリ移行（旧→新）
update public.posts set category = 'gourmet' where category = 'food';
update public.posts set category = 'sale' where category = 'shopping';
update public.posts set category = 'shop' where category in ('beauty', 'parking', 'gas', 'recruit', 'local');
update public.posts set category = 'construction' where category = 'traffic' and status = 'construction';
update public.posts set category = 'accident' where category = 'traffic' and status = 'accident';

-- likes
create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  device_id text,
  created_at timestamptz not null default now(),
  constraint post_likes_actor check (user_id is not null or device_id is not null)
);
create unique index if not exists post_likes_user_unique on public.post_likes (post_id, user_id) where user_id is not null;
create unique index if not exists post_likes_device_unique on public.post_likes (post_id, device_id) where device_id is not null;
create index if not exists post_likes_post_id_idx on public.post_likes (post_id);

-- comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  parent_id uuid references public.comments(id) on delete cascade,
  device_id text,
  author_name text not null default 'ゲスト',
  content text not null check (char_length(content) between 1 and 500),
  like_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists comments_post_id_idx on public.comments (post_id, created_at desc);
create index if not exists comments_parent_id_idx on public.comments (parent_id);

create table if not exists public.comment_likes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  device_id text,
  created_at timestamptz not null default now()
);
create unique index if not exists comment_likes_user_unique on public.comment_likes (comment_id, user_id) where user_id is not null;
create unique index if not exists comment_likes_device_unique on public.comment_likes (comment_id, device_id) where device_id is not null;

-- notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  device_id text,
  type text not null,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists notifications_device_idx on public.notifications (device_id, created_at desc);

-- municipality / shop follows
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  device_id text,
  target_type text not null check (target_type in ('municipality', 'shop', 'post')),
  target_id text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists follows_user_unique on public.follows (user_id, target_type, target_id) where user_id is not null;
create unique index if not exists follows_device_unique on public.follows (device_id, target_type, target_id) where device_id is not null;

-- shops 拡張
alter table public.shops
  add column if not exists phone text,
  add column if not exists website text,
  add column if not exists google_maps_url text,
  add column if not exists business_hours text,
  add column if not exists description text,
  add column if not exists image_url text,
  add column if not exists post_id uuid references public.posts(id) on delete set null;

-- shop applications
create table if not exists public.shop_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  shop_name text not null,
  municipality text not null,
  address text not null,
  phone text,
  website text,
  business_hours text,
  category text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- ads
create table if not exists public.ads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  image_url text,
  link_url text,
  placement text not null default 'feed' check (placement in ('feed', 'home', 'search', 'map')),
  municipality text,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

-- premium
alter table public.profiles
  add column if not exists is_premium boolean not null default false,
  add column if not exists premium_until timestamptz,
  add column if not exists avatar_url text;

-- analytics events (lightweight)
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  user_id uuid,
  device_id text,
  meta jsonb,
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_created_idx on public.analytics_events (created_at desc);
create index if not exists analytics_events_name_idx on public.analytics_events (event_name, created_at desc);

-- increment helpers
create or replace function public.increment_post_view(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.posts set view_count = view_count + 1 where id = p_id and is_active = true;
end; $$;
grant execute on function public.increment_post_view(uuid) to anon, authenticated;

create or replace function public.toggle_post_like(p_id uuid, p_device_id text default null)
returns table(liked boolean, like_count int)
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  existing uuid;
  cnt int;
begin
  if uid is not null then
    select id into existing from public.post_likes where post_id = p_id and user_id = uid;
  elsif p_device_id is not null then
    select id into existing from public.post_likes where post_id = p_id and device_id = p_device_id;
  else
    raise exception 'actor required';
  end if;

  if existing is not null then
    delete from public.post_likes where id = existing;
    update public.posts set like_count = greatest(like_count - 1, 0) where id = p_id;
    select posts.like_count into cnt from public.posts where id = p_id;
    return query select false, cnt;
  else
    insert into public.post_likes (post_id, user_id, device_id) values (p_id, uid, case when uid is null then p_device_id else null end);
    update public.posts set like_count = like_count + 1 where id = p_id;
    select posts.like_count into cnt from public.posts where id = p_id;
    return query select true, cnt;
  end if;
end; $$;
grant execute on function public.toggle_post_like(uuid, text) to anon, authenticated;

-- RLS
alter table public.post_likes enable row level security;
alter table public.comments enable row level security;
alter table public.comment_likes enable row level security;
alter table public.notifications enable row level security;
alter table public.follows enable row level security;
alter table public.shop_applications enable row level security;
alter table public.ads enable row level security;
alter table public.analytics_events enable row level security;

drop policy if exists "post_likes_select" on public.post_likes;
create policy "post_likes_select" on public.post_likes for select using (true);
drop policy if exists "post_likes_insert" on public.post_likes;
create policy "post_likes_insert" on public.post_likes for insert with check (true);
drop policy if exists "post_likes_delete" on public.post_likes;
create policy "post_likes_delete" on public.post_likes for delete using (
  (auth.uid() is not null and auth.uid() = user_id) or true
);

drop policy if exists "comments_select" on public.comments;
create policy "comments_select" on public.comments for select using (is_active = true or public.is_admin());
drop policy if exists "comments_insert" on public.comments;
create policy "comments_insert" on public.comments for insert with check (true);
drop policy if exists "comments_update_admin" on public.comments;
create policy "comments_update_admin" on public.comments for update using (public.is_admin() or (auth.uid() is not null and auth.uid() = user_id));

drop policy if exists "comment_likes_all" on public.comment_likes;
create policy "comment_likes_select" on public.comment_likes for select using (true);
create policy "comment_likes_insert" on public.comment_likes for insert with check (true);
create policy "comment_likes_delete" on public.comment_likes for delete using (true);

drop policy if exists "notifications_own" on public.notifications;
create policy "notifications_select" on public.notifications for select using (
  public.is_admin() or (auth.uid() is not null and auth.uid() = user_id) or true
);
create policy "notifications_insert" on public.notifications for insert with check (true);
create policy "notifications_update" on public.notifications for update using (
  public.is_admin() or (auth.uid() is not null and auth.uid() = user_id) or true
);

drop policy if exists "follows_all" on public.follows;
create policy "follows_select" on public.follows for select using (true);
create policy "follows_insert" on public.follows for insert with check (true);
create policy "follows_delete" on public.follows for delete using (true);

drop policy if exists "shop_apps" on public.shop_applications;
create policy "shop_apps_insert" on public.shop_applications for insert with check (true);
create policy "shop_apps_select" on public.shop_applications for select using (
  public.is_admin() or (auth.uid() is not null and auth.uid() = user_id)
);
create policy "shop_apps_update_admin" on public.shop_applications for update using (public.is_admin());

drop policy if exists "ads_select" on public.ads;
create policy "ads_select" on public.ads for select using (is_active = true or public.is_admin());
create policy "ads_admin" on public.ads for all using (public.is_admin());

drop policy if exists "analytics_insert" on public.analytics_events;
create policy "analytics_insert" on public.analytics_events for insert with check (true);
create policy "analytics_select_admin" on public.analytics_events for select using (public.is_admin());

-- サンプル店舗
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

-- 投稿に公式店舗紐付け（任意）
update public.posts set is_verified_shop = true where shop_name in ('近江食堂', 'びわこカフェ');
