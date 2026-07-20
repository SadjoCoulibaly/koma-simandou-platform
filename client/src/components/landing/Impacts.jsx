import { useTranslation } from 'react-i18next'
import { useScrollFade } from '../../hooks/useScrollFade'

function ImpactRow({ num, text, delay }) {
  const ref = useScrollFade()
  return (
    <div
      ref={ref}
      className="fade-in flex gap-[18px] border-t border-white/15 py-5"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span className="flex-shrink-0 flex h-[34px] w-[34px] items-center justify-center rounded-[9px] text-[15px] font-heading font-extrabold text-koma-teal" style={{ background: 'rgba(255,255,255,.1)' }}>
        {String(num).padStart(2, '0')}
      </span>
      <p className="text-[15.5px] text-white/85 pt-1.5">{text}</p>
    </div>
  )
}

export default function Impacts() {
  const headRef = useScrollFade()
  const { t } = useTranslation()

  const IMPACTS = [
    t('impacts.item1'),
    t('impacts.item2'),
    t('impacts.item3'),
    t('impacts.item4'),
    t('impacts.item5'),
    t('impacts.item6'),
    t('impacts.item7'),
  ]

  return (
    <section className="relative overflow-hidden text-white py-24" style={{ background: 'var(--koma-teal-dark)' }} id="impacts">

      <div className="relative z-[2] mx-auto max-w-[1240px] px-4 md:px-8">
        <span className="flex items-center gap-2 text-[11px] tracking-[.18em] uppercase font-semibold mb-4" style={{ color: 'rgba(255,255,255,.65)' }} ref={headRef}>
          <span style={{ width: 20, height: 2, background: 'var(--koma-teal)', display: 'inline-block', borderRadius: 2 }} />
          {t('impacts.eyebrow')}
        </span>
        <h2 className="fade-in mt-2 mb-12 text-[clamp(30px,3.6vw,46px)] text-white max-w-[18ch]">
          {t('impacts.title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
          {IMPACTS.map((text, i) => (
            <ImpactRow key={i} num={i + 1} text={text} delay={i % 2 * 70} />
          ))}
        </div>
      </div>
    </section>
  )
}
