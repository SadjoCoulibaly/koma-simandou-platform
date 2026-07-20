import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, LogOut, LayoutDashboard, UserPlus, ChevronDown, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
]

const T = 'var(--koma-teal)'
const R = 'var(--koma-red)'
const FONT = 'var(--font-body)'

function LangSwitcher({ light = false }) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const current = LANGS.find(l => l.code === i18n.language) || LANGS[0]

  const changeLang = (code) => { i18n.changeLanguage(code); localStorage.setItem('snicteps-lang', code); setOpen(false) }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: light ? 'rgba(255,255,255,.85)' : 'var(--koma-text)', fontFamily: FONT, padding: '4px 6px' }}>
        {current.flag} {current.label} <ChevronDown size={11} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '120%', right: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.12)', overflow: 'hidden', zIndex: 200, minWidth: 100 }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => changeLang(l.code)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 14px', background: l.code === i18n.language ? 'var(--koma-teal-light)' : 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: l.code === i18n.language ? 700 : 500, color: 'var(--koma-text)', fontFamily: FONT }}>
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// NAV_LINKS built inside component with t() — see below

export default function Navbar() {
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [scrolled,     setScrolled]     = useState(false)
  const [projectOpen,  setProjectOpen]  = useState(false)
  const navigate   = useNavigate()
  const location   = useLocation()
  const { user, isAdmin, signOut } = useAuth()
  const { t } = useTranslation()

  const isLanding = location.pathname === '/'

  const NAV_LINKS = [
    { label: t('nav.forum'),           to: '/forum' },
    { label: t('nav.entreprises'),     to: '/entreprises' },
    { label: t('nav.equipements'),     to: '/equipements' },
    { label: t('nav.projets'),         to: '/projets' },
    { label: t('nav.professionnels'),  to: '/professionnels' },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => { setMobileOpen(false); await signOut(); navigate('/') }

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,.1)' : 'none', transition: 'box-shadow .2s' }}>

      {/* ── 1. TOPBAR teal ─────────────────────────────────── */}
      <div style={{ background: 'var(--koma-teal)', height: 38, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', fontSize: 12.5, color: 'rgba(255,255,255,.9)', fontFamily: FONT }}>
        <span style={{ fontWeight: 500 }}>
          {user ? `${t('nav.welcome')}${user.user_metadata?.full_name ? ', ' + user.user_metadata.full_name.split(' ')[0] : ''} 👋` : t('nav.topbarText')}
        </span>
        <div style={{ alignItems: 'center', gap: 16 }} className="hidden md:flex">
          {/* Dropdown Plateforme KOMA */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setProjectOpen(o => !o)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.85)', fontFamily: FONT, padding: '4px 6px' }}
            >
              {t('nav.menu')} <ChevronDown size={11} style={{ transform: projectOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </button>
            {projectOpen && (
              <>
                {/* Overlay invisible pour fermer en cliquant ailleurs */}
                <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setProjectOpen(false)} />
                <div style={{ position: 'absolute', top: '130%', left: 0, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.13)', overflow: 'hidden', zIndex: 200, minWidth: 190 }}>
                  {[
                    { label: t('nav.home'), href: '/presentation' },
                    { label: t('nav.context'),     href: '/presentation#contexte' },
                    { label: t('nav.vision'),      href: '/presentation#vision' },
                    { label: t('nav.components'),  href: '/presentation#composantes' },
                    { label: t('nav.impacts'),     href: '/presentation#impacts' },
                  ].map(({ label, href }) => (
                    <a key={href} href={href} onClick={() => setProjectOpen(false)}
                      style={{ display: 'block', padding: '11px 16px', fontSize: 13, fontWeight: 500, color: 'var(--koma-text)', textDecoration: 'none', fontFamily: FONT, transition: 'background .12s' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--koma-teal-light)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
          <span style={{ color: 'rgba(255,255,255,.3)' }}>|</span>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 700, background: 'rgba(255,255,255,.18)', borderRadius: 20, padding: '3px 12px', border: '1px solid rgba(255,255,255,.3)' }}>{t('nav.forum')}</Link>
          <span style={{ color: 'rgba(255,255,255,.3)' }}>|</span>
          <LangSwitcher light />
        </div>
      </div>

      {/* ── 2. HEADER blanc (logos + recherche + icônes) ───── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eee', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        {/* Logos */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0, minWidth: 0 }}>
          <img src="/simandou-2040.png" alt="Simandou 2040" style={{ height: 'clamp(26px,4vw,36px)', objectFit: 'contain', maxWidth: 'clamp(80px,12vw,120px)' }} />
          <span style={{ width: 1, height: 24, background: '#e5e7eb', flexShrink: 0 }} />
          <img src="/logo-guinee.png" alt="République de Guinée" style={{ height: 'clamp(28px,4vw,38px)', objectFit: 'contain', maxWidth: 40 }} />
          <span style={{ width: 1, height: 24, background: '#e5e7eb', flexShrink: 0 }} />
          <img src="/koma-logo.png" alt="KOMA" style={{ height: 'clamp(28px,4.5vw,42px)', objectFit: 'contain', maxWidth: 'clamp(80px,14vw,130px)' }} />
        </Link>

        {/* Icônes droite */}
        <div style={{ alignItems: 'center', gap: 6 }} className="hidden md:flex">
{user ? (
            <>
              <button onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'transparent', border: '1.5px solid var(--koma-border)', borderRadius: 50, cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: 'var(--koma-text)', fontFamily: FONT, transition: 'all .15s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--koma-red)'; e.currentTarget.style.color = 'var(--koma-red)' }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--koma-border)'; e.currentTarget.style.color = 'var(--koma-text)' }}>
                <LogOut size={14} /> {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 10px', textDecoration: 'none', color: 'var(--koma-text)', borderRadius: 8, transition: 'background .15s' }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--koma-gray-bg)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <User size={20} color="var(--koma-teal)" />
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--koma-teal)', fontFamily: FONT }}>{t('nav.login')}</span>
              </Link>
              <Link to="/register"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--koma-red)', color: '#fff', textDecoration: 'none', borderRadius: 50, padding: '10px 20px', fontSize: 13, fontWeight: 700, fontFamily: FONT, transition: 'background .15s' }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--koma-red-hover)'}
                onMouseOut={e => e.currentTarget.style.background = 'var(--koma-red)'}>
                <UserPlus size={14} /> {t('nav.createAccount')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--koma-text)', padding: 4 }}
          className="md:hidden">
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* ── 3. BARRE DE NAVIGATION principale ──────────────── */}
      <nav style={{ background: '#fff', borderBottom: '3px solid var(--koma-teal)', padding: '0 24px' }} className="hidden md:block">
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', alignItems: 'stretch', gap: 4 }}>
          {user && NAV_LINKS.map(({ label, to }) => {
            const active = location.pathname === to
            return (
              <Link key={to} to={to}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '14px 16px', textDecoration: 'none', fontFamily: FONT, fontSize: 13.5, fontWeight: 600, color: active ? 'var(--koma-teal)' : 'var(--koma-text)', borderBottom: active ? '3px solid var(--koma-teal)' : '3px solid transparent', marginBottom: '-3px', transition: 'color .15s, border-color .15s' }}
                onMouseOver={e => { if (!active) { e.currentTarget.style.color = 'var(--koma-teal)'; e.currentTarget.style.borderBottomColor = 'var(--koma-teal)' } }}
                onMouseOut={e => { if (!active) { e.currentTarget.style.color = 'var(--koma-text)'; e.currentTarget.style.borderBottomColor = 'transparent' } }}>
                {label} <ChevronDown size={13} style={{ opacity: .5 }} />
              </Link>
            )
          })}
          {user && (
            <Link to={isAdmin ? '/admin' : '/dashboard'}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '14px 16px', textDecoration: 'none', fontFamily: FONT, fontSize: 13.5, fontWeight: 600, color: 'var(--koma-text)', marginLeft: 'auto', transition: 'color .15s' }}
              onMouseOver={e => e.currentTarget.style.color = 'var(--koma-teal)'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--koma-text)'}>
              <LayoutDashboard size={15} /> {isAdmin ? t('nav.admin') : t('nav.dashboard')}
            </Link>
          )}
        </div>
      </nav>

      {/* ── Menu mobile ────────────────────────────────────── */}
      {mobileOpen && (
        <div style={{ background: '#fff', borderTop: '1px solid #eee', padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }} className="md:hidden">

          {/* Liens rapides */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>
            {[
              { label: t('nav.home'),       href: '/presentation' },
              { label: t('nav.context'),    href: '/presentation#contexte' },
              { label: t('nav.vision'),     href: '/presentation#vision' },
              { label: t('nav.components'), href: '/presentation#composantes' },
              { label: t('nav.impacts'),    href: '/presentation#impacts' },
            ].map(({ label, href }) => (
              <a key={href} href={href} onClick={() => setMobileOpen(false)}
                style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--koma-teal)', background: 'var(--koma-teal-light)', borderRadius: 20, padding: '5px 12px', textDecoration: 'none', fontFamily: FONT }}>
                {label}
              </a>
            ))}
            <Link to="/" onClick={() => setMobileOpen(false)}
              style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', background: 'var(--koma-teal)', borderRadius: 20, padding: '5px 12px', textDecoration: 'none', fontFamily: FONT }}>
              {t('nav.forum')}
            </Link>
          </div>

          {user && NAV_LINKS.map(({ label, to }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)}
              style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6', textDecoration: 'none', fontFamily: FONT, fontSize: 15, fontWeight: 600, color: 'var(--koma-text)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {label} <ChevronDown size={15} style={{ opacity: .4 }} />
            </Link>
          ))}
          <div style={{ paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {user ? (
              <>
                <Link to={isAdmin ? '/admin' : '/dashboard'} onClick={() => setMobileOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'var(--koma-teal-light)', color: 'var(--koma-teal)', textDecoration: 'none', borderRadius: 50, padding: '12px', fontSize: 14, fontWeight: 700, fontFamily: FONT }}>
                  <LayoutDashboard size={16} /> {isAdmin ? t('nav.admin') : t('nav.dashboard')}
                </Link>
                <button onClick={handleLogout}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'transparent', border: '1.5px solid var(--koma-border)', borderRadius: 50, padding: '11px', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: 'var(--koma-text)', fontFamily: FONT }}>
                  <LogOut size={15} /> {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1.5px solid var(--koma-border)', color: 'var(--koma-text)', textDecoration: 'none', borderRadius: 50, padding: '12px', fontSize: 14, fontWeight: 600, fontFamily: FONT }}>
                  {t('nav.login')}
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'var(--koma-red)', color: '#fff', textDecoration: 'none', borderRadius: 50, padding: '12px', fontSize: 14, fontWeight: 700, fontFamily: FONT }}>
                  <UserPlus size={15} /> {t('nav.createAccount')}
                </Link>
              </>
            )}
          </div>
          <LangSwitcher />
        </div>
      )}
    </header>
  )
}
