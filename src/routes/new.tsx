import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORIES,
  isProfileComplete,
  useProfile,
  useSession,
  type Category,
  type PostType,
} from "@/lib/data";
import { findBannedWord } from "@/lib/moderation";

export const Route = createFileRoute("/new")({
  head: () => ({
    meta: [
      { title: "Post an offer | TradeHub Marketplace" },
      {
        name: "description",
        content:
          "Post yarn, cotton or fabric offers with quantity, rate and an official rate list image.",
      },
      { property: "og:title", content: "Post an offer | TradeHub" },
      {
        property: "og:description",
        content: "Share your yarn, cotton or fabric rates with buyers across the country.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewPostPage,
});

function NewPostPage() {
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile(user?.id);

  const [category, setCategory] = useState<Category>("Yarn");
  const [postType, setPostType] = useState<PostType>("sell");
  const [form, setForm] = useState({ title: "", details: "", quantity: "", rate: "" });
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    if (!isProfileComplete(profile)) {
      toast.error("Complete your profile before posting.");
      navigate({ to: "/profile" });
      return;
    }
    if (!form.title.trim()) {
      toast.error("Add a short item title.");
      return;
    }
    const bad = findBannedWord(`${form.title} ${form.details}`);
    if (bad) {
      toast.error("Please remove inappropriate language from your post.");
      return;
    }

    setSaving(true);
    let imagePath: string | null = null;

    if (file) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setSaving(false);
        toast.error("Only JPEG or PNG images are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setSaving(false);
        toast.error("Image must be smaller than 5 MB.");
        return;
      }
      const ext = file.type === "image/png" ? "png" : "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(path, file, { contentType: file.type });
      if (uploadError) {
        setSaving(false);
        toast.error("Image upload failed.");
        return;
      }
      imagePath = path;
    }

    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      category,
      post_type: postType,
      title: form.title.trim(),
      details: form.details.trim(),
      quantity: form.quantity.trim(),
      rate: form.rate.trim(),
      image_path: imagePath,
    } as never);

    setSaving(false);
    if (error) {
      toast.error(
        error.message.includes("Daily posting limit")
          ? "You have reached the daily limit of 10 posts."
          : "Could not publish your post.",
      );
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["posts"] });
    toast.success("Post published.");
    navigate({ to: "/" });
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md">
        <h2 className="text-xl font-bold">New post</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Up to 10 posts per day. Your name, company, city and WhatsApp are shown automatically.
        </p>

        <form onSubmit={submit} className="mt-5 space-y-4 rounded-2xl bg-card p-4 shadow-card">
          <div className="space-y-1.5">
            <Label>Post type</Label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "sell", label: "Selling offer" },
                  { id: "buy", label: "Buying requirement" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPostType(item.id)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                    postType === item.id
                      ? item.id === "sell"
                        ? "border-success bg-success/15 text-success"
                        : "border-info bg-info/15 text-info"
                      : "border-border bg-background hover:bg-accent"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <div className="flex gap-2">
              {CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                    category === item
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-accent"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Item title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="30/1 Combed Compact Yarn"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="details">Item details</Label>
            <Textarea
              id="details"
              rows={4}
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              placeholder="Specification, delivery terms, payment terms…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="50 bales"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rate">Rate</Label>
              <Input
                id="rate"
                value={form.rate}
                onChange={(e) => setForm({ ...form, rate: e.target.value })}
                placeholder="PKR 21,500 / bag"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="image">Rate list image (JPEG/PNG, optional)</Label>
            <label
              htmlFor="image"
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-3 py-3 text-sm text-muted-foreground hover:bg-accent"
            >
              <ImagePlus className="h-4 w-4" />
              {file ? file.name : "Choose an image"}
            </label>
            <input
              id="image"
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Publishing…" : "Publish post"}
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
