import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

const PUBLIC_FIELDS = [
  'categorie', 'marque_modele', 'numero_serie', 'annee_mise_en_service',
  'etat', 'quantite', 'disponible', 'valeur_estimee',
  'latitude', 'longitude', 'localisation_texte',
  'entreprise_nom', 'entreprise_tel',
  'photo_url',
]

const ADMIN_FIELDS = [...PUBLIC_FIELDS, 'statut', 'entreprise_id']

function pick(obj, fields) {
  return Object.fromEntries(
    fields.filter(k => obj[k] !== undefined && obj[k] !== '' && obj[k] !== null)
          .map(k => [k, obj[k]])
  )
}

// Colonnes publiques nécessaires pour la carte, les popups, la liste et la modale
const MAP_SELECT = [
  'id', 'categorie', 'marque_modele', 'numero_serie', 'annee_mise_en_service',
  'etat', 'quantite', 'disponible', 'valeur_estimee',
  'latitude', 'longitude', 'localisation_texte',
  'entreprise_nom', 'entreprise_tel', 'photo_url', 'description',
  'entreprises(nom, telephone, email, experience_simandou)',
].join(', ')

// ── GET /api/equipements ──────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, categorie, disponible, statut, search } = req.query
    const requestedLimit = Number(limit)
    const SUPABASE_MAX   = 1000

    function buildQuery(from, to) {
      let q = supabase
        .from('equipements')
        .select(MAP_SELECT, { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })
      if (categorie)  q = q.eq('categorie', categorie)
      if (disponible !== undefined) q = q.eq('disponible', disponible === 'true')
      if (statut)     q = q.eq('statut', statut)
      if (search)     q = q.ilike('marque_modele', `%${search}%`)
      return q
    }

    if (requestedLimit <= SUPABASE_MAX) {
      const from = (Number(page) - 1) * requestedLimit
      const { data, error, count } = await buildQuery(from, from + requestedLimit - 1)
      if (error) throw error
      return res.json({ data, total: count, page: Number(page), limit: requestedLimit })
    }

    // limit > 1000 : batchs parallèles (au lieu de séquentiels)
    const { count, error: countErr } = await buildQuery(0, 0)
    if (countErr) throw countErr
    const total = count || 0
    if (total === 0) return res.json({ data: [], total: 0, page: 1, limit: 0 })

    const batchCount = Math.ceil(total / SUPABASE_MAX)
    const results = await Promise.all(
      Array.from({ length: batchCount }, (_, i) => {
        const from = i * SUPABASE_MAX
        return buildQuery(from, Math.min(from + SUPABASE_MAX - 1, total - 1))
      })
    )
    const allData = []
    for (const { data: batch, error: batchErr } of results) {
      if (batchErr) throw batchErr
      allData.push(...(batch || []))
    }
    res.json({ data: allData, total, page: 1, limit: total })
  } catch (err) { next(err) }
})

// ── GET /api/equipements/:id ──────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('equipements').select('*, entreprises(nom, telephone, email, logo_url, site_web, secteur, ville)').eq('id', req.params.id).single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// ── POST /api/equipements — soumission publique ───────────────
router.post('/', async (req, res, next) => {
  try {
    const payload = { ...pick(req.body, PUBLIC_FIELDS), statut: 'actif' }

    if (payload.latitude  !== undefined) payload.latitude  = parseFloat(payload.latitude)
    if (payload.longitude !== undefined) payload.longitude = parseFloat(payload.longitude)
    if (isNaN(payload.latitude))  delete payload.latitude
    if (isNaN(payload.longitude)) delete payload.longitude

    const { data, error } = await supabase.from('equipements').insert(payload).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

// ── PUT /api/equipements/:id (admin) ─────────────────────────
router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const payload = pick(req.body, ADMIN_FIELDS)
    const { data, error } = await supabase.from('equipements')
      .update(payload).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// ── PATCH /api/equipements/:id/validate ──────────────────────
router.patch('/:id/validate', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('equipements')
      .update({ statut: 'actif' }).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// ── PATCH /api/equipements/:id/reject ────────────────────────
router.patch('/:id/reject', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('equipements')
      .update({ statut: 'suspendu' }).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// ── DELETE /api/equipements/:id (admin) ──────────────────────
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase.from('equipements').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ message: 'Équipement supprimé' })
  } catch (err) { next(err) }
})

export default router
