"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/constants/categories";
import { MUNICIPALITIES } from "@/constants/region";
import { getStatusOptions } from "@/constants/statuses";
import { createPostAction, updatePostAction } from "@/lib/posts/actions";
import { ImageUploader } from "@/components/posts/ImageUploader";
import { LocationPicker } from "@/components/posts/LocationPicker";
import type { CategoryId, Post } from "@/types";

type Mode = "create" | "edit";

export function PostForm({
  mode,
  post,
}: {
  mode: Mode;
  post?: Post;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryId>(post?.category ?? "gourmet");
  const [status, setStatus] = useState(post?.status ?? "available");
  const [imageUrl, setImageUrl] = useState(post?.image_url ?? "");
  const [latitude, setLatitude] = useState(
    post?.latitude != null ? String(post.latitude) : ""
  );
  const [longitude, setLongitude] = useState(
    post?.longitude != null ? String(post.longitude) : ""
  );

  const statusOptions = useMemo(() => getStatusOptions(category), [category]);

  function onCategoryChange(next: CategoryId) {
    setCategory(next);
    const options = getStatusOptions(next);
    setStatus(options[0]?.value ?? "");
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    formData.set("category", category);
    formData.set("status", status);
    formData.set("image_url", imageUrl);
    formData.set("latitude", latitude);
    formData.set("longitude", longitude);

    startTransition(async () => {
      const result =
        mode === "edit" && post
          ? await updatePostAction(post.id, formData)
          : await createPostAction(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push(result.id ? `/posts/${result.id}` : "/");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Field label="カテゴリー" required>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as CategoryId)}
          className="input"
          required
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="タイトル" required>
        <input
          name="title"
          defaultValue={post?.title}
          className="input"
          placeholder="例：現在待ち時間0分"
          maxLength={80}
          required
        />
      </Field>

      <Field label="店舗・施設名" required>
        <input
          name="shop_name"
          defaultValue={post?.shop_name}
          className="input"
          placeholder="例：近江食堂"
          maxLength={80}
          required
        />
      </Field>

      <Field label="市町村" required>
        <select
          name="municipality"
          defaultValue={post?.municipality ?? ""}
          className="input"
          required
        >
          <option value="" disabled>
            選択してください
          </option>
          {MUNICIPALITIES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </Field>

      <Field label="住所" required>
        <input
          name="address"
          defaultValue={post?.address}
          className="input"
          placeholder="例：草津市渋川1-2-3"
          maxLength={120}
          required
        />
      </Field>

      <Field label="ステータス" required>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input"
          required
        >
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="内容" required>
        <textarea
          name="content"
          defaultValue={post?.content}
          className="input min-h-28"
          placeholder="今の状況を具体的に書いてください"
          maxLength={1000}
          required
        />
      </Field>

      <Field label="位置情報（任意）">
        <LocationPicker
          latitude={latitude}
          longitude={longitude}
          onChange={(lat, lng) => {
            setLatitude(lat);
            setLongitude(lng);
          }}
        />
      </Field>

      <Field label="画像（任意）">
        <ImageUploader value={imageUrl} onChange={setImageUrl} />
      </Field>

      <Field label="URL（任意）">
        <input
          name="url"
          type="url"
          defaultValue={post?.url ?? ""}
          className="input"
          placeholder="https://"
        />
      </Field>

      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-[#1a6b8a] py-3.5 text-base font-semibold text-white hover:bg-[#155a74] disabled:opacity-60"
      >
        {pending ? "送信中..." : mode === "edit" ? "更新する" : "投稿する"}
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-rose-600">必須</span>}
      </span>
      {children}
    </label>
  );
}
