import { Check, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const FONT = 'var(--font-body)'
const HEAD = 'var(--font-heading)'

export function StepIndicator({ steps, currentStep }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
      {steps.map((step, i) => {
        const done   = i < currentStep
        const active = i === currentStep
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: FONT, fontSize: 13, fontWeight: 700,
                background: (done || active) ? 'var(--koma-red)' : '#e5e7eb',
                color: (done || active) ? '#fff' : '#9ca3af',
                boxShadow: active ? '0 0 0 4px rgba(214,62,68,.2)' : 'none',
                transition: 'all .3s',
              }}>
                {done ? <Check size={16} /> : <span>{i + 1}</span>}
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '.04em',
                whiteSpace: 'nowrap', fontFamily: FONT,
                color: active ? 'var(--koma-text)' : done ? 'var(--koma-teal)' : '#9ca3af',
              }}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: 'clamp(20px,5vw,48px)', height: 2, margin: '0 4px', marginBottom: 20,
                background: i < currentStep ? 'var(--koma-teal)' : '#e5e7eb',
                transition: 'all .5s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function FormWizard({ title, subtitle, steps, currentStep, children, onBack, onNext, onSubmit, loading, isLastStep, isFirstStep }) {
  const { t } = useTranslation()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--koma-gray-bg)', fontFamily: FONT }}>

      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '2px solid var(--koma-teal)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px',
        boxShadow: '0 1px 6px rgba(0,0,0,.06)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/simandou-2040.png" alt="Simandou 2040" style={{ height: 32, objectFit: 'contain' }} />
          <span style={{ width: 1, height: 24, background: '#e5e7eb' }} />
          <img src="/koma-logo.png" alt="KOMA" style={{ height: 36, objectFit: 'contain' }} />
        </Link>
        <Link
          to="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 13, fontWeight: 500, fontFamily: FONT, textDecoration: 'none', transition: 'color .15s' }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--koma-teal)'}
          onMouseOut={e => e.currentTarget.style.color = '#6b7280'}
        >
          <ArrowLeft size={14} />
          {t('forms.home')}
        </Link>
      </div>

      {/* Contenu */}
      <div style={{ padding: 'clamp(20px,4vw,40px) clamp(12px,4vw,24px) 60px' }}>
        <div style={{ margin: '0 auto', maxWidth: 680 }}>

          {/* Titre */}
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700,
              letterSpacing: '.14em', textTransform: 'uppercase',
              color: 'var(--koma-teal)', fontFamily: FONT, marginBottom: 10,
            }}>
              {subtitle}
            </span>
            <h1 style={{
              fontFamily: HEAD, fontWeight: 800,
              fontSize: 'clamp(24px,3vw,36px)',
              color: 'var(--koma-text)', lineHeight: 1.2, margin: 0,
            }}>{title}</h1>
          </div>

          <StepIndicator steps={steps} currentStep={currentStep} />

          {/* Carte formulaire */}
          <div style={{
            borderRadius: 16, background: '#fff',
            border: '1px solid #e5e7eb',
            padding: 'clamp(16px,5vw,32px)',
            boxShadow: '0 4px 24px rgba(0,0,0,.06)',
          }}>
            {children}

            {/* Navigation */}
            <div style={{
              display: 'flex', marginTop: 28, paddingTop: 20,
              borderTop: '1px solid #f3f4f6',
              justifyContent: isFirstStep ? 'flex-end' : 'space-between',
            }}>
              {!isFirstStep && (
                <button
                  type="button"
                  onClick={onBack}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    borderRadius: 50, border: '2px solid var(--koma-border)',
                    padding: '11px 22px', fontSize: 13.5, fontWeight: 600,
                    color: 'var(--koma-text)', background: 'transparent',
                    cursor: 'pointer', fontFamily: FONT, transition: 'border-color .15s',
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--koma-text)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--koma-border)'}
                >
                  {t('forms.back')}
                </button>
              )}
              <button
                type="button"
                onClick={isLastStep ? onSubmit : onNext}
                disabled={loading}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  borderRadius: 50, border: 'none',
                  background: 'var(--koma-red)', color: '#fff',
                  padding: '11px 26px', fontSize: 13.5, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? .65 : 1,
                  fontFamily: FONT, transition: 'background .15s',
                }}
                onMouseOver={e => { if (!loading) e.currentTarget.style.background = 'var(--koma-red-hover)' }}
                onMouseOut={e => { if (!loading) e.currentTarget.style.background = 'var(--koma-red)' }}
              >
                {loading ? (
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                ) : isLastStep ? t('forms.submit') : t('forms.continue')}
              </button>
            </div>
          </div>

        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
