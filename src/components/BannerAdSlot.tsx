import { Megaphone } from "lucide-react";
import type { BannerAd } from "@/lib/data";

const ACCENTS: Record<string, string> = {
  primary: "from-primary/15 to-primary/5 border-primary/30 text-primary",
  amber: "from-warning/20 to-warning/5 border-warning/40 text-foreground",
  ocean: "from-info/15 to-info/5 border-info/30 text-info",
};

export function BannerAdSlot({ ad }: { ad: BannerAd }) {
  const accent = ACCENTS[ad.accent] ?? ACCENTS['primary']!;

  return (
    <aside
      aria-label="Sponsored space"
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${accent} p-4`}
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
          {ad.cta_url ? (
            <a
              href={ad.cta_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-semibold underline"
            >
              {ad.cta_text}
            </a>
          ) : (
            <span className="mt-2 inline-block rounded-full bg-card px-3 py-1 text-[11px] font-semibold shadow-card">
              {ad.cta_text}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
