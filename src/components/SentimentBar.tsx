import { Activity, TrendingDown, TrendingUp } from "lucide-react";
import { computeSentiment } from "@/lib/sentiment";
import type { Post } from "@/lib/data";

const TONES: Record<string, string> = {
  bull: "bg-success/15 text-success",
  soft: "bg-destructive/15 text-destructive",
  active: "bg-info/15 text-info",
  stable: "bg-muted text-muted-foreground",
};

export function SentimentBar({ posts }: { posts: Post[] }) {
  const sentiment = computeSentiment(posts);
  const Icon =
    sentiment.tone === "bull" ? TrendingUp : sentiment.tone === "soft" ? TrendingDown : Activity;
  const total = sentiment.buy + sentiment.sell;
  const buyPct = total === 0 ? 50 : Math.round((sentiment.buy / total) * 100);

  return (
    <section className="rounded-2xl bg-card p-3 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${TONES[sentiment.tone]}`}
        >
          <Icon className="h-3.5 w-3.5" /> {sentiment.label}
        </span>
        <span className="text-[11px] text-muted-foreground">{sentiment.detail}</span>
      </div>
      <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-muted">
        <span className="bg-info" style={{ width: `${buyPct}%` }} aria-hidden />
        <span className="flex-1 bg-success" aria-hidden />
      </div>
      <p className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>Buying {buyPct}%</span>
        <span>Selling {100 - buyPct}%</span>
      </p>
    </section>
  );
}
