export type UserRole = "user" | "shop" | "admin";
export type PostAuthorType = "general" | "verified_shop" | "admin";
export type ShopPlan = "free" | "standard" | "premium";

export type CategoryId =
  | "gourmet"
  | "event"
  | "construction"
  | "accident"
  | "traffic"
  | "sale"
  | "tourism"
  | "hospital"
  | "disaster"
  | "shop"
  // legacy (mapped in queries)
  | "food"
  | "shopping"
  | "beauty"
  | "parking"
  | "gas"
  | "recruit"
  | "local";

export type ReportReason =
  | "incorrect"
  | "outdated"
  | "inappropriate"
  | "spam"
  | "other";

export type FeedTab = "latest" | "rising" | "popular" | "recommend";

export interface Profile {
  id: string;
  display_name: string | null;
  role: UserRole;
  is_premium?: boolean;
  premium_until?: string | null;
  avatar_url?: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string | null;
  category: CategoryId;
  title: string;
  shop_name: string;
  municipality: string;
  address: string;
  status: string;
  content: string;
  url: string | null;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  is_verified_shop: boolean;
  author_type: PostAuthorType;
  like_count: number;
  comment_count: number;
  view_count: number;
  share_count: number;
  last_verified_at: string;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string | null;
  parent_id: string | null;
  device_id: string | null;
  author_name: string;
  content: string;
  like_count: number;
  is_active: boolean;
  created_at: string;
  replies?: Comment[];
}

export interface NotificationItem {
  id: string;
  user_id: string | null;
  device_id: string | null;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  post_id: string;
  user_id: string | null;
  device_id: string | null;
  reason: ReportReason;
  detail: string | null;
  created_at: string;
}

export interface Shop {
  id: string;
  owner_id: string | null;
  name: string;
  municipality: string;
  address: string;
  category: CategoryId;
  verified: boolean;
  plan: ShopPlan;
  phone: string | null;
  website: string | null;
  google_maps_url: string | null;
  business_hours: string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Ad {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  link_url: string | null;
  placement: string;
  municipality: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PostFilters {
  q?: string;
  category?: CategoryId | "";
  municipality?: string;
  status?: string;
  sort?: "newest" | "oldest" | "nearby" | "popular" | "rising";
  lat?: number;
  lng?: number;
  radiusKm?: number;
  tab?: FeedTab;
}

export interface PostFormInput {
  category: CategoryId;
  title: string;
  shop_name: string;
  municipality: string;
  address: string;
  status: string;
  content: string;
  url?: string;
  image_url?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface PostWithDistance extends Post {
  distance_km?: number;
}

export interface AdminStats {
  postCount: number;
  reportCount: number;
  userCount: number;
  commentCount?: number;
  dau?: number;
  mau?: number;
}

export interface TodayShigaSummary {
  eventCount: number;
  newPostCount: number;
  popularSpot: string;
  trafficCount: number;
  weatherLabel: string;
  weatherTemp: string;
}

export interface AnalyticsDashboard {
  dau: number;
  mau: number;
  postCount: number;
  commentCount: number;
  popularCategories: { name: string; count: number }[];
  popularMunicipalities: { name: string; count: number }[];
  topViewed: { id: string; title: string; view_count: number }[];
  activeUsers: number;
}
