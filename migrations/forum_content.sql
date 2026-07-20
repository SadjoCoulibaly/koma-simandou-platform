-- ============================================================
-- FORUM CONTENT TABLES — À exécuter dans Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS forum_chiffres (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label      TEXT NOT NULL,
  valeur     TEXT NOT NULL,
  icone      TEXT DEFAULT '📊',
  ordre      INT  DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_themes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre       TEXT NOT NULL,
  description TEXT,
  icone       TEXT DEFAULT '🎯',
  ordre       INT  DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_intervenants (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom          TEXT NOT NULL,
  titre        TEXT,
  organisation TEXT,
  photo_url    TEXT,
  biographie   TEXT,
  ordre        INT  DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_programme (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jour           INT  NOT NULL CHECK (jour IN (1, 2, 3)),
  heure_debut    TIME NOT NULL,
  heure_fin      TIME,
  titre          TEXT NOT NULL,
  description    TEXT,
  type           TEXT DEFAULT 'session' CHECK (type IN ('ouverture','keynote','session','atelier','pause','cloture')),
  salle          TEXT,
  intervenant_id UUID REFERENCES forum_intervenants(id) ON DELETE SET NULL,
  ordre          INT  DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_sponsors (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom        TEXT NOT NULL,
  logo_url   TEXT,
  site_url   TEXT,
  categorie  TEXT DEFAULT 'partenaire' CHECK (categorie IN ('platine','or','argent','partenaire')),
  ordre      INT  DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_faq (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question   TEXT NOT NULL,
  reponse    TEXT NOT NULL,
  ordre      INT  DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Données de démonstration ─────────────────────────────────

INSERT INTO forum_chiffres (label, valeur, icone, ordre) VALUES
  ('Participants attendus', '500+', '👥', 1),
  ('Pays représentés',      '25',   '🌍', 2),
  ('Intervenants',          '40',   '🎙️', 3),
  ('Exposants',             '60',   '🏢', 4);

INSERT INTO forum_themes (titre, description, icone, ordre) VALUES
  ('Développement des capacités locales',
   'Renforcement des compétences techniques et managériales des entreprises guinéennes pour répondre aux opportunités du projet Simandou.',
   '🏗️', 1),
  ('Financement et investissement',
   'Mécanismes de financement accessibles aux PME locales, partenariats public-privé et mobilisation des investisseurs.',
   '💰', 2),
  ('Contenu local et sous-traitance',
   'Stratégies pour maximiser la participation des entreprises guinéennes dans la chaîne de valeur du projet Simandou 2040.',
   '🤝', 3),
  ('Transition écologique et durabilité',
   'Intégration des standards environnementaux, gestion responsable des ressources et développement durable.',
   '🌿', 4),
  ('Technologies et innovation',
   'Adoption des nouvelles technologies, digitalisation des processus industriels et innovation dans le secteur minier.',
   '💡', 5),
  ('Emploi et formation professionnelle',
   'Création d''emplois durables, formation de la main-d''œuvre locale et développement des filières d''enseignement technique.',
   '🎓', 6);

INSERT INTO forum_faq (question, reponse, ordre) VALUES
  ('Qui peut participer au Forum de Remobilisation ?',
   'Le forum est ouvert à tous les acteurs économiques : entreprises privées, représentants de l''État, partenaires techniques et financiers, société civile, presse et médias. L''inscription est obligatoire et gratuite.',
   1),
  ('Où se tiendra le forum ?',
   'Le Forum de Remobilisation Simandou se tiendra à Conakry, République de Guinée. Les détails précis du lieu seront communiqués aux inscrits par email.',
   2),
  ('Comment obtenir mon badge d''accès ?',
   'Après votre inscription en ligne, vous recevrez un email de confirmation avec votre numéro de badge. Présentez ce numéro à l''entrée le jour de l''événement.',
   3),
  ('Le forum est-il payant ?',
   'Non, la participation au Forum de Remobilisation Simandou est entièrement gratuite. Il suffit de vous inscrire en ligne.',
   4),
  ('Y a-t-il des opportunités de networking ?',
   'Oui, le forum prévoit plusieurs sessions de networking, des espaces d''exposition et des rencontres B2B entre participants.',
   5),
  ('Comment devenir exposant ou sponsor ?',
   'Pour les opportunités de sponsoring et d''exposition, contactez-nous directement via le formulaire de contact sur cette page.',
   6);
