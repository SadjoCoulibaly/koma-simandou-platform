import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

const PUBLIC_PROJ_PUBLIC = [
  'secteur', 'titre', 'description', 'maitre_ouvrage',
  'budget_estime', 'devise', 'date_debut', 'date_fin_prevue',
  'localisation', 'lots_sous_traitance', 'contenu_local_pct', 'avancement_pct',
  'image_url',
  'soumis_par_nom', 'soumis_par_email', 'soumis_par_telephone', 'soumis_par_organisation',
]

const PUBLIC_PROJ_PRIVE = [
  'categorie', 'titre', 'description', 'promoteur',
  'investissement_prevu', 'devise', 'emplois_prevus',
  'date_debut', 'localisation', 'statut',
  'lots_sous_traitance', 'contenu_local_pct', 'avancement_pct',
  'image_url',
]

// ── Cache mémoire serveur (2 minutes) ────────────────────────
let _cachePublics = null; let _cachePublicsAt = 0
let _cachePrives  = null; let _cachePrivesAt  = 0
const CACHE_TTL   = 2 * 60_000

router.use((req, _res, next) => {
  if (req.method !== 'GET') {
    _cachePublics = null; _cachePublicsAt = 0
    _cachePrives  = null; _cachePrivesAt  = 0
  }
  next()
})

// Colonnes renvoyées aux visiteurs non authentifiés — sans coordonnées soumissionnaire
const PUBLIC_LIST_SELECT =
  'id, secteur, titre, description, maitre_ouvrage, budget_estime, devise, ' +
  'date_debut, date_fin_prevue, localisation, lots_sous_traitance, ' +
  'contenu_local_pct, avancement_pct, image_url, statut, valide'

const PUBLIC_PRIVES_SELECT =
  'id, categorie, titre, description, promoteur, investissement_prevu, devise, ' +
  'emplois_prevus, date_debut, localisation, statut, lots_sous_traitance, ' +
  'contenu_local_pct, avancement_pct, image_url'

function pick(obj, fields) {
  return Object.fromEntries(
    fields.filter(k => obj[k] !== undefined && obj[k] !== '' && obj[k] !== null)
          .map(k => [k, obj[k]])
  )
}

// ── Projets publics ──────────────────────────────────────────

// Vue publique — seulement les projets validés
router.get('/publics', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, secteur, statut, search } = req.query
    const isDefault = !secteur && !statut && !search
                   && Number(page) === 1 && Number(limit) === 20
    if (isDefault && _cachePublics && Date.now() - _cachePublicsAt < CACHE_TTL) {
      res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300')
      return res.json(_cachePublics)
    }
    const from = (Number(page) - 1) * Number(limit)
    const to   = from + Number(limit) - 1
    let query = supabase.from('projets_publics').select(PUBLIC_LIST_SELECT, { count: 'exact' })
      .eq('valide', true)
      .range(from, to).order('created_at', { ascending: false })
    if (secteur) query = query.eq('secteur', secteur)
    if (statut)  query = query.eq('statut', statut)
    if (search)  query = query.ilike('titre', `%${search}%`)
    const { data, error, count } = await query
    if (error) throw error
    const result = { data, total: count, page: Number(page), limit: Number(limit) }
    if (isDefault && (data?.length ?? 0) > 0) {
      _cachePublics = result; _cachePublicsAt = Date.now()
      res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300')
    }
    res.json(result)
  } catch (err) { next(err) }
})

// Vue admin — tous les projets y compris en attente
router.get('/publics/admin', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, secteur, statut, search } = req.query
    const from = (Number(page) - 1) * Number(limit)
    const to   = from + Number(limit) - 1
    let query = supabase.from('projets_publics').select('*', { count: 'exact' })
      .range(from, to).order('created_at', { ascending: false })
    if (secteur) query = query.eq('secteur', secteur)
    if (statut)  query = query.eq('statut', statut)
    if (search)  query = query.ilike('titre', `%${search}%`)
    const { data, error, count } = await query
    if (error) throw error
    res.json({ data, total: count, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

router.get('/publics/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('projets_publics')
      .select(PUBLIC_LIST_SELECT)
      .eq('id', req.params.id)
      .eq('valide', true)
      .maybeSingle()
    if (error) throw error
    if (!data) return res.status(404).json({ message: 'Projet non trouvé' })
    res.json(data)
  } catch (err) { next(err) }
})

router.post('/publics', async (req, res, next) => {
  try {
    const payload = pick(req.body, PUBLIC_PROJ_PUBLIC)
    if (!payload.titre?.trim()) {
      return res.status(400).json({ message: 'Le titre du projet est obligatoire.' })
    }
    // Non visible publiquement tant que non validé
    payload.valide = false
    const { data, error } = await supabase.from('projets_publics').insert(payload).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

router.patch('/publics/:id/validate', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('projets_publics')
      .update({ valide: true, statut: 'planifie' }).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

router.patch('/publics/:id/reject', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('projets_publics')
      .update({ statut: 'suspendu' }).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

router.delete('/publics/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase.from('projets_publics').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ message: 'Projet supprimé' })
  } catch (err) { next(err) }
})

// ── Projets privés ───────────────────────────────────────────
router.get('/prives', requireAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, categorie, statut, search } = req.query
    const isDefault = !categorie && !statut && !search
                   && Number(page) === 1 && Number(limit) === 20
    if (isDefault && _cachePrives && Date.now() - _cachePrivesAt < CACHE_TTL) {
      res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300')
      return res.json(_cachePrives)
    }
    const from = (Number(page) - 1) * Number(limit)
    const to   = from + Number(limit) - 1
    let query = supabase.from('projets_prives').select(PUBLIC_PRIVES_SELECT, { count: 'exact' })
      .range(from, to).order('created_at', { ascending: false })
    if (categorie) query = query.eq('categorie', categorie)
    if (statut)    query = query.eq('statut', statut)
    if (search)    query = query.ilike('titre', `%${search}%`)
    const { data, error, count } = await query
    if (error) throw error
    const result = { data, total: count, page: Number(page), limit: Number(limit) }
    if (isDefault && (data?.length ?? 0) > 0) {
      _cachePrives = result; _cachePrivesAt = Date.now()
      res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300')
    }
    res.json(result)
  } catch (err) { next(err) }
})

router.get('/prives/:id', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('projets_prives')
      .select(PUBLIC_PRIVES_SELECT)
      .eq('id', req.params.id)
      .maybeSingle()
    if (error) throw error
    if (!data) return res.status(404).json({ message: 'Projet non trouvé' })
    res.json(data)
  } catch (err) { next(err) }
})

router.post('/prives', async (req, res, next) => {
  try {
    const payload = pick(req.body, PUBLIC_PROJ_PRIVE)
    if (!payload.titre?.trim()) {
      return res.status(400).json({ message: 'Le titre du projet est obligatoire.' })
    }
    const { data, error } = await supabase.from('projets_prives').insert(payload).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

router.patch('/prives/:id/validate', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('projets_prives')
      .update({ statut: 'construction' }).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

router.patch('/prives/:id/reject', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('projets_prives')
      .update({ statut: 'suspendu' }).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

router.delete('/prives/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase.from('projets_prives').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ message: 'Projet supprimé' })
  } catch (err) { next(err) }
})

export default router
