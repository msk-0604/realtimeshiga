import type { Municipality } from "@/constants/region";

/** 滋賀県各市町村の概ねの中心座標（周辺検索のフォールバック用） */
export const MUNICIPALITY_CENTERS: Record<
  Municipality,
  { lat: number; lng: number }
> = {
  大津市: { lat: 35.0178, lng: 135.8547 },
  彦根市: { lat: 35.2744, lng: 136.2597 },
  長浜市: { lat: 35.3808, lng: 136.2783 },
  近江八幡市: { lat: 35.1283, lng: 136.0978 },
  草津市: { lat: 35.0131, lng: 135.96 },
  守山市: { lat: 35.0586, lng: 135.9942 },
  栗東市: { lat: 35.0178, lng: 135.9981 },
  甲賀市: { lat: 34.9661, lng: 136.1672 },
  野洲市: { lat: 35.0675, lng: 136.0258 },
  湖南市: { lat: 35.0042, lng: 136.085 },
  高島市: { lat: 35.3531, lng: 136.0356 },
  東近江市: { lat: 35.1128, lng: 136.2078 },
  米原市: { lat: 35.3156, lng: 136.2836 },
  日野町: { lat: 35.0142, lng: 136.2456 },
  竜王町: { lat: 35.0608, lng: 136.1242 },
  愛荘町: { lat: 35.1689, lng: 136.2139 },
  豊郷町: { lat: 35.2003, lng: 136.23 },
  甲良町: { lat: 35.2042, lng: 136.26 },
  多賀町: { lat: 35.2231, lng: 136.2903 },
};

export function getMunicipalityCenter(name: string): { lat: number; lng: number } | null {
  return (MUNICIPALITY_CENTERS as Record<string, { lat: number; lng: number }>)[name] ?? null;
}

/** Haversine距離（km） */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function resolvePostCoords(post: {
  latitude: number | null;
  longitude: number | null;
  municipality: string;
}): { lat: number; lng: number } | null {
  if (post.latitude != null && post.longitude != null) {
    return { lat: post.latitude, lng: post.longitude };
  }
  return getMunicipalityCenter(post.municipality);
}
