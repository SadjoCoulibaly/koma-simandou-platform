# SNICTEPS — Guide de démarrage

## Stack
- **Frontend** : React 18 + Vite + Tailwind CSS + React Router
- **Backend** : Node.js + Express
- **Base de données** : Supabase (PostgreSQL)
- **Auth** : Supabase Auth
- **Déploiement** : Vercel

---

## 1. Installer les dépendances

```bash
cd snicteps-app
npm install
npm install --workspace=client
npm install --workspace=server
```

---

## 2. Variables d'environnement

### Client (`client/.env`)
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Serveur (`server/.env`)
```
PORT=3001
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
CLIENT_URL=http://localhost:5173
```

---

## 3. Créer le schéma Supabase

1. Aller sur [supabase.com](https://supabase.com) → nouveau projet
2. **SQL Editor** → coller le contenu de `supabase/schema.sql` → Run

---

## 4. Démarrer en développement

```bash
npm run dev
```

- React : http://localhost:5173
- Express : http://localhost:3001

---

## 5. Déployer sur Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Premier déploiement
cd snicteps-app
vercel

# Variables d'env sur Vercel (Settings > Environment Variables) :
# SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CLIENT_URL
# VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

---

## Structure du projet

```
snicteps-app/
├── client/                  # React + Vite + Tailwind
│   └── src/
│       ├── components/
│       │   ├── landing/     # Hero, Contexte, Vision, Composantes, Impacts
│       │   ├── layout/      # Navbar, Footer
│       │   └── ui/          # Modal, Toast
│       ├── context/         # AuthContext (Supabase Auth)
│       ├── data/            # composantes.js (données statiques)
│       ├── hooks/           # useScrollFade, useToast
│       ├── lib/             # supabase.js, api.js
│       └── pages/           # LandingPage, Login, Dashboard, Entreprises...
├── server/                  # Node.js + Express
│   ├── lib/supabase.js      # client service role
│   ├── middleware/          # auth.js, errorHandler.js
│   └── routes/              # entreprises, equipements, projets, stats
├── supabase/
│   └── schema.sql           # Tables + RLS + triggers
├── vercel.json
└── .env.example
```

## Pages disponibles

| Route | Description |
|-------|-------------|
| `/` | Landing page publique |
| `/login` | Connexion Supabase Auth |
| `/dashboard` | Tableau de bord (protégé) |
| `/entreprises` | Registre des entreprises (protégé) |

## Prochaines étapes
- [ ] Pages Équipements, Projets publics, Projets privés
- [ ] Formulaires d'enregistrement par composante
- [ ] Carte SIG (Leaflet) pour les équipements
- [ ] Espace admin (validation des entrées)
- [ ] Export PDF / Excel
