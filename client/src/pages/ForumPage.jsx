import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../lib/api'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ContactModal from '../components/ui/ContactModal'

// Palette tirée du logo du Forum de Remobilisation
const TEAL      = '#3AB5D8'   // cyan / bleu ciel
const TEAL_D    = '#1B3C6E'   // bleu marine profond
const TEAL_L    = '#EBF5FB'   // bleu très clair
const RED       = '#D97830'   // orange logo
const RED_H     = '#C06820'   // orange foncé hover
const GREEN     = '#2E7D32'   // vert "Projet Simandou"
const GREEN_L   = '#EBF5EB'   // vert très clair
const TEXT      = '#1a2a3a'   // texte marine sombre
const GRAY_BG   = '#F4F7FB'   // fond bleu-gris très clair
const FH        = 'var(--font-heading)'
const FB        = 'var(--font-body)'

const FORUM_DATE = new Date('2026-07-22T09:00:00')

function useCountdown(target) {
  const calc = () => {
    const diff = target - Date.now()
    if (diff <= 0) return { jours: 0, heures: 0, minutes: 0, secondes: 0, ended: true }
    return {
      jours:    Math.floor(diff / 86400000),
      heures:   Math.floor((diff % 86400000) / 3600000),
      minutes:  Math.floor((diff % 3600000)  / 60000),
      secondes: Math.floor((diff % 60000)    / 1000),
      ended: false,
    }
  }
  const [time, setTime] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

const TYPE_STYLES = {
  ouverture: { bg: TEAL_D,   color: '#fff',  label: 'Ouverture' },
  keynote:   { bg: TEAL,     color: '#fff',  label: 'Keynote'   },
  session:   { bg: TEAL_L,   color: TEAL,    label: 'Session'   },
  atelier:   { bg: GREEN_L,  color: GREEN,   label: 'Atelier'   },
  pause:     { bg: '#F3F4F6',color: '#6b7280',label: 'Pause'    },
  cloture:   { bg: '#FEF4EC',color: RED,     label: 'Clôture'   },
}

const CAT_COLORS = { platine: '#c0c4cc', or: TEAL, argent: '#9ca3af', partenaire: '#d1d5db' }

// ── Composants de mise en page ─────────────────────────────────
function Section({ id, children, style = {} }) {
  return <section id={id} style={{ padding: '80px 0', ...style }}>{children}</section>
}

function Container({ children }) {
  return <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>{children}</div>
}

function Eyebrow({ children }) {
  return (
    <span style={{
      display: 'inline-block', background: TEAL_L, color: TEAL,
      fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase',
      padding: '5px 14px', borderRadius: 20, marginBottom: 14, fontFamily: FB,
    }}>
      {children}
    </span>
  )
}

function SectionHead({ tag, title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', marginBottom: 52 }}>
      <Eyebrow>{tag}</Eyebrow>
      <h2 style={{ fontSize: 'clamp(24px,3.5vw,34px)', fontWeight: 800, color: TEXT, margin: '0 0 14px', fontFamily: FH }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 600, margin: '0 auto', lineHeight: 1.7, fontFamily: FB }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

function FAQItem({ question, reponse }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid #e5e7eb' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: TEXT, fontFamily: FH }}>{question}</span>
        <span style={{
          flexShrink: 0, width: 26, height: 26, borderRadius: '50%',
          background: open ? TEAL : TEAL_L, color: open ? '#fff' : TEAL,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, transition: 'all .2s',
        }}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <p style={{ margin: '0 0 20px', fontSize: 14.5, color: '#4b5563', lineHeight: 1.75, paddingRight: 40, fontFamily: FB }}>
          {reponse}
        </p>
      )}
    </div>
  )
}

const TYPE_LABELS = { ouverture: 'Ouverture', keynote: 'Keynote', session: 'Session', atelier: 'Atelier', pause: 'Pause', cloture: 'Clôture' }

// Agenda prévisionnel — Forum national Simandou 2040
const PROGRAMME_STATIC = [
  // ── Jour 1 ──────────────────────────────────────────────────
  { id:'j1-1',  jour:1, heure_debut:'09:00', heure_fin:'09:15', type:'ouverture', titre:'Cérémonie d\'accueil — Mot de bienvenue', description:null, salle:'Salle plénière', forum_intervenants:{ nom:'M. François Brouno', titre:'Président de la Task Force de la Rémobilisation CSS' } },
  { id:'j1-2',  jour:1, heure_debut:'09:15', heure_fin:'09:30', type:'pause',     titre:'Prestation artistique', description:null, salle:null, forum_intervenants:null },
  { id:'j1-3',  jour:1, heure_debut:'09:30', heure_fin:'09:45', type:'ouverture', titre:'Cérémonie officielle d\'ouverture — Discours d\'ouverture', description:null, salle:'Salle plénière', forum_intervenants:{ nom:'M. le Ministre Directeur de Cabinet de la Présidence', titre:'Président du Comité Stratégique Simandou' } },
  { id:'j1-4',  jour:1, heure_debut:'10:00', heure_fin:'10:30', type:'keynote',   titre:'Session plénière 1 — Les réalisations du projet Simandou : quelles capacités pour les futurs projets nationaux ?', description:'Présentation des infrastructures majeures réalisées (corridor ferroviaire, port en eau profonde, ouvrages d\'art, chemin de fer) · Analyse de la mobilisation industrielle, logistique, technique et humaine mise en œuvre durant le projet.', salle:'Salle plénière', forum_intervenants:{ nom:'M. Mamoudou Nagnalen BARRY', titre:'Président du CA — Compagnie du TransGuinéen (CTG)' } },
  { id:'j1-5',  jour:1, heure_debut:'10:45', heure_fin:'11:15', type:'keynote',   titre:'Session plénière 2 — Vision nationale des infrastructures 2026-2040', description:'Présentation des priorités nationales en matière d\'infrastructures et des grands projets inscrits dans la Vision Guinée 2040.', salle:'Salle plénière', forum_intervenants:{ nom:'M. Mamadou Angelo DIALLO', titre:'Délégué Général de la Delivery Unit' } },
  { id:'j1-6',  jour:1, heure_debut:'11:15', heure_fin:'11:45', type:'keynote',   titre:'Session plénière 3 — Présentation du parcours de l\'investisseur', description:null, salle:'Salle plénière', forum_intervenants:{ nom:'M. Namory CAMARA', titre:'Directeur Général — GDB' } },
  { id:'j1-7',  jour:1, heure_debut:'12:00', heure_fin:'12:30', type:'pause',     titre:'Photo officielle — Pause-café', description:null, salle:null, forum_intervenants:null },
  { id:'j1-8',  jour:1, heure_debut:'12:30', heure_fin:'14:00', type:'pause',     titre:'Déjeuner', description:null, salle:null, forum_intervenants:null },
  { id:'j1-9',  jour:1, heure_debut:'14:30', heure_fin:'16:00', type:'session',   titre:'Panel 1 — Opportunités de remobilisation des entreprises sur les projets prioritaires', description:'Modérateur : M. Yaya SOW, Conseiller Infrastructures à la Présidence. Panélistes : Mme Yariatou CAMARA (DG DGPIP) · M. Amadou DIALLO (Conseiller Suivi-Évaluation, Min. Infrastructures) · M. Moïse SIDIBÉ (DG AGEROUTE) · M. Ibrahima Abé DIALLO (Admin. Général ACGP) · M. Mamadou Angelo DIALLO (Delivery Unit) · M. Aly KABA (PDG GPC).', salle:'Salle A', forum_intervenants:{ nom:'M. Yaya SOW — Modérateur', titre:'Conseiller Infrastructures à la Présidence de la République' } },
  { id:'j1-10', jour:1, heure_debut:'14:30', heure_fin:'16:00', type:'session',   titre:'Panel 2 — Alignement des financements sur les priorités nationales et opportunités de marchés', description:'Modérateur : Dr Mohamed Lamine DOUMBOUYA, Coordinateur MAMRI. Panélistes : Mme Maïmouna DIAKHABY (Conseillère à la Présidence) · M. Aboubacar DIAKITE (DNF, Min. Économie) · M. Alpha Boubacar DIALLO (BID) · M. Diawadou BARRY (APB) · M. Moussa II KAMISSOKO (BNIG) · M. Issa DIAW (Banque mondiale) · M. ZANKLI Laté Dodji LAWSON (BAD).', salle:'Salle B', forum_intervenants:{ nom:'Dr Mohamed Lamine DOUMBOUYA — Modérateur', titre:'Coordinateur de la MAMRI' } },
  { id:'j1-11', jour:1, heure_debut:'16:00', heure_fin:'18:00', type:'pause',     titre:'Cocktail de réseautage', description:null, salle:null, forum_intervenants:null },
  // ── Jour 2 ──────────────────────────────────────────────────
  { id:'j2-1',  jour:2, heure_debut:'09:00', heure_fin:'12:00', type:'atelier',   titre:'Atelier 1 — Infrastructures routières', description:'Modérateur : Karim BARRY · Présentateur : DG BSD du Ministère des Infrastructures · Tronçons prioritaires et portefeuille du projet routier dans le cadre du programme Simandou 2040.', salle:'Salle A', forum_intervenants:null },
  { id:'j2-2',  jour:2, heure_debut:'09:00', heure_fin:'12:00', type:'atelier',   titre:'Atelier 2 — Infrastructures ferroviaires et portuaires', description:'Modérateur : Ibrahima Ahmed BARRY · Animateurs : DG PAC / DG SNCFG / DG ANAIM · Corridors ferroviaires stratégiques et modernisation des ports guinéens.', salle:'Salle B', forum_intervenants:null },
  { id:'j2-3',  jour:2, heure_debut:'09:00', heure_fin:'12:00', type:'atelier',   titre:'Atelier 3 — Énergie, Assainissement, Hydraulique et Hydrocarbures', description:'Modérateur : Aissatou SANÉ · Animateurs : SG Ministère de l\'Énergie · SG Ministère de l\'Assainissement, de l\'Hydraulique et des Hydrocarbures.', salle:'Salle C', forum_intervenants:null },
  { id:'j2-4',  jour:2, heure_debut:'09:00', heure_fin:'12:00', type:'atelier',   titre:'Atelier 4 — Aménagement urbain et infrastructures sociales', description:'Modérateur : Nana DIABY · Animateur : DG BSD MUHAT · Voirie urbaine, assainissement, bâtiments publics et équipements publics.', salle:'Salle D', forum_intervenants:null },
  { id:'j2-5',  jour:2, heure_debut:'12:00', heure_fin:'14:00', type:'pause',     titre:'Déjeuner', description:null, salle:null, forum_intervenants:null },
  { id:'j2-6',  jour:2, heure_debut:'14:00', heure_fin:'15:00', type:'session',   titre:'Rencontres d\'affaires (B2B & B2G)', description:'Sessions de mise en relation entre les entreprises, les maîtres d\'ouvrage, les investisseurs et les institutions publiques.', salle:'Salle plénière', forum_intervenants:null },
  { id:'j2-7',  jour:2, heure_debut:'15:00', heure_fin:'16:00', type:'session',   titre:'Cérémonie de signatures', description:'Protocoles d\'accord (MoU) · Conventions-cadres · Lettres d\'intention · Accords de partenariat.', salle:'Salle plénière', forum_intervenants:null },
  { id:'j2-8',  jour:2, heure_debut:'16:00', heure_fin:'16:30', type:'session',   titre:'Adoption du communiqué final', description:'Présentation et adoption des principales recommandations du Forum.', salle:'Salle plénière', forum_intervenants:null },
  { id:'j2-9',  jour:2, heure_debut:'16:30', heure_fin:'17:00', type:'cloture',   titre:'Cérémonie officielle de clôture', description:'Discours de clôture : Monsieur le Premier Ministre ou son représentant.', salle:'Salle plénière', forum_intervenants:null },
  { id:'j2-10', jour:2, heure_debut:'17:00', heure_fin:null,    type:'pause',     titre:'Cocktail de clôture et réseautage', description:null, salle:null, forum_intervenants:null },
]

// ── Page principale ────────────────────────────────────────────
export default function ForumPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const CHIFFRES        = t('forum.chiffres',         { returnObjects: true })
  const THEMES          = t('forum.themes',            { returnObjects: true })
  const FAQ             = t('forum.faq',               { returnObjects: true })
  const AGENDA_I18N     = t('forum.agenda',            { returnObjects: true })
  const SPONSOR_REASONS = t('forum.sponsoringReasons', { returnObjects: true })
  const PACKS           = t('forum.packs',             { returnObjects: true })
  const { jours, heures, minutes, secondes, ended } = useCountdown(FORUM_DATE)
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [activeDay, setActiveDay] = useState(1)
  const [contactModal, setContactModal] = useState({ open: false, subject: '' })
  const openContact = (subject = '') => setContactModal({ open: true, subject })
  const retryCount = useRef(0)

  const CACHE_KEY = 'forum_data_v1'
  const CACHE_TTL = 5 * 60 * 1000

  const loadData = async (attempt = 0) => {
    setFetchError(false)

    // Affiche le cache immédiatement si disponible
    if (attempt === 0) {
      try {
        const raw = sessionStorage.getItem(CACHE_KEY)
        if (raw) {
          const { ts, payload } = JSON.parse(raw)
          const hasContent = payload && Object.values(payload).some(v => Array.isArray(v) && v.length > 0)
          if (hasContent && Date.now() - ts < CACHE_TTL) {
            setData(payload)
            setLoading(false)
            fetch('/api/forum-content')
              .then(r => r.ok ? r.json() : null)
              .then(d => { if (d) { setData(d); sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), payload: d })) } })
              .catch(() => {})
            return
          }
        }
      } catch {}
    }

    setLoading(true)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const d = await api.get('/forum-content', { signal: controller.signal })
      clearTimeout(timeout)
      setData(d)
      retryCount.current = 0
      try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), payload: d })) } catch {}
    } catch (err) {
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, 1500))
        return loadData(attempt + 1)
      }
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const downloadAgenda = async () => {
    if (!programme?.length) return
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ])
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const teal = [0, 121, 140]
    const dark = [0, 38, 59]

    doc.setFillColor(...dark)
    doc.rect(0, 0, 210, 28, 'F')
    doc.setFillColor(...teal)
    doc.rect(0, 28, 210, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Forum de Remobilisation Simandou 2040', 14, 13)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...teal)
    doc.text('PROGRAMME OFFICIEL — KOMA · Chapiteaux By Issa, Conakry', 14, 22)

    let y = 38
    ;[1, 2, 3].forEach(jour => {
      const items = programme.filter(p => p.jour === jour)
      if (!items.length) return
      if (y > 240) { doc.addPage(); y = 20 }
      doc.setFillColor(...dark)
      doc.roundedRect(14, y, 182, 10, 2, 2, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(`Jour ${jour}`, 20, y + 7)
      y += 14
      autoTable(doc, {
        startY: y,
        head: [['Heure', 'Type', 'Titre', 'Salle']],
        body: items.map(i => [
          `${i.heure_debut?.slice(0, 5) || ''}${i.heure_fin ? `\n${i.heure_fin.slice(0, 5)}` : ''}`,
          TYPE_LABELS[i.type] || i.type || '',
          i.titre + (i.description ? `\n${i.description}` : '') + (i.forum_intervenants?.nom ? `\n🎙 ${i.forum_intervenants.nom}` : ''),
          i.salle || '',
        ]),
        headStyles: { fillColor: teal, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
        bodyStyles: { fontSize: 8.5, cellPadding: 3 },
        columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 22 }, 2: { cellWidth: 118 }, 3: { cellWidth: 20 } },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 },
        theme: 'grid',
        didDrawPage: (hookData) => { y = hookData.cursor.y + 10 },
      })
      y = doc.lastAutoTable.finalY + 10
    })

    const pages = doc.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      doc.setTextColor(180, 180, 180)
      doc.setFontSize(8)
      doc.text(`Page ${i} / ${pages} — koma-gn.com`, 14, 290)
    }
    doc.save('agenda-forum-simandou-2040.pdf')
  }

  // ── Skeletons ──
  if (loading) return (
    <div style={{ fontFamily: FB }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <Navbar />
      <div style={{ background: TEAL_D, minHeight: '60vh', display: 'flex', alignItems: 'center', padding: '120px 24px 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          <div style={{ width: 200, height: 28, borderRadius: 20, background: 'rgba(255,255,255,.1)', marginBottom: 24 }} />
          <div style={{ width: '60%', height: 56, borderRadius: 10, background: 'rgba(255,255,255,.1)', marginBottom: 16 }} />
          <div style={{ width: '40%', height: 56, borderRadius: 10, background: 'rgba(255,255,255,.08)', marginBottom: 32 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 200, height: 48, borderRadius: 12, background: 'rgba(0,121,140,.4)' }} />
            <div style={{ width: 160, height: 48, borderRadius: 12, background: 'rgba(255,255,255,.1)' }} />
          </div>
        </div>
      </div>
      <div style={{ background: TEAL_D, padding: '48px 24px', opacity: .6 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 2 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ textAlign: 'center', padding: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.08)', margin: '0 auto 12px' }} />
              <div style={{ width: 80, height: 36, borderRadius: 6, background: 'rgba(255,255,255,.1)', margin: '0 auto 8px' }} />
              <div style={{ width: 120, height: 14, borderRadius: 4, background: 'rgba(255,255,255,.06)', margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // ── Erreur ──
  if (fetchError) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, background: GRAY_BG, paddingTop: 120 }}>
      <Navbar />
      <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
      <p style={{ fontSize: 16, color: TEXT, fontWeight: 600, margin: 0, fontFamily: FH }}>{t('forum.errorLoad')}</p>
      <p style={{ fontSize: 14, color: '#9ca3af', margin: 0, fontFamily: FB }}>{t('forum.errorNetwork')}</p>
      <button onClick={() => loadData(0)} style={{ background: RED, color: '#fff', border: 'none', borderRadius: 10, padding: '11px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FB, marginTop: 8 }}
        onMouseOver={e => e.currentTarget.style.background = RED_H}
        onMouseOut={e => e.currentTarget.style.background = RED}
      >
        {t('forum.errorRetry')}
      </button>
    </div>
  )

  const JOURS       = [t('forum.day1'), t('forum.day2')]
  const CAT_LABELS  = { platine: t('forum.catPlatine'), or: t('forum.catOr'), argent: t('forum.catArgent'), partenaire: t('forum.catPartenaire') }
  const programme   = data?.programme?.length > 0 ? data.programme : (Array.isArray(AGENDA_I18N) ? AGENDA_I18N : PROGRAMME_STATIC)
  const progJour    = programme.filter(p => p.jour === activeDay)
  const sponsors    = (data?.sponsors || []).filter(s => s.categorie !== 'exposant')
  const exposants   = (data?.sponsors || []).filter(s => s.categorie === 'exposant')
  const sponsorsGrouped = sponsors.reduce((acc, s) => {
    if (!acc[s.categorie]) acc[s.categorie] = []
    acc[s.categorie].push(s)
    return acc
  }, {})

  return (
    <div style={{ fontFamily: FB }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <ContactModal
        open={contactModal.open}
        onClose={() => setContactModal({ open: false, subject: '' })}
        defaultSubject={contactModal.subject}
      />
      <Navbar />

      {/* ── HERO ── */}
      <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', background: TEAL_D, overflow: 'hidden', paddingTop: 100 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/simandou_hero.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 30%', filter: 'brightness(.3) saturate(1.1)' }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, rgba(0,38,59,.3) 0%, rgba(0,38,59,.85) 100%)` }} />

        <Container>
          <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src="/logo-forum.png"
              alt="Forum de Remobilisation des Équipements et des Sociétés du Projet Simandou"
              style={{ width: 'min(420px, 85vw)', height: 'auto', objectFit: 'contain', margin: '0 auto 20px' }}
            />

            <p style={{ fontSize: 18, color: 'rgba(255,255,255,.72)', lineHeight: 1.7, margin: '0 auto 20px', maxWidth: 560, fontFamily: FB }}>
              {t('forum.heroDesc')}
            </p>

            {/* Dates */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 40, padding: '10px 24px', marginBottom: 32 }}>
              <span style={{ fontSize: 18, color: '#fff' }}>📅</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: FB, letterSpacing: '.02em' }}>22 – 23 Juillet 2026</span>
              <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,.3)' }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', fontFamily: FB }}>Conakry, Guinée</span>
            </div>

            {/* Compte à rebours */}
            {!ended && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[
                  { v: jours,    l: 'Jours' },
                  { v: heures,   l: 'Heures' },
                  { v: minutes,  l: 'Min' },
                  { v: secondes, l: 'Sec' },
                ].map(({ v, l }, i) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ minWidth: 60, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)', borderRadius: 12, padding: '10px 8px' }}>
                        <span style={{ display: 'block', fontFamily: FH, fontWeight: 800, fontSize: 30, lineHeight: 1, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>
                          {String(v).padStart(2, '0')}
                        </span>
                      </div>
                      <span style={{ display: 'block', marginTop: 6, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600, color: 'rgba(255,255,255,.45)', fontFamily: FB }}>
                        {l}
                      </span>
                    </div>
                    {i < 3 && <span style={{ marginBottom: 20, fontSize: 22, color: 'rgba(255,255,255,.3)', fontWeight: 300 }}>:</span>}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
              <button
                onClick={() => navigate('/forum/inscription')}
                style={{ background: RED, color: '#fff', border: 'none', borderRadius: 12, padding: '15px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', letterSpacing: '.03em', transition: 'all .2s', boxShadow: '0 8px 24px rgba(214,62,68,.4)', fontFamily: FB }}
                onMouseOver={e => e.currentTarget.style.background = RED_H}
                onMouseOut={e => e.currentTarget.style.background = RED}
              >
                {t('forum.registerFree')}
              </button>
              <a href="#programme" style={{ background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(8px)', color: 'white', border: '1px solid rgba(255,255,255,.2)', borderRadius: 12, padding: '15px 28px', fontSize: 15, fontWeight: 600, textDecoration: 'none', fontFamily: FB }}>
                {t('forum.programme')}
              </a>
            </div>

            {/* Logos institutionnels */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,.15)', marginTop: 40, paddingTop: 24, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              {/* Rang 1 : Présidence + Comité */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(16px,3vw,40px)', flexWrap: 'wrap' }}>
                <img src="/logo-presidence.png" alt="Présidence de la République de Guinée" style={{ height: 'clamp(60px,9vw,110px)', width: 'auto', objectFit: 'contain' }} />
                <img src="/logo-css.png" alt="Comité Stratégique de Simandou" style={{ height: 'clamp(60px,9vw,110px)', width: 'auto', objectFit: 'contain' }} />
              </div>
              {/* Rang 2 : Les 2 Ministères */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(14px,2.5vw,32px)', flexWrap: 'wrap' }}>
                <img src="/logo-mmg.png" alt="Ministère des Mines et de la Géologie" style={{ height: 'clamp(42px,6vw,72px)', width: 'auto', objectFit: 'contain' }} />
                <img src="/logo-mi.png" alt="Ministère des Infrastructures" style={{ height: 'clamp(42px,6vw,72px)', width: 'auto', objectFit: 'contain' }} />
              </div>
              {/* Rang 3 : ACGP · TransGuinéen · Delivery Unit */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(14px,2.5vw,32px)', flexWrap: 'wrap' }}>
                <img src="/logo-acgp.png" alt="ACGP" style={{ height: 'clamp(36px,5vw,62px)', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                <img src="/logo-ctg.png" alt="Compagnie du TransGuinéen" style={{ height: 'clamp(36px,5vw,56px)', width: 'auto', objectFit: 'contain' }} />
                <img src="/logo-delivery-unit.png" alt="Delivery Unit" style={{ height: 'clamp(46px,6.5vw,80px)', width: 'auto', objectFit: 'contain' }} />
              </div>
            </div>
          </div>
        </Container>

      </div>

      {/* ── CHIFFRES CLÉS ── */}
      {Array.isArray(CHIFFRES) && CHIFFRES.length > 0 && (
        <Section style={{ background: TEAL_D, padding: '60px 0' }}>
          <Container>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2 }}>
              {CHIFFRES.map((c, i) => {
                const accent = [RED, '#52A840', TEAL, GREEN][i % 4]
                return (
                <div key={i} style={{ textAlign: 'center', padding: '32px 24px' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{c.icone}</div>
                  <div style={{ fontSize: 'clamp(36px,5vw,52px)', fontWeight: 800, color: accent, lineHeight: 1, marginBottom: 8, fontFamily: FH }}>{c.valeur}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, fontFamily: FB }}>{c.label}</div>
                </div>
              )})}
            </div>
          </Container>
        </Section>
      )}

      {/* ── THÉMATIQUES ── */}
      {Array.isArray(THEMES) && THEMES.length > 0 && (
        <Section id="themes" style={{ background: GRAY_BG }}>
          <Container>
            <SectionHead tag={t('forum.themesTag')} title={t('forum.themesTitle')} subtitle={t('forum.themesSubtitle')} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px,100%), 1fr))', gap: 20 }}>
              {THEMES.map((theme, i) => (
                <div key={i}
                  style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', border: '1px solid #e5e7eb', transition: 'all .2s', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,.08)'; e.currentTarget.style.borderColor = TEAL }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.04)'; e.currentTarget.style.borderColor = '#e5e7eb' }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: TEAL_L, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>
                    {theme.icone}
                  </div>
                  <h3 style={{ fontSize: 15.5, fontWeight: 700, color: TEXT, margin: '0 0 10px', fontFamily: FH }}>{theme.titre}</h3>
                  {theme.description && <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.65, margin: 0, fontFamily: FB }}>{theme.description}</p>}
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ── INTERVENANTS ── */}
      {data?.intervenants?.length > 0 && (
        <Section id="intervenants" style={{ background: '#fff' }}>
          <Container>
            <SectionHead tag={t('forum.intervenantsTag')} title={t('forum.intervenantsTitle')} subtitle={t('forum.intervenantsSubtitle')} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px,100%), 1fr))', gap: 24 }}>
              {data.intervenants.map(p => (
                <div key={p.id} style={{ textAlign: 'center', background: GRAY_BG, borderRadius: 20, padding: '32px 20px 24px', border: '1px solid #e5e7eb', transition: 'border-color .2s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = TEAL}
                  onMouseOut={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                >
                  {p.photo_url ? (
                    <img src={p.photo_url} alt={p.nom} style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', marginBottom: 16, border: `3px solid ${TEAL}` }} />
                  ) : (
                    <div style={{ width: 88, height: 88, borderRadius: '50%', background: `linear-gradient(135deg, ${TEAL_D}, ${TEAL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: `3px solid ${TEAL}` }}>
                      <span style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{p.nom.charAt(0)}</span>
                    </div>
                  )}
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: '0 0 4px', fontFamily: FH }}>{p.nom}</h3>
                  {p.titre && <p style={{ fontSize: 12.5, color: TEAL, fontWeight: 600, margin: '0 0 4px', fontFamily: FB }}>{p.titre}</p>}
                  {p.organisation && <p style={{ fontSize: 12, color: '#6b7280', margin: 0, fontFamily: FB }}>{p.organisation}</p>}
                  {p.biographie && (
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: '12px 0 0', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: FB }}>
                      {p.biographie}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ── PROGRAMME ── */}
      {programme.length > 0 && (
        <Section id="programme" style={{ background: GRAY_BG }}>
          <Container>
            <SectionHead tag={t('forum.programmeTag')} title={t('forum.programmeTitle')} subtitle={t('forum.programmeSubtitle')} />

            {/* Bouton téléchargement */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32, marginTop: -20 }}>
              <a
                href="/agenda-forum-simandou-2026.pdf"
                download="Agenda-Forum-Simandou-2026.pdf"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: TEAL_D, color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '11px 22px', fontSize: 13.5, fontWeight: 600, fontFamily: FB, transition: 'all .2s', boxShadow: `0 4px 12px rgba(0,38,59,.2)` }}
                onMouseOver={e => { e.currentTarget.style.background = '#003d5c'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseOut={e => { e.currentTarget.style.background = TEAL_D; e.currentTarget.style.transform = 'none' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                {t('forum.downloadAgenda')}
              </a>
            </div>

            {/* Sélecteur de jour */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
              {JOURS.map((j, i) => (
                <button key={i} onClick={() => setActiveDay(i + 1)} style={{
                  padding: '10px 28px', borderRadius: 40, border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 600, fontFamily: FB, transition: 'all .2s',
                  background: activeDay === i + 1 ? TEAL_D : '#fff',
                  color: activeDay === i + 1 ? '#fff' : '#6b7280',
                  boxShadow: activeDay === i + 1 ? `0 4px 16px rgba(0,38,59,.25)` : '0 1px 4px rgba(0,0,0,.08)',
                }}>
                  {j}
                </button>
              ))}
            </div>

            {/* Timeline */}
            <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
              <div style={{ position: 'absolute', left: 80, top: 0, bottom: 0, width: 2, background: `rgba(0,121,140,.15)` }} />
              {progJour.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0', fontFamily: FB }}>{t('forum.programmeComing')}</p>
              ) : progJour.map(item => {
                const ts = TYPE_STYLES[item.type] || TYPE_STYLES.session
                return (
                  <div key={item.id} style={{ display: 'flex', gap: 24, marginBottom: 24, alignItems: 'flex-start' }}>
                    <div style={{ width: 72, flexShrink: 0, textAlign: 'right' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: TEAL, fontFamily: FB }}>{item.heure_debut?.slice(0, 5)}</span>
                      {item.heure_fin && <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: FB }}>{item.heure_fin?.slice(0, 5)}</div>}
                    </div>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: TEAL, border: '2px solid #fff', boxShadow: `0 0 0 3px rgba(0,121,140,.2)`, flexShrink: 0, marginTop: 3, zIndex: 1 }} />
                    <div style={{ flex: 1, background: '#fff', borderRadius: 14, padding: '16px 20px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 6 }}>
                        <span style={{ background: ts.bg, color: ts.color, fontSize: 10.5, fontWeight: 700, padding: '2px 10px', borderRadius: 12, letterSpacing: '.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', fontFamily: FB }}>
                          {ts.label}
                        </span>
                        {item.salle && <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: FB }}>📍 {item.salle}</span>}
                      </div>
                      <h4 style={{ margin: '0 0 4px', fontSize: 14.5, fontWeight: 700, color: TEXT, fontFamily: FH }}>{item.titre}</h4>
                      {item.description && <p style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.6, fontFamily: FB }}>{item.description}</p>}
                      {item.forum_intervenants && (
                        <p style={{ margin: '8px 0 0', fontSize: 12, color: TEAL, fontWeight: 600, fontFamily: FB }}>
                          🎙️ {item.forum_intervenants.nom}{item.forum_intervenants.titre ? ` — ${item.forum_intervenants.titre}` : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Container>
        </Section>
      )}

      {/* ── SPONSORS & PARTENAIRES ── */}
      {sponsors.length > 0 && (
        <Section id="sponsors" style={{ background: '#fff' }}>
          <Container>
            <SectionHead tag={t('forum.sponsorsTag')} title={t('forum.sponsorsTitle')} />
            {['platine', 'or', 'argent', 'partenaire'].map(cat => {
              const group = sponsorsGrouped[cat]
              if (!group?.length) return null
              return (
                <div key={cat} style={{ marginBottom: 48 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: CAT_COLORS[cat] }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: FB }}>{CAT_LABELS[cat]}</span>
                    <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
                    {group.map(s => (
                      <a key={s.id} href={s.site_url || '#'} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: GRAY_BG, border: '1px solid #e5e7eb', borderRadius: 14, padding: '20px 32px', minWidth: 160, minHeight: 80, textDecoration: 'none', transition: 'all .2s' }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,121,140,.12)` }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
                      >
                        {s.logo_url ? (
                          <img src={s.logo_url} alt={s.nom} style={{ maxHeight: 48, maxWidth: 140, objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: 14, fontWeight: 700, color: TEXT, fontFamily: FB }}>{s.nom}</span>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )
            })}
          </Container>
        </Section>
      )}

      {/* ── EXPOSANTS ── */}
      {exposants.length > 0 && (
        <Section id="exposants" style={{ background: GRAY_BG }}>
          <Container>
            <SectionHead tag={t('forum.exposantsTag')} title={t('forum.exposantsTitle')} subtitle={t('forum.exposantsSubtitle')} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px,100%), 1fr))', gap: 16 }}>
              {exposants.map(e => (
                <a key={e.id} href={e.site_url || '#'} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '24px 16px', textDecoration: 'none', transition: 'all .2s', minHeight: 100 }}
                  onMouseOver={el => { el.currentTarget.style.borderColor = TEAL; el.currentTarget.style.boxShadow = `0 4px 16px rgba(0,121,140,.1)`; el.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseOut={el => { el.currentTarget.style.borderColor = '#e5e7eb'; el.currentTarget.style.boxShadow = 'none'; el.currentTarget.style.transform = 'none' }}
                >
                  {e.logo_url ? (
                    <img src={e.logo_url} alt={e.nom} style={{ maxHeight: 44, maxWidth: 130, objectFit: 'contain' }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: TEAL_L, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏢</div>
                  )}
                  <span style={{ fontSize: 13, fontWeight: 600, color: TEXT, textAlign: 'center', fontFamily: FB }}>{e.nom}</span>
                </a>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* FAQ retiré à la demande du client */}

      {/* ── SPONSORING ── */}
      <Section id="sponsoring" style={{ background: GRAY_BG }}>
        <Container>
          <SectionHead
            tag={t('forum.sponsoringTag')}
            title={t('forum.sponsoringTitle')}
            subtitle={t('forum.sponsoringSubtitle')}
          />

          {/* Pourquoi devenir partenaire */}
          <div style={{ background: TEAL_D, borderRadius: 20, padding: '36px 32px', marginBottom: 48 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 24px', fontFamily: FH }}>
              {t('forum.sponsoringWhyTitle')}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px,100%), 1fr))', gap: 16 }}>
              {Array.isArray(SPONSOR_REASONS) && SPONSOR_REASONS.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, background: TEAL, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, fontFamily: FB }}>{String(i+1).padStart(2,'0')}</span>
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: 13.5, fontWeight: 700, color: '#fff', fontFamily: FH }}>{item.titre}</p>
                    <p style={{ margin: 0, fontSize: 12.5, color: 'rgba(255,255,255,.6)', lineHeight: 1.6, fontFamily: FB }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 packs i18n */}
          {Array.isArray(PACKS) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px,100%), 1fr))', gap: 20 }}>
              {PACKS.map((pack) => (
                <div key={pack.nom} style={{ background: pack.dark ? TEAL_D : '#fff', border: pack.dark ? 'none' : `2px solid ${pack.accent}30`, borderRadius: 20, padding: '28px 24px', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ display: 'inline-block', background: pack.accent, color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 20, fontFamily: FB }}>
                      {pack.statut}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 24, fontWeight: 800, color: pack.dark ? '#fff' : TEXT, margin: '0 0 20px', fontFamily: FH }}>
                    Pack {pack.nom}
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    {pack.avantages.map((a, ai) => (
                      <li key={ai} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: pack.dark ? 'rgba(255,255,255,.8)' : '#374151', fontFamily: FB, lineHeight: 1.5 }}>
                        <span style={{ color: pack.accent, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span> {a}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => openContact(`Demande pack ${pack.nom} — Forum Simandou 2040`)}
                    style={{ width: '100%', background: pack.accent, color: '#fff', border: 'none', borderRadius: 12, padding: '12px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: FB, transition: 'opacity .15s' }}
                    onMouseOver={e => e.currentTarget.style.opacity = '.85'}
                    onMouseOut={e => e.currentTarget.style.opacity = '1'}
                  >
                    {t('forum.sponsoringContact')}
                  </button>
                </div>
              ))}
            </div>
          )}
          {/* DEAD CODE REMOVED — ancien bloc hardcodé */}
          {false && (() => {
            const PACKS_OLD = [
              {
                nom: 'Platine', statut: 'Partenaire officiel majeur', accent: '#C0C4CC',
                bg: TEAL_D, dark: true,
                avantages: [
                  'Logo sur tous les supports officiels',
                  'Logo sur le backdrop principal',
                  'Prise de parole officielle de 5 minutes',
                  'Stand premium',
                  'Diffusion d\'un film institutionnel',
                  'Visibilité sur les réseaux sociaux',
                  'Insertion dans la plaquette officielle',
                  '10 invitations VIP',
                  'Branding dans la salle principale',
                  'Présence sur les badges ou cordons',
                ],
              },
              {
                nom: 'Gold', statut: 'Partenaire stratégique', accent: '#D97830',
                bg: '#fff', dark: false,
                avantages: [
                  'Logo sur les supports officiels',
                  'Stand standard',
                  'Visibilité digitale',
                  'Insertion dans la plaquette',
                  '5 invitations VIP',
                  'Branding sur signalétique intérieure',
                  'Documentation dans les kits participants',
                ],
              },
              {
                nom: 'Silver', statut: 'Partenaire associé', accent: '#6b7280',
                bg: '#fff', dark: false,
                avantages: [
                  'Logo sur certains supports',
                  'Mention digitale',
                  '4 invitations',
                  'Documentation dans les kits participants',
                  'Présence sur la signalétique partenaire',
                ],
              },
              {
                nom: 'Exposant', statut: 'Exposant officiel', accent: TEAL,
                bg: '#fff', dark: false,
                avantages: [
                  'Stand d\'exposition',
                  '2 badges participants',
                  'Présentation des services ou équipements',
                  'Accès aux rencontres B2B et B2G',
                  'Insertion dans le répertoire des entreprises participantes',
                ],
              },
            ]
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px,100%), 1fr))', gap: 20 }}>
                {PACKS.map(pack => (
                  <div key={pack.nom} style={{ background: pack.bg, border: pack.dark ? 'none' : `2px solid ${pack.accent}30`, borderRadius: 20, padding: '28px 24px', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
                    {/* Badge statut */}
                    <div style={{ marginBottom: 16 }}>
                      <span style={{ display: 'inline-block', background: pack.accent, color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 20, fontFamily: FB }}>
                        {pack.statut}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 24, fontWeight: 800, color: pack.dark ? '#fff' : TEXT, margin: '0 0 20px', fontFamily: FH }}>
                      Pack {pack.nom}
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                      {pack.avantages.map(a => (
                        <li key={a} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: pack.dark ? 'rgba(255,255,255,.8)' : '#374151', fontFamily: FB, lineHeight: 1.5 }}>
                          <span style={{ color: pack.accent, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span> {a}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => openContact(`Demande pack ${pack.nom} — Forum Simandou 2040`)}
                      style={{ width: '100%', background: pack.accent, color: '#fff', border: 'none', borderRadius: 12, padding: '12px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: FB, transition: 'opacity .15s' }}
                      onMouseOver={e => e.currentTarget.style.opacity = '.85'}
                      onMouseOut={e => e.currentTarget.style.opacity = '1'}
                    >
                      Nous contacter
                    </button>
                  </div>
                ))}
              </div>
            )
          })()}
        </Container>
      </Section>

      {/* ── CONTACT & CTA ── */}
      <Section id="contact" style={{ background: TEAL_D }}>
        <Container>
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
            <span style={{ display: 'inline-block', background: 'rgba(0,121,140,.25)', color: TEAL, fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 20, marginBottom: 16, fontFamily: FB }}>
              {t('forum.contactTag')}
            </span>
            <h2 style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 700, color: '#fff', margin: '0 0 16px', fontFamily: FH }}>{t('forum.contactQuestion')}</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,.6)', lineHeight: 1.7, margin: '0 0 36px', fontFamily: FB }}>
              {t('forum.contactDesc')}
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
              <button onClick={() => openContact('Message de contact')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 12, padding: '12px 24px', color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: FB, cursor: 'pointer', transition: 'background .2s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,.14)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'}
              >
                ✉️ contact@koma-gn.com
              </button>
              <a href="tel:+224000000000" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 12, padding: '12px 24px', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 600, fontFamily: FB, transition: 'background .2s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,.14)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'}
              >
                📞 +224 621 727 276
              </a>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 40 }}>
              <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14, marginBottom: 20, fontFamily: FB }}>{t('forum.contactJoin')}</p>
              <button
                onClick={() => navigate('/forum/inscription')}
                style={{ background: RED, color: '#fff', border: 'none', borderRadius: 14, padding: '16px 40px', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(214,62,68,.4)', transition: 'background .2s', fontFamily: FB }}
                onMouseOver={e => e.currentTarget.style.background = RED_H}
                onMouseOut={e => e.currentTarget.style.background = RED}
              >
                {t('forum.registerNow')}
              </button>
            </div>
          </div>
        </Container>
      </Section>

      <Footer />
    </div>
  )
}
