import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTranslation } from 'react-i18next'

const FONT = 'var(--font-body)'
const HEAD = 'var(--font-heading)'

export default function DefinirMotDePassePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [phase, setPhase]       = useState('check') // check | form | saving | success | error
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [pwdError, setPwdError] = useState('')

  useEffect(() => {
    const hash = window.location.hash

    if (!hash.includes('access_token')) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) navigate('/dashboard')
        else setPhase('error')
      })
      return
    }

    // Supabase traite le hash automatiquement via onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
        setPhase('form')
        subscription.unsubscribe()
      }
    })

    // Fallback si l'event ne se déclenche pas
    const fallback = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) setPhase('form')
      else setPhase('error')
    }, 3500)

    return () => { subscription.unsubscribe(); clearTimeout(fallback) }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPwdError('')
    if (password.length < 8) { setPwdError(t('password.errorMin')); return }
    if (password !== confirm) { setPwdError(t('password.errorMatch')); return }

    setPhase('saving')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setPwdError(error.message); setPhase('form') }
    else {
      setPhase('success')
      setTimeout(() => navigate('/dashboard'), 3000)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#040D18', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'url(/simandou_hero.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 28%', filter: 'brightness(.32) saturate(1.1)', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(4,13,24,.5) 0%, rgba(4,13,24,.8) 100%)', zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 480, width: '100%', textAlign: 'center' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 48 }}>
          <img src="/simandou-2040.png" alt="Simandou 2040" style={{ height: 36, objectFit: 'contain' }} />
          <span style={{ width: 1, height: 28, background: 'rgba(255,255,255,.2)' }} />
          <img src="/koma-logo.png" alt="KOMA" style={{ height: 38, objectFit: 'contain' }} />
        </Link>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,.97)', borderRadius: 20, padding: '44px 40px', boxShadow: '0 24px 80px rgba(0,0,0,.45)' }}>

          {/* ── Loading ── */}
          {(phase === 'check' || phase === 'saving') && (
            <>
              <div style={{ width: 56, height: 56, border: '3px solid #E2E8F0', borderTopColor: 'var(--koma-teal)', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 24px' }} />
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0D1B2E', margin: '0 0 10px', fontFamily: HEAD }}>
                {phase === 'saving' ? t('password.savingTitle') : t('password.checkingTitle')}
              </h2>
              <p style={{ fontSize: 14, color: '#6B7280', margin: 0, fontFamily: FONT }}>{t('password.pleaseWait')}</p>
            </>
          )}

          {/* ── Formulaire ── */}
          {phase === 'form' && (
            <>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--koma-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--koma-teal)" strokeWidth="2" style={{ width: 26, height: 26 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0D1B2E', margin: '0 0 8px', fontFamily: HEAD }}>
                {t('password.formTitle')}
              </h2>
              <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 28px', lineHeight: 1.6, fontFamily: FONT }}>
                {t('password.formDesc')}
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6, fontFamily: FONT }}>
                    {t('password.newLabel')} <span style={{ color: 'var(--koma-red)' }}>*</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t('password.newPlaceholder')}
                    required
                    style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s' }}
                    onFocus={e => e.target.style.borderColor = 'var(--koma-teal)'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6, fontFamily: FONT }}>
                    {t('password.confirmLabel')} <span style={{ color: 'var(--koma-red)' }}>*</span>
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder={t('password.confirmPlaceholder')}
                    required
                    style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, fontFamily: FONT, outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s' }}
                    onFocus={e => e.target.style.borderColor = 'var(--koma-teal)'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
                {pwdError && (
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--koma-red)', background: 'rgba(214,62,68,.06)', border: '1px solid rgba(214,62,68,.2)', borderRadius: 8, padding: '10px 14px', fontFamily: FONT }}>
                    {pwdError}
                  </p>
                )}
                <button type="submit"
                  style={{ background: 'var(--koma-teal)', color: '#fff', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, marginTop: 4, transition: 'background .15s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'var(--koma-teal-dark)'}
                  onMouseOut={e => e.currentTarget.style.background = 'var(--koma-teal)'}>
                  {t('password.submit')}
                </button>
              </form>
            </>
          )}

          {/* ── Succès ── */}
          {phase === 'success' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(13,122,61,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#0D7A3D" strokeWidth="2.5" style={{ width: 30, height: 30 }}>
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0D1B2E', margin: '0 0 12px', fontFamily: HEAD }}>
                {t('password.successTitle')}
              </h2>
              <p style={{ fontSize: 15, color: '#5A6A60', margin: '0 0 28px', lineHeight: 1.6, fontFamily: FONT }}>
                {t('password.successDesc')}
              </p>
              <Link to="/dashboard"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--koma-teal)', color: 'white', textDecoration: 'none', padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: FONT }}>
                {t('password.successBtn')}
              </Link>
            </>
          )}

          {/* ── Erreur ── */}
          {phase === 'error' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(178,58,46,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#B23A2E" strokeWidth="2.5" style={{ width: 28, height: 28 }}>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0D1B2E', margin: '0 0 12px', fontFamily: HEAD }}>
                {t('password.errorTitle')}
              </h2>
              <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 28px', lineHeight: 1.6, fontFamily: FONT }}>
                {t('password.errorDesc')}
              </p>
              <Link to="/login"
                style={{ display: 'inline-flex', alignItems: 'center', background: '#0D1B2E', color: 'white', textDecoration: 'none', padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: FONT }}>
                {t('password.errorBtn')}
              </Link>
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
