import { useQuery } from "@tanstack/react-query";
import { Newspaper } from "lucide-react";
import { getBusinessNews, type NewsItem } from "@/lib/news.functions";

export function useBusinessNews() {
  return useQuery({
    queryKey: ["business-news"],
    queryFn: async (): Promise<NewsItem[]> => (await getBusinessNews()).items,
    staleTime: 10 * 60_000,
    refetchInterval: 15 * 60_000,
  });
}

export function NewsTicker() {
  const { data: items = [] } = useBusinessNews();
  if (items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <section
      aria-label="Business Recorder headlines"
      className="border-b border-border bg-card/70"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-1.5">
        <span className="flex shrink-0 items-center gap-1 rounded-md bg-info/15 px-2 py-1 text-[10px] font-bold tracking-wide text-info uppercase">
          <Newspaper className="h-3 w-3" /> News
        </span>
        <div className="no-scrollbar relative flex-1 overflow-hidden">
          <div className="ticker-track flex w-max items-center gap-6">
            {loop.map((item, index) => (
              <a
                key={`${item.link}-${index}`}
                href={item.link}
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs whitespace-nowrap text-muted-foreground hover:text-foreground hover:underline"
              >
                {item.title}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
