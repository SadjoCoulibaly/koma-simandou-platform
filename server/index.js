import './env.js'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import authRoutes         from './routes/auth.js'
import entreprisesRoutes  from './routes/entreprises.js'
import equipementsRoutes  from './routes/equipements.js'
import projetsRoutes      from './routes/projets.js'
import statsRoutes        from './routes/stats.js'
import forumRoutes        from './routes/forum.js'
import forumContentRoutes   from './routes/forum-content.js'
import humanResourcesRoutes from './routes/human-resources.js'
import contactRoutes        from './routes/contact.js'
import { errorHandler }     from './middleware/errorHandler.js'

const app  = express()
const PORT = process.env.PORT || 3001

app.set('trust proxy', 1)

// ── Security ──────────────────────────────────────────────────
app.use(helmet())
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3002',
  'https://koma-gn.com',
  'https://www.koma-gn.com',
  process.env.CLIENT_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)                                       // curl / server-to-server
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
    if (/\.vercel\.app$/.test(origin)) return cb(null, true)                // tous les sous-domaines Vercel
    if (process.env.NODE_ENV !== 'production' && /^https?:\/\/localhost:/.test(origin)) return cb(null, true) // tout port localhost en dev
    cb(new Error('CORS non autorisé'))
  },
  credentials: true,
}))

// ── Rate limiting ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { message: 'Trop de requêtes, réessayez dans 15 minutes.' },
})
app.use('/api', limiter)

// ── Body parsing & logging ────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, timestamp: new Date().toISOString() })
})


// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes)
app.use('/api/entreprises', entreprisesRoutes)
app.use('/api/equipements', equipementsRoutes)
app.use('/api/projets',     projetsRoutes)
app.use('/api/stats',       statsRoutes)
app.use('/api/forum',         forumRoutes)
app.use('/api/forum-content',   forumContentRoutes)
app.use('/api/human-resources', humanResourcesRoutes)
app.use('/api/contact',         contactRoutes)

// ── 404 ───────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route introuvable' })
})

// ── Error handler ─────────────────────────────────────────────
app.use(errorHandler)

// ── Export pour Vercel serverless ────────────────────────────
export default app

// ── Start en local seulement (pas sur Vercel) ────────────────
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅  Serveur KOMA démarré sur http://localhost:${PORT}`)
  })
}
