import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Info, ExternalLink } from 'lucide-react'
import { useScrollFade } from '../../hooks/useScrollFade'
import Modal, { ModalHeader, ModalBody, WhyContent } from '../ui/Modal'
import { getComposantes } from '../../data/composantes'
import { useTranslation } from 'react-i18next'

const ICONS = {
  building: <path d="M3 21h18M5 21V6l7-3 7 3v15M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" />,
  equip: <path d="M3 17l5 0M3 17v-4l4-1 2-4h4l2 5 4 1v3M7 17a2 2 0 104 0M16 17a2 2 0 104 0" />,
  state: <path d="M3 21h18M4 21V10l8-5 8 5v11M4 10h16M9 21v-6h6v6M12 5V3" />,
  private: <path d="M2 21h20M4 21V7l6-4v18M10 21V11l8-3v13M14 13h.01M14 16h.01" />,
}

function ComponentCard({ composante, index, onWhy }) {
  const ref = useScrollFade()
  const { t } = useTranslation()
  return (
    <article
      ref={ref}
      className="fade-in flex flex-col relative overflow-hidden rounded-[20px] border border-[#e5e7eb] bg-white p-[38px_36px] transition-all duration-[350ms] hover:-translate-y-1.5 hover:shadow-[0_4px_24px_rgba(0,0,0,.08)] hover:border-koma-teal/40"
      style={{ transitionDelay: `${index % 2 * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-5">
        <span className="font-heading font-bold text-[15px] tracking-[.2em] uppercase text-koma-teal">
          {composante.n}
        </span>
        <span className="flex h-[58px] w-[58px] items-center justify-center rounded-[15px] text-white" style={{ background: 'var(--koma-teal)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-7 w-7">
            {ICONS[composante.iconKey]}
          </svg>
        </span>
      </div>

      <h3 className="text-[26px] text-koma-text mb-3 leading-[1.12]">{composante.title}</h3>
      <p className="text-[15px] text-[#6b7280] mb-5 flex-1">{composante.desc}</p>

      <div className="flex flex-wrap gap-[7px] mb-6">
        {composante.tags.map((tag) => (
          <span key={tag} className="rounded-[20px] bg-koma-teal-light px-[11px] py-[5px] text-[11.5px] tracking-[.04em] text-koma-teal font-medium">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onWhy(composante)}
          className="inline-flex items-center gap-2 rounded-[10px] border border-[#e5e7eb] px-[18px] py-[11px] text-[13.5px] font-semibold text-koma-text font-sans transition-all hover:border-koma-teal hover:bg-koma-teal-light hover:text-koma-teal"
        >
          <Info size={16} />
          {t('composantes.whyBtn')}
        </button>
        {(composante.slug === 'projets-publics' || composante.slug === 'projets-prives') && (
          <a
            href="https://telemo.gov.gn/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[10px] border border-koma-red/30 bg-koma-pink px-[18px] py-[11px] text-[13.5px] font-semibold text-koma-red font-sans transition-all hover:bg-koma-red hover:text-white hover:border-koma-red group"
          >
            <ExternalLink size={15} />
            {t('composantes.viewOffers')}
          </a>
        )}
      </div>
    </article>
  )
}

export default function Composantes({ showToast }) {
  const [modal, setModal] = useState({ open: false, composante: null })
  const headRef = useScrollFade()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const COMPOSANTES = getComposantes(t)
  const openWhy = (c) => setModal({ open: true, composante: c })
  const close = () => setModal({ open: false, composante: null })

  return (
    <section className="bg-white py-[104px]" id="composantes">
      <div className="mx-auto max-w-[1240px] px-4 md:px-8">
        {/* Head */}
        <div ref={headRef} className="fade-in flex flex-wrap items-end justify-between gap-8 mb-14">
          <div>
            <span className="eyebrow">{t('composantes.eyebrow')}</span>
            <h2 className="mt-4 text-[clamp(30px,3.8vw,50px)] max-w-[14ch]">
              {t('composantes.title')}
            </h2>
          </div>
          <p className="text-[#6b7280] max-w-[42ch] text-[15.5px]">
            {t('composantes.desc')}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COMPOSANTES.map((c, i) => (
            <ComponentCard key={c.id} composante={c} index={i} onWhy={openWhy} />
          ))}
        </div>
      </div>

      {/* Modal Pourquoi */}
      <Modal isOpen={modal.open} onClose={close}>
        {modal.composante && (
          <>
            <ModalHeader
              num={modal.composante.n}
              title={modal.composante.title}
              onClose={close}
            />
            <ModalBody>
              <WhyContent
                composante={modal.composante}
                onRegister={() => { close(); navigate(`/register/${modal.composante.slug}`) }}
              />
            </ModalBody>
          </>
        )}
      </Modal>
    </section>
  )
}
