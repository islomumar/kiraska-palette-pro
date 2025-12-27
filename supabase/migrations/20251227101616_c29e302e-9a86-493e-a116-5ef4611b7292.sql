DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public can view product-images'
  ) THEN
    EXECUTE 'CREATE POLICY "Public can view product-images" ON storage.objects FOR SELECT USING (bucket_id = ''product-images'')';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admin can upload product-images'
  ) THEN
    EXECUTE 'CREATE POLICY "Admin can upload product-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''product-images'' AND (public.has_role(auth.uid(), ''admin''::public.app_role) OR public.has_role(auth.uid(), ''superadmin''::public.app_role)))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admin can update product-images'
  ) THEN
    EXECUTE 'CREATE POLICY "Admin can update product-images" ON storage.objects FOR UPDATE USING (bucket_id = ''product-images'' AND (public.has_role(auth.uid(), ''admin''::public.app_role) OR public.has_role(auth.uid(), ''superadmin''::public.app_role))) WITH CHECK (bucket_id = ''product-images'' AND (public.has_role(auth.uid(), ''admin''::public.app_role) OR public.has_role(auth.uid(), ''superadmin''::public.app_role)))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Admin can delete product-images'
  ) THEN
    EXECUTE 'CREATE POLICY "Admin can delete product-images" ON storage.objects FOR DELETE USING (bucket_id = ''product-images'' AND (public.has_role(auth.uid(), ''admin''::public.app_role) OR public.has_role(auth.uid(), ''superadmin''::public.app_role)))';
  END IF;
END
$do$;