import { createServerFn } from "@tanstack/react-start";

export interface NewsItem {
  title: string;
  link: string;
  published: string | null;
}

const FEEDS = [
  "https://www.brecorder.com/feeds/latest-news",
  "https://www.brecorder.com/feeds/markets",
  "https://www.brecorder.com/feeds/business-finance",
];

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

const CACHE_MS = 10 * 60_000;
let cache: { at: number; payload: { items: NewsItem[]; fetched_at: string } } | null = null;

function clean(value: string) {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parseFeed(xml: string): NewsItem[] {
  const out: NewsItem[] = [];
  const items = xml.match(/<item[\s\S]*?<\/item>/g) ?? [];
  for (const item of items) {
    const title = clean(/<title>([\s\S]*?)<\/title>/.exec(item)?.[1] ?? "");
    const link = clean(/<link>([\s\S]*?)<\/link>/.exec(item)?.[1] ?? "");
    const published = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(item)?.[1] ?? null;
    if (title && link) out.push({ title, link, published: published ? clean(published) : null });
  }
  return out;
}

async function fetchFeed(url: string): Promise<NewsItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": UA, accept: "application/rss+xml, application/xml, text/xml, */*" },
    });
    if (!res.ok) return [];
    return parseFeed(await res.text());
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export const getBusinessNews = createServerFn({ method: "GET" }).handler(async () => {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.payload;

  const results = await Promise.all(FEEDS.map((feed) => fetchFeed(feed)));
  const seen = new Set<string>();
  const items: NewsItem[] = [];
  for (const list of results) {
    for (const item of list) {
      if (seen.has(item.link)) continue;
      seen.add(item.link);
      items.push(item);
    }
  }
  items.sort((a, b) => {
    const ta = a.published ? Date.parse(a.published) : 0;
    const tb = b.published ? Date.parse(b.published) : 0;
    return tb - ta;
  });

  const payload = { items: items.slice(0, 25), fetched_at: new Date().toISOString() };
  if (payload.items.length > 0) cache = { at: Date.now(), payload };
  return payload;
});
