import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PlusCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORIES,
  isProfileComplete,
  useIsAdmin,
  usePosts,
  useProfile,
  useSession,
  type Post,
} from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TradeHub | B2B Yarn, Cotton & Fabric Marketplace" },
      {
        name: "description",
        content:
          "Live commodity rates plus a fast B2B feed of yarn, cotton and fabric offers. Search by category and city, then contact traders on WhatsApp.",
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
  const queryClient = useQueryClient();

  const [term, setTerm] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [city, setCity] = useState<string>("All");

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

      <div className="sticky top-[60px] z-20 -mx-3 bg-background/95 px-3 pt-1 pb-3 backdrop-blur">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search item, company, rate…"
            className="bg-card pl-9"
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

      <div className="mt-3 space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading feed…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 text-center shadow-card">
            <p className="font-semibold">No posts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Be the first to share a yarn, cotton or fabric offer.
            </p>
            <Button asChild className="mt-4">
              <Link to="/new">Create a post</Link>
            </Button>
          </div>
        ) : (
          filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isAdmin={isAdmin}
              onTogglePin={togglePin}
              onDelete={deletePost}
            />
          ))
        )}
      </div>

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
