import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/lib/data";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in | TradeHub Textile & Commodity Marketplace" },
      {
        name: "description",
        content:
          "Sign in with Google to post yarn, cotton and fabric offers and contact traders on WhatsApp.",
      },
      { property: "og:title", content: "Sign in | TradeHub" },
      {
        property: "og:description",
        content: "Join the B2B textile and commodity trading community.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/profile", replace: true });
  }, [loading, user, navigate]);

  async function signIn() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Sign in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/profile", replace: true });
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-sm rounded-2xl bg-card p-6 text-center shadow-card">
        <h2 className="text-xl font-bold">Welcome</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to post rates, enquiries and offers for yarn, cotton and fabric.
        </p>
        <Button className="mt-6 w-full" size="lg" onClick={signIn} disabled={busy}>
          {busy ? "Opening Google…" : "Continue with Google"}
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">
          After signing in you will be asked for your name, company, city and WhatsApp number.
        </p>
      </div>
    </AppShell>
  );
}
