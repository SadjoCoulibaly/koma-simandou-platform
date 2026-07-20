import { supabase } from '../lib/supabase.js'

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Token d'authentification manquant" })
  }

  const token = authHeader.split(' ')[1]

  try {
    // Vérifie la signature JWT et l'expiration côté Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return res.status(401).json({ message: 'Token invalide ou expiré' })
    }
    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: "Erreur d'authentification" })
  }
}

export async function requireAdmin(req, res, next) {
  try {
    if (req.user?.app_metadata?.role === 'admin') return next()

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('profiles_timeout')), 5000)
    )
    const query = supabase.from('profiles').select('role').eq('id', req.user.id).single()
    const { data, error } = await Promise.race([query, timeout])

    if (error || data?.role !== 'admin') {
      return res.status(403).json({ message: 'Accès réservé aux administrateurs' })
    }
    next()
  } catch (err) {
    if (err.message === 'profiles_timeout') {
      return res.status(403).json({ message: 'Accès réservé aux administrateurs' })
    }
    next(err)
  }
}
