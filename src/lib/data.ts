import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Category = "Yarn" | "Cotton" | "Fabric";
export const CATEGORIES: Category[] = ["Yarn", "Cotton", "Fabric"];

export interface Profile {
  id: string;
  full_name: string;
  company_name: string;
  city: string;
  whatsapp: string;
  avatar_url: string | null;
  is_blocked: boolean;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  category: Category;
  title: string;
  details: string;
  quantity: string;
  rate: string;
  image_path: string | null;
  is_pinned: boolean;
  created_at: string;
  profiles: Profile | null;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profiles: Pick<Profile, "full_name" | "company_name" | "city"> | null;
}

export interface MarketRate {
  id: string;
  symbol: string;
  label: string;
  unit: string;
  value: number;
  change_pct: number;
  sort_order: number;
  updated_at: string;
}

export interface SiteSettings {
  id: number;
  site_title: string;
  header_text: string;
  brand_name: string;
  theme: string;
}

const db = supabase as unknown as {
  from: (table: string) => any;
};

/* ---------------- auth ---------------- */

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const user: User | null = session?.user ?? null;
  return { session, user, loading };
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await db
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });
}

export function useIsAdmin(userId: string | undefined) {
  return useQuery({
    queryKey: ["is-admin", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await db
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
}

export function isProfileComplete(profile: Profile | null | undefined) {
  return !!(profile?.full_name && profile.company_name && profile.city && profile.whatsapp);
}

/* ---------------- content ---------------- */

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async (): Promise<SiteSettings> => {
      const { data, error } = await db.from("site_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data as SiteSettings;
    },
    staleTime: 60_000,
  });
}

export function useMarketRates() {
  return useQuery({
    queryKey: ["market-rates"],
    queryFn: async (): Promise<MarketRate[]> => {
      const { data, error } = await db
        .from("market_rates")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MarketRate[];
    },
    refetchInterval: 60_000,
  });
}

const POST_SELECT =
  "*, profiles:profiles!posts_profile_fkey(id, full_name, company_name, city, whatsapp, avatar_url, is_blocked, created_at)";

export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: async (): Promise<Post[]> => {
      const { data, error } = await db
        .from("posts")
        .select(POST_SELECT)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as Post[];
    },
  });
}

export function usePost(postId: string) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async (): Promise<Post | null> => {
      const { data, error } = await db
        .from("posts")
        .select(POST_SELECT)
        .eq("id", postId)
        .maybeSingle();
      if (error) throw error;
      return data as Post | null;
    },
  });
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: async (): Promise<Comment[]> => {
      const { data, error } = await db
        .from("comments")
        .select("*, profiles:profiles!comments_profile_fkey(full_name, company_name, city)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Comment[];
    },
  });
}

export function useSignedImage(path: string | null | undefined) {
  return useQuery({
    queryKey: ["image", path],
    enabled: !!path,
    staleTime: 30 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("post-images")
        .createSignedUrl(path as string, 60 * 60);
      if (error) throw error;
      return data.signedUrl;
    },
  });
}

/* ---------------- helpers ---------------- */

export function whatsappLink(number: string, message: string) {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function formatRate(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
