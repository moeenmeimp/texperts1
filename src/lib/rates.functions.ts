import { createServerFn } from "@tanstack/react-start";

export interface LiveRate {
  symbol: string;
  value: number;
  change_pct: number | null;
}

const YAHOO_SYMBOLS: Record<string, string> = {
  WTI: "CL=F",
  BRENT: "BZ=F",
  GOLD: "GC=F",
  SILVER: "SI=F",
};

const CNBC_SYMBOLS: Record<string, string> = {
  WTI: "@CL.1",
  BRENT: "@LCO.1",
  GOLD: "@GC.1",
  SILVER: "@SI.1",
};

const METAL_FALLBACK: Record<string, string> = { GOLD: "XAU", SILVER: "XAG" };

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

const CACHE_MS = 60_000;
let cache: { at: number; payload: { rates: LiveRate[]; fetched_at: string } } | null = null;

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
  for (const host of ["query2", "query1"]) {
    try {
      const res = await fetchWithTimeout(
        `https://${host}.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=5d`,
      );
      if (!res.ok) continue;
      const json = (await res.json()) as {
        chart?: {
          result?: Array<{
            meta?: { regularMarketPrice?: number; regularMarketChangePercent?: number };
          }>;
        };
      };
      const meta = json.chart?.result?.[0]?.meta;
      if (!meta || typeof meta.regularMarketPrice !== "number" || meta.regularMarketPrice <= 0) {
        continue;
      }
      return {
        symbol,
        value: meta.regularMarketPrice,
        change_pct:
          typeof meta.regularMarketChangePercent === "number"
            ? meta.regularMarketChangePercent
            : null,
      };
    } catch {
      /* try next host */
    }
  }
  return null;
}

async function fetchCnbc(symbol: string, code: string): Promise<LiveRate | null> {
  try {
    const res = await fetchWithTimeout(
      `https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=${encodeURIComponent(code)}&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=1&output=json&events=1`,
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      FormattedQuoteResult?: { FormattedQuote?: Array<{ last?: string; change_pct?: string }> };
    };
    const quote = json.FormattedQuoteResult?.FormattedQuote?.[0];
    const value = Number(String(quote?.last ?? "").replace(/,/g, ""));
    if (!Number.isFinite(value) || value <= 0) return null;
    const pct = Number(String(quote?.change_pct ?? "").replace("%", ""));
    return { symbol, value, change_pct: Number.isFinite(pct) ? pct : null };
  } catch {
    return null;
  }
}

async function fetchMetal(symbol: string, code: string): Promise<LiveRate | null> {
  try {
    const res = await fetchWithTimeout(`https://api.gold-api.com/price/${code}`);
    if (!res.ok) return null;
    const json = (await res.json()) as { price?: number };
    if (typeof json.price !== "number" || json.price <= 0) return null;
    return { symbol, value: json.price, change_pct: null };
  } catch {
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
    return { symbol: "PSX100", value, change_pct: match[2] === "neg" ? -pct : pct };
  } catch {
    return null;
  }
}

async function persist(rates: LiveRate[]) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await Promise.all(
      rates.map((rate) =>
        supabaseAdmin
          .from("market_rates")
          .update({
            value: rate.value,
            ...(rate.change_pct === null ? {} : { change_pct: rate.change_pct }),
            updated_at: new Date().toISOString(),
          } as never)
          .eq("symbol", rate.symbol),
      ),
    );
  } catch {
    /* persistence is best-effort */
  }
}

export const getLiveMarketRates = createServerFn({ method: "GET" }).handler(async () => {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.payload;

  const rates: LiveRate[] = [];
  for (const [symbol, yahooSymbol] of Object.entries(YAHOO_SYMBOLS)) {
    let hit = await fetchCnbc(symbol, CNBC_SYMBOLS[symbol]!);
    if (!hit) hit = await fetchYahoo(symbol, yahooSymbol);
    if (!hit && METAL_FALLBACK[symbol]) hit = await fetchMetal(symbol, METAL_FALLBACK[symbol]!);
    if (hit) rates.push(hit);
  }
  const psx = await fetchPsx();
  if (psx) rates.push(psx);

  const payload = { rates, fetched_at: new Date().toISOString() };
  if (rates.length > 0) {
    cache = { at: Date.now(), payload };
    await persist(rates);
  }
  return payload;
});
