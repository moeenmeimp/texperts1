import { createServerFn } from "@tanstack/react-start";

export interface LiveRate {
  symbol: string;
  value: number;
  change_pct: number;
}

const YAHOO_SYMBOLS: Record<string, string> = {
  WTI: "CL=F",
  BRENT: "BZ=F",
  GOLD: "GC=F",
  SILVER: "SI=F",
};

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

async function fetchWithTimeout(url: string, ms = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": UA, accept: "*/*" },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchYahoo(symbol: string, yahooSymbol: string): Promise<LiveRate | null> {
  try {
    const res = await fetchWithTimeout(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=5d`,
    );
    if (!res.ok) { console.error("yahoo", yahooSymbol, res.status); return null; }
    const json = (await res.json()) as {
      chart?: { result?: Array<{ meta?: { regularMarketPrice?: number; regularMarketChangePercent?: number } }> };
    };
    const meta = json.chart?.result?.[0]?.meta;
    if (!meta || typeof meta.regularMarketPrice !== "number" || meta.regularMarketPrice <= 0) {
      return null;
    }
    return {
      symbol,
      value: meta.regularMarketPrice,
      change_pct: Number(meta.regularMarketChangePercent ?? 0),
    };
  } catch (e) {
    console.error("yahoo-throw", yahooSymbol, e);
    return null;
  }
}

async function fetchPsx(): Promise<LiveRate | null> {
  try {
    const res = await fetchWithTimeout("https://dps.psx.com.pk/indices", 9000);
    if (!res.ok) return null;
    const html = await res.text();
    const match =
      /KSE100<\/div><div class="topIndices__item__val">([\d,.]+)<\/div><\/div><div class="change__text--(pos|neg)">[\s\S]*?changep">\(([\d.]+)%\)/.exec(
        html,
      );
    if (!match) return null;
    const value = Number(match[1]!.replace(/,/g, ""));
    if (!Number.isFinite(value) || value <= 0) return null;
    const pct = Number(match[3]);
    return {
      symbol: "PSX100",
      value,
      change_pct: match[2] === "neg" ? -pct : pct,
    };
  } catch {
    return null;
  }
}

export const getLiveMarketRates = createServerFn({ method: "GET" }).handler(async () => {
  const results: Array<LiveRate | null> = [];
  for (const [symbol, yahoo] of Object.entries(YAHOO_SYMBOLS)) {
    let hit = await fetchYahoo(symbol, yahoo);
    if (!hit) hit = await fetchYahoo(symbol, yahoo);
    results.push(hit);
  }
  results.push(await fetchPsx());
  const rates = results.filter((item): item is LiveRate => item !== null);
  return { rates, fetched_at: new Date().toISOString() };
});
