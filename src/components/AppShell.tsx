import { Link, useRouterState } from "@tanstack/react-router";
import {
  FileText,
  Home,
  LogIn,
  Menu,
  MessagesSquare,
  Moon,
  PlusCircle,
  Shield,
  Sun,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { MarketTicker } from "@/components/MarketTicker";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useColorMode, usePalette } from "@/lib/theme";
import { useIsAdmin, usePages, useSession, useSiteSettings } from "@/lib/data";

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
  const { data: navPages = [] } = usePages(true);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  usePalette(settings?.theme);

  useEffect(() => {
    if (settings?.site_title) document.title = settings.site_title;
  }, [settings?.site_title]);

  const brand = settings?.brand_name ?? "TradeHub";

  const links: Array<{ to: string; label: string; icon: typeof Home }> = [
    { to: "/", label: "Feed", icon: Home },
    { to: "/new", label: "New post", icon: PlusCircle },
    ...(user ? [{ to: "/chat", label: "Messages", icon: MessagesSquare }] : []),
    { to: "/profile", label: "Profile", icon: UserIcon },
    ...navPages.map((page) => ({ to: `/p/${page.slug}`, label: page.title, icon: FileText })),
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background pb-16 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-card/80 backdrop-blur-xl">
        <div className="mx-auto grid max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="rounded-xl p-2 hover:bg-accent md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="border-b border-border px-5 py-4 text-base font-extrabold">
                  {brand}
                </SheetTitle>
                <nav className="flex flex-col p-3">
                  {links.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                        path === link.to ? "bg-accent text-primary" : "hover:bg-accent"
                      }`}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-sm font-black text-primary-foreground">
                {brand.charAt(0).toUpperCase()}
              </span>
              <span className="hidden text-base font-extrabold tracking-tight sm:block">
                {brand}
              </span>
            </Link>
          </div>

          <nav className="hidden items-center justify-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  path === link.to
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggle}
              aria-label={dark ? "Switch to light mode" : "Switch to night mode"}
              className="rounded-xl p-2 transition-colors hover:bg-accent"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <Link
                to="/profile"
                aria-label="My profile"
                className="rounded-xl p-2 transition-colors hover:bg-accent"
              >
                <UserIcon className="h-5 w-5" />
              </Link>
            ) : (
              <Button asChild size="sm">
                <Link to="/auth">
                  <LogIn className="h-4 w-4" /> Login
                </Link>
              </Button>
            )}
          </div>
        </div>
        <p className="mx-auto max-w-6xl truncate px-3 pb-2 text-[11px] text-muted-foreground">
          {settings?.header_text}
        </p>
      </header>

      <MarketTicker />

      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-card md:hidden">
        <NavItem to="/" label="Feed" icon={Home} active={path === "/"} />
        <NavItem to="/new" label="Post" icon={PlusCircle} active={path === "/new"} />
        {user ? (
          <NavItem to="/chat" label="Chats" icon={MessagesSquare} active={path === "/chat"} />
        ) : null}
        <NavItem to="/profile" label="Profile" icon={UserIcon} active={path === "/profile"} />
        {isAdmin ? (
          <NavItem to="/admin" label="Admin" icon={Shield} active={path === "/admin"} />
        ) : null}
      </nav>

      <footer className="border-t border-border px-3 py-6 text-center text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">{brand}</p>
        <p className="mt-1">
          {settings?.footer_text ?? "B2B textile & commodity trading marketplace"}
        </p>
        <p className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {settings?.contact_email ? <span>{settings.contact_email}</span> : null}
          {settings?.contact_phone ? <span>{settings.contact_phone}</span> : null}
          {settings?.contact_address ? <span>{settings.contact_address}</span> : null}
        </p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {navPages.map((page) => (
            <Link key={page.id} to={`/p/${page.slug}`} className="underline">
              {page.title}
            </Link>
          ))}
        </p>
      </footer>
    </div>
  );
}
