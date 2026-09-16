import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PlusCircle, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { BannerAdSlot } from "@/components/BannerAdSlot";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORIES,
  isProfileComplete,
  useBannerAds,
  useIsAdmin,
  usePosts,
  useProfile,
  useSession,
  useSiteSettings,
  type Post,
} from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TradeHub | B2B Yarn, Cotton & Fabric Marketplace" },
      {
        name: "description",
        content:
          "Live commodity rates plus split feeds of selling offers and buying requirements for yarn, cotton and fabric. Search by category and city, then contact traders on WhatsApp.",
      },
      { property: "og:title", content: "TradeHub | B2B Yarn, Cotton & Fabric Marketplace" },
      {
        property: "og:description",
        content:
          "Live WTI, Brent, Gold, Silver and PSX 100 rates with a real-time textile trading feed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FeedPage,
});

function FeedPage() {
  const { user } = useSession();
  const { data: profile } = useProfile(user?.id);
  const { data: isAdmin } = useIsAdmin(user?.id);
  const { data: posts = [], isLoading } = usePosts();
  const { data: settings } = useSiteSettings();
  const { data: ads = [] } = useBannerAds();
  const queryClient = useQueryClient();

  const [term, setTerm] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [city, setCity] = useState<string>("All");

  const adsOn = settings?.ads_enabled !== false;
  const activeAds = useMemo(() => (adsOn ? ads.filter((ad) => ad.is_active) : []), [ads, adsOn]);
  const topAds = activeAds.filter((ad) => ad.placement === "top");
  const sidebarAds = activeAds
    .filter((ad) => ad.placement === "sidebar")
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
  const feedAds = activeAds
    .filter((ad) => ad.placement !== "sidebar" && ad.placement !== "top" && ad.placement !== "footer")
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
  const globalFrequency = Math.max(1, settings?.ads_feed_frequency ?? 3);
  const positionAds = feedAds.filter((ad) => ad.feed_mode === "position" && ad.feed_position);
  const frequencyAds = feedAds.filter((ad) => ad.feed_mode === "frequency" && ad.feed_every);
  const autoAds = feedAds.filter((ad) => ad.feed_mode !== "position" && ad.feed_mode !== "frequency");

  function adsAfterPost(postNumber: number, offset: number) {
    const out = positionAds.filter((ad) => ad.feed_position === postNumber);
    frequencyAds.forEach((ad) => {
      const every = Math.max(1, ad.feed_every ?? 1);
      if (postNumber % every === 0) out.push(ad);
    });
    if (autoAds.length > 0 && postNumber % globalFrequency === 0) {
      const slot = Math.floor(postNumber / globalFrequency) - 1 + offset;
      const picked = autoAds[((slot % autoAds.length) + autoAds.length) % autoAds.length];
      if (picked) out.push(picked);
    }
    return out;
  }


  const cities = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((post) => post.profiles?.city && set.add(post.profiles.city));
    return ["All", ...Array.from(set).sort()];
  }, [posts]);

  const filtered = useMemo(() => {
    const query = term.trim().toLowerCase();
    return posts.filter((post) => {
      if (category !== "All" && post.category !== category) return false;
      if (city !== "All" && post.profiles?.city !== city) return false;
      if (!query) return true;
      const haystack = [
        post.title,
        post.details,
        post.quantity,
        post.rate,
        post.category,
        post.profiles?.full_name,
        post.profiles?.company_name,
        post.profiles?.city,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [posts, term, category, city]);

  const selling = filtered.filter((post) => post.post_type !== "buy");
  const buying = filtered.filter((post) => post.post_type === "buy");

  async function togglePin(post: Post) {
    const { error } = await supabase
      .from("posts")
      .update({ is_pinned: !post.is_pinned } as never)
      .eq("id", post.id);
    if (error) {
      toast.error("Could not update the post.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["posts"] });
  }

  async function deletePost(post: Post) {
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) {
      toast.error("Could not delete the post.");
      return;
    }
    toast.success("Post deleted.");
    await queryClient.invalidateQueries({ queryKey: ["posts"] });
  }

  function Column({
    title,
    tone,
    items,
    emptyText,
  }: {
    title: string;
    tone: "sell" | "buy";
    items: Post[];
    emptyText: string;
  }) {
    const pinned = items.filter((post) => post.is_pinned);
    const rest = items.filter((post) => !post.is_pinned);
    const offset = tone === "sell" ? 0 : 1;

    return (
      <section className="min-w-0">
        <header className="sticky top-[104px] z-10 mb-3 flex items-center justify-between rounded-xl bg-background/95 py-1 backdrop-blur">
          <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-tight">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${
                tone === "sell" ? "bg-success/15 text-success" : "bg-info/15 text-info"
              }`}
            >
              {title}
            </span>
          </h2>
          <span className="text-xs text-muted-foreground">{items.length}</span>
        </header>

        {pinned.length > 0 ? (
          <div className="mb-3 space-y-3 rounded-2xl border border-warning/40 bg-warning/5 p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
              <Sparkles className="h-3.5 w-3.5" /> Sponsored / Featured
            </p>
            {pinned.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isAdmin={isAdmin}
                canMessage={!!user && user.id !== post.user_id}
                onTogglePin={togglePin}
                onDelete={deletePost}
              />
            ))}
          </div>
        ) : null}

        <div className="space-y-3">
          {rest.length === 0 && pinned.length === 0 ? (
            <div className="rounded-2xl bg-card p-6 text-center shadow-card">
              <p className="text-sm font-semibold">{emptyText}</p>
              <Button asChild size="sm" className="mt-3">
                <Link to="/new">Create a post</Link>
              </Button>
            </div>
          ) : null}
          {rest.map((post, index) => {
            const slotAds = adsAfterPost(index + 1, offset);
            return (
              <div key={post.id} className="space-y-3">
                <PostCard
                  post={post}
                  isAdmin={isAdmin}
                  canMessage={!!user && user.id !== post.user_id}
                  onTogglePin={togglePin}
                  onDelete={deletePost}
                />
                {slotAds.map((ad, i) => (
                  <BannerAdSlot key={`${post.id}-${ad.id}-${i}`} ad={ad} />
                ))}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <AppShell>
      {user && !isProfileComplete(profile) ? (
        <div className="mb-4 rounded-xl bg-accent p-3 text-sm text-accent-foreground">
          Complete your profile (name, company, city, WhatsApp) before posting.{" "}
          <Link to="/profile" className="font-semibold underline">
            Complete now
          </Link>
        </div>
      ) : null}

      {topAds.length > 0 ? (
        <div className="mb-3 space-y-3">
          {topAds.map((ad) => (
            <BannerAdSlot key={ad.id} ad={ad} variant="wide" />
          ))}
        </div>
      ) : null}

      <div className="sticky top-[64px] z-20 -mx-3 bg-background/95 px-3 pt-1 pb-3 backdrop-blur">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search item, company, rate…"
            className="h-11 bg-card pl-9"
            aria-label="Search posts"
          />
        </div>

        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
          {["All", ...CATEGORIES].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                category === item
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-accent"
              }`}
            >
              {item}
            </button>
          ))}
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            aria-label="Filter by city"
            className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold"
          >
            {cities.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All cities" : item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-3 text-sm text-muted-foreground">Loading feed…</p>
      ) : (
        <div className="mt-3 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_18rem]">
          <Column
            title="Active selling offers"
            tone="sell"
            items={selling}
            emptyText="No selling offers match your filters."
          />
          <Column
            title="Buying requirements"
            tone="buy"
            items={buying}
            emptyText="No buying requirements match your filters."
          />
          {sidebarAds.length > 0 ? (
            <aside className="hidden space-y-3 lg:block">
              <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                Promotions
              </p>
              {sidebarAds.map((ad) => (
                <BannerAdSlot key={ad.id} ad={ad} variant="square" />
              ))}
            </aside>
          ) : null}
        </div>
      )}

      <Button
        asChild
        size="lg"
        className="fixed right-4 bottom-20 z-30 rounded-full shadow-card md:bottom-8"
      >
        <Link to="/new">
          <PlusCircle className="h-5 w-5" /> Post
        </Link>
      </Button>
    </AppShell>
  );
}
