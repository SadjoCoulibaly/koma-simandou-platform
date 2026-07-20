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
    const from = (Number(page) - 1) * Number(limit)
    const to   = from + Number(limit) - 1
    let query = supabase.from('projets_publics').select('*', { count: 'exact' })
      .eq('valide', true)
      .range(from, to).order('created_at', { ascending: false })
    if (secteur) query = query.eq('secteur', secteur)
    if (statut)  query = query.eq('statut', statut)
    if (search)  query = query.ilike('titre', `%${search}%`)
    const { data, error, count } = await query
    if (error) throw error
    res.json({ data, total: count, page: Number(page), limit: Number(limit) })
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
    const { data, error } = await supabase.from('projets_publics').select('*').eq('id', req.params.id).single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

router.post('/publics', async (req, res, next) => {
  try {
    const payload = pick(req.body, PUBLIC_PROJ_PUBLIC)
    if (!payload.titre?.trim()) {
      return res.status(400).json({ message: 'Le titre du projet est obligatoire.' })
    }
    // Force en attente de validation, non visible publiquement
    payload.statut = 'en_attente'
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
router.get('/prives', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, categorie, statut, search } = req.query
    const from = (Number(page) - 1) * Number(limit)
    const to   = from + Number(limit) - 1
    let query = supabase.from('projets_prives').select('*', { count: 'exact' })
      .range(from, to).order('created_at', { ascending: false })
    if (categorie) query = query.eq('categorie', categorie)
    if (statut)    query = query.eq('statut', statut)
    if (search)    query = query.ilike('titre', `%${search}%`)
    const { data, error, count } = await query
    if (error) throw error
    res.json({ data, total: count, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

router.get('/prives/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('projets_prives').select('*').eq('id', req.params.id).single()
    if (error) throw error
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
