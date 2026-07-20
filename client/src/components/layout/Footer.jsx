import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ContactModal from '../ui/ContactModal'

const FONT = 'var(--font-body)'

export default function Footer() {
  const { t } = useTranslation()
  const [contactOpen, setContactOpen] = useState(false)

  const cols = [
    {
      title: t('footer.col1Title'),
      links: [
        { label: t('footer.comp1'), to: '/register/entreprises' },
        { label: t('footer.comp2'), to: '/register/equipements' },
        { label: t('footer.comp3'), to: '/register/projets-publics' },
        { label: t('footer.comp4'), to: '/register/projets-prives' },
      ],
    },
    {
      title: t('footer.projectTitle'),
      links: [
        { label: t('footer.proj1'), href: '/#contexte' },
        { label: t('footer.proj2'), href: '/#vision' },
        { label: t('footer.proj3'), href: '/#impacts' },
        { label: t('footer.proj4'), href: '/forum/inscription' },
      ],
    },
    {
      title: t('footer.col3Title'),
      links: [
        { label: t('footer.res1'), to: '/forum' },
        { label: t('footer.res2'), to: '/professionnels' },
        { label: t('footer.res3'), to: '/projets' },
        { label: t('footer.res4'), onClick: () => setContactOpen(true) },
      ],
    },
  ]

  return (
    <>
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} defaultSubject="Message de contact" />
      <footer style={{ background: 'var(--koma-teal-dark)', color: '#fff', fontFamily: FONT, position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '56px 24px 0' }}>

          {/* Grid 4 colonnes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, paddingBottom: 48, borderBottom: '1px solid rgba(255,255,255,.15)' }}>

            {/* Brand */}
            <div>
              <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', marginBottom: 20 }}>
                <img src="/logo-guinee.png" alt="République de Guinée" style={{ height: 72, objectFit: 'contain' }} />
              </Link>
              <p style={{ fontSize: 13.5, lineHeight: 1.75, color: 'rgba(255,255,255,.65)', maxWidth: '30ch', margin: 0 }}>
                {t('footer.description')}
              </p>
            </div>

            {/* Colonnes liens */}
            {cols.map(col => (
              <div key={col.title}>
                <h4 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 18, marginTop: 0, letterSpacing: '.04em' }}>
                  {col.title}
                </h4>
                {col.links.map(l => (
                  l.to
                    ? <Link key={l.label} to={l.to} style={{ display: 'block', fontSize: 13.5, color: 'rgba(255,255,255,.7)', textDecoration: 'none', marginBottom: 10, transition: 'opacity .15s' }}
                        onMouseOver={e => e.currentTarget.style.opacity = '1'}
                        onMouseOut={e => e.currentTarget.style.opacity = '.7'}>{l.label}</Link>
                    : l.onClick
                    ? <button key={l.label} onClick={l.onClick} style={{ display: 'block', fontSize: 13.5, color: 'rgba(255,255,255,.7)', textDecoration: 'none', marginBottom: 10, transition: 'opacity .15s', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: FONT, textAlign: 'left' }}
                        onMouseOver={e => e.currentTarget.style.opacity = '1'}
                        onMouseOut={e => e.currentTarget.style.opacity = '.7'}>{l.label}</button>
                    : <a key={l.label} href={l.href} style={{ display: 'block', fontSize: 13.5, color: 'rgba(255,255,255,.7)', textDecoration: 'none', marginBottom: 10, transition: 'opacity .15s' }}
                        onMouseOver={e => e.currentTarget.style.opacity = '1'}
                        onMouseOut={e => e.currentTarget.style.opacity = '.7'}>{l.label}</a>
                ))}
              </div>
            ))}
          </div>

          {/* Bande légale */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '20px 0', fontSize: 12, color: 'rgba(255,255,255,.45)' }}>
            <span>© {new Date().getFullYear()} KOMA — Plateforme Nationale · {t('footer.copyright')}</span>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <button onClick={() => setContactOpen(true)} style={{ color: 'rgba(255,255,255,.45)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: FONT, padding: 0 }}>
                contact@koma-gn.com
              </button>
              <a href="tel:+224621727276" style={{ color: 'rgba(255,255,255,.45)', textDecoration: 'none', fontSize: 12, fontFamily: FONT, transition: 'color .15s' }}
                onMouseOver={e => e.currentTarget.style.color = 'rgba(255,255,255,.8)'}
                onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,.45)'}>
                +224 621 727 276
              </a>
            </div>
          </div>
        </div>

        {/* Signature développeur */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', textAlign: 'center', padding: '14px 24px 18px', fontSize: 11, color: 'rgba(255,255,255,.28)', fontFamily: FONT }}>
          {t('footer.signature')} <strong style={{ color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>YawiGroup Sarl</strong>
        </div>
      </footer>
    </>
  )
}
