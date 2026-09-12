-- 1) Move SECURITY DEFINER helper out of the API-exposed public schema
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

ALTER FUNCTION public.has_role(uuid, public.app_role) SET SCHEMA private;
ALTER FUNCTION private.has_role(uuid, public.app_role) SET search_path = public;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2) Scope post image reads to signed-in users instead of everyone
DROP POLICY IF EXISTS "post images readable" ON storage.objects;
CREATE POLICY "post images readable by authenticated"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'post-images');