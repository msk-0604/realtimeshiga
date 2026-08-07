"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "rts_favorites";
const DEVICE_KEY = "rts_device_id";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("rts-favorites"));
}

function subscribeFavorites(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("rts-favorites", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("rts-favorites", callback);
  };
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribeFavorites, readFavorites, () => [] as string[]);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  const toggleFavorite = useCallback((id: string) => {
    const current = readFavorites();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [id, ...current];
    writeFavorites(next);
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}

function readDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

function subscribeDeviceId() {
  return () => {};
}

export function useDeviceId() {
  return useSyncExternalStore(subscribeDeviceId, readDeviceId, () => "");
}

export function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
