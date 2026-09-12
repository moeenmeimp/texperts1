ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS post_type text NOT NULL DEFAULT 'sell';
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_post_type_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_post_type_check CHECK (post_type IN ('sell','buy'));

ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS ads_enabled boolean NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS public.banner_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  cta_text text NOT NULL DEFAULT 'Advertise here',
  cta_url text NOT NULL DEFAULT '',
  accent text NOT NULL DEFAULT 'primary',
  placement text NOT NULL DEFAULT 'feed',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.banner_ads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banner_ads TO authenticated;
GRANT ALL ON public.banner_ads TO service_role;

ALTER TABLE public.banner_ads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "banner ads public read" ON public.banner_ads;
CREATE POLICY "banner ads public read" ON public.banner_ads FOR SELECT USING (true);

DROP POLICY IF EXISTS "admins manage banner ads" ON public.banner_ads;
CREATE POLICY "admins manage banner ads" ON public.banner_ads FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.banner_ads (title, subtitle, cta_text, accent, placement, sort_order)
SELECT * FROM (VALUES
  ('Advertise Your Textile Mill Here', 'Reach thousands of verified yarn, cotton and fabric buyers every day.', 'Book this slot', 'primary', 'feed', 1),
  ('Yarn Machinery & Spare Parts', 'Premium ring frames, autoconers and spares — promoted to mill owners.', 'Promote your brand', 'amber', 'sidebar', 2),
  ('Logistics & Bonded Warehousing', 'Nationwide bale movement, customs clearing and storage partners.', 'Feature your service', 'ocean', 'feed', 3)
) AS v(title, subtitle, cta_text, accent, placement, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.banner_ads);