import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { PALETTES } from "@/lib/theme";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Textarea } from "@/components/ui/textarea";
import {
  useBannerAds,
  usePages,
  useSignedFile,
  useIsAdmin,
  useMarketRates,
  usePosts,
  useSession,
  useSiteSettings,
  type BannerAd,
  type Page,
  type Post,
  type Profile,
} from "@/lib/data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard | TradeHub Marketplace" },
      {
        name: "description",
        content: "Owner tools: branding, colour themes, market rates, post moderation and members.",
      },
      { property: "og:title", content: "Admin dashboard | TradeHub" },
      { property: "og:description", content: "Private control panel for the site owner." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useSession();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin(user?.id);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  if (loading || roleLoading) {
    return (
      <AppShell>
        <p className="text-sm text-muted-foreground">Checking access…</p>
      </AppShell>
    );
  }

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="rounded-2xl bg-card p-6 text-center shadow-card">
          <h2 className="font-bold">Admin only</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This dashboard is available to the site owner only.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h2 className="text-xl font-bold">Admin dashboard</h2>
      <Tabs defaultValue="settings" className="mt-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="settings">Site</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="ads">Ads</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>
        <TabsContent value="settings">
          <SiteSettingsPanel />
          <PasswordPanel />
          <MarketRatesPanel />
        </TabsContent>
        <TabsContent value="theme">
          <ThemePanel />
        </TabsContent>
        <TabsContent value="ads">
          <AdsPanel />
        </TabsContent>
        <TabsContent value="pages">
          <PagesPanel />
        </TabsContent>
        <TabsContent value="posts">
          <PostsPanel />
        </TabsContent>
        <TabsContent value="members">
          <MembersPanel />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function SiteSettingsPanel() {
  const { data: settings } = useSiteSettings();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    site_title: "",
    header_text: "",
    brand_name: "",
    footer_text: "",
    contact_email: "",
    contact_phone: "",
    contact_address: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        site_title: settings.site_title,
        header_text: settings.header_text,
        brand_name: settings.brand_name,
        footer_text: settings.footer_text ?? "",
        contact_email: settings.contact_email ?? "",
        contact_phone: settings.contact_phone ?? "",
        contact_address: settings.contact_address ?? "",
      });
    }
  }, [settings]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update(form as never)
      .eq("id", 1);
    setSaving(false);
    if (error) {
      toast.error("Could not save settings.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    toast.success("Site settings updated.");
  }

  return (
    <form onSubmit={save} className="mt-4 space-y-4 rounded-2xl bg-card p-4 shadow-card">
      <h3 className="font-semibold">Branding</h3>
      <div className="space-y-1.5">
        <Label htmlFor="brand_name">Brand name</Label>
        <Input
          id="brand_name"
          value={form.brand_name}
          onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="header_text">Header text</Label>
        <Input
          id="header_text"
          value={form.header_text}
          onChange={(e) => setForm({ ...form, header_text: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="site_title">Website title (browser tab)</Label>
        <Input
          id="site_title"
          value={form.site_title}
          onChange={(e) => setForm({ ...form, site_title: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="footer_text">Footer text</Label>
        <Input
          id="footer_text"
          value={form.footer_text}
          onChange={(e) => setForm({ ...form, footer_text: e.target.value })}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact_email">Contact email</Label>
          <Input
            id="contact_email"
            value={form.contact_email}
            onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact_phone">Contact phone</Label>
          <Input
            id="contact_phone"
            value={form.contact_phone}
            onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="contact_address">Contact address</Label>
        <Input
          id="contact_address"
          value={form.contact_address}
          onChange={(e) => setForm({ ...form, contact_address: e.target.value })}
        />
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save branding"}
      </Button>
    </form>
  );
}

function ThemePanel() {
  const { data: settings } = useSiteSettings();
  const queryClient = useQueryClient();

  async function choose(theme: string) {
    const { error } = await supabase
      .from("site_settings")
      .update({ theme } as never)
      .eq("id", 1);
    if (error) {
      toast.error("Could not change the theme.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    toast.success("Colour theme updated.");
  }

  return (
    <div className="mt-4 rounded-2xl bg-card p-4 shadow-card">
      <h3 className="font-semibold">Colour palette</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Applies to everyone. Each palette has a matching eye-friendly night mode; visitors switch
        day/night with the moon icon in the header.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PALETTES.map((palette) => (
          <button
            key={palette.id}
            type="button"
            onClick={() => choose(palette.id)}
            className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm font-semibold transition-colors ${
              settings?.theme === palette.id
                ? "border-primary bg-accent"
                : "border-border hover:bg-accent"
            }`}
          >
            <span
              className="h-6 w-6 rounded-full border border-border"
              style={{ backgroundColor: palette.swatch }}
            />
            {palette.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function MarketRatesPanel() {
  const { data: rates = [] } = useMarketRates();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Record<string, { value: string; change: string }>>({});

  async function save(id: string, symbol: string) {
    const entry = draft[id];
    if (!entry) return;
    const { error } = await supabase
      .from("market_rates")
      .update({ value: Number(entry.value), change_pct: Number(entry.change) } as never)
      .eq("id", id);
    if (error) {
      toast.error("Could not update the rate.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["market-rates"] });
    toast.success(`${symbol} updated.`);
  }

  return (
    <div className="mt-4 rounded-2xl bg-card p-4 shadow-card">
      <h3 className="font-semibold">Market rates ticker</h3>
      <div className="mt-3 space-y-3">
        {rates.map((rate) => {
          const entry = draft[rate.id] ?? {
            value: String(rate.value),
            change: String(rate.change_pct),
          };
          return (
            <div key={rate.id} className="flex flex-wrap items-end gap-2">
              <div className="min-w-28 flex-1">
                <Label className="text-xs">{rate.label}</Label>
                <Input
                  inputMode="decimal"
                  value={entry.value}
                  onChange={(e) =>
                    setDraft({ ...draft, [rate.id]: { ...entry, value: e.target.value } })
                  }
                />
              </div>
              <div className="w-24">
                <Label className="text-xs">Change %</Label>
                <Input
                  inputMode="decimal"
                  value={entry.change}
                  onChange={(e) =>
                    setDraft({ ...draft, [rate.id]: { ...entry, change: e.target.value } })
                  }
                />
              </div>
              <Button size="sm" variant="secondary" onClick={() => save(rate.id, rate.symbol)}>
                Save
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PostsPanel() {
  const { data: posts = [] } = usePosts();
  const queryClient = useQueryClient();

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

  async function remove(post: Post) {
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) {
      toast.error("Could not delete the post.");
      return;
    }
    toast.success("Post deleted.");
    await queryClient.invalidateQueries({ queryKey: ["posts"] });
  }

  return (
    <div className="mt-4 space-y-3">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          isAdmin
          onTogglePin={togglePin}
          onDelete={remove}
          showImage={false}
        />
      ))}
      {posts.length === 0 ? <p className="text-sm text-muted-foreground">No posts yet.</p> : null}
    </div>
  );
}

function MembersPanel() {
  const queryClient = useQueryClient();
  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Profile[];
    },
  });

  async function toggleBlock(member: Profile) {
    const { error } = await supabase
      .from("profiles")
      .update({ is_blocked: !member.is_blocked } as never)
      .eq("id", member.id);
    if (error) {
      toast.error("Could not update this member.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["members"] });
    toast.success(member.is_blocked ? "Member unblocked." : "Member blocked.");
  }

  return (
    <div className="mt-4 space-y-2">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center gap-3 rounded-xl bg-card p-3 text-sm shadow-card"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{member.full_name || "Unnamed member"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {member.company_name} {member.city ? `· ${member.city}` : ""} {member.whatsapp}
            </p>
          </div>
          <Button
            size="sm"
            variant={member.is_blocked ? "secondary" : "destructive"}
            onClick={() => toggleBlock(member)}
          >
            {member.is_blocked ? "Unblock" : "Block"}
          </Button>
        </div>
      ))}
      {members.length === 0 ? <p className="text-sm text-muted-foreground">No members yet.</p> : null}
    </div>
  );
}

function PasswordPanel() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (form.next.length < 8) {
      toast.error("Use at least 8 characters.");
      return;
    }
    if (form.next !== form.confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      password: form.next,
      ...(form.current ? { current_password: form.current } : {}),
    } as never);
    setSaving(false);
    if (error) {
      toast.error(error.message || "Could not change the password.");
      return;
    }
    setForm({ current: "", next: "", confirm: "" });
    toast.success("Password updated.");
  }

  return (
    <form onSubmit={save} className="mt-4 space-y-4 rounded-2xl bg-card p-4 shadow-card">
      <h3 className="font-semibold">Change admin password</h3>
      <div className="space-y-1.5">
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={form.current}
          onChange={(e) => setForm({ ...form, current: e.target.value })}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={form.next}
            onChange={(e) => setForm({ ...form, next: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />
        </div>
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Update password"}
      </Button>
    </form>
  );
}

function AdsPanel() {
  const { data: settings } = useSiteSettings();
  const { data: ads = [] } = useBannerAds();
  const { data: pages = [] } = usePages();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, Partial<BannerAd>>>({});
  const [frequency, setFrequency] = useState(3);

  useEffect(() => {
    if (settings?.ads_feed_frequency) setFrequency(settings.ads_feed_frequency);
  }, [settings?.ads_feed_frequency]);

  async function saveFrequency() {
    const { error } = await supabase
      .from("site_settings")
      .update({ ads_feed_frequency: Math.max(1, frequency) } as never)
      .eq("id", 1);
    if (error) {
      toast.error("Could not save the frequency.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    toast.success("In-feed frequency saved.");
  }

  async function createAd() {
    const { error } = await supabase
      .from("banner_ads")
      .insert({ title: "New ad space", placement: "feed" } as never);
    if (error) {
      toast.error("Could not create an ad space.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["banner-ads"] });
  }

  async function removeAd(ad: BannerAd) {
    const { error } = await supabase.from("banner_ads").delete().eq("id", ad.id);
    if (error) {
      toast.error("Could not delete this ad space.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["banner-ads"] });
  }

  async function toggleAdsEnabled(value: boolean) {
    const { error } = await supabase
      .from("site_settings")
      .update({ ads_enabled: value } as never)
      .eq("id", 1);
    if (error) {
      toast.error("Could not update ad visibility.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["site-settings"] });
  }

  async function saveAd(ad: BannerAd) {
    const draft = drafts[ad.id] ?? {};
    const { error } = await supabase
      .from("banner_ads")
      .update({ ...draft } as never)
      .eq("id", ad.id);
    if (error) {
      toast.error("Could not save this ad space.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["banner-ads"] });
    toast.success("Ad space saved.");
  }

  async function toggleAd(ad: BannerAd) {
    const { error } = await supabase
      .from("banner_ads")
      .update({ is_active: !ad.is_active } as never)
      .eq("id", ad.id);
    if (error) {
      toast.error("Could not update this ad space.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["banner-ads"] });
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-3 rounded-2xl bg-card p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Show ad spaces</h3>
            <p className="text-sm text-muted-foreground">Hide every promotional slot at once.</p>
          </div>
          <Switch checked={settings?.ads_enabled !== false} onCheckedChange={toggleAdsEnabled} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Default in-feed frequency (every N posts)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value) || 1)}
              className="max-w-32"
            />
            <Button size="sm" variant="secondary" onClick={saveFrequency}>
              Save
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Used by in-feed ads set to “Automatic”.
          </p>
        </div>
      </div>

      <Button size="sm" onClick={createAd}>
        Add new ad space
      </Button>

      {ads.map((ad) => {
        const draft = { ...ad, ...drafts[ad.id] };
        return (
          <div key={ad.id} className="space-y-3 rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate font-semibold">{ad.title}</p>
              <Switch checked={ad.is_active} onCheckedChange={() => toggleAd(ad)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Ad type</Label>
              <select
                value={draft.ad_type ?? "banner"}
                onChange={(e) =>
                  setDrafts({ ...drafts, [ad.id]: { ...drafts[ad.id], ad_type: e.target.value } })
                }
                className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                aria-label="Ad type"
              >
                <option value="banner">Image / text banner</option>
                <option value="html">Affiliate / custom HTML code</option>
              </select>
            </div>

            {draft.ad_type === "html" ? (
              <div className="space-y-1.5">
                <Label className="text-xs">Ad code (HTML / JavaScript)</Label>
                <Textarea
                  rows={6}
                  value={draft.html_code ?? ""}
                  placeholder="<script>...</script> or affiliate banner code"
                  onChange={(e) =>
                    setDrafts({
                      ...drafts,
                      [ad.id]: { ...drafts[ad.id], html_code: e.target.value },
                    })
                  }
                  className="font-mono text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Warning: pasted code runs on your live site. Only paste code from networks you
                  trust.
                </p>
              </div>
            ) : (
              <AdImageField
                ad={ad}
                onUploaded={() => queryClient.invalidateQueries({ queryKey: ["banner-ads"] })}
              />
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Placement</Label>
                <select
                  value={draft.placement}
                  onChange={(e) =>
                    setDrafts({
                      ...drafts,
                      [ad.id]: { ...drafts[ad.id], placement: e.target.value },
                    })
                  }
                  className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                  aria-label="Ad placement"
                >
                  <option value="top">Header full-width banner</option>
                  <option value="sidebar">Right-side panel card</option>
                  <option value="feed">In-feed</option>
                  <option value="footer">Footer full-width banner</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Landing page</Label>
                <select
                  value={draft.page_slug ?? ""}
                  onChange={(e) =>
                    setDrafts({
                      ...drafts,
                      [ad.id]: { ...drafts[ad.id], page_slug: e.target.value || null },
                    })
                  }
                  className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                  aria-label="Landing page"
                >
                  <option value="">None (use link below)</option>
                  {pages.map((page) => (
                    <option key={page.id} value={page.slug}>
                      {page.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Headline</Label>
                <Input
                  value={draft.title}
                  onChange={(e) =>
                    setDrafts({ ...drafts, [ad.id]: { ...drafts[ad.id], title: e.target.value } })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Subtitle</Label>
                <Input
                  value={draft.subtitle}
                  onChange={(e) =>
                    setDrafts({
                      ...drafts,
                      [ad.id]: { ...drafts[ad.id], subtitle: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Button text</Label>
                <Input
                  value={draft.cta_text}
                  onChange={(e) =>
                    setDrafts({
                      ...drafts,
                      [ad.id]: { ...drafts[ad.id], cta_text: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Link (optional)</Label>
                <Input
                  value={draft.cta_url}
                  placeholder="https://"
                  onChange={(e) =>
                    setDrafts({ ...drafts, [ad.id]: { ...drafts[ad.id], cta_url: e.target.value } })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Position / order number</Label>
                <Input
                  type="number"
                  value={draft.sort_order ?? 0}
                  onChange={(e) =>
                    setDrafts({
                      ...drafts,
                      [ad.id]: { ...drafts[ad.id], sort_order: Number(e.target.value) || 0 },
                    })
                  }
                />
                <p className="text-[11px] text-muted-foreground">
                  Lower numbers appear first (side panel stacking order).
                </p>
              </div>
              {draft.placement === "feed" ? (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs">In-feed rule</Label>
                    <select
                      value={draft.feed_mode ?? "auto"}
                      onChange={(e) =>
                        setDrafts({
                          ...drafts,
                          [ad.id]: { ...drafts[ad.id], feed_mode: e.target.value },
                        })
                      }
                      className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                      aria-label="In-feed rule"
                    >
                      <option value="auto">Automatic (use global frequency)</option>
                      <option value="position">Show after a specific post number</option>
                      <option value="frequency">Repeat every N posts</option>
                    </select>
                  </div>
                  {draft.feed_mode === "position" ? (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Show after post #</Label>
                      <Input
                        type="number"
                        min={1}
                        value={draft.feed_position ?? 1}
                        onChange={(e) =>
                          setDrafts({
                            ...drafts,
                            [ad.id]: {
                              ...drafts[ad.id],
                              feed_position: Number(e.target.value) || 1,
                            },
                          })
                        }
                      />
                    </div>
                  ) : null}
                  {draft.feed_mode === "frequency" ? (
                    <div className="space-y-1.5">
                      <Label className="text-xs">Repeat every N posts</Label>
                      <Input
                        type="number"
                        min={1}
                        value={draft.feed_every ?? 4}
                        onChange={(e) =>
                          setDrafts({
                            ...drafts,
                            [ad.id]: { ...drafts[ad.id], feed_every: Number(e.target.value) || 1 },
                          })
                        }
                      />
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => saveAd(ad)}>
                Save ad space
              </Button>
              <Button size="sm" variant="destructive" onClick={() => removeAd(ad)}>
                Delete
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AdImageField({ ad, onUploaded }: { ad: BannerAd; onUploaded: () => void }) {
  const { data: url } = useSignedFile("ad-images", ad.image_path);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Banner images must be 5 MB or smaller.");
      return;
    }
    setBusy(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${ad.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("ad-images")
      .upload(path, file, { contentType: file.type });
    if (!uploadError) {
      const { error } = await supabase
        .from("banner_ads")
        .update({ image_path: path } as never)
        .eq("id", ad.id);
      if (error) toast.error("Image uploaded but could not be linked.");
      else toast.success("Banner image updated.");
    } else {
      toast.error("Could not upload that image.");
    }
    setBusy(false);
    onUploaded();
  }

  async function clearImage() {
    const { error } = await supabase
      .from("banner_ads")
      .update({ image_path: null } as never)
      .eq("id", ad.id);
    if (error) toast.error("Could not remove the image.");
    onUploaded();
  }

  return (
    <div className="space-y-2">
      {url ? (
        <img
          src={url}
          alt={`${ad.title} banner`}
          className="max-h-36 w-full rounded-xl border border-border object-cover"
        />
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={busy}
          aria-label="Upload banner image"
          className="max-w-xs"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void upload(file);
          }}
        />
        {ad.image_path ? (
          <Button size="sm" variant="outline" onClick={clearImage}>
            Remove image
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function PagesPanel() {
  const { data: pages = [] } = usePages();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Page>>({});
  const [saving, setSaving] = useState(false);

  const active = pages.find((page) => page.id === activeId) ?? null;
  const current = { ...(active ?? {}), ...draft } as Page;

  async function createPage() {
    const slug = window.prompt("Page web address (letters and dashes), e.g. machinery-promo");
    if (!slug) return;
    const clean = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const { data, error } = await supabase
      .from("pages")
      .insert({ slug: clean, title: clean, content_html: "<p>New page</p>" } as never)
      .select("id")
      .single();
    if (error) {
      toast.error("Could not create the page. The address may already exist.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["pages"] });
    setActiveId((data as { id: string }).id);
    setDraft({});
  }

  async function savePage() {
    if (!active) return;
    setSaving(true);
    const { error } = await supabase
      .from("pages")
      .update({
        title: current.title,
        slug: current.slug,
        content_html: current.content_html,
        show_in_nav: current.show_in_nav,
        is_published: current.is_published,
        sort_order: current.sort_order,
      } as never)
      .eq("id", active.id);
    setSaving(false);
    if (error) {
      toast.error("Could not save this page.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["pages"] });
    setDraft({});
    toast.success("Page saved.");
  }

  async function deletePage() {
    if (!active) return;
    const { error } = await supabase.from("pages").delete().eq("id", active.id);
    if (error) {
      toast.error("Could not delete this page.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["pages"] });
    setActiveId(null);
    setDraft({});
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-card p-4 shadow-card">
        {pages.map((page) => (
          <button
            key={page.id}
            type="button"
            onClick={() => {
              setActiveId(page.id);
              setDraft({});
            }}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              page.id === activeId ? "bg-primary text-primary-foreground" : "bg-accent"
            }`}
          >
            {page.title}
          </button>
        ))}
        <Button size="sm" onClick={createPage}>
          New page
        </Button>
      </div>

      {active ? (
        <div className="space-y-4 rounded-2xl bg-card p-4 shadow-card">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Page title</Label>
              <Input
                value={current.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Web address</Label>
              <Input
                value={current.slug}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={current.is_published}
                onCheckedChange={(value) => setDraft({ ...draft, is_published: value })}
              />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={current.show_in_nav}
                onCheckedChange={(value) => setDraft({ ...draft, show_in_nav: value })}
              />
              Show in menu
            </label>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Page content</Label>
            <RichTextEditor
              value={current.content_html ?? ""}
              onChange={(html) => setDraft({ ...draft, content_html: html })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">HTML (advanced)</Label>
            <Textarea
              rows={4}
              value={current.content_html ?? ""}
              onChange={(e) => setDraft({ ...draft, content_html: e.target.value })}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={saving} onClick={savePage}>
              {saving ? "Saving…" : "Save page"}
            </Button>
            <Button size="sm" variant="destructive" onClick={deletePage}>
              Delete page
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Choose a page to edit, or create a new landing page for your adverts.
        </p>
      )}
    </div>
  );
}
