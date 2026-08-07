import { DUMMY_POSTS, DUMMY_REPORTS } from "@/data/dummy-posts";
import type { Post, Report, PostFilters, PostFormInput, AdminStats } from "@/types";
import { sanitizeUrl } from "@/lib/validation";

/**
 * Supabase未設定時の開発用インメモリストア。
 * next dev の同一プロセス内でCRUDを確認できる。
 */
let memoryPosts: Post[] = structuredClone(DUMMY_POSTS);
let memoryReports: Report[] = structuredClone(DUMMY_REPORTS);

function sortPosts(posts: Post[], sort: PostFilters["sort"] = "newest"): Post[] {
  return [...posts].sort((a, b) => {
    if (sort === "popular" || sort === "rising") {
      const scoreA = a.like_count * 3 + a.comment_count * 2 + a.view_count * 0.01;
      const scoreB = b.like_count * 3 + b.comment_count * 2 + b.view_count * 0.01;
      if (sort === "rising") {
        const ageA = (Date.now() - new Date(a.last_verified_at).getTime()) / 3600000 + 1;
        const ageB = (Date.now() - new Date(b.last_verified_at).getTime()) / 3600000 + 1;
        return scoreB / ageB - scoreA / ageA;
      }
      return scoreB - scoreA;
    }
    const aTime = new Date(a.last_verified_at).getTime();
    const bTime = new Date(b.last_verified_at).getTime();
    return sort === "oldest" ? aTime - bTime : bTime - aTime;
  });
}

function applyFilters(posts: Post[], filters: PostFilters = {}): Post[] {
  let result = posts.filter((p) => p.is_active);

  if (filters.category) {
    result = result.filter((p) => p.category === filters.category);
  }
  if (filters.municipality) {
    result = result.filter((p) => p.municipality === filters.municipality);
  }
  if (filters.status) {
    result = result.filter((p) => p.status === filters.status);
  }
  if (filters.q?.trim()) {
    const q = filters.q.trim().toLowerCase();
    result = result.filter((p) =>
      [p.title, p.shop_name, p.content, p.municipality, p.address]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }

  return sortPosts(result, filters.sort ?? "newest");
}

function createId(): string {
  return crypto.randomUUID();
}

export const memoryStore = {
  listPosts(filters: PostFilters = {}): Post[] {
    return applyFilters(memoryPosts, filters);
  },

  getPost(id: string): Post | null {
    return memoryPosts.find((p) => p.id === id) ?? null;
  },

  createPost(input: PostFormInput): Post {
    const now = new Date().toISOString();
    const post: Post = {
      id: createId(),
      user_id: null,
      category: input.category,
      title: input.title,
      shop_name: input.shop_name,
      municipality: input.municipality,
      address: input.address,
      status: input.status,
      content: input.content,
      url: sanitizeUrl(input.url) ?? null,
      image_url: sanitizeUrl(input.image_url) ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      is_active: true,
      is_verified_shop: false,
      author_type: "general",
      like_count: 0,
      comment_count: 0,
      view_count: 0,
      share_count: 0,
      last_verified_at: now,
      created_at: now,
      updated_at: now,
    };
    memoryPosts = [post, ...memoryPosts];
    return post;
  },

  updatePost(id: string, input: PostFormInput): Post | null {
    const index = memoryPosts.findIndex((p) => p.id === id);
    if (index < 0) return null;
    const now = new Date().toISOString();
    const updated: Post = {
      ...memoryPosts[index],
      category: input.category,
      title: input.title,
      shop_name: input.shop_name,
      municipality: input.municipality,
      address: input.address,
      status: input.status,
      content: input.content,
      url: sanitizeUrl(input.url) ?? null,
      image_url: sanitizeUrl(input.image_url) ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      updated_at: now,
      last_verified_at: now,
    };
    memoryPosts = [
      ...memoryPosts.slice(0, index),
      updated,
      ...memoryPosts.slice(index + 1),
    ];
    return updated;
  },

  verifyPost(id: string): Post | null {
    const index = memoryPosts.findIndex((p) => p.id === id);
    if (index < 0) return null;
    const now = new Date().toISOString();
    const updated: Post = {
      ...memoryPosts[index],
      last_verified_at: now,
      updated_at: now,
    };
    memoryPosts = [
      ...memoryPosts.slice(0, index),
      updated,
      ...memoryPosts.slice(index + 1),
    ];
    return updated;
  },

  setPostActive(id: string, isActive: boolean): Post | null {
    const index = memoryPosts.findIndex((p) => p.id === id);
    if (index < 0) return null;
    const updated = { ...memoryPosts[index], is_active: isActive, updated_at: new Date().toISOString() };
    memoryPosts = [
      ...memoryPosts.slice(0, index),
      updated,
      ...memoryPosts.slice(index + 1),
    ];
    return updated;
  },

  deletePost(id: string): boolean {
    const before = memoryPosts.length;
    memoryPosts = memoryPosts.filter((p) => p.id !== id);
    memoryReports = memoryReports.filter((r) => r.post_id !== id);
    return memoryPosts.length < before;
  },

  setVerifiedShop(id: string, verified: boolean): Post | null {
    const index = memoryPosts.findIndex((p) => p.id === id);
    if (index < 0) return null;
    const updated: Post = {
      ...memoryPosts[index],
      is_verified_shop: verified,
      author_type: verified ? "verified_shop" : "general",
      updated_at: new Date().toISOString(),
    };
    memoryPosts = [
      ...memoryPosts.slice(0, index),
      updated,
      ...memoryPosts.slice(index + 1),
    ];
    return updated;
  },

  listAllPosts(): Post[] {
    return sortPosts(memoryPosts, "newest");
  },

  createReport(input: {
    post_id: string;
    reason: Report["reason"];
    detail?: string;
    device_id?: string;
  }): { ok: true; report: Report } | { ok: false; error: string } {
    const recent = memoryReports.find(
      (r) =>
        r.post_id === input.post_id &&
        r.device_id &&
        input.device_id &&
        r.device_id === input.device_id &&
        Date.now() - new Date(r.created_at).getTime() < 60 * 60 * 1000
    );
    if (recent) {
      return { ok: false, error: "同一端末から短時間に連続通報はできません" };
    }

    const report: Report = {
      id: createId(),
      post_id: input.post_id,
      user_id: null,
      device_id: input.device_id ?? null,
      reason: input.reason,
      detail: input.detail?.trim() || null,
      created_at: new Date().toISOString(),
    };
    memoryReports = [report, ...memoryReports];
    return { ok: true, report };
  },

  listReports(): Report[] {
    return [...memoryReports].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  getStats(): AdminStats {
    return {
      postCount: memoryPosts.length,
      reportCount: memoryReports.length,
      userCount: 0,
    };
  },

  getReportedPostIds(): string[] {
    return [...new Set(memoryReports.map((r) => r.post_id))];
  },
};
