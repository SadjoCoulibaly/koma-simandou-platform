import { useTranslation } from 'react-i18next'
import { useScrollFade } from '../../hooks/useScrollFade'

function FadeDiv({ children, className = '', delay = 0 }) {
  const ref = useScrollFade()
  return (
    <div ref={ref} className={`fade-in ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

export default function Contexte() {
  const { t } = useTranslation()
  return (
    <section className="py-24" style={{ background: '#fff' }} id="contexte">
      <div className="mx-auto max-w-[1240px] px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-[72px] items-center">
        {/* Left */}
        <FadeDiv>
          <span className="eyebrow">{t('contexte.eyebrow')}</span>
          <h2 className="mt-5 mb-6 text-[clamp(30px,3.6vw,46px)]">
            {t('contexte.title')}
          </h2>
          <p className="text-koma-text text-[16px] mb-4 max-w-[54ch]">
            {t('contexte.p1')}
          </p>
          <p className="text-koma-text text-[16px] mb-4 max-w-[54ch]">
            {t('contexte.p2')}
          </p>
          <p className="text-koma-text text-[16px] max-w-[54ch]">
            {t('contexte.p3')}
          </p>
        </FadeDiv>

        {/* Quote card */}
        <FadeDiv delay={140}>
          <div className="relative overflow-hidden rounded-[18px] p-6 md:p-[46px_42px]" style={{ background: 'var(--koma-teal-dark)' }}>
            <div className="relative font-heading font-extrabold text-[90px] leading-[.6] opacity-30" style={{ color: 'var(--koma-teal)' }}>"</div>
            <p className="relative italic text-[21px] leading-relaxed text-white mt-2.5 mb-5">
              {t('contexte.quote')}
            </p>
            <div className="relative text-[12.5px] tracking-[.14em] uppercase font-semibold" style={{ color: 'rgba(255,255,255,.55)' }}>
              {t('contexte.quoteSource')}
            </div>
          </div>
        </FadeDiv>
      </div>
    </section>
  )
}
