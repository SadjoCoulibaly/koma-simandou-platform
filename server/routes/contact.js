import { Router } from 'express'
import { sendContactMessage } from '../lib/email.js'

const router = Router()

router.post('/', async (req, res, next) => {
  try {
    const { nom, email, sujet, message } = req.body
    if (!nom?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ message: 'Nom, email et message sont obligatoires.' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: 'Email invalide.' })
    }
    await sendContactMessage({
      nom: nom.trim(),
      email: email.trim(),
      sujet: sujet?.trim() || 'Message de contact',
      message: message.trim(),
    })
    res.json({ message: 'Message envoyé.' })
  } catch (err) { next(err) }
})

export default router
