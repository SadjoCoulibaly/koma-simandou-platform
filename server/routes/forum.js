import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { sendForumConfirmation, sendForumAdminNotification } from '../lib/email.js'

const router = Router()

function generateBadgeNumber() {
  const year = new Date().getFullYear()
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `KOMA-${year}-${rand}`
}

// ── POST /api/forum — inscription publique ─────────────────────
router.post('/', async (req, res, next) => {
  try {
    const { nom, prenom, email, telephone, organisation, fonction, type_participant } = req.body

    if (!nom?.trim() || !prenom?.trim() || !email?.trim()) {
      return res.status(400).json({ message: 'Nom, prénom et email sont obligatoires.' })
    }

    // Vérifier doublon email
    const { data: existing, error: checkError } = await supabase
      .from('forum_inscriptions')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (checkError) throw checkError
    if (existing) {
      return res.status(409).json({ message: 'Cette adresse email est déjà inscrite au forum.' })
    }

    const numero_badge = generateBadgeNumber()

    const payload = {
      nom:              nom.trim().toUpperCase(),
      prenom:           prenom.trim(),
      email:            email.toLowerCase().trim(),
      telephone:        telephone?.trim() || null,
      organisation:     organisation?.trim() || null,
      fonction:         fonction?.trim() || null,
      type_participant: type_participant || 'Autre',
      statut:           'confirme',
      numero_badge,
    }

    const { data, error } = await supabase
      .from('forum_inscriptions')
      .insert(payload)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ message: 'Cette adresse email est déjà inscrite au forum.' })
      }
      throw error
    }

    res.status(201).json(data)

    // Emails après la réponse — awaités pour éviter que Vercel coupe avant l'envoi
    const emailResults = await Promise.allSettled([
      sendForumConfirmation({ ...payload }),
      sendForumAdminNotification({ ...payload }),
    ])
    emailResults.forEach((r, i) => {
      if (r.status === 'rejected') console.error(`[email ${i}] non envoyé :`, r.reason?.message)
    })
  } catch (err) { next(err) }
})

// ── GET /api/forum — liste (admin) ────────────────────────────
router.get('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 50, statut, search } = req.query
    const from = (Number(page) - 1) * Number(limit)
    const to   = from + Number(limit) - 1

    let query = supabase
      .from('forum_inscriptions')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: true })

    if (statut && statut !== 'Tous') query = query.eq('statut', statut)
    if (search) query = query.or(`nom.ilike.%${search}%,prenom.ilike.%${search}%,organisation.ilike.%${search}%,email.ilike.%${search}%`)

    const { data, error, count } = await query
    if (error) throw error
    res.json({ data, total: count, page: Number(page), limit: Number(limit) })
  } catch (err) { next(err) }
})

// ── PATCH /api/forum/:id/present — marquer présent (admin) ───
router.patch('/:id/present', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('forum_inscriptions')
      .update({ statut: 'present' })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// ── DELETE /api/forum/:id (admin) ────────────────────────────
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase.from('forum_inscriptions').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ message: 'Inscription supprimée' })
  } catch (err) { next(err) }
})

export default router
