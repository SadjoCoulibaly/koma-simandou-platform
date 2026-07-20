import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, Mail } from 'lucide-react'
import axios from 'axios'
import { FormField, Input } from '../components/ui/FormField'
import { StepIndicator } from '../components/ui/FormWizard'
import { useTranslation } from 'react-i18next'

const FONT = 'var(--font-body)'
const HEAD = 'var(--font-heading)'

const PROFILE_TYPES = [
  { value: 'Particulier',                        icon: '👤', sub: 'Personne physique' },
  { value: 'Entreprise nationale',               icon: '🏢', sub: 'Société de droit guinéen' },
  { value: 'Entreprise internationale',          icon: '🌍', sub: 'Société étrangère opérant en Guinée' },
  { value: 'Sous-traitant',                      icon: '🔗', sub: 'Prestataire de second rang' },
  { value: "Bureau d'études",                    icon: '📐', sub: 'Ingénierie, conseil, conception' },
  { value: 'Fournisseur',                        icon: '📦', sub: 'Biens et services aux projets' },
  { value: "Société de location d'équipements",  icon: '🚧', sub: 'Engins, matériels lourds' },
  { value: "Projet sectoriel de l'État",         icon: '🏛️', sub: "Programme public d'investissement" },
  { value: 'Projet du secteur privé',            icon: '💼', sub: 'Initiative privée ou mixte' },
]

export default function RegisterUnifiedPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const STEPS = [t('register.step0'), t('register.step1')]

  const [step, setStep]           = useState(searchParams.get('type') ? 1 : 0)
  const [type, setType]           = useState(searchParams.get('type') || '')
  const [form, setForm]           = useState({
    nom:             searchParams.get('nom')          || '',
    organisation:    searchParams.get('organisation') || '',
    email:           searchParams.get('email')        || '',
    telephone:       searchParams.get('telephone')    || '',
    password: '', confirmPassword: '',
  })
  const [showPwd, setShowPwd]     = useState(false)
  const [showCfm, setShowCfm]     = useState(false)
  const [errors, setErrors]       = useState({})
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const isOrg    = type !== 'Particulier'
  const isProjet = type === "Projet sectoriel de l'État" || type === 'Projet du secteur privé'

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
  }

  const validate0 = () => {
    if (!type) { setErrors({ type: t('register.errors.selectType') }); return false }
    return true
  }

  const validate1 = () => {
    const e = {}
    if (!form.nom.trim())       e.nom = t('register.errors.required')
    if (isOrg && !form.organisation.trim()) e.organisation = t('register.errors.required')
    if (!form.email.trim())     e.email = t('register.errors.required')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('register.errors.email')
    if (!form.telephone.trim()) e.telephone = t('register.errors.required')
    if (!form.password)                        e.password = t('register.errors.required')
    else if (form.password.length < 8)         e.password = t('register.errors.password')
    if (form.password !== form.confirmPassword) e.confirmPassword = t('register.errors.passwordMatch')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = async () => {
    if (step === 0) {
      if (validate0()) { setErrors({}); setStep(1) }
      return
    }
    if (step === 1) {
      if (!validate1()) return
      setLoading(true)
      try {
        await axios.post('/api/auth/register', {
          email: form.email, password: form.password,
          nom: form.nom, telephone: form.telephone,
          type, organisation: form.organisation,
        })
        setSubmitted(true)
      } catch (err) {
        const msg = err.response?.data?.message || "Erreur lors de la création du compte. Vérifiez que cet email n'est pas déjà utilisé."
        setErrors({ submit: msg })
      } finally {
        setLoading(false)
      }
    }
  }

  const containerMax = step === 0 ? 800 : 520

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--koma-gray-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
            <img src="/simandou-2040.png" alt="Simandou 2040" style={{ height: 34, objectFit: 'contain' }} />
            <span style={{ width: 1, height: 26, background: '#e5e7eb' }} />
            <img src="/koma-logo.png" alt="KOMA" style={{ height: 34, objectFit: 'contain' }} />
          </Link>
          <div style={{ background: '#fff', borderRadius: 20, padding: '44px 40px', boxShadow: '0 4px 24px rgba(0,0,0,.08)', border: '1px solid #e5e7eb' }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'var(--koma-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Mail size={30} color="var(--koma-teal)" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--koma-text)', margin: '0 0 14px', fontFamily: HEAD }}>
              Vérifiez votre email
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', margin: '0 0 8px', lineHeight: 1.7, fontFamily: FONT }}>
              Un email d'activation a été envoyé à
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--koma-text)', margin: '0 0 24px', fontFamily: FONT }}>{form.email}</p>
            <p style={{ fontSize: 14, color: '#9ca3af', margin: '0 0 28px', lineHeight: 1.6, fontFamily: FONT }}>
              Cliquez sur le lien dans l'email pour activer votre compte. Vérifiez vos courriers indésirables si vous ne le recevez pas.
            </p>
            <Link
              to="/login"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--koma-red)', color: 'white', textDecoration: 'none', padding: '12px 28px', borderRadius: 50, fontSize: 14, fontWeight: 700, fontFamily: FONT, transition: 'background .15s' }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--koma-red-hover)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--koma-red)'}
            >
              Aller à la connexion
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--koma-gray-bg)', fontFamily: FONT }}>

      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '2px solid var(--koma-teal)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px', boxShadow: '0 1px 6px rgba(0,0,0,.06)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/simandou-2040.png" alt="Simandou 2040" style={{ height: 36, objectFit: 'contain' }} />
          <span style={{ width: 1, height: 28, background: '#e5e7eb' }} />
          <img src="/koma-logo.png" alt="KOMA" style={{ height: 40, objectFit: 'contain' }} />
        </Link>
        <Link
          to="/login"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 13, fontWeight: 500, fontFamily: FONT, textDecoration: 'none', transition: 'color .15s' }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--koma-teal)'}
          onMouseOut={e => e.currentTarget.style.color = '#6b7280'}
        >
          <ArrowLeft size={14} /> {t('register.alreadyAccount')}
        </Link>
      </div>

      {/* Content */}
      <div style={{ padding: '40px 24px 60px' }}>
        <div style={{ margin: '0 auto', maxWidth: containerMax, transition: 'max-width .3s' }}>

          {/* Titre */}
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--koma-teal)', fontFamily: FONT, marginBottom: 10 }}>
              {t('register.subtitle')}
            </span>
            <h1 style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 'clamp(24px,3vw,36px)', color: 'var(--koma-text)', lineHeight: 1.2, margin: 0 }}>
              {t('register.title')}
            </h1>
          </div>

          <StepIndicator steps={STEPS} currentStep={step} />

          {/* Card */}
          <div style={{ borderRadius: 16, background: '#fff', border: '1px solid #e5e7eb', padding: step === 0 ? '28px' : '32px', boxShadow: '0 4px 24px rgba(0,0,0,.06)' }}>

            {/* Step 0 : Sélection du type */}
            {step === 0 && (
              <div>
                <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 20px', textAlign: 'center', fontFamily: FONT }}>
                  {t('register.selectType')}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(230px,100%), 1fr))', gap: 10 }}>
                  {PROFILE_TYPES.map(pt => (
                    <button
                      key={pt.value}
                      type="button"
                      onClick={() => { setType(pt.value); setErrors({}) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        borderRadius: 12,
                        border: `2px solid ${type === pt.value ? 'var(--koma-teal)' : '#e5e7eb'}`,
                        background: type === pt.value ? 'var(--koma-teal-light)' : '#fff',
                        padding: '12px 14px', textAlign: 'left', cursor: 'pointer', outline: 'none',
                        transition: 'all .15s',
                        boxShadow: type === pt.value ? '0 0 0 3px rgba(0,121,140,.12)' : 'none',
                      }}
                    >
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{pt.icon}</span>
                      <span style={{ flex: 1 }}>
                        <b style={{ display: 'block', fontSize: 13, fontWeight: 700, color: type === pt.value ? 'var(--koma-teal)' : 'var(--koma-text)', lineHeight: 1.2, fontFamily: FONT }}>{pt.value}</b>
                        <small style={{ fontSize: 11.5, color: '#6b7280', fontFamily: FONT }}>{pt.sub}</small>
                      </span>
                      <span style={{
                        flexShrink: 0, width: 18, height: 18, borderRadius: '50%',
                        border: `2px solid ${type === pt.value ? 'var(--koma-teal)' : '#d1d5db'}`,
                        background: type === pt.value ? 'var(--koma-teal)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all .15s',
                      }}>
                        {type === pt.value && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" style={{ width: 10, height: 10 }}>
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
                {errors.type && <p style={{ marginTop: 12, fontSize: 13, color: 'var(--koma-red)', textAlign: 'center', fontFamily: FONT }}>{errors.type}</p>}
              </div>
            )}

            {/* Step 1 : Informations */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ display: 'inline-block', background: 'var(--koma-teal-light)', color: 'var(--koma-teal)', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 12px', borderRadius: 20, fontFamily: FONT }}>
                    {type}
                  </span>
                </div>

                <FormField
                  label={isProjet ? t('register.porteur') : isOrg ? t('register.representant') : t('register.nomComplet')}
                  required
                  error={errors.nom}
                >
                  <Input placeholder="DIALLO Mamadou" value={form.nom} onChange={e => set('nom', e.target.value)} error={errors.nom} />
                </FormField>

                {isOrg && (
                  <FormField
                    label={isProjet ? t('register.titreProjet') : t('register.organisation')}
                    required
                    error={errors.organisation}
                  >
                    <Input
                      placeholder={isProjet ? 'Ex: Projet hydroélectrique régional' : 'Ex: SOGUIMINE S.A.'}
                      value={form.organisation}
                      onChange={e => set('organisation', e.target.value)}
                      error={errors.organisation}
                    />
                  </FormField>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <FormField label={t('register.email')} required error={errors.email}>
                    <Input type="email" placeholder="vous@email.com" value={form.email} onChange={e => set('email', e.target.value)} error={errors.email} />
                  </FormField>
                  <FormField label={t('register.telephone')} required error={errors.telephone}>
                    <Input type="tel" placeholder="+224 620 000 000" value={form.telephone} onChange={e => set('telephone', e.target.value)} error={errors.telephone} />
                  </FormField>
                </div>

                <FormField label={t('register.password')} required error={errors.password} hint={t('register.passwordHint')}>
                  <div style={{ position: 'relative' }}>
                    <Input
                      type={showPwd ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      error={errors.password}
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}>
                      {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </FormField>

                <FormField label={t('register.confirmPassword')} required error={errors.confirmPassword}>
                  <div style={{ position: 'relative' }}>
                    <Input
                      type={showCfm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={e => set('confirmPassword', e.target.value)}
                      error={errors.confirmPassword}
                    />
                    <button type="button" onClick={() => setShowCfm(!showCfm)} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}>
                      {showCfm ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </FormField>

                {errors.submit && (
                  <div style={{ borderRadius: 10, border: '1px solid rgba(214,62,68,.3)', background: 'rgba(214,62,68,.06)', padding: '12px 16px', fontSize: 13.5, color: 'var(--koma-red)', fontFamily: FONT }}>
                    {errors.submit}
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: step === 0 ? 'flex-end' : 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep(s => s - 1)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 50, border: '2px solid var(--koma-border)', padding: '11px 22px', fontSize: 13.5, fontWeight: 600, color: 'var(--koma-text)', background: 'transparent', cursor: 'pointer', fontFamily: FONT, transition: 'border-color .15s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--koma-text)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--koma-border)'}
                >
                  {t('register.back')}
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, borderRadius: 50, background: 'var(--koma-red)', padding: '11px 26px', fontSize: 13.5, fontWeight: 700, color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.65 : 1, fontFamily: FONT, transition: 'background .15s' }}
                onMouseOver={e => { if (!loading) e.currentTarget.style.background = 'var(--koma-red-hover)' }}
                onMouseOut={e => { if (!loading) e.currentTarget.style.background = 'var(--koma-red)' }}
              >
                {loading ? (
                  <>
                    <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                    {t('register.creating')}
                  </>
                ) : step === 1 ? t('register.createBtn') : t('register.continue')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
