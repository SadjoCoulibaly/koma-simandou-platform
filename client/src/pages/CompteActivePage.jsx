import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTranslation } from 'react-i18next'

const FONT = 'var(--font-body)'
const HEAD = 'var(--font-heading)'

export default function CompteActivePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [status, setStatus]           = useState('loading') // loading | pending | success | error
  const [activationCode, setActivationCode] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      // Ne pas appeler exchangeCodeForSession ici.
      // Les scanners d'email d'entreprise (Outlook Defender, Proofpoint…)
      // pré-chargent les liens et exécutent le JS : le code serait consommé
      // avant que l'utilisateur clique. On attend un geste explicite.
      setActivationCode(code)
      setStatus('pending')
      return
    }

    // Implicit flow fallback (hash-based — moins exposé aux scanners)
    const hash = window.location.hash
    if (hash.includes('access_token') && hash.includes('type=signup')) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          supabase.auth.signOut()
          setStatus('success')
          setTimeout(() => navigate('/login'), 3000)
        } else {
          setStatus('error')
        }
      })
      return
    }

    // Aucun token dans l'URL
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/login')
      else setStatus('error')
    })
  }, [navigate])

  const handleActivate = async () => {
    if (!activationCode) return
    setStatus('loading')
    const { data, error } = await supabase.auth.exchangeCodeForSession(activationCode)
    if (data?.session) {
      await supabase.auth.signOut()
      setStatus('success')
      setTimeout(() => navigate('/login'), 3000)
    } else {
      console.error('exchangeCodeForSession error:', error)
      setStatus('error')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--koma-teal-dark)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'url(/simandou_hero.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 28%', filter: 'brightness(.32) saturate(1.1)', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0,38,59,.5) 0%, rgba(0,38,59,.8) 100%)', zIndex: 1 }} />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 480, width: '100%', textAlign: 'center' }}>

        {/* Logos */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 48 }}>
          <img src="/simandou-2040.png" alt="Simandou 2040" style={{ height: 36, objectFit: 'contain' }} />
          <span style={{ width: 1, height: 28, background: 'rgba(255,255,255,.2)' }} />
          <img src="/koma-logo.png" alt="KOMA" style={{ height: 38, objectFit: 'contain' }} />
        </Link>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,.97)', borderRadius: 20, padding: '44px 40px', boxShadow: '0 24px 80px rgba(0,0,0,.45)' }}>

          {status === 'loading' && (
            <>
              <div style={{ width: 56, height: 56, border: '3px solid #E2E8F0', borderTopColor: 'var(--koma-teal)', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 24px' }} />
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--koma-teal-dark)', margin: '0 0 10px', fontFamily: HEAD }}>
                {t('compte.loadingTitle')}
              </h2>
              <p style={{ fontSize: 14, color: '#6B7280', margin: 0, fontFamily: FONT }}>
                {t('compte.loadingDesc')}
              </p>
            </>
          )}

          {status === 'pending' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--koma-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--koma-teal)" strokeWidth="2.5" style={{ width: 28, height: 28 }}>
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--koma-teal-dark)', margin: '0 0 12px', fontFamily: HEAD }}>
                Confirmez votre adresse email
              </h2>
              <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 28px', lineHeight: 1.6, fontFamily: FONT }}>
                Votre lien d'activation est prêt. Cliquez sur le bouton ci-dessous pour activer votre compte.
              </p>
              <button
                onClick={handleActivate}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--koma-teal)', color: 'white', border: 'none', padding: '13px 32px', borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: FONT, cursor: 'pointer', width: '100%' }}>
                Activer mon compte
              </button>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(13,122,61,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#0D7A3D" strokeWidth="2.5" style={{ width: 30, height: 30 }}>
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--koma-teal-dark)', margin: '0 0 12px', fontFamily: HEAD }}>
                {t('compte.successTitle')}
              </h2>
              <p style={{ fontSize: 15, color: '#5A6A60', margin: '0 0 28px', lineHeight: 1.6, fontFamily: FONT }}>
                {t('compte.successDesc')}
              </p>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--koma-teal)', color: 'white', textDecoration: 'none', padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: FONT }}>
                {t('compte.loginBtn')}
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(214,62,68,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--koma-red)" strokeWidth="2.5" style={{ width: 28, height: 28 }}>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--koma-teal-dark)', margin: '0 0 12px', fontFamily: HEAD }}>
                {t('compte.errorTitle')}
              </h2>
              <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 8px', lineHeight: 1.6, fontFamily: FONT }}>
                {t('compte.errorDesc')}
              </p>
              <p style={{ fontSize: 13, color: '#9CA3AF', margin: '0 0 28px', lineHeight: 1.6, fontFamily: FONT }}>
                Si votre lien est expiré ou déjà utilisé, contactez l'administrateur pour recevoir un nouveau lien d'activation.
              </p>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--koma-teal-dark)', color: 'white', textDecoration: 'none', padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: FONT }}>
                {t('compte.loginAlt')}
              </Link>
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
