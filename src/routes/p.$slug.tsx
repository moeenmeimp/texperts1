import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { usePage, useSiteSettings } from "@/lib/data";

export const Route = createFileRoute("/p/$slug")({
  head: () => ({
    meta: [
      { title: "Information | TradeHub Marketplace" },
      {
        name: "description",
        content:
          "Company information, contact details and partner pages for the TradeHub B2B textile and commodity marketplace.",
      },
      { property: "og:title", content: "Information | TradeHub Marketplace" },
      {
        property: "og:description",
        content: "Company information and contact details for TradeHub.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DynamicPage,
});

function DynamicPage() {
  const { slug } = Route.useParams();
  const { data: page, isLoading } = usePage(slug);
  const { data: settings } = useSiteSettings();

  return (
    <AppShell>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !page || !page.is_published ? (
        <div className="rounded-2xl bg-card p-6 text-center shadow-card">
          <h1 className="font-bold">Page not found</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            This page is not available right now.
          </p>
        </div>
      ) : (
        <article className="mx-auto max-w-3xl rounded-2xl bg-card p-5 shadow-card sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight">{page.title}</h1>
          <div
            className="prose-page mt-4 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: page.content_html }}
          />
          {page.slug === "contact" ? (
            <div className="mt-6 space-y-1 rounded-xl bg-accent p-4 text-sm">
              {settings?.contact_email ? <p>Email: {settings.contact_email}</p> : null}
              {settings?.contact_phone ? <p>Phone: {settings.contact_phone}</p> : null}
              {settings?.contact_address ? <p>Address: {settings.contact_address}</p> : null}
            </div>
          ) : null}
        </article>
      )}
    </AppShell>
  );
}
