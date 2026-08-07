"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "rts_favorites";
const DEVICE_KEY = "rts_device_id";
const EMPTY_FAVORITES: string[] = [];

let cachedRaw: string | null = null;
let cachedFavorites: string[] = EMPTY_FAVORITES;

function readFavorites(): string[] {
  if (typeof window === "undefined") return EMPTY_FAVORITES;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedFavorites;
    cachedRaw = raw;

    if (!raw) {
      cachedFavorites = EMPTY_FAVORITES;
      return cachedFavorites;
    }

    const parsed = JSON.parse(raw);
    cachedFavorites = Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : EMPTY_FAVORITES;
    return cachedFavorites;
  } catch {
    cachedFavorites = EMPTY_FAVORITES;
    return cachedFavorites;
  }
}

function writeFavorites(ids: string[]) {
  const raw = JSON.stringify(ids);
  localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedFavorites = ids;
  window.dispatchEvent(new Event("rts-favorites"));
}

function subscribeFavorites(callback: () => void) {
  const onChange = () => {
    cachedRaw = null; // force re-read
    callback();
  };
  window.addEventListener("storage", onChange);
  window.addEventListener("rts-favorites", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("rts-favorites", onChange);
  };
}

export function useFavorites() {
  const favorites = useSyncExternalStore(
    subscribeFavorites,
    readFavorites,
    () => EMPTY_FAVORITES
  );

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

let cachedDeviceId = "";

function readDeviceId(): string {
  if (typeof window === "undefined") return "";
  if (cachedDeviceId) return cachedDeviceId;

  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  cachedDeviceId = id;
  return cachedDeviceId;
}

function subscribeDeviceId(_callback: () => void) {
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
