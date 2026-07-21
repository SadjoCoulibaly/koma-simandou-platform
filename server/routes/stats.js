import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

// ── Cache mémoire serveur (2 minutes) ────────────────────────
let _cachePublic = null; let _cachePublicAt = 0
let _cacheDist   = null; let _cacheDistAt   = 0
const CACHE_TTL  = 2 * 60_000

// GET /api/stats/public — compteurs agrégés publics (landing page, sans auth)
router.get('/public', async (_req, res, next) => {
  try {
    if (_cachePublic && Date.now() - _cachePublicAt < CACHE_TTL) {
      res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300')
      return res.json(_cachePublic)
    }
    const [
      { count: entreprises },
      { data: eqRows },
      { count: projets_publics },
      { count: projets_prives },
    ] = await Promise.all([
      supabase.from('entreprises').select('*', { count: 'exact', head: true }).eq('statut', 'actif'),
      supabase.from('equipements').select('quantite').eq('statut', 'actif'),
      supabase.from('projets_publics').select('*', { count: 'exact', head: true }),
      supabase.from('projets_prives').select('*', { count: 'exact', head: true }),
    ])
    const equipements = (eqRows || []).reduce((s, r) => s + (r.quantite || 1), 0)
    const payload = { entreprises, equipements, projets_publics, projets_prives }
    if (Object.values(payload).some(v => (v ?? 0) > 0)) {
      _cachePublic = payload; _cachePublicAt = Date.now()
      res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300')
    }
    res.json(payload)
  } catch (err) { next(err) }
})

// GET /api/stats/distribution — répartitions pour les charts publics
router.get('/distribution', async (_req, res, next) => {
  try {
    if (_cacheDist && Date.now() - _cacheDistAt < CACHE_TTL) {
      res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300')
      return res.json(_cacheDist)
    }
    const [
      { data: ents },
      { data: eqs },
      { data: pp },
      { data: priv },
    ] = await Promise.all([
      supabase.from('entreprises').select('type').eq('statut', 'actif'),
      supabase.from('equipements').select('categorie, disponible, quantite').eq('statut', 'actif'),
      supabase.from('projets_publics').select('statut, secteur'),
      supabase.from('projets_prives').select('statut, categorie'),
    ])

    const countBy = (arr, key) => {
      const map = {}
      ;(arr || []).forEach(r => { const v = r[key] || 'Autre'; map[v] = (map[v] || 0) + 1 })
      return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    }

    const eqsArr = eqs || []
    const sumQ = (arr) => arr.reduce((s, e) => s + (e.quantite || 1), 0)
    const payload = {
      entreprises: { par_type: countBy(ents, 'type'), total: (ents || []).length },
      equipements: {
        par_categorie: countBy(eqs, 'categorie'),
        disponibles:   sumQ(eqsArr.filter(e => e.disponible)),
        indisponibles: sumQ(eqsArr.filter(e => !e.disponible)),
        total:         sumQ(eqsArr),
      },
      projets: {
        publics_par_statut:   countBy(pp,   'statut'),
        prives_par_categorie: countBy(priv, 'categorie'),
        total_publics:  (pp   || []).length,
        total_prives:   (priv || []).length,
      },
    }
    if ((ents?.length ?? 0) > 0 || (eqs?.length ?? 0) > 0) {
      _cacheDist = payload; _cacheDistAt = Date.now()
      res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300')
    }
    res.json(payload)
  } catch (err) { next(err) }
})

// GET /api/stats/summary — compteurs globaux + en_attente
router.get('/summary', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const [
      { count: entreprises_total },
      { count: entreprises_attente },
      { data: eqActifs },
      { count: equipements_attente },
      { count: projets_publics },
      { count: projets_prives },
    ] = await Promise.all([
      supabase.from('entreprises').select('*', { count: 'exact', head: true }),
      supabase.from('entreprises').select('*', { count: 'exact', head: true }).eq('statut', 'en_attente'),
      supabase.from('equipements').select('quantite').eq('statut', 'actif'),
      supabase.from('equipements').select('*', { count: 'exact', head: true }).eq('statut', 'en_attente'),
      supabase.from('projets_publics').select('*', { count: 'exact', head: true }),
      supabase.from('projets_prives').select('*', { count: 'exact', head: true }),
    ])

    const equipements_total = (eqActifs || []).reduce((s, r) => s + (r.quantite || 1), 0)

    res.json({
      entreprises: { total: entreprises_total, en_attente: entreprises_attente },
      equipements: { total: equipements_total, en_attente: equipements_attente },
      projets_publics,
      projets_prives,
    })
  } catch (err) { next(err) }
})

// GET /api/stats/by-category — breakdown par catégorie d'équipements
router.get('/by-category', requireAuth, requireAdmin, async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('equipements')
      .select('categorie')
      .eq('statut', 'actif')
    if (error) throw error

    const counts = {}
    data.forEach(({ categorie }) => {
      counts[categorie] = (counts[categorie] || 0) + 1
    })

    res.json(Object.entries(counts).map(([label, count]) => ({ label, count })))
  } catch (err) { next(err) }
})

export default router
