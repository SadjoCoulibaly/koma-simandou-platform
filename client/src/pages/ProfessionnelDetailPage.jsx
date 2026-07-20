import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Phone, Mail, MapPin, ArrowLeft, Briefcase, Globe, CheckCircle } from 'lucide-react'
import { humanResourcesApi } from '../lib/api'
import { useTranslation } from 'react-i18next'

const FONT = 'var(--font-body)'
const HEAD = 'var(--font-heading)'

const DISPO_COLORS = {
  disponible:   { bg: '#D1FAE5', text: '#065F46' },
  partiel:      { bg: '#FEF3E0', text: '#92400E' },
  indisponible: { bg: '#FEE2E2', text: '#991B1B' },
}

export default function ProfessionnelDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const [pro, setPro] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    humanResourcesApi.getById(id)
      .then(data => {
        if (!data || data.statut !== 'actif') { setNotFound(true); return }
        setPro(data)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--koma-gray-bg)' }}>
      <span style={{ width: 36, height: 36, border: '3px solid #E2E8F0', borderTopColor: 'var(--koma-teal)', borderRadius: '50%', animation: 'spin .8s linear infinite', display: 'inline-block' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (notFound) return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--koma-gray-bg)', fontFamily: FONT, gap: 16, padding: 24 }}>
      <p style={{ fontSize: 16, color: '#6b7280' }}>{t('professionnel.notFound')}</p>
      <Link to="/professionnels" style={{ color: 'var(--koma-teal)', textDecoration: 'none', fontWeight: 600 }}>{t('professionnel.backAll')}</Link>
    </div>
  )

  const colors = DISPO_COLORS[pro.disponibilite] || { bg: '#F3F4F6', text: '#374151' }
  const dispoLabel = pro.disponibilite ? t(`common.${pro.disponibilite}`, { defaultValue: pro.disponibilite }) : '—'

  return (
    <div style={{ background: 'var(--koma-gray-bg)', minHeight: '100vh', fontFamily: FONT, padding: '48px 16px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Retour */}
        <Link to="/professionnels"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--koma-teal)', textDecoration: 'none', fontSize: 13.5, fontWeight: 600, marginBottom: 28 }}>
          <ArrowLeft size={15} /> {t('professionnel.back')}
        </Link>

        {/* Carte principale */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>

          {/* En-tête */}
          <div style={{ background: 'linear-gradient(135deg, var(--koma-teal-dark) 0%, var(--koma-teal) 100%)', padding: '36px 32px', display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: 90, height: 90, borderRadius: '50%', border: '3px solid rgba(255,255,255,.3)', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {pro.photo_url
                ? <img src={pro.photo_url} alt={pro.nom_complet} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: HEAD, fontSize: 32, fontWeight: 800, color: '#fff' }}>{pro.nom_complet?.charAt(0) ?? '?'}</span>
              }
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <span style={{ display: 'inline-block', background: colors.bg, color: colors.text, borderRadius: 50, padding: '3px 12px', fontSize: 11.5, fontWeight: 700, marginBottom: 8 }}>
                {dispoLabel}
              </span>
              <h1 style={{ fontFamily: HEAD, fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, color: '#fff', margin: '0 0 6px', lineHeight: 1.2 }}>
                {pro.nom_complet}
              </h1>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,.8)', margin: 0 }}>{pro.fonction}</p>
              {pro.localisation && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, color: 'rgba(255,255,255,.65)', fontSize: 13 }}>
                  <MapPin size={13} /> {pro.localisation}
                </div>
              )}
            </div>
          </div>

          {/* Boutons d'action */}
          <div style={{ display: 'flex', gap: 12, padding: '20px 32px', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap' }}>
            {pro.telephone && (
              <a href={`tel:${pro.telephone}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--koma-teal)', color: '#fff', textDecoration: 'none', borderRadius: 50, padding: '11px 22px', fontSize: 14, fontWeight: 700, transition: 'background .15s' }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--koma-teal-dark)'}
                onMouseOut={e => e.currentTarget.style.background = 'var(--koma-teal)'}>
                <Phone size={15} /> {t('professionnel.call')}
              </a>
            )}
            {pro.email && (
              <a href={`mailto:${pro.email}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: 'var(--koma-teal)', textDecoration: 'none', borderRadius: 50, padding: '11px 22px', fontSize: 14, fontWeight: 700, border: '1.5px solid var(--koma-teal)', transition: 'all .15s' }}
                onMouseOver={e => { e.currentTarget.style.background = 'var(--koma-teal-light)' }}
                onMouseOut={e => { e.currentTarget.style.background = '#fff' }}>
                <Mail size={15} /> {t('professionnel.sendEmail')}
              </a>
            )}
          </div>

          {/* Corps */}
          <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Infos */}
            <div>
              <h2 style={{ fontFamily: HEAD, fontSize: 14, fontWeight: 700, color: 'var(--koma-teal)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>
                {t('professionnel.infoTitle')}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {[
                  { icon: <Briefcase size={14} />, label: t('professionnel.fonction'),    value: pro.fonction },
                  { icon: <Globe size={14} />,     label: t('professionnel.nationalite'), value: pro.nationalite },
                  { icon: <MapPin size={14} />,    label: t('professionnel.localisation'), value: pro.localisation },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} style={{ background: 'var(--koma-gray-bg)', borderRadius: 10, padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--koma-teal)', marginBottom: 4 }}>
                      {row.icon}
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>{row.label}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--koma-text)' }}>{row.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Compétences */}
            {pro.competences?.length > 0 && (
              <div>
                <h2 style={{ fontFamily: HEAD, fontSize: 14, fontWeight: 700, color: 'var(--koma-teal)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>
                  {t('professionnel.competencesTitle')}
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {pro.competences.map((c, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#EBF4FF', color: '#185FA5', borderRadius: 999, padding: '5px 12px', fontSize: 13, fontWeight: 600 }}>
                      <CheckCircle size={12} /> {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Projets réalisés */}
            {pro.projet_realise && (
              <div>
                <h2 style={{ fontFamily: HEAD, fontSize: 14, fontWeight: 700, color: 'var(--koma-teal)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>
                  {t('professionnel.projetsTitle')}
                </h2>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-line' }}>
                  {pro.projet_realise}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
