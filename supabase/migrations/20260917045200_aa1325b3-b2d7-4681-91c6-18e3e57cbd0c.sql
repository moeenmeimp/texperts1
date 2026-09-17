CREATE TABLE public.polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  label text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);
CREATE TABLE public.poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id uuid NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (poll_id, user_id)
);
CREATE INDEX poll_votes_poll_idx ON public.poll_votes(poll_id);

GRANT SELECT ON public.polls TO anon;
GRANT SELECT ON public.polls TO authenticated;
GRANT ALL ON public.polls TO service_role;
GRANT SELECT ON public.poll_options TO anon;
GRANT SELECT ON public.poll_options TO authenticated;
GRANT ALL ON public.poll_options TO service_role;
GRANT SELECT ON public.poll_votes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.poll_votes TO authenticated;
GRANT ALL ON public.poll_votes TO service_role;

ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Polls are viewable by everyone" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Admins manage polls" ON public.polls FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Poll options are viewable by everyone" ON public.poll_options FOR SELECT USING (true);
CREATE POLICY "Admins manage poll options" ON public.poll_options FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Poll votes are viewable by everyone" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "Users cast their own vote" ON public.poll_votes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update their own vote" ON public.poll_votes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete their own vote" ON public.poll_votes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

INSERT INTO public.polls (id, question) VALUES ('11111111-1111-4111-8111-111111111111', 'Where do you expect yarn prices to move this week?');
INSERT INTO public.poll_options (poll_id, label, sort_order) VALUES
 ('11111111-1111-4111-8111-111111111111', 'Up', 1),
 ('11111111-1111-4111-8111-111111111111', 'Stable', 2),
 ('11111111-1111-4111-8111-111111111111', 'Down', 3);

UPDATE public.site_settings SET ads_feed_frequency = 4 WHERE id = 1;