import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

// ── Cache mémoire serveur (2 minutes) ────────────────────────
let _cache = null
let _cacheAt = 0
const CACHE_TTL = 2 * 60_000

export function invalidateForumCache() { _cache = null; _cacheAt = 0 }

// Invalide le cache sur toute mutation (POST/PUT/DELETE)
router.use((req, _res, next) => { if (req.method !== 'GET') invalidateForumCache(); next() })

// ── GET /api/forum-content — données publiques complètes ──────
router.get('/', async (req, res, next) => {
  try {
    if (_cache && Date.now() - _cacheAt < CACHE_TTL) {
      res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300')
      return res.json(_cache)
    }
    const safe = (r) => (r.status === 'fulfilled' ? r.value.data || [] : [])
    const results = await Promise.allSettled([
      supabase.from('forum_chiffres').select('*').order('ordre'),
      supabase.from('forum_themes').select('*').order('ordre'),
      supabase.from('forum_intervenants').select('*').order('ordre'),
      supabase.from('forum_programme').select('*, forum_intervenants(nom, titre, organisation)').order('jour').order('ordre'),
      supabase.from('forum_sponsors').select('*').order('categorie').order('ordre'),
      supabase.from('forum_faq').select('*').order('ordre'),
    ])
    const [chiffres, themes, intervenants, programme, sponsors, faq] = results
    _cache = {
      chiffres:     safe(chiffres),
      themes:       safe(themes),
      intervenants: safe(intervenants),
      programme:    safe(programme),
      sponsors:     safe(sponsors),
      faq:          safe(faq),
    }
    _cacheAt = Date.now()
    res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=300')
    res.json(_cache)
  } catch (err) { next(err) }
})

// ── CHIFFRES ─────────────────────────────────────────────────
router.get('/chiffres', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('forum_chiffres').select('*').order('ordre')
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})
router.post('/chiffres', requireAuth, requireAdmin, async (req, res, next) => { invalidateForumCache()
  try {
    const { label, valeur, icone, ordre } = req.body
    if (!label?.trim() || !valeur?.trim()) return res.status(400).json({ message: 'Label et valeur requis.' })
    const { data, error } = await supabase.from('forum_chiffres').insert({ label, valeur, icone: icone || '📊', ordre: ordre || 0 }).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})
router.put('/chiffres/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { label, valeur, icone, ordre } = req.body
    const { data, error } = await supabase.from('forum_chiffres').update({ label, valeur, icone, ordre }).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})
router.delete('/chiffres/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase.from('forum_chiffres').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ message: 'Supprimé' })
  } catch (err) { next(err) }
})

// ── THÉMATIQUES ───────────────────────────────────────────────
router.get('/themes', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('forum_themes').select('*').order('ordre')
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})
router.post('/themes', requireAuth, requireAdmin, async (req, res, next) => { invalidateForumCache()
  try {
    const { titre, description, icone, ordre } = req.body
    if (!titre?.trim()) return res.status(400).json({ message: 'Titre requis.' })
    const { data, error } = await supabase.from('forum_themes').insert({ titre, description, icone: icone || '🎯', ordre: ordre || 0 }).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})
router.put('/themes/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { titre, description, icone, ordre } = req.body
    const { data, error } = await supabase.from('forum_themes').update({ titre, description, icone, ordre }).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})
router.delete('/themes/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase.from('forum_themes').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ message: 'Supprimé' })
  } catch (err) { next(err) }
})

// ── INTERVENANTS ──────────────────────────────────────────────
router.get('/intervenants', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('forum_intervenants').select('*').order('ordre')
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})
router.post('/intervenants', requireAuth, requireAdmin, async (req, res, next) => { invalidateForumCache()
  try {
    const { nom, titre, organisation, photo_url, biographie, ordre } = req.body
    if (!nom?.trim()) return res.status(400).json({ message: 'Nom requis.' })
    const { data, error } = await supabase.from('forum_intervenants').insert({ nom, titre, organisation, photo_url, biographie, ordre: ordre || 0 }).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})
router.put('/intervenants/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { nom, titre, organisation, photo_url, biographie, ordre } = req.body
    const { data, error } = await supabase.from('forum_intervenants').update({ nom, titre, organisation, photo_url, biographie, ordre }).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})
router.delete('/intervenants/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase.from('forum_intervenants').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ message: 'Supprimé' })
  } catch (err) { next(err) }
})

// ── PROGRAMME ─────────────────────────────────────────────────
router.get('/programme', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('forum_programme').select('*, forum_intervenants(id, nom, titre)').order('jour').order('ordre')
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})
router.post('/programme', requireAuth, requireAdmin, async (req, res, next) => { invalidateForumCache()
  try {
    const { jour, heure_debut, heure_fin, titre, description, type, salle, intervenant_id, ordre } = req.body
    if (!titre?.trim() || !jour || !heure_debut) return res.status(400).json({ message: 'Jour, heure et titre requis.' })
    const { data, error } = await supabase.from('forum_programme').insert({ jour: Number(jour), heure_debut, heure_fin, titre, description, type: type || 'session', salle, intervenant_id: intervenant_id || null, ordre: ordre || 0 }).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})
router.put('/programme/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { jour, heure_debut, heure_fin, titre, description, type, salle, intervenant_id, ordre } = req.body
    const { data, error } = await supabase.from('forum_programme').update({ jour: Number(jour), heure_debut, heure_fin, titre, description, type, salle, intervenant_id: intervenant_id || null, ordre }).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})
router.delete('/programme/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase.from('forum_programme').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ message: 'Supprimé' })
  } catch (err) { next(err) }
})

// ── SPONSORS ──────────────────────────────────────────────────
router.get('/sponsors', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('forum_sponsors').select('*').order('categorie').order('ordre')
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})
router.post('/sponsors', requireAuth, requireAdmin, async (req, res, next) => { invalidateForumCache()
  try {
    const { nom, logo_url, site_url, categorie, ordre } = req.body
    if (!nom?.trim()) return res.status(400).json({ message: 'Nom requis.' })
    const { data, error } = await supabase.from('forum_sponsors').insert({ nom, logo_url, site_url, categorie: categorie || 'partenaire', ordre: ordre || 0 }).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})
router.put('/sponsors/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { nom, logo_url, site_url, categorie, ordre } = req.body
    const { data, error } = await supabase.from('forum_sponsors').update({ nom, logo_url, site_url, categorie, ordre }).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})
router.delete('/sponsors/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase.from('forum_sponsors').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ message: 'Supprimé' })
  } catch (err) { next(err) }
})

// ── FAQ ───────────────────────────────────────────────────────
router.get('/faq', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('forum_faq').select('*').order('ordre')
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})
router.post('/faq', requireAuth, requireAdmin, async (req, res, next) => { invalidateForumCache()
  try {
    const { question, reponse, ordre } = req.body
    if (!question?.trim() || !reponse?.trim()) return res.status(400).json({ message: 'Question et réponse requises.' })
    const { data, error } = await supabase.from('forum_faq').insert({ question, reponse, ordre: ordre || 0 }).select().single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) { next(err) }
})
router.put('/faq/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { question, reponse, ordre } = req.body
    const { data, error } = await supabase.from('forum_faq').update({ question, reponse, ordre }).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json(data)
  } catch (err) { next(err) }
})
router.delete('/faq/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase.from('forum_faq').delete().eq('id', req.params.id)
    if (error) throw error
    res.json({ message: 'Supprimé' })
  } catch (err) { next(err) }
})

export default router
