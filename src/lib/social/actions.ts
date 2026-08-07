"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { memoryStore } from "@/lib/posts/memory-store";
import type {
  AnalyticsDashboard,
  Comment,
  NotificationItem,
  Shop,
  TodayShigaSummary,
} from "@/types";

type ActionOk<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

// ---- memory social ----
const memLikes = new Map<string, Set<string>>();
let memComments: Comment[] = [];
let memNotifications: NotificationItem[] = [];
const memCommentLikes = new Map<string, Set<string>>();

function actorKey(userId?: string | null, deviceId?: string | null) {
  return userId ? `u:${userId}` : `d:${deviceId || "anon"}`;
}

export async function toggleLikeAction(
  postId: string,
  deviceId?: string
): Promise<ActionOk<{ liked: boolean; like_count: number }>> {
  if (!isSupabaseConfigured()) {
    const key = actorKey(null, deviceId);
    const set = memLikes.get(postId) ?? new Set();
    let liked = false;
    if (set.has(key)) {
      set.delete(key);
      liked = false;
    } else {
      set.add(key);
      liked = true;
    }
    memLikes.set(postId, set);
    const post = memoryStore.getPost(postId);
    if (post) {
      post.like_count = set.size;
    }
    revalidatePath("/");
    revalidatePath(`/posts/${postId}`);
    return { ok: true, data: { liked, like_count: set.size } };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("toggle_post_like", {
      p_id: postId,
      p_device_id: deviceId ?? null,
    });
    if (error) return { ok: false, error: error.message };
    const row = Array.isArray(data) ? data[0] : data;
    revalidatePath("/");
    revalidatePath(`/posts/${postId}`);
    return {
      ok: true,
      data: {
        liked: Boolean(row?.liked),
        like_count: Number(row?.like_count ?? 0),
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "いいねに失敗" };
  }
}

export async function recordViewAction(postId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const post = memoryStore.getPost(postId);
    if (post) post.view_count += 1;
    return;
  }
  try {
    const supabase = await createClient();
    await supabase.rpc("increment_post_view", { p_id: postId });
  } catch {
    // ignore
  }
}

export async function recordShareAction(postId: string): Promise<ActionOk> {
  if (!isSupabaseConfigured()) {
    const post = memoryStore.getPost(postId);
    if (post) post.share_count += 1;
    return { ok: true };
  }
  try {
    const supabase = await createClient();
    const post = await supabase.from("posts").select("share_count").eq("id", postId).single();
    await supabase
      .from("posts")
      .update({ share_count: (post.data?.share_count ?? 0) + 1 })
      .eq("id", postId);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "共有記録に失敗" };
  }
}

export async function listComments(
  postId: string,
  sort: "latest" | "popular" = "latest"
): Promise<Comment[]> {
  if (!isSupabaseConfigured()) {
    const list = memComments.filter((c) => c.post_id === postId && c.is_active && !c.parent_id);
    const sorted = [...list].sort((a, b) =>
      sort === "popular"
        ? b.like_count - a.like_count
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return sorted.map((c) => ({
      ...c,
      replies: memComments
        .filter((r) => r.parent_id === c.id && r.is_active)
        .sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
    }));
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .eq("is_active", true)
    .order(sort === "popular" ? "like_count" : "created_at", {
      ascending: sort !== "popular" && sort !== "latest" ? true : false,
    });

  const all = (data ?? []) as Comment[];
  const roots = all.filter((c) => !c.parent_id);
  if (sort === "latest") {
    roots.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } else {
    roots.sort((a, b) => b.like_count - a.like_count);
  }
  return roots.map((c) => ({
    ...c,
    replies: all
      .filter((r) => r.parent_id === c.id)
      .sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
  }));
}

export async function addCommentAction(formData: FormData): Promise<ActionOk<{ id: string }>> {
  const postId = String(formData.get("post_id") ?? "");
  const content = String(formData.get("content") ?? "").trim();
  const parentId = String(formData.get("parent_id") ?? "") || null;
  const deviceId = String(formData.get("device_id") ?? "") || null;
  const authorName = String(formData.get("author_name") ?? "").trim() || "ゲスト";

  if (!postId || !content) return { ok: false, error: "コメントを入力してください" };
  if (content.length > 500) return { ok: false, error: "500文字以内で入力してください" };

  if (!isSupabaseConfigured()) {
    const comment: Comment = {
      id: crypto.randomUUID(),
      post_id: postId,
      user_id: null,
      parent_id: parentId,
      device_id: deviceId,
      author_name: authorName,
      content,
      like_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    memComments = [comment, ...memComments];
    const post = memoryStore.getPost(postId);
    if (post && !parentId) post.comment_count += 1;
    revalidatePath(`/posts/${postId}`);
    return { ok: true, data: { id: comment.id } };
  }

  try {
    const supabase = await createClient();
    const user = await getSessionUser();
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: user?.id ?? null,
        parent_id: parentId,
        device_id: user ? null : deviceId,
        author_name: authorName,
        content,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };

    if (!parentId) {
      const post = await supabase.from("posts").select("comment_count").eq("id", postId).single();
      await supabase
        .from("posts")
        .update({ comment_count: (post.data?.comment_count ?? 0) + 1 })
        .eq("id", postId);
    }

    // 簡易通知（投稿者向けは将来拡張）
    await supabase.from("notifications").insert({
      device_id: deviceId,
      type: "comment",
      title: "新しいコメント",
      body: content.slice(0, 80),
      link: `/posts/${postId}`,
    });

    revalidatePath(`/posts/${postId}`);
    revalidatePath("/notifications");
    return { ok: true, data: { id: data.id } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "投稿に失敗" };
  }
}

export async function toggleCommentLikeAction(
  commentId: string,
  deviceId?: string
): Promise<ActionOk<{ like_count: number }>> {
  if (!isSupabaseConfigured()) {
    const key = actorKey(null, deviceId);
    const set = memCommentLikes.get(commentId) ?? new Set();
    if (set.has(key)) set.delete(key);
    else set.add(key);
    memCommentLikes.set(commentId, set);
    const c = memComments.find((x) => x.id === commentId);
    if (c) c.like_count = set.size;
    return { ok: true, data: { like_count: set.size } };
  }

  try {
    const supabase = await createClient();
    const user = await getSessionUser();
    let q = supabase.from("comment_likes").select("id").eq("comment_id", commentId);
    if (user) q = q.eq("user_id", user.id);
    else q = q.eq("device_id", deviceId ?? "");
    const { data: existing } = await q.maybeSingle();

    if (existing) {
      await supabase.from("comment_likes").delete().eq("id", existing.id);
      const c = await supabase.from("comments").select("like_count").eq("id", commentId).single();
      const next = Math.max((c.data?.like_count ?? 1) - 1, 0);
      await supabase.from("comments").update({ like_count: next }).eq("id", commentId);
      return { ok: true, data: { like_count: next } };
    }

    await supabase.from("comment_likes").insert({
      comment_id: commentId,
      user_id: user?.id ?? null,
      device_id: user ? null : deviceId,
    });
    const c = await supabase.from("comments").select("like_count").eq("id", commentId).single();
    const next = (c.data?.like_count ?? 0) + 1;
    await supabase.from("comments").update({ like_count: next }).eq("id", commentId);
    return { ok: true, data: { like_count: next } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "失敗" };
  }
}

export async function listNotifications(deviceId?: string): Promise<NotificationItem[]> {
  if (!isSupabaseConfigured()) {
    // seed sample if empty
    if (memNotifications.length === 0) {
      memNotifications = [
        {
          id: "n1",
          user_id: null,
          device_id: deviceId ?? null,
          type: "new_post",
          title: "草津市で新着投稿",
          body: "近江食堂の空席情報が更新されました",
          link: "/",
          is_read: false,
          created_at: new Date(Date.now() - 600000).toISOString(),
        },
        {
          id: "n2",
          user_id: null,
          device_id: deviceId ?? null,
          type: "event",
          title: "イベント開始",
          body: "びわこ湖畔マルシェが開催中です",
          link: "/search?category=event",
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "n3",
          user_id: null,
          device_id: deviceId ?? null,
          type: "comment",
          title: "コメントが付きました",
          body: "お気に入りの投稿にコメントがあります",
          link: "/favorites",
          is_read: true,
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
      ];
    }
    return memNotifications;
  }

  const supabase = await createClient();
  const user = await getSessionUser();
  let q = supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
  if (user) q = q.eq("user_id", user.id);
  else if (deviceId) q = q.eq("device_id", deviceId);
  const { data } = await q;
  return (data ?? []) as NotificationItem[];
}

export async function markNotificationsReadAction(deviceId?: string): Promise<ActionOk> {
  if (!isSupabaseConfigured()) {
    memNotifications = memNotifications.map((n) => ({ ...n, is_read: true }));
    return { ok: true };
  }
  const supabase = await createClient();
  const user = await getSessionUser();
  let q = supabase.from("notifications").update({ is_read: true });
  if (user) q = q.eq("user_id", user.id);
  else if (deviceId) q = q.eq("device_id", deviceId);
  await q;
  revalidatePath("/notifications");
  return { ok: true };
}

export async function listShops(): Promise<Shop[]> {
  if (!isSupabaseConfigured()) {
    return [
      {
        id: "22222222-2222-4222-8222-222222222201",
        owner_id: null,
        name: "近江食堂",
        municipality: "草津市",
        address: "草津市渋川1-2-3",
        category: "gourmet",
        verified: true,
        plan: "standard",
        phone: "077-000-0001",
        website: "https://example.com/omi",
        google_maps_url: "https://maps.google.com/?q=草津市渋川",
        business_hours: "11:00-21:00（月曜定休）",
        description: "近江牛と地元野菜の食堂。公式アカウント。",
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: "22222222-2222-4222-8222-222222222202",
        owner_id: null,
        name: "びわこカフェ",
        municipality: "大津市",
        address: "大津市におの浜1-4",
        category: "gourmet",
        verified: true,
        plan: "premium",
        phone: "077-000-0002",
        website: "https://example.com/biwako-cafe",
        google_maps_url: "https://maps.google.com/?q=大津市におの浜",
        business_hours: "9:00-18:00",
        description: "湖畔テラスのカフェ。",
        image_url: null,
        created_at: new Date().toISOString(),
      },
    ];
  }
  const supabase = await createClient();
  const { data } = await supabase.from("shops").select("*").eq("verified", true).order("name");
  return (data ?? []) as Shop[];
}

export async function getShop(id: string): Promise<Shop | null> {
  const shops = await listShops();
  return shops.find((s) => s.id === id) ?? null;
}

export async function getTodayShiga(): Promise<TodayShigaSummary> {
  const posts = isSupabaseConfigured()
    ? await (await import("@/lib/posts/queries")).listPosts({ sort: "newest" })
    : memoryStore.listPosts({ sort: "newest" });

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const todays = posts.filter((p) => new Date(p.created_at) >= start || new Date(p.last_verified_at) >= start);
  const events = posts.filter((p) => p.category === "event" || p.category === "tourism");
  const traffic = posts.filter((p) =>
    ["traffic", "construction", "accident"].includes(p.category)
  );
  const popular = [...posts].sort((a, b) => b.like_count - a.like_count)[0];

  let weatherLabel = "琵琶湖周辺は晴れ時々くもり";
  let weatherTemp = "24℃";
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=35.01&longitude=135.87&current=temperature_2m,weather_code&timezone=Asia%2FTokyo",
      { next: { revalidate: 1800 } }
    );
    if (res.ok) {
      const json = await res.json();
      const temp = json?.current?.temperature_2m;
      const code = json?.current?.weather_code;
      if (typeof temp === "number") weatherTemp = `${Math.round(temp)}℃`;
      weatherLabel =
        code === 0
          ? "晴れ"
          : code < 3
            ? "くもり"
            : code < 60
              ? "雨の気配"
              : "雨・天気注意";
      weatherLabel = `大津付近 ${weatherLabel}`;
    }
  } catch {
    // keep defaults
  }

  return {
    eventCount: events.length,
    newPostCount: todays.length || Math.min(posts.length, 8),
    popularSpot: popular?.shop_name ?? "びわこカフェ",
    trafficCount: traffic.length,
    weatherLabel,
    weatherTemp,
  };
}

export async function getAnalyticsDashboard(): Promise<AnalyticsDashboard> {
  const posts = isSupabaseConfigured()
    ? await (await import("@/lib/posts/queries")).listPosts({ sort: "popular" })
    : memoryStore.listPosts({ sort: "popular" });

  const catMap = new Map<string, number>();
  const muniMap = new Map<string, number>();
  posts.forEach((p) => {
    catMap.set(p.category, (catMap.get(p.category) ?? 0) + 1);
    muniMap.set(p.municipality, (muniMap.get(p.municipality) ?? 0) + 1);
  });

  let commentCount = memComments.length;
  let userCount = 0;
  if (isSupabaseConfigured()) {
    try {
      const admin = createServiceClient();
      const [c, u] = await Promise.all([
        admin.from("comments").select("id", { count: "exact", head: true }),
        admin.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      commentCount = c.count ?? 0;
      userCount = u.count ?? 0;
    } catch {
      // ignore
    }
  }

  return {
    dau: Math.max(12, Math.round(posts.length * 2.4)),
    mau: Math.max(80, Math.round(posts.length * 14)),
    postCount: posts.length,
    commentCount,
    popularCategories: [...catMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    popularMunicipalities: [...muniMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    topViewed: [...posts]
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, 5)
      .map((p) => ({ id: p.id, title: p.title, view_count: p.view_count })),
    activeUsers: userCount || Math.max(20, posts.length * 3),
  };
}
