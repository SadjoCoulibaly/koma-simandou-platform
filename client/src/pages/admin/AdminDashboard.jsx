import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Truck, Landmark, Factory, Map, Link2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { statsApi } from '../../lib/api'

// ── Générateur de liens d'invitation ──────────────────────────
const ACCOUNT_TYPES = [
  'Particulier',
  'Entreprise nationale',
  'Entreprise internationale',
  'Sous-traitant',
  "Bureau d'études",
  'Fournisseur',
  "Société de location d'équipements",
  "Projet sectoriel de l'État",
  'Projet du secteur privé',
]
const INVITE_BASE = 'https://koma-gn.com/register'

function InviteGenerator() {
  const [open, setOpen]     = useState(false)
  const [copied, setCopied] = useState(false)
  const [fields, setFields] = useState({ nom: '', organisation: '', email: '', telephone: '', type: '' })

  const set = (k, v) => setFields(f => ({ ...f, [k]: v }))

  const generatedUrl = (() => {
    const params = new URLSearchParams()
    Object.entries(fields).forEach(([k, v]) => { if (v) params.set(k, v) })
    const qs = params.toString()
    return qs ? `${INVITE_BASE}?${qs}` : INVITE_BASE
  })()

  const hasParams = generatedUrl !== INVITE_BASE

  const copy = () => {
    navigator.clipboard.writeText(generatedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ background: 'white', borderRadius: 14, border: '1px solid rgba(0,0,0,.07)', boxShadow: '0 1px 4px rgba(0,0,0,.05)', overflow: 'hidden', marginTop: 14 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--koma-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Link2 size={16} color="#00798C" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0A1937', margin: 0, fontFamily: 'var(--font-body)' }}>Lien d'invitation — Création de compte</p>
            <p style={{ fontSize: 12, color: '#6B7A8D', margin: 0, fontFamily: 'var(--font-body)' }}>Générez un lien pré-rempli à envoyer à un partenaire</p>
          </div>
        </div>
        {open ? <ChevronUp size={16} color="#6B7A8D" /> : <ChevronDown size={16} color="#6B7A8D" />}
      </button>

      {open && (
        <div style={{ borderTop: '1px solid #F0F4F8', padding: '16px 20px 20px' }}>
          <p style={{ fontSize: 12.5, color: '#6B7A8D', marginBottom: 14, fontFamily: 'var(--font-body)' }}>
            Le destinataire arrive sur <strong style={{ color: '#0A1937' }}>/register</strong> avec ses informations pré-remplies — il choisit seulement son mot de passe.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            {[
              { key: 'nom',          label: 'Nom complet' },
              { key: 'organisation', label: 'Organisation' },
              { key: 'email',        label: 'Email' },
              { key: 'telephone',    label: 'Téléphone' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7A8D', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 5, fontFamily: 'var(--font-body)' }}>{label}</label>
                <input
                  type="text"
                  value={fields[key]}
                  onChange={e => set(key, e.target.value)}
                  placeholder="Optionnel"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', background: '#F8FAFD', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7A8D', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 5, fontFamily: 'var(--font-body)' }}>Type de profil</label>
              <select
                value={fields.type}
                onChange={e => set('type', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', background: '#F8FAFD', cursor: 'pointer' }}
              >
                <option value="">— Sélectionner (recommandé) —</option>
                {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#F8FAFD', fontSize: 12, color: '#6B7A8D', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {generatedUrl}
            </div>
            <button
              onClick={copy}
              disabled={!hasParams}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8, border: 'none',
                fontSize: 13, fontWeight: 600, cursor: hasParams ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
                background: copied ? '#1C7A4D' : hasParams ? '#0A1937' : '#E2E8F0',
                color: hasParams ? '#fff' : '#9CA3AF',
                transition: 'background .15s',
              }}
            >
              {copied ? <><Check size={13} /> Copié !</> : <><Copy size={13} /> Copier le lien</>}
            </button>
          </div>
          {!hasParams && (
            <p style={{ marginTop: 8, fontSize: 11.5, color: '#9CA3AF', fontFamily: 'var(--font-body)' }}>Remplissez au moins un champ pour générer un lien personnalisé.</p>
          )}
        </div>
      )}
    </div>
  )
}

const MODULES = [
  { icon: Building2, title: 'Registre des Entreprises',      desc: 'Gérez les entreprises nationales et internationales recensées.',            to: '/admin/entreprises' },
  { icon: Truck,     title: 'Inventaire des Équipements',    desc: "Accédez à l'inventaire national des équipements avec carte SIG intégrée.", to: '/admin/equipements' },
  { icon: Landmark,  title: "Projets Sectoriels de l'État",  desc: "Suivez les projets d'investissement public classés par secteur.",           to: '/admin/projets-publics' },
  { icon: Factory,   title: 'Projets Structurants Privés',   desc: 'Gérez les projets du secteur privé sur le territoire national.',           to: '/admin/projets-prives' },
]

function HeroCard({ navigate }) {
  const cardRef    = useRef(null)
  const rafRef     = useRef(null)
  const targetRef  = useRef({ x: 0.5, y: 0.5 })
  const currentRef = useRef({ x: 0.5, y: 0.5 })
  const [pos, setPos]       = useState({ x: 0.5, y: 0.5 })
  const [inside, setInside] = useState(false)

  useEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t
    const tick = () => {
      const cx = lerp(currentRef.current.x, targetRef.current.x, 0.07)
      const cy = lerp(currentRef.current.y, targetRef.current.y, 0.07)
      if (Math.abs(cx - currentRef.current.x) > 0.0004 || Math.abs(cy - currentRef.current.y) > 0.0004) {
        currentRef.current = { x: cx, y: cy }
        setPos({ x: cx, y: cy })
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const onMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    targetRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top)  / rect.height,
    }
    setInside(true)
  }

  const onMouseLeave = () => {
    targetRef.current = { x: 0.5, y: 0.5 }
    setInside(false)
  }

  const px = (pos.x - 0.5) * -22
  const py = (pos.y - 0.5) * -12
  const sx = inside ? pos.x * 100 : 62
  const sy = inside ? pos.y * 100 : 38

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'relative', borderRadius: 18, overflow: 'hidden',
        minHeight: 320, marginBottom: 20,
        boxShadow: '0 6px 32px rgba(0,0,0,.22)',
        cursor: 'default',
        background: '#040D18',
      }}
    >
      {/* ── Image Simandou avec parallaxe ── */}
      <div style={{
        position: 'absolute',
        inset: '-8% -5%',
        backgroundImage: 'url(/simandou_hero.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 28%',
        transform: `translate(${px}px, ${py}px)`,
        transition: 'transform .05s linear',
        filter: 'brightness(.50) saturate(1.15) contrast(1.06)',
        willChange: 'transform',
      }} />

      {/* ── Dégradé de protection texte ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          linear-gradient(110deg,
            rgba(4,13,24,.93) 0%,
            rgba(4,13,24,.80) 42%,
            rgba(4,13,24,.42) 70%,
            rgba(4,13,24,.15) 100%
          )
        `,
        pointerEvents: 'none',
      }} />

      {/* ── Spotlight doré ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse 50% 55% at ${sx}% ${sy}%, rgba(0,121,140,.13) 0%, transparent 65%)`,
        transition: inside ? 'none' : 'background .6s ease-out',
        pointerEvents: 'none',
        mixBlendMode: 'screen',
      }} />

      {/* ── Glow de coin ── */}
      <div style={{
        position: 'absolute', top: -80, right: -60,
        width: 380, height: 380, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,121,140,.09), transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* ── Contenu ── */}
      <div style={{ position: 'relative', zIndex: 2 }} className="p-5 md:p-10">
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,.22)',
          borderRadius: 100, padding: '6px 16px',
          marginBottom: 20, color: 'white',
          fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase'
        }}>
          🏛 Forum de Remobilisation du Contenu Local
        </div>

        <h1 style={{
          fontFamily: "var(--font-body)", fontWeight: 700,
          fontSize: 'clamp(22px, 2.8vw, 36px)', color: 'white',
          lineHeight: 1.2, maxWidth: '18ch', marginBottom: 14,
        }}>
          Système National d'Information sur les Capacités Techniques
        </h1>

        <p style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', maxWidth: '55ch', lineHeight: 1.65, marginBottom: 26 }}>
          Une plateforme gouvernementale centralisée pour recenser, analyser et cartographier les
          capacités industrielles, les équipements disponibles et les projets structurants en République de Guinée.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/admin/entreprises')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--koma-red)', color: 'white', border: 'none', cursor: 'pointer',
              borderRadius: 9, padding: '11px 20px', fontSize: 13.5, fontWeight: 600,
              fontFamily: 'var(--font-body)',
              transition: 'background .15s, transform .15s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'var(--koma-red-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'var(--koma-red)'; e.currentTarget.style.transform = 'none' }}
          >
            <Building2 size={16} /> Registre Entreprises
          </button>
          <button
            onClick={() => navigate('/admin/carte-sig')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,.10)', color: 'white',
              border: '1px solid rgba(255,255,255,.25)', backdropFilter: 'blur(8px)',
              cursor: 'pointer', borderRadius: 9, padding: '11px 20px',
              fontSize: 13.5, fontWeight: 600, fontFamily: "var(--font-body)",
              transition: 'background .15s, transform .15s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,.18)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,.10)'; e.currentTarget.style.transform = 'none' }}
          >
            <Map size={16} /> Carte SIG des Équipements
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statsApi.getSummary()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const s = stats || { entreprises: { total: 0 }, equipements: { total: 0 }, projets_publics: 0, projets_prives: 0 }

  const STATS = [
    { value: s.entreprises?.total  ?? 0, label: 'Entreprises Recensées',      icon: Building2 },
    { value: s.equipements?.total  ?? 0, label: 'Équipements Disponibles',    icon: Truck },
    { value: s.projets_publics     ?? 0, label: 'Projets Publics',            icon: Landmark },
    { value: s.projets_prives      ?? 0, label: 'Projets Structurants Privés',icon: Factory },
  ]

  return (
    <div style={{ background: '#F0F4F8', minHeight: '100vh' }} className="p-3 md:p-5">

      <HeroCard navigate={navigate} />

      {/* ── Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
        {STATS.map(({ value, label, icon: Icon }) => (
          <div key={label} style={{
            background: 'white', borderRadius: 14,
            padding: '20px 22px', border: '1px solid rgba(0,0,0,.07)',
            boxShadow: '0 1px 4px rgba(0,0,0,.05)'
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: 'var(--koma-teal-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 14
            }}>
              <Icon size={20} color="#00798C" />
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#0A1937', lineHeight: 1, marginBottom: 5 }}>
              {loading
                ? <span style={{ display: 'inline-block', width: 60, height: 28, borderRadius: 6, background: 'var(--koma-teal-light)' }} />
                : value.toLocaleString('fr-FR')}
            </div>
            <p style={{ fontSize: 13, color: '#6B7A8D', fontWeight: 500 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Modules principaux ────────────────────────────── */}
      <div style={{ background: 'white', borderRadius: 14, padding: '24px 26px', border: '1px solid rgba(0,0,0,.07)', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0A1937', marginBottom: 4, fontFamily: "var(--font-body)" }}>
          Modules Principaux
        </h2>
        <p style={{ fontSize: 13.5, color: '#6B7A8D', marginBottom: 20 }}>
          Explorez les différents registres et bases de données de la plateforme nationale.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {MODULES.map(({ icon: Icon, title, desc, to }) => (
            <button key={to} onClick={() => navigate(to)} style={{
              background: '#F8FAFD', border: '1px solid #E2E8F0',
              borderRadius: 12, padding: '18px 18px', textAlign: 'left',
              cursor: 'pointer', transition: 'all .2s', fontFamily: "var(--font-body)"
            }}
              onMouseOver={e => { e.currentTarget.style.background = 'var(--koma-teal-light)'; e.currentTarget.style.borderColor = 'var(--koma-teal)' }}
              onMouseOut={e => { e.currentTarget.style.background = '#F8FAFD'; e.currentTarget.style.borderColor = '#E2E8F0' }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 9, background: 'var(--koma-teal-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12
              }}>
                <Icon size={18} color="#00798C" />
              </div>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: '#0A1937', marginBottom: 5, lineHeight: 1.3 }}>{title}</p>
              <p style={{ fontSize: 12.5, color: '#6B7A8D', lineHeight: 1.5 }}>{desc}</p>
            </button>
          ))}
        </div>

        <InviteGenerator />
      </div>
    </div>
  )
}
