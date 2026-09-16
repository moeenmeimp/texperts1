ALTER TABLE public.banner_ads
  ADD COLUMN IF NOT EXISTS ad_type text NOT NULL DEFAULT 'banner',
  ADD COLUMN IF NOT EXISTS html_code text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS feed_mode text NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS feed_position integer,
  ADD COLUMN IF NOT EXISTS feed_every integer;

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS ads_feed_frequency integer NOT NULL DEFAULT 3;