import type { Post } from "@/lib/data";

export interface Sentiment {
  label: string;
  tone: "bull" | "active" | "stable" | "soft";
  detail: string;
  buy: number;
  sell: number;
  score: number;
}

/**
 * Platform sentiment from live activity: buying vs selling post volume
 * over the last 48 hours.
 */
export function computeSentiment(posts: Post[]): Sentiment {
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const recent = posts.filter((post) => new Date(post.created_at).getTime() >= cutoff);
  const buy = recent.filter((post) => post.post_type === "buy").length;
  const sell = recent.length - buy;
  const total = recent.length;

  if (total < 3) {
    return {
      label: "Stable Market",
      tone: "stable",
      detail: "Low activity in the last 48h",
      buy,
      sell,
      score: 0,
    };
  }

  const score = Math.round(((buy - sell) / total) * 100);

  if (score >= 20) {
    return {
      label: "High Demand / Bullish",
      tone: "bull",
      detail: `${buy} buying vs ${sell} selling posts (48h)`,
      buy,
      sell,
      score,
    };
  }
  if (score <= -20) {
    return {
      label: "Supply Heavy / Softening",
      tone: "soft",
      detail: `${sell} selling vs ${buy} buying posts (48h)`,
      buy,
      sell,
      score,
    };
  }
  if (total >= 10) {
    return {
      label: "Active Trading",
      tone: "active",
      detail: `${total} posts in the last 48h, balanced flow`,
      buy,
      sell,
      score,
    };
  }
  return {
    label: "Stable Market",
    tone: "stable",
    detail: `${total} posts in the last 48h`,
    buy,
    sell,
    score,
  };
}
