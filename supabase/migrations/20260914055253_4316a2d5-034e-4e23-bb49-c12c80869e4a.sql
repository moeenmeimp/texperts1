CREATE POLICY "ad images readable" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'ad-images');
CREATE POLICY "admins upload ad images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ad-images' AND private.has_role(auth.uid(),'admin'::public.app_role));
CREATE POLICY "admins update ad images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'ad-images' AND private.has_role(auth.uid(),'admin'::public.app_role));
CREATE POLICY "admins delete ad images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'ad-images' AND private.has_role(auth.uid(),'admin'::public.app_role));

CREATE POLICY "participants read chat files" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'chat-files'
    AND private.in_conversation(((storage.foldername(name))[1])::uuid, auth.uid())
  );
CREATE POLICY "participants upload chat files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'chat-files'
    AND private.in_conversation(((storage.foldername(name))[1])::uuid, auth.uid())
  );
