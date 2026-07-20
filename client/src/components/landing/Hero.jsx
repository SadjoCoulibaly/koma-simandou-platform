import { useState, useEffect, useRef } from 'react'
import { ArrowRight, CalendarCheck, MapPin, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

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

export default function Hero() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { jours, heures, minutes, secondes, ended } = useCountdown(FORUM_DATE)

  const sectionRef  = useRef(null)
  const rafRef      = useRef(null)
  const targetRef   = useRef({ x: 0, y: 0 })
  const currentRef  = useRef({ x: 0, y: 0 })
  const [mouse, setMouse] = useState({ x: 0, y: 0, inside: false })

  useEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t
    const tick = () => {
      const cx = lerp(currentRef.current.x, targetRef.current.x, 0.07)
      const cy = lerp(currentRef.current.y, targetRef.current.y, 0.07)
      if (Math.abs(cx - currentRef.current.x) > 0.0005 || Math.abs(cy - currentRef.current.y) > 0.0005) {
        currentRef.current = { x: cx, y: cy }
        setMouse(m => ({ ...m, x: cx, y: cy }))
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const onMouseMove = (e) => {
    const rect = sectionRef.current?.getBoundingClientRect()
    if (!rect) return
    targetRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top)  / rect.height,
    }
    setMouse(m => ({ ...m, inside: true }))
  }

  const onMouseLeave = () => {
    targetRef.current = { x: 0.5, y: 0.5 }
    setMouse(m => ({ ...m, inside: false }))
  }

  const px = (mouse.x - 0.5) * -28
  const py = (mouse.y - 0.5) * -16
  const sx = mouse.inside ? mouse.x * 100 : 62
  const sy = mouse.inside ? mouse.y * 100 : 38

  const COUNTDOWN = [
    { v: jours,    l: t('hero.days') },
    { v: heures,   l: t('hero.hours') },
    { v: minutes,  l: t('hero.minutes') },
    { v: secondes, l: t('hero.seconds') },
  ]

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative overflow-hidden text-white py-20 pb-28"
      style={{ background: 'var(--koma-teal-dark)' }}
    >
      {/* Image parallaxe */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: '-8% -5%',
          backgroundImage: 'url(/simandou_hero.jpg)',
          backgroundSize: 'cover', backgroundPosition: 'center 28%',
          transform: `translate(${px}px, ${py}px)`,
          transition: 'transform .05s linear',
          filter: 'brightness(.45) saturate(1.15) contrast(1.06)',
          willChange: 'transform',
        }}
      />

      {/* Dégradé protection texte */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background: `
            linear-gradient(90deg,
              rgba(0,38,59,.97)  0%,
              rgba(0,38,59,.88) 38%,
              rgba(0,38,59,.55) 62%,
              rgba(0,38,59,.18) 100%
            ),
            linear-gradient(180deg,
              rgba(0,38,59,.25) 0%,
              transparent       40%,
              rgba(0,38,59,.40) 100%
            )
          `,
          pointerEvents: 'none',
        }}
      />

      {/* Spotlight teal */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 55% 55% at ${sx}% ${sy}%, rgba(0,121,140,.18) 0%, transparent 68%)`,
          transition: mouse.inside ? 'background .08s linear' : 'background .6s ease-out',
          pointerEvents: 'none', mixBlendMode: 'screen',
        }}
      />

      {/* Glow coin top-right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[100px] -right-16 h-[500px] w-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(0,121,140,.12), transparent 65%)' }}
      />

      {/* Contenu */}
      <div className="relative z-[2] mx-auto max-w-[1240px] px-4 md:px-8">

        {/* Bandeau Forum */}
        <div
          className="animate-[rise_.9s_cubic-bezier(.16,1,.3,1)_.05s_backwards] mb-10 rounded-[16px] overflow-hidden"
          style={{ border: '1px solid rgba(0,121,140,.4)', background: 'rgba(0,121,140,.15)', backdropFilter: 'blur(4px)' }}
        >
          <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, var(--koma-teal), rgba(0,121,140,.4), var(--koma-teal))' }} />

          <div className="flex flex-wrap items-center justify-between gap-4 px-4 md:px-6 py-4 md:py-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CalendarCheck size={15} style={{ color: 'var(--koma-teal)' }} />
                <span className="text-[11px] tracking-[.18em] uppercase font-semibold" style={{ color: 'rgba(255,255,255,.65)' }}>
                  {t('hero.forumBanner')}
                </span>
              </div>
              <p className="text-[17px] font-semibold text-white leading-snug">
                {t('hero.forumTitle')}
              </p>
              <div className="flex items-center gap-4 mt-1.5">
                <span className="flex items-center gap-1.5 text-[12.5px]" style={{ color: 'rgba(255,255,255,.55)' }}>
                  <Clock size={12} /> {t('hero.forumDate')}
                </span>
                <span className="flex items-center gap-1.5 text-[12.5px]" style={{ color: 'rgba(255,255,255,.55)' }}>
                  <MapPin size={12} /> {t('hero.forumPlace')}
                </span>
              </div>
            </div>

            {/* Compte à rebours */}
            {!ended ? (
              <div className="hidden sm:flex items-center gap-3">
                {COUNTDOWN.map(({ v, l }, i) => (
                  <div key={l} className="flex items-center gap-3">
                    <div className="text-center">
                      <div
                        className="min-w-[54px] rounded-[10px] px-2 py-2 text-center"
                        style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(0,121,140,.4)' }}
                      >
                        <span className="block font-heading font-extrabold text-[28px] leading-none text-white tabular-nums">
                          {String(v).padStart(2, '0')}
                        </span>
                      </div>
                      <span className="mt-1 block text-[9.5px] tracking-[.14em] uppercase font-semibold" style={{ color: 'rgba(255,255,255,.45)' }}>
                        {l}
                      </span>
                    </div>
                    {i < 3 && (
                      <span className="mb-4 text-[20px] font-light" style={{ color: 'rgba(255,255,255,.3)' }}>:</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="rounded-[10px] px-4 py-2"
                style={{ background: 'rgba(0,121,140,.3)', border: '1px solid rgba(0,121,140,.5)' }}
              >
                <span className="text-[13px] font-semibold text-white">{t('hero.forumLive')}</span>
              </div>
            )}

            {/* CTA inscription */}
            <button
              onClick={() => navigate('/forum/inscription')}
              className="inline-flex items-center gap-2 whitespace-nowrap text-[13.5px] font-semibold text-white transition-transform hover:-translate-y-0.5"
              style={{ borderRadius: 50, background: 'var(--koma-red)', padding: '12px 20px', border: 'none', cursor: 'pointer', transition: 'background .15s' }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--koma-red-hover)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--koma-red)'}
            >
              <CalendarCheck size={15} />
              {t('hero.forumRegister')}
            </button>
          </div>
        </div>

        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-4 animate-[rise_.9s_cubic-bezier(.16,1,.3,1)_.18s_backwards]">
          <span style={{ width: 20, height: 2, background: 'var(--koma-teal)', display: 'inline-block', borderRadius: 2 }} />
          <span className="text-[11px] tracking-[.18em] uppercase font-semibold" style={{ color: 'rgba(255,255,255,.7)' }}>
            {t('hero.badge')}
          </span>
        </div>

        {/* H1 */}
        <h1
          className="mt-2 mb-6 max-w-[15ch] text-[clamp(40px,6.4vw,80px)] font-extrabold font-heading text-white animate-[rise_.9s_cubic-bezier(.16,1,.3,1)_.28s_backwards]"
          style={{ lineHeight: 1.1 }}
        >
          {t('hero.title1')}{' '}
          <span style={{ color: 'var(--koma-teal)' }}>{t('hero.title2')}</span>{' '}
          {t('hero.title3')}
        </h1>

        {/* Lead */}
        <p
          className="max-w-[60ch] text-[clamp(16px,1.5vw,19px)] animate-[rise_.9s_cubic-bezier(.16,1,.3,1)_.38s_backwards]"
          style={{ color: 'rgba(255,255,255,.75)' }}
        >
          {t('hero.lead')}
        </p>

        {/* CTA boutons */}
        <div className="mt-9 flex flex-wrap gap-3.5 animate-[rise_.9s_cubic-bezier(.16,1,.3,1)_.48s_backwards]">
          <a
            href="#composantes"
            className="inline-flex items-center gap-2 text-[14.5px] font-semibold text-white transition-transform hover:-translate-y-0.5"
            style={{ borderRadius: 50, background: 'var(--koma-red)', padding: '14px 28px' }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--koma-red-hover)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--koma-red)'}
          >
            {t('hero.cta1')}
            <ArrowRight size={16} />
          </a>
          <a
            href="#contexte"
            className="inline-flex items-center gap-2 text-[14.5px] font-semibold text-white transition-transform hover:-translate-y-0.5"
            style={{ borderRadius: 50, border: '2px solid rgba(255,255,255,.35)', padding: '14px 28px', background: 'transparent' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.7)'; e.currentTarget.style.background = 'rgba(255,255,255,.06)' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.35)'; e.currentTarget.style.background = 'transparent' }}
          >
            {t('hero.cta2')}
          </a>
        </div>

        {/* Logos institutionnels */}
        <div
          className="animate-[rise_.9s_cubic-bezier(.16,1,.3,1)_.6s_backwards]"
          style={{ borderTop: '1px solid rgba(255,255,255,.15)', marginTop: 48, paddingTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
        >
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
    </section>
  )
}
