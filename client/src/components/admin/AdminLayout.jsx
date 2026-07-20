import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Wrench, Landmark, BriefcaseBusiness,
  BarChart2, LogOut, Menu, X, UsersRound, Map, FileEdit, ArrowLeft,
  UserCheck, ChevronDown, ChevronUp, Power,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'

const FONT_BODY = 'var(--font-body)'
const LANGS = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中' },
]

function LangSwitcher() {
  const { i18n } = useTranslation()
  const change = (code) => { i18n.changeLanguage(code); localStorage.setItem('snicteps-lang', code) }
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
      {LANGS.map(l => (
        <button key={l.code} onClick={() => change(l.code)}
          style={{
            flex: 1, padding: '6px 0', border: 'none', borderRadius: 8, cursor: 'pointer',
            fontFamily: FONT_BODY, fontSize: 12, fontWeight: 700, transition: 'all .15s',
            background: i18n.language === l.code ? 'var(--koma-teal)' : '#f3f4f6',
            color: i18n.language === l.code ? '#fff' : '#6b7280',
          }}>
          {l.label}
        </button>
      ))}
    </div>
  )
}

function useNavGroups() {
  const { t } = useTranslation()
  return [
    { label: t('admin.nav.dashboard'), icon: LayoutDashboard, to: '/admin', exact: true },
    {
      label: t('admin.nav.registres'), icon: Building2,
      children: [
        { to: '/admin/entreprises',     icon: Building2, label: t('admin.nav.entreprises') },
        { to: '/admin/equipements',     icon: Wrench,    label: t('admin.nav.equipements') },
        { to: '/admin/human-resources', icon: UserCheck, label: t('admin.nav.hr') },
      ],
    },
    {
      label: t('admin.nav.projets'), icon: Landmark,
      children: [
        { to: '/admin/projets-publics', icon: Landmark,          label: t('admin.nav.projetsPublics') },
        { to: '/admin/projets-prives',  icon: BriefcaseBusiness, label: t('admin.nav.projetsPrives') },
      ],
    },
    {
      label: t('admin.nav.cartoBI'), icon: Map,
      children: [
        { to: '/admin/carte-sig',    icon: Map,      label: t('admin.nav.carteSIG') },
        { to: '/admin/dashboard-bi', icon: BarChart2, label: t('admin.nav.dashboardBI') },
      ],
    },
    {
      label: t('admin.nav.forum'), icon: UsersRound,
      children: [
        { to: '/admin/forum',         icon: UsersRound, label: t('admin.nav.forumInscrits') },
        { to: '/admin/forum-content', icon: FileEdit,   label: t('admin.nav.forumContent') },
      ],
    },
  ]
}

function AccordionItem({ group, location }) {
  const isChildActive = group.children?.some(c => location.pathname.startsWith(c.to))
  const [open, setOpen] = useState(isChildActive)

  /* Item simple (sans enfants) */
  if (!group.children) {
    const active = group.exact ? location.pathname === group.to : location.pathname.startsWith(group.to)
    return (
      <NavLink to={group.to} end={group.exact}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 14px', borderRadius: 12, textDecoration: 'none',
          fontFamily: FONT_BODY, fontSize: 13.5, fontWeight: 600,
          background: active ? 'var(--koma-red)' : 'var(--koma-pink-light)',
          color: active ? '#fff' : 'var(--koma-text)',
          marginBottom: 6, transition: 'all .15s',
        }}>
        <group.icon size={16} style={{ flexShrink: 0 }} />
        {group.label}
      </NavLink>
    )
  }

  /* Accordéon */
  return (
    <div style={{ marginBottom: 6 }}>
      <button onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
          fontFamily: FONT_BODY, fontSize: 13.5, fontWeight: 600,
          background: (open || isChildActive) ? 'var(--koma-red)' : 'var(--koma-pink-light)',
          color: (open || isChildActive) ? '#fff' : 'var(--koma-text)',
          transition: 'all .15s',
        }}>
        <group.icon size={16} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, textAlign: 'left' }}>{group.label}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div style={{ paddingLeft: 14, paddingTop: 4 }}>
          {group.children.map(child => {
            const childActive = location.pathname === child.to
            return (
              <NavLink key={child.to} to={child.to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 12px', borderRadius: 8, textDecoration: 'none',
                  fontFamily: FONT_BODY, fontSize: 13, fontWeight: childActive ? 700 : 500,
                  color: childActive ? 'var(--koma-red)' : 'var(--koma-text)',
                  borderLeft: `2px solid ${childActive ? 'var(--koma-red)' : 'transparent'}`,
                  background: childActive ? 'rgba(214,62,68,.06)' : 'transparent',
                  marginBottom: 2, transition: 'all .15s',
                }}
                onMouseOver={e => { if (!childActive) { e.currentTarget.style.color = 'var(--koma-red)'; e.currentTarget.style.background = 'rgba(214,62,68,.04)' } }}
                onMouseOut={e => { if (!childActive) { e.currentTarget.style.color = 'var(--koma-text)'; e.currentTarget.style.background = 'transparent' } }}>
                <child.icon size={14} style={{ flexShrink: 0 }} />
                {child.label}
              </NavLink>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Sidebar({ onClose, location, user, handleLogout, navigate }) {
  const { t }    = useTranslation()
  const navGroups = useNavGroups()
  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'KM'
  const name     = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Administrateur'
  const email    = user?.email || ''

  return (
    <div style={{ width: 252, flexShrink: 0, background: '#fff', borderRight: '1px solid #eeeeee', display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* ── Logos ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 14px', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/simandou-2040.png" alt="Simandou 2040" style={{ height: 26, objectFit: 'contain' }} />
          <span style={{ width: 1, height: 20, background: '#e5e7eb' }} />
          <img src="/koma-logo.png" alt="KOMA" style={{ height: 30, objectFit: 'contain' }} />
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* ── Avatar utilisateur hexagonal ── */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Hexagone simulé via clip-path */}
          <div style={{
            width: 48, height: 48, flexShrink: 0,
            background: 'var(--koma-teal-light)',
            clipPath: 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, color: 'var(--koma-teal)' }}>{initials}</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: FONT_BODY, fontWeight: 700, fontSize: 13.5, color: 'var(--koma-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</div>
          </div>
        </div>
      </div>

      {/* ── Navigation accordéons ── */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {navGroups.map(g => (
          <AccordionItem key={g.label} group={g} location={location} />
        ))}
      </nav>

      {/* ── Footer boutons ── */}
      <div style={{ padding: '12px 10px 16px', borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <LangSwitcher />
        <button onClick={() => navigate('/')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'transparent', border: '1.5px solid #e5e7eb', borderRadius: 50, padding: '10px', cursor: 'pointer', color: '#6b7280', fontSize: 13, fontWeight: 600, fontFamily: FONT_BODY, transition: 'all .15s' }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--koma-teal)'; e.currentTarget.style.color = 'var(--koma-teal)' }}
          onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280' }}>
          <ArrowLeft size={14} /> {t('admin.nav.backToSite')}
        </button>
        <button onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'transparent', border: '2px solid var(--koma-border)', borderRadius: 50, padding: '10px', cursor: 'pointer', color: 'var(--koma-text)', fontSize: 13, fontWeight: 600, fontFamily: FONT_BODY, transition: 'all .15s' }}
          onMouseOver={e => { e.currentTarget.style.background = 'var(--koma-red)'; e.currentTarget.style.borderColor = 'var(--koma-red)'; e.currentTarget.style.color = '#fff' }}
          onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--koma-border)'; e.currentTarget.style.color = 'var(--koma-text)' }}>
          <Power size={14} /> {t('admin.nav.logout')}
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }) {
  const { user, signOut } = useAuth()
  const { t }    = useTranslation()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => { await signOut(); navigate('/login') }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--koma-gray-bg)' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex" style={{ flexDirection: 'column', width: 252, flexShrink: 0 }}>
        <Sidebar location={location} user={user} handleLogout={handleLogout} navigate={navigate} />
      </div>

      {/* Mobile sidebar overlay */}
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 110 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'fixed', inset: '0 auto 0 0', zIndex: 120, display: 'flex', flexDirection: 'column', width: 252 }}>
            <Sidebar onClose={() => setOpen(false)} location={location} user={user} handleLogout={handleLogout} navigate={navigate} />
          </div>
        </>
      )}

      {/* Contenu principal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Mobile topbar */}
        <div className="lg:hidden" style={{ background: 'var(--koma-teal)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <Menu size={22} />
          </button>
          <span style={{ color: 'white', fontFamily: FONT_BODY, fontWeight: 700, fontSize: 15 }}>{t('admin.nav.title')}</span>
        </div>

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
