import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Search, FolderOpen, MapPin, TrendingUp, X, Calendar, Users, Building2, CheckSquare, Layers } from 'lucide-react'
import { projetsPublicsApi, projetsPrivesApi } from '../lib/api'
import { useTranslation } from 'react-i18next'

const FONT = 'var(--font-body)'
const HEAD = 'var(--font-heading)'

const STATUT_COLORS = {
  planifie:     { bg: '#DBEAFE', text: '#1E40AF' },
  etude:        { bg: '#EDE9FE', text: '#5B21B6' },
  financement:  { bg: '#FEF3E0', text: '#92400E' },
  en_cours:     { bg: '#D1FAE5', text: '#065F46' },
  construction: { bg: '#DBEAFE', text: '#1E40AF' },
  exploitation: { bg: '#D1FAE5', text: '#065F46' },
  termine:      { bg: '#F3F4F6', text: '#374151' },
  suspendu:     { bg: '#FEE2E2', text: '#991B1B' },
  en_attente:   { bg: '#FEF3E0', text: '#92400E' },
}

function StatutBadge({ statut, t }) {
  const colors = STATUT_COLORS[statut] || { bg: '#F3F4F6', text: '#374151' }
  const label = statut ? t(`statuts.${statut}`, { defaultValue: statut }) : '—'
  return (
    <span style={{ display: 'inline-block', background: colors.bg, color: colors.text, borderRadius: 50, padding: '3px 10px', fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

function ProjetModal({ projet, onClose, t }) {
  if (!projet) return null
  const colors = STATUT_COLORS[projet.statut] || { bg: '#F3F4F6', text: '#374151' }
  const label = projet.statut ? t(`statuts.${projet.statut}`, { defaultValue: projet.statut }) : '—'

  const Row = ({ icon: Icon, label, value }) => value ? (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', paddingBottom: 10, borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--koma-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={14} color="var(--koma-teal)" />
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</p>
        <p style={{ margin: '2px 0 0', fontSize: 13.5, color: 'var(--koma-text)', lineHeight: 1.55 }}>{value}</p>
      </div>
    </div>
  ) : null

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,38,59,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.22)', position: 'relative' }}>

        {/* Image */}
        {projet.image_url && (
          <div style={{ height: 200, overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
            <img src={projet.image_url} alt={projet.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* Header */}
        <div style={{ padding: '28px 28px 20px' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: projet.image_url ? 12 : 16, right: 16, background: projet.image_url ? 'rgba(0,0,0,.45)' : '#f3f4f6', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex', zIndex: 1 }}>
            <X size={16} color={projet.image_url ? '#fff' : '#6b7280'} />
          </button>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
            <span style={{ background: colors.bg, color: colors.text, borderRadius: 50, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>{label}</span>
            {(projet.secteur || projet.categorie) && (
              <span style={{ background: 'var(--koma-teal-light)', color: 'var(--koma-teal)', borderRadius: 50, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>
                {projet.secteur || projet.categorie}
              </span>
            )}
          </div>

          <h2 style={{ fontFamily: HEAD, fontSize: 22, fontWeight: 800, color: 'var(--koma-text)', margin: '0 0 8px', lineHeight: 1.25 }}>{projet.titre}</h2>

          {projet.description && (
            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 20px', lineHeight: 1.7 }}>{projet.description}</p>
          )}

          {/* Avancement */}
          {projet.avancement_pct != null && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>{t('projets.avancement')}</span>
                <span style={{ fontSize: 13, color: 'var(--koma-teal)', fontWeight: 800 }}>{projet.avancement_pct}%</span>
              </div>
              <div style={{ height: 7, background: '#e5e7eb', borderRadius: 99 }}>
                <div style={{ height: '100%', background: 'var(--koma-teal)', borderRadius: 99, width: `${projet.avancement_pct}%`, transition: 'width .4s' }} />
              </div>
            </div>
          )}

          {/* Infos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Row icon={Building2} label={projet.maitre_ouvrage ? t('projets.maitreOuvrage') : t('projets.promoteur')} value={projet.maitre_ouvrage || projet.promoteur} />
            <Row icon={MapPin}     label={t('projets.localisation') || 'Localisation'} value={projet.localisation} />
            <Row icon={TrendingUp} label="Budget / Investissement"
              value={(projet.budget_estime || projet.investissement_prevu)
                ? `${new Intl.NumberFormat('fr-FR').format(projet.budget_estime || projet.investissement_prevu)} ${projet.devise || 'USD'}`
                : null} />
            <Row icon={Calendar}   label="Date de début"    value={projet.date_debut ? new Date(projet.date_debut).toLocaleDateString('fr-FR') : null} />
            <Row icon={Calendar}   label="Date de fin prévue" value={projet.date_fin_prevue ? new Date(projet.date_fin_prevue).toLocaleDateString('fr-FR') : null} />
            <Row icon={Users}      label="Emplois prévus"   value={projet.emplois_prevus ? `${projet.emplois_prevus} emplois` : null} />
            <Row icon={CheckSquare} label="Taux de contenu local" value={projet.contenu_local_pct != null ? `${projet.contenu_local_pct} %` : null} />
            {projet.travaux_realises && (
              <div style={{ paddingBottom: 10, borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--koma-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckSquare size={14} color="var(--koma-teal)" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em' }}>Travaux réalisés</p>
                    <ul style={{ margin: '4px 0 0', paddingLeft: 16, fontSize: 13.5, color: 'var(--koma-text)', lineHeight: 1.7 }}>
                      {projet.travaux_realises.split('\n').filter(Boolean).map((l, i) => <li key={i}>{l}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {projet.lots_sous_traitance && (
              <div style={{ paddingBottom: 10 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--koma-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Layers size={14} color="var(--koma-teal)" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em' }}>Lots de sous-traitance</p>
                    <ul style={{ margin: '4px 0 0', paddingLeft: 16, fontSize: 13.5, color: 'var(--koma-text)', lineHeight: 1.7 }}>
                      {projet.lots_sous_traitance.split('\n').filter(Boolean).map((l, i) => <li key={i}>{l}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

function ProjetCard({ projet, onClick, t }) {
  return (
    <div onClick={onClick} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform .15s, box-shadow .15s' }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.1)' }}
      onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.05)' }}>
      {projet.image_url && (
        <div style={{ height: 160, overflow: 'hidden', background: '#f3f4f6' }}>
          <img src={projet.image_url} alt={projet.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
          <StatutBadge statut={projet.statut} t={t} />
          {projet.secteur && <span style={{ fontSize: 11.5, color: '#6b7280', fontWeight: 600 }}>{projet.secteur}</span>}
          {projet.categorie && <span style={{ fontSize: 11.5, color: '#6b7280', fontWeight: 600 }}>{projet.categorie}</span>}
        </div>
        <h3 style={{ fontFamily: HEAD, fontSize: 16, fontWeight: 800, color: 'var(--koma-teal)', margin: 0, lineHeight: 1.3, textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: 'rgba(0,121,140,.3)' }}>
          {projet.titre}
        </h3>
        {projet.description && (
          <p style={{ fontSize: 13.5, color: '#6b7280', margin: 0, lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {projet.description}
          </p>
        )}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(projet.maitre_ouvrage || projet.promoteur) && (
            <div style={{ fontSize: 12.5, color: '#6b7280' }}>
              <span style={{ fontWeight: 700, color: 'var(--koma-teal)' }}>
                {projet.maitre_ouvrage ? t('projets.maitreOuvrage') : t('projets.promoteur')}
              </span> : {projet.maitre_ouvrage || projet.promoteur}
            </div>
          )}
          {projet.localisation && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#6b7280' }}>
              <MapPin size={12} /> {projet.localisation}
            </div>
          )}
          {projet.avancement_pct != null && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11.5, color: '#6b7280', fontWeight: 600 }}>{t('projets.avancement')}</span>
                <span style={{ fontSize: 11.5, color: 'var(--koma-teal)', fontWeight: 700 }}>{projet.avancement_pct}%</span>
              </div>
              <div style={{ height: 5, background: '#e5e7eb', borderRadius: 99 }}>
                <div style={{ height: '100%', background: 'var(--koma-teal)', borderRadius: 99, width: `${projet.avancement_pct}%` }} />
              </div>
            </div>
          )}
          {(projet.budget_estime || projet.investissement_prevu) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#6b7280' }}>
              <TrendingUp size={12} />
              {new Intl.NumberFormat('fr-FR').format(projet.budget_estime || projet.investissement_prevu)} {projet.devise || 'USD'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProjetsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('publics')
  const [data, setData]           = useState([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const LIMIT = 12

  const load = (p = 1, s = search, tab = activeTab) => {
    setLoading(true)
    if (tab === 'prives' && !user) {
      setData([]); setTotal(0); setLoading(false)
      return
    }
    const api    = tab === 'publics' ? projetsPublicsApi : projetsPrivesApi
    const params = { page: p, limit: LIMIT }
    if (s.trim()) params.search = s.trim()
    api.getAll(params)
      .then(res => { setData(res.data || []); setTotal(res.total || 0) })
      .catch(() => { setData([]); setTotal(0) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])
  useEffect(() => { if (activeTab === 'prives') load(1, search, 'prives') }, [user])

  const switchTab = (tab) => { setActiveTab(tab); setPage(1); setSearch(''); load(1, '', tab) }
  const handleSearch = (v) => { setSearch(v); setPage(1); load(1, v, activeTab) }
  const handlePage = (p) => { setPage(p); load(p) }
  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div style={{ background: 'var(--koma-gray-bg)', minHeight: '100vh', fontFamily: FONT }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--koma-teal-dark) 0%, var(--koma-teal) 100%)', padding: '64px 24px 0', textAlign: 'center' }}>
        <span className="eyebrow" style={{ color: 'rgba(255,255,255,.7)' }}>Simandou 2040</span>
        <h1 style={{ fontFamily: HEAD, fontSize: 'clamp(26px,4vw,42px)', fontWeight: 800, color: '#fff', margin: '12px 0 8px', lineHeight: 1.2 }}>
          {t('projets.title')}
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,.7)', maxWidth: '52ch', margin: '0 auto 32px' }}>
          {t('projets.desc')}
        </p>

        {/* Barre de recherche */}
        <div style={{ maxWidth: 520, margin: '0 auto 24px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder={t('projets.search')}
            value={search}
            onChange={e => handleSearch(e.target.value)}
            style={{ width: '100%', padding: '14px 18px 14px 46px', borderRadius: 50, border: 'none', fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box', boxShadow: '0 4px 12px rgba(0,0,0,.15)' }}
          />
        </div>

        {/* Tabs */}
        <div style={{ display: 'inline-flex', background: 'rgba(0,0,0,.2)', borderRadius: 50, padding: 4, gap: 4 }}>
          {[
            { v: 'publics', l: t('projets.tabPublic') },
            { v: 'prives',  l: t('projets.tabPrive') },
          ].map(tab => (
            <button key={tab.v} onClick={() => switchTab(tab.v)}
              style={{ padding: '9px 22px', borderRadius: 50, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 700, fontFamily: FONT, transition: 'all .15s',
                background: activeTab === tab.v ? '#fff' : 'transparent',
                color: activeTab === tab.v ? 'var(--koma-teal)' : 'rgba(255,255,255,.8)',
              }}>
              {tab.l}
            </button>
          ))}
        </div>
        <div style={{ height: 24 }} />
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20, fontFamily: FONT }}>
          {total} {t('projets.title').split(' ')[0].toLowerCase()}{total !== 1 ? 's' : ''}
        </p>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <span style={{ width: 36, height: 36, border: '3px solid #E2E8F0', borderTopColor: 'var(--koma-teal)', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />
          </div>
        ) : data.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: '#9ca3af', gap: 12 }}>
            <FolderOpen size={48} style={{ opacity: .3 }} />
            {activeTab === 'prives' && !user ? (
              <>
                <p style={{ fontSize: 15, margin: 0 }}>Connectez-vous pour voir les projets d'investissement privés</p>
                <a href="/login" style={{ fontSize: 13.5, color: 'var(--koma-teal)', fontWeight: 700, textDecoration: 'none' }}>Se connecter →</a>
              </>
            ) : (
              <p style={{ fontSize: 15, margin: 0 }}>{t('projets.noResults')}</p>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {data.map(p => (
              <ProjetCard key={p.id} projet={p} t={t} onClick={() => setSelected(p)} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 40 }}>
            <button onClick={() => handlePage(page - 1)} disabled={page <= 1}
              style={{ padding: '8px 18px', borderRadius: 50, border: '1.5px solid #e5e7eb', background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? .4 : 1, fontSize: 13, fontWeight: 600, fontFamily: FONT }}>
              {t('common.prev')}
            </button>
            <span style={{ fontSize: 13, color: '#6b7280', fontFamily: FONT }}>{t('common.page')} {page} {t('common.of')} {totalPages}</span>
            <button onClick={() => handlePage(page + 1)} disabled={page >= totalPages}
              style={{ padding: '8px 18px', borderRadius: 50, border: '1.5px solid #e5e7eb', background: '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? .4 : 1, fontSize: 13, fontWeight: 600, fontFamily: FONT }}>
              {t('common.next')}
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <ProjetModal projet={selected} onClose={() => setSelected(null)} t={t} />
    </div>
  )
}
