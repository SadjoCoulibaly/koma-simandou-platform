import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Building2, Truck, Landmark, Factory, ArrowRight } from 'lucide-react'
import { statsApi } from '../../lib/api'
import { useScrollFade } from '../../hooks/useScrollFade'

const TEAL_PALETTE  = ['#00798C','#00263B','#009BAD','#005F6E','#EBFCFF','#80CDD6']
const GREEN_PALETTE = ['#1C7A4D','#0F6E56','#2E9B6A','#4CAF82','#A3D9B8','#D4EDDA']

function CustomTooltip({ active, payload, t }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div style={{ background: 'white', borderRadius: 10, padding: '8px 14px', boxShadow: '0 4px 16px rgba(0,0,0,.12)', fontSize: 13, border: '1px solid #e5e7eb' }}>
      <p style={{ margin: 0, fontWeight: 700, color: '#0D1B2E' }}>{name}</p>
      <p style={{ margin: '2px 0 0', color: '#00798C', fontWeight: 600 }}>
        {value} {value > 1 ? t('platformOverview.entrees') : t('platformOverview.entree')}
      </p>
    </div>
  )
}

function DonutCard({ title, data, palette, emptyMsg, t }) {
  const hasData = data?.some(d => d.value > 0)
  const total   = data?.reduce((s, d) => s + d.value, 0) || 0
  return (
    <div style={{ background: 'white', borderRadius: 20, padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,.05)', height: '100%' }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 16px' }}>{title}</p>
      {!hasData ? (
        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>{emptyMsg}</div>
      ) : (
        <>
          <div style={{ position: 'relative', height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip t={t} />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ textAlign: 'center' }}>
                <b style={{ fontSize: 26, fontWeight: 800, color: '#00263B', lineHeight: 1 }}>{total}</b>
                <p style={{ fontSize: 10, color: '#9ca3af', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '.1em' }}>{t('platformOverview.total')}</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14 }}>
            {data.slice(0, 5).map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: palette[i % palette.length], flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#00263B' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}


export default function PlatformOverview() {
  const navigate   = useNavigate()
  const { t }      = useTranslation()
  const headRef    = useScrollFade()

  const [dist, setDist]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statsApi.getDistribution()
      .then(d => { setDist(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const KPI = [
    { icon: Building2, label: t('platformOverview.kpiEntreprises'),   value: dist?.entreprises?.total ?? 0,    color: '#00798C', bg: '#EBFCFF' },
    { icon: Truck,     label: t('platformOverview.kpiEquipements'),    value: dist?.equipements?.total ?? 0,    color: '#1C7A4D', bg: '#E1F5EE' },
    { icon: Landmark,  label: t('platformOverview.kpiProjetsPublics'), value: dist?.projets?.total_publics ?? 0, color: '#7A4FB5', bg: '#F0EAFB' },
    { icon: Factory,   label: t('platformOverview.kpiProjetsPrives'),  value: dist?.projets?.total_prives ?? 0,  color: '#9A4820', bg: '#FAEEE6' },
  ]

  return (
    <section className="py-[100px]" style={{ background: '#F8FAFC' }} id="platform-overview">
      <div className="mx-auto max-w-[1240px] px-4 md:px-8">

        {/* En-tête */}
        <div ref={headRef} className="fade-in text-center mb-14">
          <span className="eyebrow">{t('platformOverview.eyebrow')}</span>
          <h2 className="mt-4 text-[clamp(28px,3.5vw,46px)] max-w-[24ch] mx-auto">
            {t('platformOverview.title')}
          </h2>
          <p className="mt-4 text-[15px] text-[#6b7280] max-w-[54ch] mx-auto leading-relaxed">
            {t('platformOverview.subtitle')}
          </p>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {KPI.map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} style={{ background: 'white', borderRadius: 16, padding: '18px 20px', border: '1px solid #e5e7eb', boxShadow: '0 1px 6px rgba(0,0,0,.05)' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Icon size={18} color={color} />
              </div>
              {loading
                ? <div style={{ height: 28, width: 48, borderRadius: 8, background: '#F3F4F6', animation: 'pulse 1.4s ease-in-out infinite', marginBottom: 6 }} />
                : <p style={{ fontSize: 28, fontWeight: 800, color: '#00263B', margin: '0 0 4px', lineHeight: 1 }}>{value.toLocaleString()}</p>
              }
              <p style={{ fontSize: 12, color: '#6b7280', margin: 0, fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} style={{ background: 'white', borderRadius: 20, height: 280, border: '1px solid #e5e7eb', animation: 'pulse 1.4s ease-in-out infinite' }} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <DonutCard
              title={t('platformOverview.chartEntreprises')}
              data={dist?.entreprises?.par_type || []}
              palette={TEAL_PALETTE}
              emptyMsg={t('platformOverview.emptyEntreprises')}
              t={t}
            />
            <DonutCard
              title={t('platformOverview.chartProjets')}
              data={[
                ...(dist?.projets?.publics_par_statut || []),
                ...(dist?.projets?.prives_par_categorie?.slice(0, 3) || []),
              ]}
              palette={GREEN_PALETTE}
              emptyMsg={t('platformOverview.emptyProjets')}
              t={t}
            />
          </div>
        )}

        {/* Disponibilité équipements */}
        {!loading && dist?.equipements?.total > 0 && (
          <div style={{ background: 'white', borderRadius: 20, padding: '20px 24px', border: '1px solid #e5e7eb', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 8px' }}>
                {t('platformOverview.disponibilite')}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 10, borderRadius: 999, background: '#F3F4F6', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.round((dist.equipements.disponibles / dist.equipements.total) * 100)}%`, background: '#1C7A4D', borderRadius: 999, transition: 'width 1s ease' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1C7A4D', minWidth: 36 }}>
                  {Math.round((dist.equipements.disponibles / dist.equipements.total) * 100)}%
                </span>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>
                  ✅ <b style={{ color: '#1C7A4D' }}>{dist.equipements.disponibles}</b>{' '}
                  {dist.equipements.disponibles > 1 ? t('platformOverview.disponiblesPlural') : t('platformOverview.disponibles')}
                </span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>
                  ❌ <b style={{ color: '#B23A2E' }}>{dist.equipements.indisponibles}</b>{' '}
                  {dist.equipements.indisponibles > 1 ? t('platformOverview.indisponiblePlural') : t('platformOverview.indisponible')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-[20px] px-8 py-7 mt-8"
          style={{ background: 'var(--koma-teal-dark)' }}
        >
          <p className="text-[16px] font-semibold text-white leading-snug m-0">
            {t('platformOverview.ctaText')}
          </p>
          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center gap-2 whitespace-nowrap text-[14px] font-bold text-white transition-all hover:-translate-y-0.5 flex-shrink-0"
            style={{ borderRadius: 50, background: 'var(--koma-red)', padding: '12px 24px', border: 'none', cursor: 'pointer' }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--koma-red-hover)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--koma-red)'}
          >
            {t('platformOverview.ctaBtn')} <ArrowRight size={15} />
          </button>
        </div>

      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </section>
  )
}
