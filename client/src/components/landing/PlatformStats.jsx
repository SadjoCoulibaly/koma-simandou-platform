import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Truck, Landmark, Factory, ArrowRight, UserPlus } from 'lucide-react'
import { statsApi } from '../../lib/api'
import { useScrollFade } from '../../hooks/useScrollFade'
import { useTranslation } from 'react-i18next'

function StatCard({ icon: Icon, value, loading, label, delay }) {
  const ref = useRef(null)
  const [count, setCount] = useState(0)
  const visibleRef = useRef(false)
  const animatingRef = useRef(false)

  const startAnimation = (target) => {
    if (animatingRef.current) return
    animatingRef.current = true
    const dur = 1800
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1)
      const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setCount(Math.round(ease * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          visibleRef.current = true
          if (!loading && value > 0) startAnimation(value)
          observer.unobserve(el)
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (visibleRef.current && !loading && value > 0 && !animatingRef.current) {
      startAnimation(value)
    }
  }, [value, loading])

  const display = loading
    ? null
    : value > 0
      ? count.toLocaleString('fr-FR')
      : '0'

  return (
    <div
      ref={ref}
      className="fade-in flex flex-col items-center text-center p-8 rounded-[24px] bg-white border border-[#e5e7eb] shadow-[0_2px_12px_rgba(0,0,0,.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_32px_rgba(0,121,140,.13)] hover:border-koma-teal/30"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className="h-[56px] w-[56px] flex items-center justify-center rounded-[16px] mb-5"
        style={{ background: 'var(--koma-teal-light)' }}
      >
        <Icon size={26} color="#00798C" />
      </div>

      <b
        className="block font-heading font-extrabold text-[48px] leading-none mb-2 tabular-nums"
        style={{ color: 'var(--koma-teal-dark)', minHeight: '1.1em' }}
      >
        {loading
          ? <span className="inline-block h-10 w-16 rounded-[10px] animate-pulse" style={{ background: 'var(--koma-teal-light)' }} />
          : display
        }
      </b>

      <span className="text-[13.5px] text-[#6b7280] font-medium leading-snug max-w-[14ch]">
        {label}
      </span>
    </div>
  )
}

export default function PlatformStats() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const headRef = useScrollFade()
  const ctaRef = useScrollFade()

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statsApi.getPublic()
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => {
        setStats({ entreprises: 0, equipements: 0, projets_publics: 0, projets_prives: 0 })
        setLoading(false)
      })
  }, [])

  const s = stats || { entreprises: 0, equipements: 0, projets_publics: 0, projets_prives: 0 }

  const STATS = [
    { icon: Building2, value: s.entreprises     ?? 0, label: t('platformStats.stat1') },
    { icon: Truck,     value: s.equipements     ?? 0, label: t('platformStats.stat2') },
    { icon: Landmark,  value: s.projets_publics ?? 0, label: t('platformStats.stat3') },
    { icon: Factory,   value: s.projets_prives  ?? 0, label: t('platformStats.stat4') },
  ]

  return (
    <section className="py-[104px]" style={{ background: 'var(--koma-gray-bg)' }} id="plateforme-stats">
      <div className="mx-auto max-w-[1240px] px-4 md:px-8">

        {/* Head */}
        <div ref={headRef} className="fade-in text-center mb-14">
          <span className="eyebrow">{t('platformStats.eyebrow')}</span>
          <h2 className="mt-4 text-[clamp(30px,3.8vw,50px)] max-w-[22ch] mx-auto">
            {t('platformStats.title')}
          </h2>
          <p className="mt-4 text-[15.5px] text-[#6b7280] max-w-[52ch] mx-auto leading-relaxed">
            {t('platformStats.subtitle')}
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {STATS.map(({ icon, value, label }, i) => (
            <StatCard
              key={label}
              icon={icon}
              value={value}
              loading={loading}
              label={label}
              delay={i * 80}
            />
          ))}
        </div>

        {/* CTA banner */}
        <div
          ref={ctaRef}
          className="fade-in flex flex-col md:flex-row items-center justify-between gap-6 rounded-[24px] px-8 py-8 md:px-12"
          style={{ background: 'var(--koma-teal-dark)' }}
        >
          <div className="flex items-center gap-4">
            <div
              className="hidden sm:flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px]"
              style={{ background: 'rgba(0,121,140,.35)' }}
            >
              <UserPlus size={22} color="white" />
            </div>
            <div>
              <p className="text-[17px] font-semibold text-white leading-snug">
                {t('platformStats.ctaText')}
              </p>
              <p className="mt-1 text-[12.5px]" style={{ color: 'rgba(255,255,255,.55)' }}>
                {t('platformStats.ctaSub')}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center gap-2 whitespace-nowrap text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{
              borderRadius: 50,
              background: 'var(--koma-red)',
              padding: '13px 26px',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--koma-red-hover)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--koma-red)'}
          >
            {t('platformStats.ctaBtn')}
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </section>
  )
}
