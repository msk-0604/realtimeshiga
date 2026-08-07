# リアルタイム滋賀

滋賀県の「今」がわかる、スマートフォン中心のリアルタイム地域情報アプリです。

**キャッチコピー：** 滋賀の“今”が、すぐわかる。  
**サブコピー：** お店・イベント・交通・地域情報を、みんなでリアルタイム共有。

---

## サービス概要

店舗検索サイトではなく、**いま役立つ情報**を住民・店舗が投稿・更新するプラットフォームです。

- 今、空いている / 混んでいる
- 今、安くなった / 駐車場が空いている
- 今日イベント・診療している
- 道路の混雑・求人・地域のお知らせ

すべての投稿に **最終更新 ○分前** を目立つように表示し、新しい情報を優先します。

---

## 技術スタック

- Next.js（App Router）+ TypeScript
- Tailwind CSS
- Supabase（PostgreSQL / Auth / Storage / RLS）
- Vercel デプロイ想定
- パッケージは最小限（`@supabase/supabase-js`, `@supabase/ssr`, `zod`, `date-fns`）

---

## ローカル起動方法

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数（任意・デモは未設定でも可）

```bash
cp .env.local.example .env.local
```

Supabase 未設定でも **デモモード（ダミーデータ）** で画面確認・投稿（メモリ上）ができます。

### 3. 開発サーバー起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

### 4. ビルド確認

```bash
npm run build
npm start
```

---

## Supabase 設定方法

1. [Supabase](https://supabase.com/) でプロジェクトを作成
2. **Project Settings → API** から以下を取得
   - Project URL
   - anon public key
3. `.env.local` に設定

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_PASSWORD=your-strong-password
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## SQL 実行方法

1. Supabase ダッシュボード → **SQL Editor**
2. リポジトリの `supabase/schema.sql` をすべて貼り付けて **Run**
3. テーブル・インデックス・RLS・サンプルデータが作成されます

作成される主なテーブル：

- `profiles` … ユーザープロフィール（role: user / shop / admin）
- `posts` … 投稿（`last_verified_at` で鮮度管理）
- `reports` … 通報（`device_id` で連続通報制限）
- `shops` … 将来の店舗課金用

---

## .env 設定

| 変数 | 説明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon 公開キー |
| `ADMIN_PASSWORD` | `/admin` のログインパスワード（未設定時は `admin123`） |
| `NEXT_PUBLIC_SITE_URL` | OGP 用サイト URL |

**秘密鍵や service role key はコミットしないでください。** `.env*` は `.gitignore` 済みです（`.env.local.example` のみ例外）。

---

## 主要画面

| パス | 内容 |
|------|------|
| `/` | トップ（カテゴリ・最新投稿） |
| `/search` | キーワード・市町村・カテゴリ・ステータス絞り込み |
| `/posts/new` | 新規投稿 |
| `/posts/[id]` | 詳細・「この情報はまだ正しい」・通報 |
| `/posts/[id]/edit` | 編集 |
| `/favorites` | お気に入り（localStorage） |
| `/mypage` | マイページ |
| `/admin` | 管理画面（投稿削除・非表示・店舗認証・通報確認） |

---

## GitHub への push

```bash
git init
git add .
git commit -m "Initial commit: リアルタイム滋賀 MVP"
git branch -M main
git remote add origin https://github.com/<your-account>/realtimeshiga.git
git push -u origin main
```

`.env.local` は push されないことを確認してください。

---

## Vercel デプロイ

1. [Vercel](https://vercel.com/) にログインし、GitHub リポジトリを Import
2. Framework Preset: **Next.js**
3. Environment Variables に `.env.local` と同じ値を設定
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_SITE_URL`（本番 URL）
4. Deploy

デプロイ後、Supabase の Authentication → URL Configuration に本番 URL を追加してください（将来のログイン用）。

---

## ディレクトリ構成（抜粋）

```
src/
  app/           # ページ（App Router）
  components/    # UI コンポーネント
  constants/     # 市町村・カテゴリ・ステータス（全国展開しやすい master data）
  data/          # ダミーデータ
  hooks/         # お気に入り等
  lib/           # Supabase・CRUD・バリデーション
  types/         # 型定義
supabase/
  schema.sql     # DB・RLS・シード
```

---

## 管理画面

- URL: `/admin`
- パスワード: `ADMIN_PASSWORD`（未設定時 `admin123`）
- 本番では必ず強いパスワードに変更してください

---

## 今後の拡張（設計上追加しやすい）

地図・現在地検索・Push・店舗フォロー・有料プラン・店舗管理画面・コメント・不正検知など。  
地域データは `constants/` に分離しているため、京都府・大阪府・全国への展開がしやすい構成です。
