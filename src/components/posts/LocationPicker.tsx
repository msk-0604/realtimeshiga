"use client";

import { useState } from "react";

export function LocationPicker({
  latitude,
  longitude,
  onChange,
}: {
  latitude: string;
  longitude: string;
  onChange: (lat: string, lng: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function useCurrentLocation() {
    setError(null);
    if (!navigator.geolocation) {
      setError("この端末では位置情報が使えません");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude.toFixed(6), pos.coords.longitude.toFixed(6));
        setLoading(false);
      },
      () => {
        setError("位置情報の取得に失敗しました。ブラウザの許可を確認してください。");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input
          name="latitude"
          value={latitude}
          onChange={(e) => onChange(e.target.value, longitude)}
          className="input text-sm"
          placeholder="緯度"
          inputMode="decimal"
        />
        <input
          name="longitude"
          value={longitude}
          onChange={(e) => onChange(latitude, e.target.value)}
          className="input text-sm"
          placeholder="経度"
          inputMode="decimal"
        />
      </div>
      <button
        type="button"
        onClick={useCurrentLocation}
        disabled={loading}
        className="w-full rounded-lg border border-[#1a6b8a] bg-white py-2.5 text-sm font-medium text-[#1a6b8a] disabled:opacity-60"
      >
        {loading ? "取得中..." : "📍 現在地を使う"}
      </button>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <p className="text-xs text-slate-500">
        周辺検索のために位置情報を付けると便利です（任意）
      </p>
    </div>
  );
}
