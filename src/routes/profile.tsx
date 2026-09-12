import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { isProfileComplete, useProfile, useSession } from "@/lib/data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My profile | TradeHub Marketplace" },
      {
        name: "description",
        content: "Complete your trading profile: name, company, city and WhatsApp number.",
      },
      { property: "og:title", content: "My profile | TradeHub" },
      { property: "og:description", content: "Manage your trading profile details." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfile(user?.id);

  const [form, setForm] = useState({ full_name: "", company_name: "", city: "", whatsapp: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name,
        company_name: profile.company_name,
        city: profile.city,
        whatsapp: profile.whatsapp,
      });
    }
  }, [profile]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    if (!form.full_name || !form.company_name || !form.city || !form.whatsapp) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (form.whatsapp.replace(/\D/g, "").length < 10) {
      toast.error("Enter a valid WhatsApp number with country code, e.g. +92 300 1234567.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...form } as never, { onConflict: "id" });
    setSaving(false);
    if (error) {
      toast.error("Could not save your profile.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    await queryClient.invalidateQueries({ queryKey: ["posts"] });
    toast.success("Profile saved.");
    navigate({ to: "/" });
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const complete = isProfileComplete(profile);

  return (
    <AppShell>
      <div className="mx-auto max-w-md">
        <h2 className="text-xl font-bold">{complete ? "My profile" : "Complete your profile"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These details are shown on every post so buyers can reach you.
        </p>

        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <form onSubmit={save} className="mt-5 space-y-4 rounded-2xl bg-card p-4 shadow-card">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Ahmed Khan"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company_name">Company name</Label>
              <Input
                id="company_name"
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                placeholder="Khan Textiles Pvt Ltd"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Faisalabad"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp">WhatsApp number</Label>
              <Input
                id="whatsapp"
                inputMode="tel"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="+92 300 1234567"
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving…" : "Save profile"}
            </Button>
          </form>
        )}

        {profile?.is_blocked ? (
          <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            Your account has been blocked by the administrator. You cannot post or comment.
          </p>
        ) : null}

        <Button variant="outline" className="mt-4 w-full" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </AppShell>
  );
}
