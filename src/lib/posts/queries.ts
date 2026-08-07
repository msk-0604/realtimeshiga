import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient, getCurrentProfile, getSessionUser } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { memoryStore } from "@/lib/posts/memory-store";
import { distanceKm, resolvePostCoords } from "@/lib/geo";
import { sanitizeUrl } from "@/lib/validation";
import type {
  AdminStats,
  Post,
  PostFilters,
  PostFormInput,
  PostWithDistance,
  Report,
} from "@/types";

function mapPost(row: Record<string, unknown>): Post {
  return {
    id: String(row.id),
    user_id: (row.user_id as string | null) ?? null,
    category: row.category as Post["category"],
    title: String(row.title),
    shop_name: String(row.shop_name),
    municipality: String(row.municipality),
    address: String(row.address),
    status: String(row.status),
    content: String(row.content),
    url: (row.url as string | null) ?? null,
    image_url: (row.image_url as string | null) ?? null,
    latitude: (row.latitude as number | null) ?? null,
    longitude: (row.longitude as number | null) ?? null,
    is_active: Boolean(row.is_active),
    is_verified_shop: Boolean(row.is_verified_shop),
    author_type: (row.author_type as Post["author_type"]) ?? "general",
    last_verified_at: String(row.last_verified_at),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function dbImageUrl(url: string | null | undefined): string | null {
  const sanitized = sanitizeUrl(url);
  if (!sanitized) return null;
  if (sanitized.startsWith("data:")) return null; // DBには保存不可
  return sanitized;
}

function applyNearbySort(posts: Post[], filters: PostFilters): PostWithDistance[] {
  if (filters.lat == null || filters.lng == null) {
    return posts;
  }

  const radius = filters.radiusKm ?? 20;
  const withDistance: PostWithDistance[] = posts
    .map((p) => {
      const coords = resolvePostCoords(p);
      if (!coords) return { ...p, distance_km: undefined };
      const d = distanceKm(filters.lat!, filters.lng!, coords.lat, coords.lng);
      return { ...p, distance_km: d };
    })
    .filter((p) => p.distance_km == null || p.distance_km <= radius);

  if (filters.sort === "nearby") {
    withDistance.sort((a, b) => {
      const da = a.distance_km ?? Number.POSITIVE_INFINITY;
      const db = b.distance_km ?? Number.POSITIVE_INFINITY;
      if (da !== db) return da - db;
      return (
        new Date(b.last_verified_at).getTime() - new Date(a.last_verified_at).getTime()
      );
    });
  }

  return withDistance;
}

export async function listPosts(filters: PostFilters = {}): Promise<PostWithDistance[]> {
  if (!isSupabaseConfigured()) {
    return applyNearbySort(memoryStore.listPosts(filters), filters);
  }

  const supabase = await createClient();
  let query = supabase.from("posts").select("*").eq("is_active", true);

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.municipality) query = query.eq("municipality", filters.municipality);
  if (filters.status) query = query.eq("status", filters.status);

  if (filters.q?.trim()) {
    const q = filters.q.trim().replace(/[%_]/g, "");
    query = query.or(
      `title.ilike.%${q}%,shop_name.ilike.%${q}%,content.ilike.%${q}%,municipality.ilike.%${q}%,address.ilike.%${q}%`
    );
  }

  query = query.order("last_verified_at", {
    ascending: filters.sort === "oldest",
  });

  const { data, error } = await query;
  if (error) {
    console.error("listPosts error:", error.message);
    return applyNearbySort(memoryStore.listPosts(filters), filters);
  }

  return applyNearbySort((data ?? []).map(mapPost), filters);
}

export async function getPostById(id: string): Promise<Post | null> {
  if (!isSupabaseConfigured()) {
    return memoryStore.getPost(id);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("getPostById error:", error.message);
    return memoryStore.getPost(id);
  }
  return data ? mapPost(data) : null;
}

export async function createPost(input: PostFormInput): Promise<Post> {
  if (!isSupabaseConfigured()) {
    return memoryStore.createPost(input);
  }

  const supabase = await createClient();
  const user = await getSessionUser();
  const profile = await getCurrentProfile();

  const authorType =
    profile?.role === "shop"
      ? "verified_shop"
      : profile?.role === "admin"
        ? "admin"
        : "general";

  const payload = {
    user_id: user?.id ?? null,
    category: input.category,
    title: input.title,
    shop_name: input.shop_name,
    municipality: input.municipality,
    address: input.address,
    status: input.status,
    content: input.content,
    url: (() => {
      const u = sanitizeUrl(input.url);
      return u && !u.startsWith("data:") ? u : null;
    })(),
    image_url: dbImageUrl(input.image_url),
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    author_type: authorType,
    is_verified_shop: profile?.role === "shop",
    is_active: true,
  };

  const { data, error } = await supabase.from("posts").insert(payload).select("*").single();
  if (error) throw new Error(error.message);
  return mapPost(data);
}

export async function updatePost(id: string, input: PostFormInput): Promise<Post> {
  if (!isSupabaseConfigured()) {
    const updated = memoryStore.updatePost(id, input);
    if (!updated) throw new Error("投稿が見つかりません");
    return updated;
  }

  const supabase = await createClient();
  const user = await getSessionUser();
  const existing = await getPostById(id);
  if (!existing) throw new Error("投稿が見つかりません");

  // 所有者または未紐付け投稿のみ編集可（厳密な制御はRLS側）
  if (existing.user_id && user && existing.user_id !== user.id) {
    const profile = await getCurrentProfile();
    if (profile?.role !== "admin") {
      throw new Error("この投稿を編集する権限がありません");
    }
  }

  const now = new Date().toISOString();
  const imageUrl = dbImageUrl(input.image_url);
  let url = sanitizeUrl(input.url);
  if (url?.startsWith("data:")) url = null;

  const { data, error } = await supabase
    .from("posts")
    .update({
      category: input.category,
      title: input.title,
      shop_name: input.shop_name,
      municipality: input.municipality,
      address: input.address,
      status: input.status,
      content: input.content,
      url,
      image_url: imageUrl,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      updated_at: now,
      last_verified_at: now,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapPost(data);
}

export async function verifyPost(id: string): Promise<Post> {
  if (!isSupabaseConfigured()) {
    const updated = memoryStore.verifyPost(id);
    if (!updated) throw new Error("投稿が見つかりません");
    return updated;
  }

  const supabase = await createClient();

  // RPCがあれば使う（RLS強化後）
  const { error: rpcError } = await supabase.rpc("verify_post", { post_id: id });
  if (!rpcError) {
    const refreshed = await getPostById(id);
    if (refreshed) return refreshed;
  }

  // フォールバック（旧ポリシー）
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("posts")
    .update({ last_verified_at: now, updated_at: now })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapPost(data);
}

export async function createReport(input: {
  post_id: string;
  reason: Report["reason"];
  detail?: string;
  device_id?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isSupabaseConfigured()) {
    const result = memoryStore.createReport(input);
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  const supabase = await createClient();
  const user = await getSessionUser();

  if (input.device_id) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from("reports")
      .select("id")
      .eq("post_id", input.post_id)
      .eq("device_id", input.device_id)
      .gte("created_at", oneHourAgo)
      .limit(1);

    if (existing && existing.length > 0) {
      return { ok: false, error: "同一端末から短時間に連続通報はできません" };
    }
  }

  const { error } = await supabase.from("reports").insert({
    post_id: input.post_id,
    user_id: user?.id ?? null,
    reason: input.reason,
    detail: input.detail?.trim() || null,
    device_id: input.device_id ?? null,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function listAllPostsAdmin(): Promise<Post[]> {
  if (!isSupabaseConfigured()) {
    return memoryStore.listAllPosts();
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapPost);
}

export async function listReportsAdmin(): Promise<Report[]> {
  if (!isSupabaseConfigured()) {
    return memoryStore.listReports();
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Report[];
}

export async function getAdminStats(): Promise<AdminStats> {
  if (!isSupabaseConfigured()) {
    return memoryStore.getStats();
  }

  const supabase = createServiceClient();
  const [posts, reports, profiles] = await Promise.all([
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("reports").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  return {
    postCount: posts.count ?? 0,
    reportCount: reports.count ?? 0,
    userCount: profiles.count ?? 0,
  };
}

export async function adminSetActive(id: string, isActive: boolean): Promise<void> {
  if (!isSupabaseConfigured()) {
    memoryStore.setPostActive(id, isActive);
    return;
  }
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("posts")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function adminDeletePost(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    memoryStore.deletePost(id);
    return;
  }
  const supabase = createServiceClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function adminSetVerified(id: string, verified: boolean): Promise<void> {
  if (!isSupabaseConfigured()) {
    memoryStore.setVerifiedShop(id, verified);
    return;
  }
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("posts")
    .update({
      is_verified_shop: verified,
      author_type: verified ? "verified_shop" : "general",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getPostsByIds(ids: string[]): Promise<Post[]> {
  if (ids.length === 0) return [];
  if (!isSupabaseConfigured()) {
    return ids
      .map((id) => memoryStore.getPost(id))
      .filter((p): p is Post => Boolean(p));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").select("*").in("id", ids);
  if (error) return [];
  const mapped = (data ?? []).map(mapPost);
  const order = new Map(ids.map((id, i) => [id, i]));
  return mapped.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}
