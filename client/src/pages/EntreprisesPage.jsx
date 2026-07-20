import { useEffect, useState } from 'react'
import { Search, Building2, Phone, Mail, Globe, MapPin, X, Check, ShieldCheck, Star } from 'lucide-react'
import { entreprisesApi } from '../lib/api'
import { useTranslation } from 'react-i18next'
import { tEnum, SECTEURS_ENT, TYPES_COMPTE } from '../lib/enumTranslations'

const TYPES = ['Tous', 'Nationale', 'Internationale', 'Sous-traitant', "Bureau d'études", 'Fournisseur']

function EntrepriseModal({ entreprise, onClose }) {
  const { t } = useTranslation()
  if (!entreprise) return null
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,38,59,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'white', borderRadius: 20, padding: '32px', maxWidth: 560, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,.18)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: '#F0F4F8', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={18} color="#6B7A8D" />
        </button>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--koma-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              {entreprise.logo_url
                ? <img src={entreprise.logo_url} alt={entreprise.nom} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                : <Building2 size={24} color="var(--koma-teal)" />
              }
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--koma-text)', margin: 0, fontFamily: 'var(--font-heading)' }}>{entreprise.nom}</h2>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--koma-teal)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{tEnum(t, TYPES_COMPTE, entreprise.type)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {entreprise.statut === 'actif' ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0' }}>
                <ShieldCheck size={13} /> {t('entreprises.badge.verified')}
              </span>
            ) : (
              <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'var(--koma-teal-light)', color: 'var(--koma-teal)' }}>
                {t('entreprises.modal.pending')}
              </span>
            )}
            {entreprise.experience_simandou && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: '#FEF3E0', color: '#92400E', border: '1px solid #FCD34D' }}>
                <Star size={12} fill="#92400E" /> Partenaire Simandou
              </span>
            )}
          </div>
        </div>

        {/* Infos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {entreprise.secteur && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#8A9A90', minWidth: 100, textTransform: 'uppercase', letterSpacing: '.06em', paddingTop: 2 }}>{t('entreprises.modal.secteur')}</span>
              <span style={{ fontSize: 14, color: 'var(--koma-text)' }}>{tEnum(t, SECTEURS_ENT, entreprise.secteur)}</span>
            </div>
          )}
          {entreprise.ville && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#8A9A90', minWidth: 100, textTransform: 'uppercase', letterSpacing: '.06em', paddingTop: 2 }}>{t('entreprises.modal.ville')}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, color: 'var(--koma-text)' }}>
                <MapPin size={13} color="var(--koma-teal)" /> {entreprise.ville}
              </span>
            </div>
          )}
          {entreprise.effectifs && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#8A9A90', minWidth: 100, textTransform: 'uppercase', letterSpacing: '.06em', paddingTop: 2 }}>{t('entreprises.modal.effectifs')}</span>
              <span style={{ fontSize: 14, color: 'var(--koma-text)' }}>{entreprise.effectifs} {t('common.people')}</span>
            </div>
          )}
          {entreprise.rccm && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#8A9A90', minWidth: 100, textTransform: 'uppercase', letterSpacing: '.06em', paddingTop: 2 }}>{t('entreprises.modal.rccm')}</span>
              <span style={{ fontSize: 14, color: 'var(--koma-text)' }}>{entreprise.rccm}</span>
            </div>
          )}
          {entreprise.capital_social && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#8A9A90', minWidth: 100, textTransform: 'uppercase', letterSpacing: '.06em', paddingTop: 2 }}>Capital</span>
              <span style={{ fontSize: 14, color: 'var(--koma-text)' }}>{Number(entreprise.capital_social).toLocaleString('fr-FR')} GNF</span>
            </div>
          )}
        </div>

        {/* Description */}
        {entreprise.description && (
          <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
            <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#8A9A90', textTransform: 'uppercase', letterSpacing: '.08em' }}>Description</p>
            <p style={{ margin: 0, fontSize: 13.5, color: 'var(--koma-text)', lineHeight: 1.7 }}>{entreprise.description}</p>
          </div>
        )}

        {/* Références techniques */}
        {entreprise.references_techniques?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#8A9A90', textTransform: 'uppercase', letterSpacing: '.08em' }}>Références techniques</p>
            <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {entreprise.references_techniques.map((r, i) => (
                <li key={i} style={{ fontSize: 13, color: 'var(--koma-text)', lineHeight: 1.5 }}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Certifications */}
        {entreprise.certifications?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {entreprise.certifications.map((c, i) => (
              <span key={i} style={{ background: '#EBF4FF', color: '#185FA5', borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{c}</span>
            ))}
          </div>
        )}

        {/* Contacts */}
        {(entreprise.telephone || entreprise.email || entreprise.site_web) && (
          <div style={{ background: 'var(--koma-gray-bg)', borderRadius: 14, padding: '16px 20px' }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, color: '#8A9A90', letterSpacing: '.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>{t('entreprises.modal.contacts')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {entreprise.telephone && (
                <a
                  href={`tel:${entreprise.telephone}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--koma-text)', fontSize: 14, fontWeight: 500 }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={15} color="#0F6E56" />
                  </div>
                  <span>{entreprise.telephone}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--koma-teal)', fontWeight: 600 }}>{t('entreprises.modal.call')}</span>
                </a>
              )}
              {entreprise.email && (
                <a
                  href={`mailto:${entreprise.email}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--koma-text)', fontSize: 14, fontWeight: 500 }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: '#EBF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={15} color="#185FA5" />
                  </div>
                  <span>{entreprise.email}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--koma-teal)', fontWeight: 600 }}>{t('entreprises.modal.email')}</span>
                </a>
              )}
              {entreprise.site_web && (
                <a
                  href={entreprise.site_web.startsWith('http') ? entreprise.site_web : `https://${entreprise.site_web}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'var(--koma-text)', fontSize: 14, fontWeight: 500 }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--koma-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Globe size={15} color="var(--koma-teal)" />
                  </div>
                  <span>{entreprise.site_web}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--koma-teal)', fontWeight: 600 }}>{t('entreprises.modal.visit')}</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function EntreprisesPage() {
  const { t } = useTranslation()
  const [entreprises, setEntreprises] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [typeFilter, setTypeFilter]   = useState('Tous')
  const [selected, setSelected]       = useState(null)
  const [copiedId, setCopiedId]       = useState(null)

  const copyEmail = (e, id, email) => {
    e.stopPropagation()
    navigator.clipboard.writeText(email).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  useEffect(() => {
    entreprisesApi.getAll({ statut: 'actif' })
      .then(res => setEntreprises(res?.data || []))
      .catch(() => setEntreprises([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = entreprises.filter((e) => {
    const matchSearch = e.nom?.toLowerCase().includes(search.toLowerCase())
    const matchType   = typeFilter === 'Tous' || e.type === typeFilter
    return matchSearch && matchType
  })

  return (
    <div className="min-h-screen bg-koma-gray py-8 md:py-10 px-4 md:px-8">
      <div className="mx-auto max-w-[1240px]">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="eyebrow">{t('entreprises.eyebrow')}</span>
            <h1 className="mt-3 text-[clamp(26px,3vw,40px)] text-koma-text">{t('entreprises.title')}</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A9A90]" />
            <input
              type="text"
              placeholder={t('entreprises.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-[10px] border border-[#e5e7eb] bg-white pl-9 pr-4 py-3 text-[14px] focus:outline-none focus:border-koma-teal transition"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`rounded-[20px] px-3.5 py-1.5 text-[12.5px] font-medium transition-all ${
                  typeFilter === t ? 'bg-koma-teal text-white' : 'bg-koma-teal-light text-koma-teal hover:bg-koma-teal/12'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-[#8A9A90]">
            <span className="h-7 w-7 border-2 border-koma-teal/20 border-t-koma-teal rounded-full animate-spin mr-3" />
            {t('entreprises.loading')}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center text-[#8A9A90]">
            <Building2 size={48} className="mb-4 opacity-20" />
            <p className="text-[15px]">{t('entreprises.empty')}</p>
          </div>
        ) : (
          <div className="rounded-[16px] border border-[#e5e7eb] bg-white overflow-hidden overflow-x-auto">
            <table className="w-full text-[14px] min-w-[600px]">
              <thead>
                <tr className="border-b border-[#f3f4f6] bg-[#f8fafc]">
                  <th className="text-left px-5 py-3.5 font-semibold text-[12px] tracking-widest uppercase text-koma-teal">{t('entreprises.columns.nom')}</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-[12px] tracking-widest uppercase text-koma-teal">{t('entreprises.columns.type')}</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-[12px] tracking-widest uppercase text-koma-teal">{t('entreprises.columns.secteur')}</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-[12px] tracking-widest uppercase text-koma-teal">{t('entreprises.columns.contacts')}</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-[12px] tracking-widest uppercase text-koma-teal">{t('entreprises.columns.statut')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-[#f3f4f6] hover:bg-[#f8fafc] transition-colors cursor-pointer"
                    onClick={() => setSelected(e)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {e.logo_url ? (
                          <img src={e.logo_url} alt={e.nom} className="h-8 w-8 rounded-[8px] object-contain border border-[#e5e7eb] bg-white flex-shrink-0" />
                        ) : (
                          <div className="h-8 w-8 rounded-[8px] bg-koma-teal-light flex items-center justify-center flex-shrink-0">
                            <Building2 size={15} color="var(--koma-teal)" />
                          </div>
                        )}
                        <span className="font-semibold text-koma-teal hover:underline underline-offset-2 cursor-pointer">{e.nom}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#6b7280]">{tEnum(t, TYPES_COMPTE, e.type)}</td>
                    <td className="px-5 py-3.5 text-[#6b7280]">{tEnum(t, SECTEURS_ENT, e.secteur)}</td>
                    <td className="px-5 py-3.5">
                      <div style={{ display: 'flex', gap: 6 }}>
                        {e.telephone && (
                          <a
                            href={`tel:${e.telephone}`}
                            onClick={ev => ev.stopPropagation()}
                            title={e.telephone}
                            style={{ width: 30, height: 30, borderRadius: 8, background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', flexShrink: 0 }}
                          >
                            <Phone size={13} color="#0F6E56" />
                          </a>
                        )}
                        {e.site_web && (
                          <a
                            href={e.site_web.startsWith('http') ? e.site_web : `https://${e.site_web}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={ev => ev.stopPropagation()}
                            title={e.site_web}
                            style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--koma-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', flexShrink: 0 }}
                          >
                            <Globe size={13} color="var(--koma-teal)" />
                          </a>
                        )}
                        {e.email && (
                          <button
                            onClick={ev => copyEmail(ev, e.id, e.email)}
                            title={copiedId === e.id ? 'Copié !' : e.email}
                            style={{ width: 30, height: 30, borderRadius: 8, background: copiedId === e.id ? '#D1FAE5' : '#EBF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0, transition: 'background .2s' }}
                          >
                            {copiedId === e.id ? <Check size={13} color="#065F46" /> : <Mail size={13} color="#185FA5" />}
                          </button>
                        )}
                        {!e.telephone && !e.email && !e.site_web && <span style={{ color: '#C4C4C4', fontSize: 13 }}>—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {e.statut === 'actif' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0' }}>
                          <ShieldCheck size={12} /> {t('entreprises.badge.verified')}
                        </span>
                      ) : (
                        <span className="rounded-full px-2.5 py-0.5 text-[11.5px] font-medium bg-koma-teal-light text-koma-teal">
                          {t('entreprises.modal.pending')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EntrepriseModal entreprise={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
