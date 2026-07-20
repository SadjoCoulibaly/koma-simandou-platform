import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const FONT = 'var(--font-body)'
const HEAD = 'var(--font-heading)'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate   = useNavigate()
  const { t } = useTranslation()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await signIn(form.email, form.password)
      if (!data?.user?.id) throw new Error('Connexion échouée')
      navigate(data.user.app_metadata?.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.message || 'Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: FONT }}>

      {/* ── Panneau gauche illustratif ─────────────────────── */}
      <div style={{ flex: 1, background: 'var(--koma-teal-dark)', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 40px', position: 'relative', overflow: 'hidden' }} className="hidden lg:flex">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/simandou_hero.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: .25 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,38,59,.7) 0%, rgba(0,38,59,.95) 100%)' }} />

        {/* Logos */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="/simandou-2040.png" alt="Simandou 2040" style={{ height: 40, objectFit: 'contain' }} />
          <span style={{ width: 1, height: 32, background: 'rgba(255,255,255,.25)' }} />
          <img src="/koma-logo.png" alt="KOMA" style={{ height: 48, objectFit: 'contain' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,121,140,.3)', border: '1px solid rgba(0,121,140,.5)', borderRadius: 50, padding: '6px 16px', marginBottom: 24 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--koma-teal)', display: 'inline-block' }} />
            <span style={{ color: 'rgba(255,255,255,.8)', fontSize: 12, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase' }}>République de Guinée</span>
          </div>
          <h1 style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 'clamp(28px,3vw,42px)', color: '#fff', margin: '0 0 16px', lineHeight: 1.15 }}>
            La plateforme<br />
            <span style={{ color: 'var(--koma-teal)' }}>nationale KOMA</span><br />
            Simandou 2040
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.65)', lineHeight: 1.75, maxWidth: '38ch' }}>
            Registre numérique national — entreprises, équipements, projets et ressources humaines du secteur minier guinéen.
          </p>
        </div>

        <p style={{ position: 'relative', zIndex: 2, fontSize: 12, color: 'rgba(255,255,255,.3)' }}>
          © {new Date().getFullYear()} KOMA · Simandou 2040
        </p>
      </div>

      {/* ── Panneau droit — formulaire ────────────────────── */}
      <div style={{ width: '100%', maxWidth: 480, background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 40px', overflowY: 'auto' }}>

        {/* Mobile logos */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 36 }} className="lg:hidden">
          <img src="/simandou-2040.png" alt="Simandou 2040" style={{ height: 32, objectFit: 'contain' }} />
          <span style={{ width: 1, height: 24, background: '#e5e7eb' }} />
          <img src="/koma-logo.png" alt="KOMA" style={{ height: 36, objectFit: 'contain' }} />
        </Link>

        <h2 style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 28, color: 'var(--koma-text)', margin: '0 0 6px' }}>
          {t('login.title')}
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 32px' }}>{t('login.subtitle')}</p>

        {/* Bannière créer un compte */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, background: 'var(--koma-teal-light)', border: '1px solid rgba(0,121,140,.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 28 }}>
          <p style={{ fontSize: 13, color: 'var(--koma-teal)', margin: 0, fontWeight: 500 }}>{t('login.noAccount')}</p>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--koma-red)', color: '#fff', textDecoration: 'none', borderRadius: 50, padding: '8px 16px', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', transition: 'background .15s' }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--koma-red-hover)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--koma-red)'}>
            <UserPlus size={13} /> {t('login.createAccount')}
          </Link>
        </div>

        {error && (
          <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', fontSize: 13.5, color: '#991b1b', fontFamily: FONT }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--koma-text)', marginBottom: 7, fontFamily: FONT }}>
              {t('login.email')} <span style={{ color: 'var(--koma-red)' }}>*</span>
            </label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="votre@email.com"
              autoComplete="email"
              className="input-koma"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--koma-text)', marginBottom: 7, fontFamily: FONT }}>
              {t('login.password')} <span style={{ color: 'var(--koma-red)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input type={showPwd ? 'text' : 'password'} required value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                autoComplete="current-password"
                className="input-koma"
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn-koma-primary"
            style={{ marginTop: 4, justifyContent: 'center', opacity: loading ? .65 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading
              ? <span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
              : t('login.submit')}
          </button>
        </form>

        <hr style={{ border: 'none', borderTop: '2px solid var(--koma-teal)', margin: '28px 0', opacity: .18 }} />
        <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', fontFamily: FONT }}>
          Plateforme réservée aux acteurs du secteur minier guinéen.
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
