export type UserRole = "user" | "shop" | "admin";

export type PostAuthorType = "general" | "verified_shop" | "admin";

export type ShopPlan = "free" | "standard" | "premium";

export type CategoryId =
  | "food"
  | "event"
  | "shopping"
  | "beauty"
  | "hospital"
  | "parking"
  | "gas"
  | "traffic"
  | "recruit"
  | "local";

export type ReportReason =
  | "incorrect"
  | "outdated"
  | "inappropriate"
  | "spam"
  | "other";

export interface Profile {
  id: string;
  display_name: string | null;
  role: UserRole;
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
  last_verified_at: string;
  created_at: string;
  updated_at: string;
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
  created_at: string;
}

export interface PostFilters {
  q?: string;
  category?: CategoryId | "";
  municipality?: string;
  status?: string;
  sort?: "newest" | "oldest";
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
}

export interface AdminStats {
  postCount: number;
  reportCount: number;
  userCount: number;
}
