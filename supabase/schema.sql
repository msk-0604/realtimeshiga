-- リアルタイム滋賀 - Supabase Schema
-- SQL Editor に貼り付けて実行してください

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type user_role as enum ('user', 'shop', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type author_type as enum ('general', 'verified_shop', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type shop_plan as enum ('free', 'standard', 'premium');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_reason as enum ('incorrect', 'outdated', 'inappropriate', 'spam', 'other');
exception when duplicate_object then null; end $$;

-- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role user_role not null default 'user',
  created_at timestamptz not null default now()
);

-- posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  category text not null,
  title text not null,
  shop_name text not null,
  municipality text not null,
  address text not null,
  status text not null,
  content text not null,
  url text,
  image_url text,
  latitude double precision,
  longitude double precision,
  is_active boolean not null default true,
  is_verified_shop boolean not null default false,
  author_type author_type not null default 'general',
  last_verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_title_length check (char_length(title) between 1 and 80),
  constraint posts_content_length check (char_length(content) between 1 and 1000),
  constraint posts_url_http check (url is null or url ~* '^https?://'),
  constraint posts_image_url_http check (image_url is null or image_url ~* '^https?://')
);

-- reports
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  device_id text,
  reason report_reason not null,
  detail text,
  created_at timestamptz not null default now()
);

-- shops (将来の店舗課金用)
create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  municipality text not null,
  address text not null,
  category text not null,
  verified boolean not null default false,
  plan shop_plan not null default 'free',
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists posts_last_verified_at_idx on public.posts (last_verified_at desc);
create index if not exists posts_category_idx on public.posts (category);
create index if not exists posts_municipality_idx on public.posts (municipality);
create index if not exists posts_status_idx on public.posts (status);
create index if not exists posts_is_active_idx on public.posts (is_active);
create index if not exists posts_search_idx on public.posts using gin (
  to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(shop_name,'') || ' ' || coalesce(content,'') || ' ' || coalesce(municipality,'') || ' ' || coalesce(address,''))
);
create index if not exists reports_post_id_idx on public.reports (post_id);
create index if not exists reports_device_post_created_idx on public.reports (device_id, post_id, created_at desc);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

-- Auto profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'ユーザー'), 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Helper: is admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.reports enable row level security;
alter table public.shops enable row level security;

-- profiles policies
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- posts policies (MVP: 匿名投稿可 / 鮮度確認のための更新可)
-- 公開一覧の is_active フィルタはアプリ側で実施
drop policy if exists "posts_select_active" on public.posts;
create policy "posts_select_all" on public.posts
  for select using (true);

drop policy if exists "posts_insert_anon" on public.posts;
create policy "posts_insert_anon" on public.posts
  for insert with check (true);

drop policy if exists "posts_update_verify" on public.posts;
create policy "posts_update_verify" on public.posts
  for update using (true)
  with check (true);

drop policy if exists "posts_delete_admin" on public.posts;
create policy "posts_delete_admin" on public.posts
  for delete using (public.is_admin());

-- reports policies
drop policy if exists "reports_insert_anon" on public.reports;
create policy "reports_insert_anon" on public.reports
  for insert with check (true);

drop policy if exists "reports_select_admin" on public.reports;
create policy "reports_select_admin" on public.reports
  for select using (public.is_admin());

-- shops policies
drop policy if exists "shops_select_all" on public.shops;
create policy "shops_select_all" on public.shops
  for select using (true);

drop policy if exists "shops_insert_owner" on public.shops;
create policy "shops_insert_owner" on public.shops
  for insert with check (auth.uid() = owner_id or public.is_admin());

drop policy if exists "shops_update_owner" on public.shops;
create policy "shops_update_owner" on public.shops
  for update using (auth.uid() = owner_id or public.is_admin());

-- Storage bucket for post images (任意)
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

drop policy if exists "post_images_public_read" on storage.objects;
create policy "post_images_public_read" on storage.objects
  for select using (bucket_id = 'post-images');

drop policy if exists "post_images_insert" on storage.objects;
create policy "post_images_insert" on storage.objects
  for insert with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] is not null
    and coalesce((metadata->>'size')::int, 0) < 2097152
  );

-- サンプルデータ（架空店舗）
insert into public.posts (
  id, category, title, shop_name, municipality, address, status, content,
  is_verified_shop, author_type, last_verified_at, created_at, updated_at
) values
(
  '11111111-1111-4111-8111-111111111101',
  'food', '現在待ち時間0分・4名席空きあり', '近江食堂', '草津市', '草津市渋川1-2-3', 'available',
  '現在4名席が2卓空いています。ランチタイムは比較的空いています。',
  true, 'verified_shop', now() - interval '4 minutes', now() - interval '2 hours', now() - interval '4 minutes'
),
(
  '11111111-1111-4111-8111-111111111102',
  'parking', '空車あり・残り8台', '草津駅前パーキング', '草津市', '草津市渋川2-1-10', 'available',
  '平日昼間は空車あり。駅徒歩3分。',
  false, 'general', now() - interval '8 minutes', now() - interval '1 hour', now() - interval '8 minutes'
),
(
  '11111111-1111-4111-8111-111111111103',
  'event', 'びわこ湖畔マルシェ開催中', '大津湖畔公園特設会場', '大津市', '大津市柳が崎', 'ongoing',
  '地元野菜・パン・ハンドメイドが出店中。16時まで。',
  false, 'admin', now() - interval '15 minutes', now() - interval '3 hours', now() - interval '15 minutes'
),
(
  '11111111-1111-4111-8111-111111111104',
  'shopping', '弁当30%OFF開始', '守山フレッシュマーケット', '守山市', '守山市吉身3-5-1', 'sale',
  '惣菜コーナーの弁当が18時から30%OFF。数量限定です。',
  true, 'verified_shop', now() - interval '12 minutes', now() - interval '40 minutes', now() - interval '12 minutes'
),
(
  '11111111-1111-4111-8111-111111111105',
  'beauty', '15:30から1枠空き', 'ヘアサロン びわこ', '大津市', '大津市浜大津1-1-8', 'one_slot',
  'カットのみであれば15:30から受付可能です。',
  true, 'verified_shop', now() - interval '20 minutes', now() - interval '1 hour', now() - interval '20 minutes'
),
(
  '11111111-1111-4111-8111-111111111106',
  'hospital', '本日休日診療あり', '彦根中央クリニック', '彦根市', '彦根市旭町4-2', 'holiday',
  '本日9:00〜12:00、13:00〜17:00で休日診療を実施しています。',
  false, 'general', now() - interval '35 minutes', now() - interval '5 hours', now() - interval '35 minutes'
),
(
  '11111111-1111-4111-8111-111111111107',
  'gas', 'レギュラー164円・混雑なし', '琵琶湖石油 長浜店', '長浜市', '長浜市公園町8-3', 'quiet',
  'レギュラー164円、ハイオク175円。洗車待ちなし。',
  false, 'general', now() - interval '18 minutes', now() - interval '2 hours', now() - interval '18 minutes'
),
(
  '11111111-1111-4111-8111-111111111108',
  'traffic', '国道8号 彦根付近で渋滞', '国道8号（彦根IC付近）', '彦根市', '彦根市高宮町付近', 'congested',
  '南行きで約2kmの渋滞。工事の影響あり。',
  false, 'general', now() - interval '6 minutes', now() - interval '25 minutes', now() - interval '6 minutes'
),
(
  '11111111-1111-4111-8111-111111111109',
  'recruit', '本日夕方から単発アルバイト募集', '近江八幡フードホール', '近江八幡市', '近江八幡市鷹飼町5-12', 'urgent',
  '17:00〜21:00の単発スタッフ急募。経験不問。',
  true, 'verified_shop', now() - interval '10 minutes', now() - interval '1 hour', now() - interval '10 minutes'
),
(
  '11111111-1111-4111-8111-111111111110',
  'local', '白い柴犬を探しています', '守山市駅周辺', '守山市', '守山市勝部付近', 'active',
  '今朝から行方不明。赤い首輪。情報お待ちしています。',
  false, 'general', now() - interval '50 minutes', now() - interval '4 hours', now() - interval '50 minutes'
),
(
  '11111111-1111-4111-8111-111111111111',
  'food', '本日限定メニューあり・現在満席', 'びわこカフェ', '大津市', '大津市におの浜1-4', 'full',
  '湖畔テラス席は満席。店内は15分待ち程度です。限定パフェ提供中。',
  true, 'verified_shop', now() - interval '3 minutes', now() - interval '6 hours', now() - interval '3 minutes'
),
(
  '11111111-1111-4111-8111-111111111112',
  'parking', '満車です', '彦根城下パーキング', '彦根市', '彦根市金亀町', 'full',
  '観光ピークで満車。近隣の市営駐車場を案内中。',
  false, 'general', now() - interval '22 minutes', now() - interval '2 hours', now() - interval '22 minutes'
)
on conflict (id) do nothing;
