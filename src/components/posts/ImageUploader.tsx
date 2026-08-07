"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function ImageUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | null) {
    setError(null);
    if (!file) return;

    if (!ALLOWED.includes(file.type)) {
      setError("JPEG / PNG / WebP / GIF のみアップロードできます");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("画像は2MB以下にしてください");
      return;
    }

    if (!isSupabaseConfigured()) {
      // デモモード: Data URL（本番ではStorage）
      if (file.size > 500_000) {
        setError("デモモードでは500KB以下の画像にしてください");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => onChange(String(reader.result ?? ""));
      reader.readAsDataURL(file);
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `uploads/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data } = supabase.storage.from("post-images").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        disabled={uploading}
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#e8f4f8] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#1a6b8a]"
      />
      {uploading && <p className="text-xs text-slate-500">アップロード中...</p>}
      {error && <p className="text-xs text-rose-600">{error}</p>}
      {value && (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="プレビュー"
            className="mt-1 max-h-40 w-full rounded-lg border border-slate-200 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="mt-2 text-xs text-slate-500 underline"
          >
            画像を削除
          </button>
        </div>
      )}
      <p className="text-xs text-slate-500">2MB以下の画像（任意）</p>
    </div>
  );
}
