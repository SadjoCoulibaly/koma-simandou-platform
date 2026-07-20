import { useTranslation } from 'react-i18next'
import { useScrollFade } from '../../hooks/useScrollFade'

const VISION_ICONS = [
  <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M15 9h.01M15 13h.01" />,
  <><path d="M3 17l4-4 4 2 6-7M13 7h4v4" /><rect x="2" y="3" width="20" height="18" rx="2" /></>,
  <path d="M3 3v18h18M7 14l3-3 3 2 5-6" />,
  <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  <><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" /><circle cx="12" cy="12" r="3" /></>,
  <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
]

function VCard({ item, delay }) {
  const ref = useScrollFade()
  return (
    <div
      ref={ref}
      className="fade-in group relative overflow-hidden rounded-[16px] border border-[#e5e7eb] bg-white p-[30px_26px] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_4px_20px_rgba(0,0,0,.08)] hover:border-transparent before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:bg-koma-teal before:scale-y-0 before:origin-top before:transition-transform before:duration-300 hover:before:scale-y-100"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="mb-[18px] flex h-[46px] w-[46px] items-center justify-center rounded-[12px] bg-koma-teal-light text-koma-teal">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
          {item.icon}
        </svg>
      </div>
      <h3 className="mb-2 text-[20px] text-koma-text">{item.title}</h3>
      <p className="text-[14px] text-[#6b7280]">{item.desc}</p>
    </div>
  )
}

export default function Vision() {
  const headRef = useScrollFade()
  const { t } = useTranslation()

  const VISION_ITEMS = VISION_ICONS.map((icon, i) => ({
    icon,
    title: t(`vision.item${i + 1}Title`),
    desc:  t(`vision.item${i + 1}Desc`),
  }))

  return (
    <section className="relative overflow-hidden border-y border-[#e5e7eb] bg-koma-gray py-24" id="vision">

      <div className="relative mx-auto max-w-[1240px] px-4 md:px-8">
        {/* Head */}
        <div ref={headRef} className="fade-in mx-auto mb-14 max-w-[60ch] text-center">
          <span className="eyebrow justify-center">{t('vision.eyebrow')}</span>
          <h2 className="mt-4 mb-4 text-[clamp(30px,3.6vw,46px)]">{t('vision.title')}</h2>
          <p className="text-[#6b7280] text-[16px]">
            {t('vision.desc')}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {VISION_ITEMS.map((item, i) => (
            <VCard key={i} item={item} delay={i % 3 * 70} />
          ))}
        </div>
      </div>
    </section>
  )
}
