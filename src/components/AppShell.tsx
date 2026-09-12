import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LogIn, Moon, PlusCircle, Shield, Sun, User as UserIcon } from "lucide-react";
import type { ReactNode } from "react";
import { MarketTicker } from "@/components/MarketTicker";
import { Button } from "@/components/ui/button";
import { useColorMode, usePalette } from "@/lib/theme";
import { useIsAdmin, useSession, useSiteSettings } from "@/lib/data";

function NavItem({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { data: settings } = useSiteSettings();
  const { dark, toggle } = useColorMode();
  const { user } = useSession();
  const { data: isAdmin } = useIsAdmin(user?.id);
  const path = useRouterState({ select: (s) => s.location.pathname });
  usePalette(settings?.theme);

  useEffect(() => {
    if (settings?.site_title) document.title = settings.site_title;
  }, [settings?.site_title]);

  const brand = settings?.brand_name ?? "TradeHub";

  return (
    <div className="flex min-h-screen flex-col bg-background pb-16 md:pb-0">
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground shadow-card">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-3 py-3">
          <Link to="/" className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-extrabold tracking-tight">{brand}</h1>
            <p className="truncate text-[11px] opacity-80">{settings?.header_text}</p>
          </Link>

          <button
            type="button"
            onClick={toggle}
            aria-label={dark ? "Switch to light mode" : "Switch to night mode"}
            className="rounded-full p-2 transition-colors hover:bg-black/10"
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {user ? (
            <Link
              to="/profile"
              aria-label="My profile"
              className="rounded-full p-2 transition-colors hover:bg-black/10"
            >
              <UserIcon className="h-5 w-5" />
            </Link>
          ) : (
            <Button asChild size="sm" variant="secondary">
              <Link to="/auth">
                <LogIn className="h-4 w-4" /> Login
              </Link>
            </Button>
          )}
        </div>
      </header>

      <MarketTicker />

      <main className="mx-auto w-full max-w-3xl flex-1 px-3 py-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-card md:hidden">
        <NavItem to="/" label="Feed" icon={Home} active={path === "/"} />
        <NavItem to="/new" label="Post" icon={PlusCircle} active={path === "/new"} />
        <NavItem to="/profile" label="Profile" icon={UserIcon} active={path === "/profile"} />
        {isAdmin ? (
          <NavItem to="/admin" label="Admin" icon={Shield} active={path === "/admin"} />
        ) : null}
      </nav>

      <footer className="hidden border-t border-border py-6 text-center text-xs text-muted-foreground md:block">
        {brand} — B2B textile & commodity trading marketplace
      </footer>
    </div>
  );
}
