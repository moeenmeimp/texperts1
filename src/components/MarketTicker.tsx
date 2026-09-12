import { TrendingDown, TrendingUp } from "lucide-react";
import { formatRate, useMarketRates, type MarketRate } from "@/lib/data";

function RateChip({ rate }: { rate: MarketRate }) {
  const up = Number(rate.change_pct) >= 0;
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-full bg-card px-3 py-1.5 shadow-card">
      <span className="text-xs font-semibold whitespace-nowrap">{rate.label}</span>
      <span className="text-xs font-bold whitespace-nowrap tabular-nums">
        {formatRate(Number(rate.value))}
        {rate.unit ? <span className="ml-1 font-medium text-muted-foreground">{rate.unit}</span> : null}
      </span>
      <span
        className={`flex items-center gap-0.5 text-[11px] font-semibold tabular-nums ${
          up ? "text-success" : "text-destructive"
        }`}
      >
        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {up ? "+" : ""}
        {Number(rate.change_pct).toFixed(2)}%
      </span>
    </div>
  );
}

export function MarketTicker() {
  const { data: rates = [] } = useMarketRates();
  if (rates.length === 0) return null;
  const loop = [...rates, ...rates];

  return (
    <section aria-label="Top market rates" className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-3 py-2">
        <span className="hidden shrink-0 rounded-md bg-primary px-2 py-1 text-[11px] font-bold tracking-wide text-primary-foreground uppercase sm:inline-block">
          Live rates
        </span>
        <div className="no-scrollbar relative flex-1 overflow-hidden">
          <div className="ticker-track flex w-max gap-2">
            {loop.map((rate, index) => (
              <RateChip key={`${rate.id}-${index}`} rate={rate} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
