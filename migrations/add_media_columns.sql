-- Migration : ajout colonnes photo/logo/image sur les tables principales
-- À exécuter dans Supabase → SQL Editor

-- 1. Logo entreprise (existait dans le formulaire public mais n'était pas sauvegardé)
ALTER TABLE entreprises
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Photo équipement
ALTER TABLE equipements
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 3. Visuel projet public
ALTER TABLE projets_publics
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 4. Visuel projet privé
ALTER TABLE projets_prives
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 5. Bucket Supabase Storage (exécuter via Dashboard ou API si pas déjà créé)
-- Le bucket 'logos' est déjà utilisé par les entreprises.
-- Les équipements et projets uploadent dans le même bucket avec des dossiers distincts :
--   logos/equipements/xxx.jpg
--   logos/projets/xxx.jpg
-- Politiques RLS du bucket 'logos' : accès public en lecture, auth requis en écriture.
