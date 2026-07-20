import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { sendAccountActivation } from '../lib/email.js'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, nom, telephone, type, organisation } = req.body

    if (!email?.trim() || !password || !nom?.trim()) {
      return res.status(400).json({ message: 'Email, mot de passe et nom sont obligatoires.' })
    }

    // Créer l'utilisateur via Admin SDK (sans confirmation auto)
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      user_metadata: { full_name: nom.trim(), phone: telephone?.trim(), type, organisation: organisation?.trim() },
      email_confirm: false,
    })

    if (createError) {
      if (createError.message.includes('already registered') || createError.message.includes('already been registered')) {
        return res.status(409).json({ message: 'Cet email est déjà utilisé.' })
      }
      throw createError
    }

    // Générer le lien d'activation
    const redirectTo = `${process.env.CLIENT_URL || 'https://koma-gn.com'}/compte-active`
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: email.toLowerCase().trim(),
      options: { redirectTo },
    })

    if (linkError) throw linkError

    const activationLink = linkData.properties.action_link

    // Envoyer l'email d'activation (attendu avant la réponse — obligatoire sur serverless)
    try {
      await sendAccountActivation({ nom: nom.trim(), email: email.toLowerCase().trim(), activationLink, type })
    } catch (emailErr) {
      console.warn('Email activation non envoyé :', emailErr.message)
    }

    res.status(201).json({ message: 'Compte créé. Vérifiez votre email pour activer votre compte.' })
  } catch (err) { next(err) }
})

export default router
