# Advertising & Banner Management Upgrade

## What you'll get

A complete ad system where every field you fill in the dashboard actually shows up, with four
placement slots, exact position control, and support for pasted ad-network code.

## 1. Full banner rendering

Ads will render image + headline + subtitle + a real clickable button using your custom button
text, linking to either a landing page or an external URL. Today an uploaded image hides the text
and button entirely; that gets replaced with a proper card layout (image on top for wide/feed slots,
image + text stacked for side panel), and text-only ads keep their current styled look.

## 2. Four placement slots

- Header banner: full width at the very top of the feed.
- Right-side panel: stacked square/vertical cards.
- In-feed: inside the post columns.
- Footer banner: new full-width slot just above the site footer, shown on every page.

## 3. Position and sequence control

- Each ad gets a "Position / order" number. Side-panel ads stack top-to-bottom by that number.
- In-feed ads get a mode per ad:
  - "After post #N" — the ad appears exactly after that post in the feed.
  - "Every N posts" — repeating placement.
- A global default frequency (e.g. every 4 posts) lives in the Ads settings for any in-feed ad left
  on automatic. Ads with an exact position always win over repeating ones at the same slot.

## 4. Affiliate / custom HTML ads

New ad type "Affiliate / Custom HTML" with a code box for AdSense, ad-network, or affiliate
snippets. These render in any of the four slots. Pasted code is inserted as raw HTML markup; inline
`<script>` tags in pasted snippets are executed after insert so AdSense-style tags work. Only admins
can create these, and the dashboard shows a warning that pasted code runs on your site.

## Technical notes

Database (`banner_ads`): add `ad_type` text default `'banner'` (`banner` | `html`), `html_code`
text default `''`, `feed_mode` text default `'auto'` (`auto` | `position` | `frequency`),
`feed_position` int null, `feed_every` int null. `placement` gains `'footer'`.
`site_settings`: add `ads_feed_frequency` int default 3.

Frontend:
- `src/lib/data.ts` — extend `BannerAd` / `SiteSettings` types; order ads by `sort_order`.
- `src/components/BannerAdSlot.tsx` — rewrite render: `banner` variant renders image + headline +
  subtitle + CTA button; `html` variant renders sanitized-container `dangerouslySetInnerHTML` plus a
  small effect that re-executes `<script>` nodes.
- New `src/components/FooterAds.tsx` (or inline in `AppShell`) renders footer placement ads above
  the footer in `AppShell.tsx`.
- `src/routes/index.tsx` — build a feed-insertion map from `feed_mode`/`feed_position`/`feed_every`
  and the global frequency, and sort sidebar ads by `sort_order`.
- `src/routes/admin.tsx` — Ads panel gains ad-type selector, HTML code textarea, footer placement
  option, order number input, in-feed mode controls, and a global frequency field.
