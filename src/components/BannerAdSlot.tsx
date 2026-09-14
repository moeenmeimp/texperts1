import { Link } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import type { ReactNode } from "react";
import { useSignedFile, type BannerAd } from "@/lib/data";

const ACCENTS: Record<string, string> = {
  primary: "from-primary/15 to-primary/5 border-primary/30 text-primary",
  amber: "from-warning/20 to-warning/5 border-warning/40 text-foreground",
  ocean: "from-info/15 to-info/5 border-info/30 text-info",
};

function AdLink({
  ad,
  className,
  children,
}: {
  ad: BannerAd;
  className?: string;
  children: ReactNode;
}) {
  if (ad.page_slug) {
    return (
      <Link to="/p/$slug" params={{ slug: ad.page_slug }} className={className}>
        {children}
      </Link>
    );
  }
  if (ad.cta_url) {
    return (
      <a href={ad.cta_url} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return <div className={className}>{children}</div>;
}

export function BannerAdSlot({
  ad,
  variant = "card",
}: {
  ad: BannerAd;
  variant?: "card" | "wide" | "square";
}) {
  const accent = ACCENTS[ad.accent] ?? ACCENTS['primary']!;
  const { data: imageUrl } = useSignedFile("ad-images", ad.image_path);

  if (imageUrl) {
    return (
      <aside aria-label="Sponsored space" className="relative overflow-hidden rounded-2xl">
        <AdLink ad={ad} className="block">
          <img
            src={imageUrl}
            alt={ad.title}
            loading="lazy"
            className={`w-full object-cover ${
              variant === "wide"
                ? "max-h-40 sm:max-h-56"
                : variant === "square"
                  ? "aspect-square"
                  : "max-h-48"
            }`}
          />
          <span className="absolute top-2 right-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">
            Ad
          </span>
        </AdLink>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Sponsored space"
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${accent} ${
        variant === "wide" ? "p-5" : "p-4"
      }`}
    >
      <span className="absolute top-2 right-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
        Ad space
      </span>
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-card shadow-card">
          <Megaphone className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">{ad.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{ad.subtitle}</p>
          <AdLink ad={ad} className="mt-2 inline-block text-xs font-semibold underline">
            {ad.cta_text}
          </AdLink>
        </div>
      </div>
    </aside>
  );
}
