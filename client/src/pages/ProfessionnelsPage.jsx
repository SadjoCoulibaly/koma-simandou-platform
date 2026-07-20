import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Phone, Mail } from 'lucide-react'
import { humanResourcesApi } from '../lib/api'
import { useTranslation } from 'react-i18next'

const FONT = 'var(--font-body)'
const HEAD = 'var(--font-heading)'

const DISPO_COLORS = {
  disponible:   { bg: '#D1FAE5', text: '#065F46' },
  partiel:      { bg: '#FEF3E0', text: '#92400E' },
  indisponible: { bg: '#FEE2E2', text: '#991B1B' },
}

const FONCTIONS_FILTER = [
  'Toutes',
  'Ingénieur minier', 'Géologue', 'Topographe', 'Chef de chantier',
  'Opérateur engins', 'Technicien de maintenance', 'Électromécanicien',
  'Soudeur', 'Chauffeur', 'Responsable HSE', 'Logisticien',
  'Comptable', 'Juriste', 'Informaticien', 'Autre',
]

export default function ProfessionnelsPage() {
  const { t } = useTranslation()
  const [pros, setPros]     = useState([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [search, setSearch] = useState('')
  const [fonctionFilter, setFonctionFilter] = useState('Toutes')
  const [dispoFilter, setDispoFilter]       = useState('tous')
  const [loading, setLoading] = useState(true)
  const LIMIT = 12

  const load = (p = 1, s = search, fn = fonctionFilter, dispo = dispoFilter) => {
    setLoading(true)
    const params = { page: p, limit: LIMIT, statut: 'actif' }
    if (s.trim())        params.search       = s.trim()
    if (fn !== 'Toutes') params.fonction     = fn
    if (dispo !== 'tous') params.disponibilite = dispo
    humanResourcesApi.getAll(params)
      .then(res => { setPros(res.data || []); setTotal(res.total || 0) })
      .catch(() => { setPros([]); setTotal(0) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSearch = (v) => { setSearch(v); setPage(1); load(1, v, fonctionFilter, dispoFilter) }
  const handleFonction = (f) => { setFonctionFilter(f); setPage(1); load(1, search, f, dispoFilter) }
  const handleDispo = (d) => { setDispoFilter(d); setPage(1); load(1, search, fonctionFilter, d) }
  const handlePage = (p) => { setPage(p); load(p) }

  const totalPages = Math.ceil(total / LIMIT)

  const dispoFilters = [
    { v: 'tous',         l: t('professionnels.all') },
    { v: 'disponible',   l: t('common.disponible') },
    { v: 'partiel',      l: t('common.partiel') },
    { v: 'indisponible', l: t('common.indisponible') },
  ]

  return (
    <div style={{ background: 'var(--koma-gray-bg)', minHeight: '100vh', fontFamily: FONT }}>

      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(135deg, var(--koma-teal-dark) 0%, var(--koma-teal) 100%)', padding: '64px 24px 48px', textAlign: 'center' }}>
        <span className="eyebrow" style={{ color: 'rgba(255,255,255,.7)' }}>Simandou 2040</span>
        <h1 style={{ fontFamily: HEAD, fontSize: 'clamp(26px,4vw,42px)', fontWeight: 800, color: '#fff', margin: '12px 0 8px', lineHeight: 1.2 }}>
          {t('professionnels.title')}
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,.7)', maxWidth: '52ch', margin: '0 auto 32px' }}>
          {t('professionnels.desc')}
        </p>

        {/* Barre de recherche */}
        <div style={{ maxWidth: 520, margin: '0 auto', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder={t('professionnels.search')}
            value={search}
            onChange={e => handleSearch(e.target.value)}
            style={{ width: '100%', padding: '14px 18px 14px 46px', borderRadius: 50, border: 'none', fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box', boxShadow: '0 4px 12px rgba(0,0,0,.15)' }}
          />
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>

        {/* Filtres disponibilité */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {dispoFilters.map(d => (
            <button key={d.v} onClick={() => handleDispo(d.v)}
              style={{
                padding: '7px 16px', borderRadius: 50, border: '1.5px solid',
                borderColor: dispoFilter === d.v ? 'var(--koma-teal)' : 'transparent',
                background: dispoFilter === d.v ? 'var(--koma-teal)' : '#fff',
                color: dispoFilter === d.v ? '#fff' : 'var(--koma-text)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: FONT, transition: 'all .15s',
              }}>
              {d.l}
            </button>
          ))}
          <span style={{ fontSize: 13, color: '#9ca3af', alignSelf: 'center', marginLeft: 8 }}>
            {total} {t('professionnels.title').split(' ')[0].toLowerCase()}{total !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Filtres fonctions */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
          {FONCTIONS_FILTER.map(f => (
            <button key={f} onClick={() => handleFonction(f)}
              style={{
                padding: '5px 13px', borderRadius: 50, border: '1.5px solid',
                borderColor: fonctionFilter === f ? 'var(--koma-teal)' : '#e5e7eb',
                background: fonctionFilter === f ? 'var(--koma-teal-light)' : '#fff',
                color: fonctionFilter === f ? 'var(--koma-teal)' : '#6b7280',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: FONT, transition: 'all .15s',
              }}>
              {f}
            </button>
          ))}
        </div>

        {/* Grille */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <span style={{ width: 36, height: 36, border: '3px solid #E2E8F0', borderTopColor: 'var(--koma-teal)', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />
          </div>
        ) : pros.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af', fontSize: 15 }}>
            {t('professionnels.noResults')}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {pros.map(pro => {
              const colors = DISPO_COLORS[pro.disponibilite] || { bg: '#F3F4F6', text: '#374151' }
              const dispoLabel = pro.disponibilite ? t(`common.${pro.disponibilite}`, { defaultValue: pro.disponibilite }) : '—'
              return (
                <div key={pro.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)', transition: 'transform .15s, box-shadow .15s' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.1)' }}
                  onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.05)' }}>

                  {/* Header carte */}
                  <div style={{ background: 'var(--koma-gray-bg)', padding: '20px 20px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <Link to={`/professionnels/${pro.id}`} style={{ width: 54, height: 54, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'var(--koma-teal-light)', border: '2px solid rgba(0,121,140,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                      {pro.photo_url
                        ? <img src={pro.photo_url} alt={pro.nom_complet} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontFamily: HEAD, fontSize: 20, fontWeight: 800, color: 'var(--koma-teal)' }}>{pro.nom_complet?.charAt(0) ?? '?'}</span>
                      }
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'inline-block', background: colors.bg, color: colors.text, borderRadius: 50, padding: '2px 9px', fontSize: 10.5, fontWeight: 700, marginBottom: 4 }}>{dispoLabel}</span>
                      <Link to={`/professionnels/${pro.id}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{ fontFamily: HEAD, fontSize: 15.5, fontWeight: 800, color: 'var(--koma-teal)', margin: '0 0 2px', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {pro.nom_complet}
                        </h3>
                      </Link>
                      <p style={{ fontSize: 12.5, color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pro.fonction}</p>
                    </div>
                  </div>

                  {/* Corps */}
                  <div style={{ padding: '12px 20px 16px' }}>
                    {pro.localisation && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#6b7280', marginBottom: 10 }}>
                        <MapPin size={12} /> {pro.localisation}
                      </div>
                    )}
                    {pro.competences?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                        {pro.competences.slice(0, 3).map((c, i) => (
                          <span key={i} style={{ background: '#EBF4FF', color: '#185FA5', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{c}</span>
                        ))}
                        {pro.competences.length > 3 && <span style={{ fontSize: 11, color: '#9ca3af' }}>+{pro.competences.length - 3}</span>}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Link to={`/professionnels/${pro.id}`}
                        style={{ flex: 1, minWidth: 100, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--koma-teal)', color: '#fff', textDecoration: 'none', borderRadius: 50, padding: '8px 14px', fontSize: 12.5, fontWeight: 700, transition: 'background .15s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'var(--koma-teal-dark)'}
                        onMouseOut={e => e.currentTarget.style.background = 'var(--koma-teal)'}>
                        {t('professionnels.viewProfile')}
                      </Link>
                      {pro.telephone && (
                        <a href={`tel:${pro.telephone}`}
                          title={pro.telephone}
                          style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #d1fae5', background: '#ecfdf5', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#065f46', textDecoration: 'none', flexShrink: 0 }}>
                          <Phone size={14} />
                        </a>
                      )}
                      {pro.email && (
                        <a href={`mailto:${pro.email}`}
                          title={pro.email}
                          style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid #dbeafe', background: '#eff6ff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8', textDecoration: 'none', flexShrink: 0 }}>
                          <Mail size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
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
    </div>
  )
}
