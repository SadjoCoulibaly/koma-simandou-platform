import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { sendEntrepriseInvite } from '../lib/email.js'

const router = Router()

// ── Cache mémoire serveur (2 minutes) ────────────────────────
let _cache = null; let _cacheAt = 0
const CACHE_TTL = 2 * 60_000

router.use((req, _res, next) => { if (req.method !== 'GET') { _cache = null; _cacheAt = 0 }; next() })

// Champs autorisés pour une soumission publique
const PUBLIC_FIELDS = [
  'type', 'nom', 'rccm', 'nif', 'adresse', 'ville',
  'telephone', 'email', 'site_web',
  'declarant_nom', 'declarant_prenom', 'declarant_fonction',
  'declarant_telephone', 'declarant_email',
  'secteur', 'effectifs', 'capital_social', 'experience_simandou',
  'description', 'references_techniques', 'certifications',
  'logo_url',
]

// Champs supplémentaires réservés à l'admin
const ADMIN_FIELDS = [...PUBLIC_FIELDS, 'statut']

function pick(obj, fields) {
  return Object.fromEntries(
    fields.filter(k => obj[k] !== undefined && obj[k] !== '' && obj[k] !== null)
          .map(k => [k, obj[k]])
  )
}

// ── GET /api/entreprises ──────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, secteur, statut, search } = req.query
    const isDefault = !type && !secteur && !statut && !search
                   && Number(page) === 1 && Number(limit) === 20
    if (isDefault && _cache && Date.now() - _cacheAt < CACHE_TTL) {
      res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300')
      return res.json(_cache)
    }
    const from = (Number(page) - 1) * Number(limit)
    const to   = from + Number(limit) - 1

    let query = supabase
      .from('entreprises')
      .select(
        'id, type, nom, secteur, ville, logo_url, telephone, email, site_web, ' +
        'statut, experience_simandou, effectifs, rccm, capital_social, ' +
        'description, references_techniques, certifications',
        { count: 'exact' }
      )
      .range(from, to)
      .order('created_at', { ascending: false })

    if (type)    query = query.eq('type', type)
    if (secteur) query = query.eq('secteur', secteur)
    if (statut)  query = query.eq('statut', statut)
    if (search)  query = query.ilike('nom', `%${search}%`)

    const { data, error, count } = await query
    if (error) throw error
    const result = { data, total: count, page: Number(page), limit: Number(limit) }
    if (isDefault && (data?.length ?? 0) > 0) {
      _cache = result; _cacheAt = Date.now()
      res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300')
    }
    res.json(result)
  } catch (err) { next(err) }
})

// ── GET /api/entreprises/:id ──────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('entreprises').select('*').eq('id', req.params.id).single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// ── POST /api/entreprises — soumission publique ───────────────
router.post('/', async (req, res, next) => {
  try {
    const payload = {
      ...pick(req.body, PUBLIC_FIELDS),
      statut: 'en_attente',
      created_at: new Date().toISOString(),
    }
    const { data, error } = await supabase
      .from('entreprises').insert(payload).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})

// ── PUT /api/entreprises/:id — mise à jour (admin) ────────────
router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const payload = pick(req.body, ADMIN_FIELDS)
    const { data, error } = await supabase
      .from('entreprises').update(payload).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// ── PATCH /api/entreprises/:id/validate ──────────────────────
router.patch('/:id/validate', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('entreprises')
      .update({ statut: 'actif', valide_par: req.user.id, date_validation: new Date().toISOString() })
      .eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// ── PATCH /api/entreprises/:id/reject ────────────────────────
router.patch('/:id/reject', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('entreprises').update({ statut: 'suspendu' })
      .eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})

// ── DELETE /api/entreprises/:id (admin) ──────────────────────
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase.from('entreprises').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ message: 'Entreprise supprimée' })
  } catch (err) { next(err) }
})

// ── POST /api/entreprises/:id/invite ─────────────────────────
router.post('/:id/invite', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data: entreprise, error: fetchError } = await supabase
      .from('entreprises')
      .select('id, nom, email, declarant_nom, declarant_email')
      .eq('id', req.params.id).single()
    if (fetchError || !entreprise) return res.status(404).json({ message: 'Entreprise introuvable.' })

    const rawEmail = entreprise.declarant_email || entreprise.email
    const email = rawEmail?.toLowerCase().trim()

    if (!email) return res.status(400).json({ message: "Aucun email renseigné pour cette entreprise. Ajoutez un email déclarant ou un email de contact." })

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!emailValid) return res.status(400).json({ message: `Email invalide : "${email}". Corrigez l'email de l'entreprise avant de générer le lien.` })

    const nom = entreprise.declarant_nom || entreprise.nom
    const redirectTo = `${process.env.CLIENT_URL || 'https://koma-gn.com'}/definir-mot-de-passe`

    // Créer le compte Supabase si inexistant (ignorer l'erreur "déjà existant")
    const { error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: nom,
        entreprise_id: req.params.id,
        organisation: entreprise.nom,
        type: 'entreprise',
      },
    })
    if (createError && !createError.message.toLowerCase().includes('already')) throw createError

    // Générer le lien — 'recovery' fonctionne pour les comptes nouveaux ET existants
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo, expiresIn: 172800 }, // 48h
    })
    if (linkError) throw linkError

    const inviteLink = linkData.properties.action_link

    // Envoyer l'email (attendu — obligatoire sur serverless Vercel)
    try {
      await sendEntrepriseInvite({ nom, email, inviteLink, entrepriseNom: entreprise.nom })
    } catch (emailErr) {
      console.warn('[invite] Email non envoyé :', emailErr.message)
    }

    res.json({ inviteLink, email })
  } catch (err) { next(err) }
})

export default router
