-- Policies Storage — à exécuter dans Supabase → SQL Editor

-- BUCKET: logos (logos entreprises, photos équipements, visuels projets)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'logos_anon_insert' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "logos_anon_insert" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'logos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'logos_auth_insert' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "logos_auth_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'logos_public_select' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "logos_public_select" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'logos');
  END IF;
END $$;

-- BUCKET: forum-media (photos intervenants, logos sponsors)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'forum_media_auth_insert' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "forum_media_auth_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'forum-media');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'forum_media_public_select' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "forum_media_public_select" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'forum-media');
  END IF;
END $$;
