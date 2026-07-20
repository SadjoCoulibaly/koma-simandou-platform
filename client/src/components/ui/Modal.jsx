import { useEffect } from 'react'
import { X, ArrowRight, Info } from 'lucide-react'

const FONT = 'var(--font-body)'
const HEAD = 'var(--font-heading)'

export default function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,38,59,.55)', backdropFilter: 'blur(5px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ position: 'relative', width: '100%', maxWidth: 660, maxHeight: '88vh', overflowY: 'auto', borderRadius: 20, background: '#fff', boxShadow: '0 40px 90px -20px rgba(0,38,59,.35)', animation: 'modIn .38s cubic-bezier(.16,1,.3,1)' }}>
        {children}
      </div>
      <style>{`@keyframes modIn{from{opacity:0;transform:scale(.96) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  )
}

export function ModalHeader({ num, title, onClose }) {
  return (
    <div style={{ position: 'relative', borderRadius: '20px 20px 0 0', background: 'var(--koma-teal-dark)', padding: '36px 40px 32px' }}>
      <button
        onClick={onClose}
        style={{
          position: 'absolute', right: 18, top: 18, zIndex: 3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.1)',
          color: '#fff', cursor: 'pointer', transition: 'all .2s',
        }}
        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,.2)'; e.currentTarget.style.transform = 'rotate(90deg)' }}
        onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.transform = 'rotate(0deg)' }}
      >
        <X size={17} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ width: 20, height: 2, background: 'var(--koma-teal)', display: 'inline-block', borderRadius: 2 }} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', fontFamily: FONT }}>
          {num}
        </span>
      </div>
      <h3 style={{ margin: 0, fontFamily: HEAD, fontWeight: 800, fontSize: 28, color: '#fff', lineHeight: 1.2 }}>{title}</h3>
    </div>
  )
}

export function ModalBody({ children }) {
  return (
    <div style={{ padding: '32px 40px 36px', fontFamily: FONT }}>
      {children}
    </div>
  )
}

export function WhyContent({ composante, onRegister }) {
  return (
    <>
      <p style={{ fontSize: 15.5, color: '#4b5563', marginBottom: 20, lineHeight: 1.7, fontFamily: FONT }}>{composante.why.intro}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ width: 20, height: 2, background: 'var(--koma-teal)', display: 'inline-block', borderRadius: 2 }} />
        <h4 style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--koma-teal)', fontFamily: FONT }}>
          {composante.why.label}
        </h4>
      </div>

      <ul style={{ listStyle: 'none', margin: '0 0 24px', padding: 0 }}>
        {composante.why.list.map((item, i) => (
          <li
            key={i}
            style={{
              position: 'relative', fontSize: 14.5, color: 'var(--koma-text)',
              padding: '11px 0 11px 22px',
              borderBottom: i < composante.why.list.length - 1 ? '1px solid #f3f4f6' : 'none',
              fontFamily: FONT, lineHeight: 1.6,
            }}
          >
            <span style={{
              position: 'absolute', left: 2, top: 18,
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--koma-teal)',
              boxShadow: '0 0 0 3px rgba(0,121,140,.15)',
            }} />
            {item}
          </li>
        ))}
      </ul>

      <button
        onClick={onRegister}
        style={{
          display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: 8,
          borderRadius: 50, background: 'var(--koma-red)', color: '#fff', border: 'none',
          padding: '13px 20px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
          fontFamily: FONT, transition: 'background .15s',
        }}
        onMouseOver={e => e.currentTarget.style.background = 'var(--koma-red-hover)'}
        onMouseOut={e => e.currentTarget.style.background = 'var(--koma-red)'}
      >
        Accéder à l'enregistrement de cette composante
        <ArrowRight size={16} />
      </button>
    </>
  )
}

export function RegContent({ composante, onSelect }) {
  return (
    <>
      <p style={{ fontSize: 15, color: '#4b5563', marginBottom: 20, lineHeight: 1.7, fontFamily: FONT }}>{composante.reg.intro}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {composante.reg.items.map((item, i) => (
          <button
            key={i}
            onClick={() => onSelect(item.label)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff',
              padding: '14px 18px', textAlign: 'left', cursor: 'pointer', transition: 'all .2s',
              fontFamily: FONT,
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--koma-teal)'; e.currentTarget.style.background = 'var(--koma-teal-light)' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff' }}
          >
            <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <b style={{ fontSize: 15, color: 'var(--koma-text)', fontWeight: 600 }}>{item.label}</b>
              <small style={{ fontSize: 12.5, color: '#6b7280' }}>{item.sub}</small>
            </span>
            <span style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: 'var(--koma-teal-light)', color: 'var(--koma-teal)',
              transition: 'all .2s',
            }}>
              <ArrowRight size={16} />
            </span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, borderRadius: 12, border: '1px solid rgba(0,121,140,.25)', background: 'var(--koma-teal-light)', padding: 16 }}>
        <Info size={18} style={{ flexShrink: 0, marginTop: 1, color: 'var(--koma-teal)' }} />
        <span style={{ fontSize: 13.5, color: 'var(--koma-teal)', lineHeight: 1.6, fontFamily: FONT }}>
          Le module de formulaire sera connecté à l'étape d'architecture technologique. La structure de navigation est prête.
        </span>
      </div>
    </>
  )
}
