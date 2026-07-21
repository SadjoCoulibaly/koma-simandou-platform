import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

const PUBLIC_FIELDS = [
  'nom_complet', 'telephone', 'email', 'nationalite', 'fonction',
  'competences', 'projet_realise', 'disponibilite', 'localisation', 'photo_url',
]

function pick(obj, fields) {
  return Object.fromEntries(
    fields.filter(k => obj[k] !== undefined && obj[k] !== '' && obj[k] !== null)
          .map(k => [k, obj[k]])
  )
}

// ── POST /api/human-resources/upload-photo ───────────────────
router.post('/upload-photo', async (req, res, next) => {
  try {
    const { base64, filename, mimeType } = req.body
    if (!base64 || !filename) return res.status(400).json({ message: 'base64 et filename requis' })

    const buffer = Buffer.from(base64.replace(/^data:[^;]+;base64,/, ''), 'base64')
    const ext    = (mimeType || 'image/jpeg').split('/')[1] || 'jpg'
    const path   = `photos/${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('hr-avatars')
      .upload(path, buffer, { contentType: mimeType || 'image/jpeg', upsert: true })

    if (upErr) throw upErr

    const { data: { publicUrl } } = supabase.storage.from('hr-avatars').getPublicUrl(path)
    res.json({ url: publicUrl })
  } catch (err) { next(err) }
})

// ── GET /api/human-resources ─────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, disponibilite, statut, search, fonction } = req.query
    const from = (Number(page) - 1) * Number(limit)
    const to   = from + Number(limit) - 1

    let query = supabase
      .from('human_resources')
      .select(
        'id, nom_complet, telephone, email, nationalite, fonction, ' +
        'competences, projet_realise, disponibilite, localisation, photo_url, statut',
        { count: 'exact' }
      )
      .range(from, to)
      .order('created_at', { ascending: false })

    if (disponibilite) query = query.eq('disponibilite', disponibilite)
    if (statut)        query = query.eq('statut', statut)
    if (fonction)      query = query.eq('fonction', fonction)
    if (search)        query = query.ilike('nom_complet', `%${search}%`)

    const { data, error, count } = await query
    if (error) throw error
    res.json({ data, total: count, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

// ── GET /api/human-resources/:id ─────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('human_resources')
      .select('id, nom_complet, telephone, email, nationalite, fonction, ' +
              'competences, projet_realise, disponibilite, localisation, photo_url, statut')
      .eq('id', req.params.id)
      .eq('statut', 'actif')
      .single()
    if (error) throw error
    if (!data) return res.status(404).json({ message: 'Professionnel introuvable' })
    res.json(data)
  } catch (err) { next(err) }
})

// ── POST /api/human-resources — soumission publique ──────────
router.post('/', async (req, res, next) => {
  try {
    const payload = pick(req.body, PUBLIC_FIELDS)
    if (!payload.nom_complet) return res.status(400).json({ message: 'nom_complet est requis' })
    if (!payload.fonction)    return res.status(400).json({ message: 'fonction est requis' })

    if (Array.isArray(payload.competences)) {
      payload.competences = payload.competences.filter(Boolean)
    }

    const { data, error } = await supabase
      .from('human_resources')
      .insert({ ...payload, statut: 'en_attente' })
      .select()
      .single()

    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

// ── PATCH /api/human-resources/:id/validate ──────────────────
router.patch('/:id/validate', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('human_resources')
      .update({ statut: 'actif', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// ── PATCH /api/human-resources/:id/reject ────────────────────
router.patch('/:id/reject', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('human_resources')
      .update({ statut: 'suspendu', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// ── DELETE /api/human-resources/:id ──────────────────────────
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('human_resources').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true })
  } catch (err) { next(err) }
})

export default router
