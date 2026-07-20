import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import FormWizard from '../../components/ui/FormWizard'
import { FormField, Input, Select, SectionTitle } from '../../components/ui/FormField'
import { forumApi } from '../../lib/api'
import { useTranslation } from 'react-i18next'

const TYPES_CONFIG = [
  { value: 'Opérateur économique',             key: 'operateur' },
  { value: "Représentant de l'État",           key: 'etat' },
  { value: 'Partenaire technique & financier', key: 'partenaire' },
  { value: 'Société civile',                   key: 'societe_civile' },
  { value: 'Presse & Médias',                  key: 'presse' },
  { value: 'Autre',                            key: 'autre' },
]

function getInitialFromParams(params) {
  return {
    nom:              params.get('nom')              || '',
    prenom:           params.get('prenom')           || '',
    email:            params.get('email')            || '',
    telephone:        params.get('telephone')        || '',
    organisation:     params.get('organisation')     || '',
    fonction:         params.get('fonction')         || '',
    type_participant: params.get('type')             || '',
  }
}

const INITIAL = {
  nom: '', prenom: '', email: '', telephone: '',
  organisation: '', fonction: '', type_participant: '',
}

const TYPE_COLORS = {
  'Opérateur économique':             '#1A56DB',
  "Représentant de l'État":           '#1C7A4D',
  'Partenaire technique & financier': '#854F0B',
  'Société civile':                   '#534AB7',
  'Presse & Médias':                  '#A32D2D',
  'Autre':                            '#00798C',
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
  ctx.fill()
}

async function drawBadgeCanvas(canvas, { prenom, nom, organisation, fonction, type_participant, badge }) {
  const W = 500, H = 760
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const GOLD  = '#C9A84C'
  const ga    = v => `rgba(201,168,76,${v})`
  const color = TYPE_COLORS[type_participant] || '#00798C'

  const loadImg = src => new Promise(res => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = () => res(null)
    img.src = src
  })

  // QR code
  let qrImg = null
  try {
    const QR = (await import('qrcode')).default
    const url = await QR.toDataURL(badge, { width: 360, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
    qrImg = await loadImg(url)
  } catch {}

  // Logos
  const [lgGuinee, lgSimandou, lgKoma, lgPres, lgCSS, lgMMG, lgAcgp, lgTrans] = await Promise.all([
    loadImg('/logo-guinee.png'), loadImg('/simandou-2040.png'), loadImg('/koma-logo.png'),
    loadImg('/logo-presidence.png'), loadImg('/logo-css.png'), loadImg('/logo-mmg.png'),
    loadImg('/logo-acgp.png'), loadImg('/logo-transguineen.png'),
  ])

  // ── FOND DÉGRADÉ ─────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W * 0.4, H)
  bg.addColorStop(0,   '#072133')
  bg.addColorStop(0.5, '#09273C')
  bg.addColorStop(1,   '#061825')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Halo doré haut
  const glow = ctx.createRadialGradient(W/2, 60, 0, W/2, 60, 260)
  glow.addColorStop(0, 'rgba(201,168,76,0.13)')
  glow.addColorStop(1, 'rgba(201,168,76,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H / 2)

  // ── DOUBLE BORDURE DORÉE ─────────────────────────────
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 3
  ctx.strokeRect(6, 6, W - 12, H - 12)
  ctx.strokeStyle = ga(0.35)
  ctx.lineWidth = 1
  ctx.strokeRect(13, 13, W - 26, H - 26)

  // ── HELPER LOGOS ─────────────────────────────────────
  const fitDraw = (img, cx, cy, maxH, maxW) => {
    if (!img) return
    let h = maxH, w = h * (img.width / img.height)
    if (w > maxW) { w = maxW; h = w / (img.width / img.height) }
    ctx.drawImage(img, cx - w/2, cy - h/2, w, h)
  }

  // ── LOGOS HAUT : Guinée · Simandou · KOMA ────────────
  fitDraw(lgGuinee,   W * 0.18, 66, 58, 58)
  fitDraw(lgSimandou, W * 0.50, 66, 50, 110)
  fitDraw(lgKoma,     W * 0.82, 66, 46, 110)

  ctx.strokeStyle = ga(0.55)
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(30, 106); ctx.lineTo(W - 30, 106); ctx.stroke()

  // ── TITRE FORUM ──────────────────────────────────────
  ctx.textAlign = 'center'

  ctx.fillStyle = ga(0.8)
  ctx.font = 'bold 11px Arial'
  ctx.fillText('FORUM STRATÉGIQUE', W/2, 128)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 34px Arial'
  ctx.fillText('SIMANDOU 2040', W/2, 167)

  ctx.fillStyle = ga(0.65)
  ctx.font = '11px Arial'
  ctx.fillText('INFRASTRUCTURE ET RESSOURCES', W/2, 187)

  // ── BANDEAU DORÉ ─────────────────────────────────────
  const ribGrad = ctx.createLinearGradient(0, 202, W, 202)
  ribGrad.addColorStop(0,    ga(0.08))
  ribGrad.addColorStop(0.15, GOLD)
  ribGrad.addColorStop(0.85, GOLD)
  ribGrad.addColorStop(1,    ga(0.08))
  ctx.fillStyle = ribGrad
  ctx.fillRect(0, 202, W, 26)
  ctx.fillStyle = '#06192A'
  ctx.font = 'bold 10.5px Arial'
  ctx.fillText('DÉVELOPPEMENT  ·  GUINÉE  ·  2026', W/2, 219)

  // ── QR CODE ──────────────────────────────────────────
  const QRS = 178, QRX = (W - QRS) / 2, QRY = 242

  ctx.fillStyle = '#ffffff'
  roundRect(ctx, QRX - 14, QRY - 14, QRS + 28, QRS + 28, 16)

  // Marques d'angle dorées
  const ML = 18
  ;[[QRX-16, QRY-16, 1, 1],[QRX+QRS+16, QRY-16, -1, 1],
    [QRX-16, QRY+QRS+16, 1, -1],[QRX+QRS+16, QRY+QRS+16, -1, -1]
  ].forEach(([cx, cy, dx, dy]) => {
    ctx.strokeStyle = GOLD; ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(cx + dx * ML, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + dy * ML)
    ctx.stroke()
  })

  if (qrImg) {
    ctx.drawImage(qrImg, QRX, QRY, QRS, QRS)
  } else {
    ctx.fillStyle = '#e5e7eb'; ctx.fillRect(QRX, QRY, QRS, QRS)
    ctx.fillStyle = '#374151'; ctx.font = '12px Arial'
    ctx.fillText('QR CODE', W/2, QRY + QRS/2)
  }

  ctx.fillStyle = ga(0.65); ctx.font = '9.5px Arial'
  ctx.fillText('SCANNEZ POUR VÉRIFIER', W/2, QRY + QRS + 22)

  // ── SÉPARATEUR ───────────────────────────────────────
  const SEPY = QRY + QRS + 38
  ctx.strokeStyle = ga(0.4); ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(30, SEPY); ctx.lineTo(W - 30, SEPY); ctx.stroke()

  // ── NOM & INFOS ──────────────────────────────────────
  const IY = SEPY + 30
  const fullName = `${prenom} ${nom}`.toUpperCase()
  let fs = 28
  ctx.font = `bold ${fs}px Arial`
  while (ctx.measureText(fullName).width > W - 60 && fs > 15) {
    fs--; ctx.font = `bold ${fs}px Arial`
  }
  ctx.fillStyle = '#ffffff'
  ctx.fillText(fullName, W/2, IY)

  const nw = Math.min(ctx.measureText(fullName).width + 16, 220)
  ctx.fillStyle = GOLD
  ctx.fillRect((W - nw) / 2, IY + 8, nw, 2)

  ctx.fillStyle = GOLD; ctx.font = 'bold 12px Arial'
  ctx.fillText((fonction || '').toUpperCase(), W/2, IY + 32)

  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '11.5px Arial'
  ctx.fillText(organisation || '', W/2, IY + 52)

  ctx.font = 'bold 11px Arial'
  const pillText = type_participant || ''
  const pillW = ctx.measureText(pillText).width + 28
  const lc = color === '#00798C' ? '#4BC8DA' : color === '#854F0B' ? '#D4A050'
           : color === '#1A56DB' ? '#5C8EF0' : color
  ctx.fillStyle = color + '40'
  roundRect(ctx, (W - pillW) / 2, IY + 64, pillW, 26, 13)
  ctx.fillStyle = lc
  ctx.fillText(pillText, W/2, IY + 82)

  // ── LOGOS PARTENAIRES ─────────────────────────────────
  const LY = IY + 106
  ctx.strokeStyle = ga(0.35); ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(30, LY); ctx.lineTo(W - 30, LY); ctx.stroke()

  const partners = [lgPres, lgCSS, lgMMG, lgAcgp, lgTrans].filter(Boolean)
  if (partners.length) {
    const gap = (W - 60) / partners.length
    partners.forEach((lg, i) => fitDraw(lg, 30 + gap * i + gap / 2, LY + 28, 30, 72))
  }

  // ── PIED ─────────────────────────────────────────────
  const FY = LY + 66
  ctx.strokeStyle = GOLD; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(30, FY); ctx.lineTo(W - 30, FY); ctx.stroke()

  ctx.fillStyle = ga(0.75); ctx.font = 'bold 9.5px Arial'
  ctx.fillText(`N°  ${badge}`, W/2, FY + 18)
  ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.font = '9px Arial'
  ctx.fillText('koma-gn.com  ·  Forum Simandou 2040  ·  République de Guinée', W/2, FY + 34)

  ctx.textAlign = 'left'
}

function QRImg({ data, size = 140 }) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    import('qrcode').then(m =>
      m.default.toDataURL(data, { width: size * 2, margin: 1, color: { dark: '#000000', light: '#ffffff' } }).then(setSrc)
    ).catch(() => {})
  }, [data, size])
  return src
    ? <img src={src} width={size} height={size} style={{ display: 'block' }} alt="QR" />
    : <div style={{ width: size, height: size, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }} />
}

function BadgePreview({ form, badge, badgeColor, GOLD }) {
  const lightColor = badgeColor === '#00798C' ? '#4BC8DA'
                   : badgeColor === '#854F0B' ? '#D4A050'
                   : badgeColor === '#1A56DB' ? '#5C8EF0'
                   : badgeColor

  return (
    <div style={{
      display: 'inline-block', width: 300, textAlign: 'left',
      background: 'linear-gradient(160deg, #072133 0%, #09273C 50%, #061825 100%)',
      border: `2.5px solid ${GOLD}`,
      outline: `1px solid rgba(201,168,76,0.3)`,
      outlineOffset: '4px',
      borderRadius: 14,
      boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(201,168,76,0.08)`,
      overflow: 'hidden',
      fontFamily: 'var(--font-body)',
    }}>

      {/* Logos haut */}
      <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid rgba(201,168,76,0.25)` }}>
        <img src="/logo-guinee.png" alt="Guinée" style={{ height: 36, width: 36, objectFit: 'contain' }} />
        <img src="/simandou-2040.png" alt="Simandou" style={{ height: 28, maxWidth: 90, objectFit: 'contain' }} />
        <img src="/koma-logo.png" alt="KOMA" style={{ height: 26, maxWidth: 80, objectFit: 'contain' }} />
      </div>

      {/* Titre */}
      <div style={{ textAlign: 'center', padding: '12px 16px 0' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: `rgba(201,168,76,0.8)`, letterSpacing: '.2em', marginBottom: 4 }}>FORUM STRATÉGIQUE</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>SIMANDOU 2040</div>
        <div style={{ fontSize: 8.5, color: `rgba(201,168,76,0.6)`, marginTop: 3, letterSpacing: '.08em' }}>INFRASTRUCTURE ET RESSOURCES</div>
      </div>

      {/* Bandeau doré */}
      <div style={{ margin: '10px 0', background: GOLD, textAlign: 'center', padding: '5px 0' }}>
        <span style={{ fontSize: 8.5, fontWeight: 700, color: '#06192A', letterSpacing: '.14em' }}>
          DÉVELOPPEMENT · GUINÉE · 2026
        </span>
      </div>

      {/* QR code */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 16px 10px' }}>
        <div style={{ background: '#fff', borderRadius: 10, padding: 10, boxShadow: `0 0 0 2px ${GOLD}` }}>
          <QRImg data={badge} size={130} />
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 7.5, color: `rgba(201,168,76,0.65)`, letterSpacing: '.12em', marginBottom: 10 }}>
        SCANNEZ POUR VÉRIFIER
      </div>

      {/* Séparateur */}
      <div style={{ margin: '0 16px 12px', height: 1, background: `rgba(201,168,76,0.3)` }} />

      {/* Nom & infos */}
      <div style={{ textAlign: 'center', padding: '0 16px 12px' }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '.03em' }}>
          {form.prenom} {form.nom}
        </div>
        <div style={{ margin: '5px auto 6px', width: 60, height: 2, background: GOLD, borderRadius: 1 }} />
        <div style={{ fontSize: 10, fontWeight: 700, color: GOLD, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 3 }}>
          {form.fonction}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>{form.organisation}</div>
        <span style={{ background: badgeColor + '35', color: lightColor, fontSize: 9.5, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
          {form.type_participant}
        </span>
      </div>

      {/* Logos partenaires */}
      <div style={{ margin: '0 16px', borderTop: `1px solid rgba(201,168,76,0.25)`, padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
        {['/logo-presidence.png', '/logo-css.png', '/logo-mmg.png', '/logo-acgp.png', '/logo-transguineen.png'].map(src => (
          <img key={src} src={src} alt="" style={{ height: 20, maxWidth: 44, objectFit: 'contain', opacity: 0.85 }} />
        ))}
      </div>

      {/* Pied */}
      <div style={{ borderTop: `1px solid ${GOLD}`, margin: '0', padding: '8px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: `rgba(201,168,76,0.75)`, letterSpacing: '.08em' }}>N°  {badge}</div>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>koma-gn.com · Forum Simandou 2040</div>
      </div>
    </div>
  )
}

export default function ForumForm() {
  const [searchParams] = useSearchParams()
  const [step, setStep]           = useState(0)
  const [form, setForm]           = useState(() => getInitialFromParams(searchParams))
  const [errors, setErrors]       = useState({})
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [badge, setBadge]         = useState(null)
  const [dlLoading, setDlLoading] = useState(false)
  const canvasRef = useRef(null)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const getBadgeData = () => ({ ...form, badge })

  const downloadPNG = useCallback(async () => {
    const canvas = document.createElement('canvas')
    await drawBadgeCanvas(canvas, getBadgeData())
    canvas.toBlob(blob => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `badge-forum-KOMA-${badge}.png`
      a.click()
      URL.revokeObjectURL(a.href)
    }, 'image/png')
  }, [form, badge])

  const downloadPDF = useCallback(async () => {
    setDlLoading(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const canvas = document.createElement('canvas')
      await drawBadgeCanvas(canvas, getBadgeData())
      const img = canvas.toDataURL('image/png', 1.0)
      const doc = new jsPDF({ orientation: 'portrait', unit: 'px', format: [500, 760] })
      doc.addImage(img, 'PNG', 0, 0, 500, 760)
      doc.save(`badge-forum-KOMA-${badge}.pdf`)
    } finally {
      setDlLoading(false)
    }
  }, [form, badge])

  const STEPS = [t('forumForm.step0'), t('forumForm.step1'), t('forumForm.step2')]

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (step === 0) {
      if (!form.nom.trim())       e.nom       = t('forumForm.errors.nom')
      if (!form.prenom.trim())    e.prenom    = t('forumForm.errors.prenom')
      if (!form.email.trim())     e.email     = t('forumForm.errors.email')
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('forumForm.errors.emailInvalid')
      if (!form.telephone.trim()) e.telephone = t('forumForm.errors.telephone')
    }
    if (step === 1) {
      if (!form.organisation.trim()) e.organisation    = t('forumForm.errors.organisation')
      if (!form.fonction.trim())     e.fonction        = t('forumForm.errors.fonction')
      if (!form.type_participant)    e.type_participant = t('forumForm.errors.type')
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext   = () => { if (validate()) setStep(s => s + 1) }
  const handleBack   = () => setStep(s => s - 1)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const data = await forumApi.inscrire(form)
      setBadge(data.numero_badge)
      setSubmitted(true)
    } catch (err) {
      setErrors({ submit: err.message || t('forumForm.errors.submit') })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    const badgeColor = TYPE_COLORS[form.type_participant] || '#00798C'
    const GOLD = '#C9A84C'

    return (
      <div style={{ minHeight: '100vh', background: '#0B1E2D', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>

          {/* Message succès */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'inline-flex', width: 60, height: 60, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '2px solid #C9A84C', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2.5" style={{ width: 28, height: 28 }}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: '#ffffff', margin: '0 0 8px' }}>{t('forumForm.successTitle')}</h2>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)', margin: '0 auto 20px', maxWidth: '40ch', lineHeight: 1.6 }}>
              {t('forumForm.successMsg')} <strong style={{ color: '#C9A84C' }}>{form.prenom} {form.nom}</strong>.
            </p>
          </div>

          {/* ── BADGE PORTRAIT ── */}
          <BadgePreview
            form={form}
            badge={badge}
            badgeColor={badgeColor}
            GOLD={GOLD}
          />

          {/* Boutons téléchargement */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16, marginTop: 20 }}>
            <button onClick={downloadPNG}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 10, background: '#C9A84C', color: '#06192A', border: 'none', padding: '11px 22px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', transition: 'opacity .15s' }}
              onMouseOver={e => e.currentTarget.style.opacity = '0.85'}
              onMouseOut={e => e.currentTarget.style.opacity = '1'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              PNG
            </button>
            <button onClick={downloadPDF} disabled={dlLoading}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 10, background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1.5px solid #C9A84C', padding: '11px 22px', fontSize: 13.5, fontWeight: 700, cursor: dlLoading ? 'wait' : 'pointer', opacity: dlLoading ? 0.6 : 1, transition: 'background .15s' }}
              onMouseOver={e => { if (!dlLoading) e.currentTarget.style.background = 'rgba(201,168,76,0.25)' }}
              onMouseOut={e => { if (!dlLoading) e.currentTarget.style.background = 'rgba(201,168,76,0.15)' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {dlLoading ? '...' : 'PDF'}
            </button>
          </div>

          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', marginBottom: 20 }}>
            {t('forumForm.showBadge')}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setSubmitted(false); setForm(INITIAL); setStep(0); setBadge(null) }}
              style={{ borderRadius: 50, border: '1.5px solid rgba(201,168,76,0.5)', padding: '11px 24px', fontSize: 13.5, fontWeight: 600, color: '#C9A84C', background: 'transparent', cursor: 'pointer', transition: 'border-color .15s' }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#C9A84C'}
              onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'}
            >
              {t('forms.newRegistration')}
            </button>
            <button
              onClick={() => navigate('/')}
              style={{ borderRadius: 50, background: 'rgba(255,255,255,0.08)', padding: '11px 24px', fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(255,255,255,0.12)', cursor: 'pointer', transition: 'background .15s' }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              {t('forms.backToHome')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <FormWizard
      title={t('forumForm.title')}
      subtitle={t('forumForm.subtitle')}
      steps={STEPS}
      currentStep={step}
      onBack={handleBack}
      onNext={handleNext}
      onSubmit={handleSubmit}
      loading={loading}
      isFirstStep={step === 0}
      isLastStep={step === STEPS.length - 1}
    >
      {/* ── Étape 0 : Identité ── */}
      {step === 0 && (
        <div className="flex flex-col gap-5">
          <SectionTitle title={t('forumForm.step0Title')} desc={t('forumForm.step0Desc')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={t('forumForm.nom')} required error={errors.nom}>
              <Input
                placeholder="DIALLO"
                value={form.nom}
                onChange={e => set('nom', e.target.value.toUpperCase())}
                error={errors.nom}
              />
            </FormField>
            <FormField label={t('forumForm.prenom')} required error={errors.prenom}>
              <Input
                placeholder="Mamadou"
                value={form.prenom}
                onChange={e => set('prenom', e.target.value)}
                error={errors.prenom}
              />
            </FormField>
          </div>
          <FormField label={t('forumForm.email')} required error={errors.email}>
            <Input
              type="email"
              placeholder="votre@email.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              error={errors.email}
            />
          </FormField>
          <FormField label={t('forumForm.telephone')} required error={errors.telephone}>
            <Input
              type="tel"
              placeholder="+224 620 000 000"
              value={form.telephone}
              onChange={e => set('telephone', e.target.value)}
              error={errors.telephone}
            />
          </FormField>
        </div>
      )}

      {/* ── Étape 1 : Organisation ── */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <SectionTitle title={t('forumForm.step1Title')} desc={t('forumForm.step1Desc')} />
          <FormField label={t('forumForm.organisation')} required error={errors.organisation}>
            <Input
              placeholder="Nom de votre entreprise ou institution"
              value={form.organisation}
              onChange={e => set('organisation', e.target.value)}
              error={errors.organisation}
            />
          </FormField>
          <FormField label={t('forumForm.fonction')} required error={errors.fonction}>
            <Input
              placeholder="Directeur Général, Chef de projet..."
              value={form.fonction}
              onChange={e => set('fonction', e.target.value)}
              error={errors.fonction}
            />
          </FormField>
          <FormField label={t('forumForm.typeParticipant')} required error={errors.type_participant}>
            <Select
              value={form.type_participant}
              onChange={e => set('type_participant', e.target.value)}
              error={errors.type_participant}
            >
              <option value="">{t('forumForm.selectProfile')}</option>
              {TYPES_CONFIG.map(tp => (
                <option key={tp.value} value={tp.value}>{t(`forumForm.types.${tp.key}`)}</option>
              ))}
            </Select>
          </FormField>
        </div>
      )}

      {/* ── Étape 2 : Confirmation ── */}
      {step === 2 && (
        <div>
          <SectionTitle title={t('forumForm.step2Title')} desc={t('forumForm.step2Desc')} />

          <div className="rounded-[14px] border border-[#e5e7eb] overflow-hidden mb-4" style={{ background: 'var(--koma-gray-bg)' }}>
            {[
              { label: t('forumForm.recapNom'),     value: `${form.prenom} ${form.nom}` },
              { label: t('forumForm.recapEmail'),    value: form.email },
              { label: t('forumForm.recapTel'),      value: form.telephone },
              { label: t('forumForm.recapOrg'),      value: form.organisation },
              { label: t('forumForm.recapFonction'), value: form.fonction },
              { label: t('forumForm.recapProfil'),   value: form.type_participant },
            ].map(row => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 px-5 py-3 border-b border-[#f3f4f6] last:border-0">
                <span className="text-[12px] tracking-[.1em] uppercase font-semibold text-koma-teal font-sans flex-shrink-0">{row.label}</span>
                <span className="text-[14.5px] text-koma-text text-right">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 rounded-[12px] border border-koma-teal/25 p-4" style={{ background: 'var(--koma-teal-light)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--koma-teal)" strokeWidth="2" className="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
            <p className="text-[13px] text-koma-teal leading-relaxed">
              {t('forumForm.confirmNote')} <strong>{form.email}</strong> {t('forumForm.afterValidation')}
            </p>
          </div>

          {errors.submit && (
            <div className="mt-4 flex items-start gap-3 rounded-[12px] p-4" style={{ border: '1px solid rgba(214,62,68,.3)', background: 'rgba(214,62,68,.06)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--koma-red)" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--koma-red)' }}>{errors.submit}</p>
            </div>
          )}
        </div>
      )}
    </FormWizard>
  )
}
