import { Link } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { useSignedFile, type BannerAd } from "@/lib/data";

const ACCENTS: Record<string, string> = {
  primary: "from-primary/15 to-primary/5 border-primary/30",
  amber: "from-warning/20 to-warning/5 border-warning/40",
  ocean: "from-info/15 to-info/5 border-info/30",
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

function HtmlAd({ ad }: { ad: BannerAd }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = ad.html_code ?? "";
    // Re-execute inline/external scripts so ad-network snippets initialise.
    host.querySelectorAll("script").forEach((old) => {
      const script = document.createElement("script");
      Array.from(old.attributes).forEach((attr) =>
        script.setAttribute(attr.name, attr.value),
      );
      script.text = old.text;
      old.replaceWith(script);
    });
  }, [ad.html_code]);

  if (!ad.html_code) return null;

  return (
    <aside aria-label="Sponsored space" className="relative overflow-hidden rounded-2xl">
      <span className="absolute top-2 right-2 z-10 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">
        Ad
      </span>
      <div ref={ref} className="ad-html-slot [&_img]:max-w-full" />
    </aside>
  );
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

  if (ad.ad_type === "html") return <HtmlAd ad={ad} />;

  const hasText = Boolean(ad.title || ad.subtitle || ad.cta_text);

  return (
    <aside
      aria-label="Sponsored space"
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${accent}`}
    >
      <span className="absolute top-2 right-2 z-10 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">
        Ad
      </span>

      {imageUrl ? (
        <AdLink ad={ad} className="block">
          <img
            src={imageUrl}
            alt={ad.title || "Advertisement"}
            loading="lazy"
            className={`w-full object-cover ${
              variant === "wide"
                ? "max-h-40 sm:max-h-56"
                : variant === "square"
                  ? "aspect-square"
                  : "max-h-48"
            }`}
          />
        </AdLink>
      ) : null}

      {hasText ? (
        <div className={`flex items-start gap-3 ${variant === "wide" ? "p-5" : "p-4"}`}>
          {!imageUrl ? (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-card shadow-card">
              <Megaphone className="h-4 w-4" />
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            {ad.title ? (
              <p className="text-sm font-bold text-foreground sm:text-base">{ad.title}</p>
            ) : null}
            {ad.subtitle ? (
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{ad.subtitle}</p>
            ) : null}
            {ad.cta_text && (ad.page_slug || ad.cta_url) ? (
              <AdLink
                ad={ad}
                className="mt-2.5 inline-flex items-center rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                {ad.cta_text}
              </AdLink>
            ) : ad.cta_text ? (
              <span className="mt-2.5 inline-block text-xs font-semibold text-muted-foreground">
                {ad.cta_text}
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
