"use client";

import { useEffect, useRef, useState } from "react";
import type { PostWithDistance } from "@/types";
import { resolvePostCoords } from "@/lib/geo";
import { getCategory } from "@/constants/categories";

type MapPost = Pick<
  PostWithDistance,
  "id" | "title" | "shop_name" | "municipality" | "category" | "latitude" | "longitude" | "distance_km"
>;

export function NearbyMap({
  posts,
  center,
}: {
  posts: MapPost[];
  center: { lat: number; lng: number } | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!center || !containerRef.current) return;

    let cancelled = false;
    let map: import("leaflet").Map | null = null;

    async function init() {
      try {
        const L = (await import("leaflet")).default;

        if (cancelled || !containerRef.current) return;

        // Fix default marker icons in bundlers
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        map = L.map(containerRef.current, {
          scrollWheelZoom: false,
        }).setView([center!.lat, center!.lng], 12);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
          maxZoom: 18,
        }).addTo(map);

        L.circleMarker([center!.lat, center!.lng], {
          radius: 8,
          color: "#1a6b8a",
          fillColor: "#1a6b8a",
          fillOpacity: 0.9,
        })
          .addTo(map)
          .bindPopup("現在地");

        posts.forEach((post) => {
          const coords = resolvePostCoords(post);
          if (!coords) return;
          const cat = getCategory(post.category);
          L.marker([coords.lat, coords.lng])
            .addTo(map!)
            .bindPopup(
              `<strong>${cat.icon} ${post.title}</strong><br/>${post.shop_name}<br/>${post.municipality}`
            );
        });

        setReady(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "地図の読み込みに失敗しました");
      }
    }

    init();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [center, posts]);

  if (!center) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
        「現在地周辺」を押すと地図が表示されます
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div ref={containerRef} className="h-56 w-full" />
      {!ready && !error && (
        <p className="px-3 py-2 text-xs text-slate-500">地図を読み込み中...</p>
      )}
      {error && <p className="px-3 py-2 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
