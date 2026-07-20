import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Building2, Truck, Landmark, Factory, UserCheck, CalendarCheck, ArrowRight, Phone, Mail } from 'lucide-react'
import { statsApi, entreprisesApi, humanResourcesApi, projetsPublicsApi, projetsPrivesApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

function StatCard({ value, label, icon: Icon, color, bg, loading }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, padding: '20px 22px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <Icon size={20} color={color} />
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--koma-text)', lineHeight: 1, marginBottom: 5 }}>
        {loading
          ? <span style={{ display: 'inline-block', width: 56, height: 26, borderRadius: 6, background: 'var(--koma-gray-bg)', animation: 'pulse 1.4s ease-in-out infinite' }} />
          : value.toLocaleString('fr-FR')}
      </div>
      <p style={{ fontSize: 12.5, color: '#6B7A8D', fontWeight: 500, margin: 0 }}>{label}</p>
    </div>
  )
}

export default function DashboardPage() {
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const { t } = useTranslation()
  const [stats, setStats]               = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [entreprises, setEntreprises]   = useState([])
  const [hrLoading, setHrLoading]       = useState(true)
  const [hrCount, setHrCount]           = useState(0)
  const [myEntreprise, setMyEntreprise] = useState(null)
  const [humanResources, setHumanResources] = useState([])
  const [projets, setProjets]           = useState([])

  const MODULES = [
    {
      icon: Building2, color: '#0F6E56', bg: '#E1F5EE',
      label: t('dashboard.mod1Label'),
      desc:  t('dashboard.mod1Desc'),
      to: '/entreprises', badge: t('dashboard.mod1Badge'),
    },
    {
      icon: Truck, color: '#185FA5', bg: '#EBF2FF',
      label: t('dashboard.mod2Label'),
      desc:  t('dashboard.mod2Desc'),
      to: '/equipements', badge: t('dashboard.mod2Badge'),
    },
    {
      icon: Landmark, color: '#7A4FB5', bg: '#F0EAFB',
      label: t('dashboard.mod3Label'),
      desc:  t('dashboard.mod3Desc'),
      to: '/register/projets-publics', badge: t('dashboard.mod3Badge'),
    },
    {
      icon: Factory, color: '#9A4820', bg: '#FAEEE6',
      label: t('dashboard.mod4Label'),
      desc:  t('dashboard.mod4Desc'),
      to: '/register/projets-prives', badge: t('dashboard.mod4Badge'),
    },
    {
      icon: UserCheck, color: '#00798C', bg: '#EBFCFF',
      label: t('dashboard.mod5Label'),
      desc:  t('dashboard.mod5Desc'),
      to: '/ressources-humaines/inscription', badge: t('dashboard.mod5Badge'),
    },
  ]

  useEffect(() => {
    statsApi.getPublic()
      .then(setStats)
      .catch(() => {})
      .finally(() => setStatsLoading(false))

    entreprisesApi.getAll({ limit: 5, statut: 'actif' })
      .then(r => setEntreprises(r?.data || []))
      .catch(() => {})

    humanResourcesApi.getAll({ limit: 6, statut: 'actif' })
      .then(r => { setHrCount(r?.total || 0); setHumanResources(r?.data || []) })
      .catch(() => {})
      .finally(() => setHrLoading(false))

    Promise.all([
      projetsPublicsApi.getAll({ limit: 4 }),
      projetsPrivesApi.getAll({ limit: 4 }),
    ]).then(([pub, priv]) => {
      const pubData  = (pub?.data  || []).map(p => ({ ...p, _type: 'public' }))
      const privData = (priv?.data || []).map(p => ({ ...p, _type: 'prive' }))
      setProjets([...pubData, ...privData].slice(0, 6))
    }).catch(() => {})

    const entrepriseId = user?.user_metadata?.entreprise_id
    if (entrepriseId) {
      entreprisesApi.getById(entrepriseId)
        .then(data => setMyEntreprise(data))
        .catch(() => {})
    }
  }, [user])

  const s = stats || {}
  const STATS = [
    { value: s.entreprises    ?? 0, label: t('dashboard.stats.entreprises'),    icon: Building2,  color: '#0F6E56', bg: '#E1F5EE' },
    { value: s.equipements    ?? 0, label: t('dashboard.stats.equipements'),    icon: Truck,      color: '#185FA5', bg: '#EBF2FF' },
    { value: s.projets_publics ?? 0, label: t('dashboard.stats.projetsPublics'), icon: Landmark,   color: '#7A4FB5', bg: '#F0EAFB' },
    { value: s.projets_prives  ?? 0, label: t('dashboard.stats.projetsPrives'),  icon: Factory,    color: '#9A4820', bg: '#FAEEE6' },
    { value: hrCount,                label: t('dashboard.stats.humanResources'), icon: UserCheck,  color: '#00798C', bg: '#EBFCFF' },
  ]

  const QUICK_ACTIONS = [
    { label: t('dashboard.registerEntreprise'), to: '/register/entreprises',            icon: Building2, color: '#0F6E56', bg: '#E1F5EE' },
    { label: t('dashboard.registerEquipement'), to: '/register/equipements',            icon: Truck,     color: '#185FA5', bg: '#EBF2FF' },
    { label: t('dashboard.registerHR'),         to: '/ressources-humaines/inscription', icon: UserCheck, color: '#00798C', bg: '#EBFCFF' },
  ]

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilisateur'

  return (
    <div style={{ background: 'var(--koma-gray-bg)', minHeight: '100vh', padding: '20px', fontFamily: 'var(--font-body)' }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        .dash-grid{display:grid;grid-template-columns:1fr;gap:16px}
        @media(min-width:1024px){.dash-grid{grid-template-columns:1fr 360px}}
      `}</style>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', minHeight: 240, marginBottom: 20, backgroundImage: 'url(/simandou_hero.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 28%', boxShadow: '0 4px 24px rgba(0,0,0,.14)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, rgba(0,38,59,.9) 0%, rgba(0,38,59,.6) 55%, rgba(0,38,59,.15) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '32px 36px' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'clamp(20px,2.8vw,30px)', color: 'white', lineHeight: 1.2, maxWidth: '22ch', marginBottom: 10 }}>
            {t('dashboard.welcome')} {displayName}
          </h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.7)', maxWidth: '54ch', lineHeight: 1.65, marginBottom: 22 }}>
            {t('dashboard.subtitle')}
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/entreprises')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--koma-red)', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 9, padding: '10px 18px', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)' }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--koma-red-hover)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--koma-red)'}
            >
              <Building2 size={15} /> {t('dashboard.viewEntreprises')}
            </button>
            <Link to="/forum/inscription" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.12)', color: 'white', border: '1px solid rgba(255,255,255,.25)', borderRadius: 9, padding: '10px 18px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              <CalendarCheck size={15} /> {t('dashboard.forumCta')}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 20 }}>
        {STATS.map(stat => (
          <StatCard key={stat.label} {...stat} loading={stat.label !== t('dashboard.stats.humanResources') ? statsLoading : hrLoading} />
        ))}
      </div>

      <div className="dash-grid">

        {/* ── Modules ── */}
        <div>
          <div style={{ background: 'white', borderRadius: 14, padding: '22px 24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,.05)', marginBottom: 16 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--koma-text)', marginBottom: 4 }}>{t('dashboard.modules')}</h2>
            <p style={{ fontSize: 13, color: '#6B7A8D', marginBottom: 18 }}>{t('dashboard.modulesDesc')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MODULES.map(({ icon: Icon, color, bg, label, desc, to, badge }) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--koma-gray-bg)', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', textAlign: 'left', cursor: 'pointer', transition: 'all .15s', width: '100%', fontFamily: 'var(--font-body)' }}
                  onMouseOver={e => { e.currentTarget.style.background = bg; e.currentTarget.style.borderColor = color + '44' }}
                  onMouseOut={e => { e.currentTarget.style.background = 'var(--koma-gray-bg)'; e.currentTarget.style.borderColor = '#e5e7eb' }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} color={color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--koma-text)' }}>{label}</span>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color, background: bg, padding: '1px 8px', borderRadius: 20, letterSpacing: '.06em', flexShrink: 0 }}>{badge}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#6B7A8D', margin: 0, lineHeight: 1.5 }}>{desc}</p>
                  </div>
                  <ArrowRight size={16} color="#C4C4C4" style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>

          {/* Entreprises récentes */}
          {entreprises.length > 0 && (
            <div style={{ background: 'white', borderRadius: 14, padding: '22px 24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--koma-text)', margin: 0 }}>{t('dashboard.recent')}</h2>
                <button onClick={() => navigate('/entreprises')} style={{ fontSize: 12.5, color: 'var(--koma-teal)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  {t('dashboard.seeAll')}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {entreprises.map(e => (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid #f3f4f6' }}>
                    {e.logo_url ? (
                      <img src={e.logo_url} alt={e.nom} style={{ width: 36, height: 36, borderRadius: 9, objectFit: 'contain', border: '1px solid #e5e7eb', background: 'white', padding: 3, flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 700, color: '#0F6E56' }}>
                        {e.nom?.charAt(0) || '?'}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: 'var(--koma-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.nom}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#6B7A8D' }}>{e.type} · {e.ville || '—'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {e.telephone && (
                        <a href={`tel:${e.telephone}`} onClick={ev => ev.stopPropagation()} title={e.telephone} style={{ width: 28, height: 28, borderRadius: 7, background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                          <Phone size={12} color="#0F6E56" />
                        </a>
                      )}
                      {e.email && (
                        <a href={`mailto:${e.email}`} onClick={ev => ev.stopPropagation()} title={e.email} style={{ width: 28, height: 28, borderRadius: 7, background: '#EBF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                          <Mail size={12} color="#185FA5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ressources humaines */}
          {humanResources.length > 0 && (
            <div style={{ background: 'white', borderRadius: 14, padding: '22px 24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,.05)', marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--koma-text)', margin: 0 }}>{t('dashboard.hrTitle')}</h2>
                <button onClick={() => navigate('/ressources-humaines/inscription')} style={{ fontSize: 12.5, color: 'var(--koma-teal)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  {t('dashboard.hrRegister')}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {humanResources.map(hr => (
                  <div key={hr.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                    {hr.photo_url ? (
                      <img src={hr.photo_url} alt={hr.nom_complet} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#EBFCFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 15, fontWeight: 700, color: '#00798C' }}>
                        {hr.nom_complet?.charAt(0) || '?'}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: 'var(--koma-text)' }}>{hr.nom_complet}</p>
                      <p style={{ margin: '1px 0 6px', fontSize: 12, color: '#6B7A8D' }}>
                        {hr.fonction}{hr.localisation ? ` · 📍 ${hr.localisation}` : ''}
                      </p>
                      {Array.isArray(hr.competences) && hr.competences.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {hr.competences.slice(0, 3).map((c, i) => (
                            <span key={i} style={{ fontSize: 11, background: '#EBFCFF', color: '#00798C', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>{c}</span>
                          ))}
                          {hr.competences.length > 3 && (
                            <span style={{ fontSize: 11, color: '#6B7A8D', padding: '2px 4px' }}>+{hr.competences.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, flexShrink: 0,
                      background: hr.disponibilite === 'disponible' ? '#E1F5EE' : '#FEF2F2',
                      color: hr.disponibilite === 'disponible' ? '#0F6E56' : '#9A4820',
                      borderRadius: 8, padding: '3px 8px', whiteSpace: 'nowrap',
                    }}>
                      {hr.disponibilite || '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar droite ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Mon profil */}
          <div style={{ background: 'white', borderRadius: 14, padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#8A9A90', letterSpacing: '.12em', textTransform: 'uppercase', margin: '0 0 14px' }}>{t('dashboard.profile')}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              {myEntreprise?.logo_url ? (
                <img
                  src={myEntreprise.logo_url}
                  alt={myEntreprise.nom}
                  style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'contain', border: '1px solid #e5e7eb', background: 'white', padding: 3, flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--koma-teal-dark) 0%, var(--koma-teal) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--koma-text)', fontSize: 14 }}>{myEntreprise?.nom || displayName}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#6B7A8D' }}>{user?.email}</p>
              </div>
            </div>
            {user?.user_metadata?.type && (
              <div style={{ background: 'var(--koma-teal-light)', borderRadius: 8, padding: '8px 12px', marginBottom: 14 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--koma-teal)', fontWeight: 600 }}>{user.user_metadata.type}</p>
                {user.user_metadata.organisation && (
                  <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#6B7A8D' }}>{user.user_metadata.organisation}</p>
                )}
              </div>
            )}
          </div>

          {/* Forum CTA */}
          <div style={{ background: 'var(--koma-teal-dark)', borderRadius: 14, padding: '20px', border: '1px solid rgba(0,121,140,.2)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(0,121,140,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <CalendarCheck size={20} color="#00798C" />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'white', margin: '0 0 6px', fontFamily: 'var(--font-heading)' }}>Forum Simandou 2040</p>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,.6)', lineHeight: 1.6, margin: '0 0 16px', fontFamily: 'var(--font-body)' }}>
              {t('hero.forumDate')} · {t('hero.forumPlace')}<br />
              {t('dashboard.forumRegisterDesc')}
            </p>
            <button
              onClick={() => navigate('/forum/inscription')}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'var(--koma-red)', color: 'white', border: 'none', borderRadius: 9, padding: '11px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--koma-red-hover)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--koma-red)'}
            >
              <CalendarCheck size={15} /> {t('dashboard.forumCta')}
            </button>
          </div>

          {/* Actions rapides */}
          <div style={{ background: 'white', borderRadius: 14, padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#8A9A90', letterSpacing: '.12em', textTransform: 'uppercase', margin: '0 0 14px' }}>{t('dashboard.quickActions')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {QUICK_ACTIONS.map(({ label, to, icon: Icon, color, bg }) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--koma-gray-bg)', border: '1px solid #e5e7eb', borderRadius: 9, padding: '10px 12px', cursor: 'pointer', transition: 'all .15s', textAlign: 'left', width: '100%', fontFamily: 'var(--font-body)' }}
                  onMouseOver={e => { e.currentTarget.style.background = bg; e.currentTarget.style.borderColor = color + '44' }}
                  onMouseOut={e => { e.currentTarget.style.background = 'var(--koma-gray-bg)'; e.currentTarget.style.borderColor = '#e5e7eb' }}
                >
                  <Icon size={15} color={color} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--koma-text)' }}>{label}</span>
                  <ArrowRight size={14} color="#C4C4C4" style={{ marginLeft: 'auto' }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Projets enregistrés ── */}
      {projets.length > 0 && (
        <div style={{ background: 'white', borderRadius: 14, padding: '22px 24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,.05)', marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--koma-text)', margin: 0 }}>{t('dashboard.projetsTitle')}</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => navigate('/register/projets-publics')} style={{ fontSize: 12.5, color: '#7A4FB5', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{t('dashboard.projetsPublicBtn')}</button>
              <button onClick={() => navigate('/register/projets-prives')} style={{ fontSize: 12.5, color: '#9A4820', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>{t('dashboard.projetsPriveBtn')}</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {projets.map(p => {
              const isPublic = p._type === 'public'
              const color    = isPublic ? '#7A4FB5' : '#9A4820'
              const bg       = isPublic ? '#F0EAFB' : '#FAEEE6'
              const statuts  = { en_cours: 'En cours', termine: 'Terminé', suspendu: 'Suspendu', planifie: 'Planifié' }
              const statutLbl = statuts[p.statut] || p.statut || '—'
              const statutColor = p.statut === 'en_cours' ? '#0F6E56' : p.statut === 'termine' ? '#185FA5' : p.statut === 'suspendu' ? '#B23A2E' : '#6B7A8D'
              return (
                <div key={`${p._type}-${p.id}`} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', background: 'var(--koma-gray-bg)' }}>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>
                      {isPublic ? '🏛️' : '🏗️'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--koma-text)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.titre}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#6B7A8D' }}>
                        {p.secteur || p.categorie || '—'}{p.localisation ? ` · 📍 ${p.localisation}` : ''}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, background: bg, color, borderRadius: 8, padding: '2px 8px' }}>
                      {isPublic ? 'Public' : 'Privé'}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: statutColor }}>{statutLbl}</span>
                  </div>
                  {p.avancement_pct != null && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 5, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${p.avancement_pct}%`, background: color, borderRadius: 99 }} />
                      </div>
                      <p style={{ margin: '3px 0 0', fontSize: 10.5, color: '#6B7A8D' }}>{p.avancement_pct}% d'avancement</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
