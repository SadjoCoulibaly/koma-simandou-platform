-- ============================================================
-- SUPABASE STORAGE — Bucket pour les médias du Forum
-- À exécuter dans Supabase SQL Editor
-- ============================================================

-- Créer le bucket public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'forum-media',
  'forum-media',
  true,
  5242880, -- 5 MB max
  ARRAY['image/jpeg','image/png','image/webp','image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Politique : lecture publique
CREATE POLICY "forum_media_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'forum-media');

-- Politique : upload pour les utilisateurs authentifiés
CREATE POLICY "forum_media_auth_upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'forum-media' AND auth.role() = 'authenticated');

-- Politique : suppression pour les utilisateurs authentifiés
CREATE POLICY "forum_media_auth_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'forum-media' AND auth.role() = 'authenticated');
