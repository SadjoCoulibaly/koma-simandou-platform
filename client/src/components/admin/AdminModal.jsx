import { useEffect } from 'react'
import { X } from 'lucide-react'

const FONT = 'var(--font-body)'

export default function AdminModal({ open, onClose, title, children, onSubmit, loading, submitLabel = 'Enregistrer' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,38,59,.45)', backdropFilter: 'blur(3px)' }} />

      {/* Drawer */}
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 520, background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 32px rgba(0,0,0,.14)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '2px solid var(--koma-teal)', background: '#fff' }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--koma-text)', fontFamily: 'var(--font-heading)' }}>{title}</h3>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb', background: 'transparent', cursor: 'pointer', color: '#6b7280', transition: 'all .15s' }}
            onMouseOver={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = 'var(--koma-red)' }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {children}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #eee', background: '#fff', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose}
            style={{ padding: '12px 24px', borderRadius: 50, border: '2px solid var(--koma-border)', background: 'transparent', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', color: 'var(--koma-text)', fontFamily: FONT, transition: 'all .15s' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--koma-text)' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--koma-border)' }}>
            Annuler
          </button>
          <button onClick={onSubmit} disabled={loading}
            style={{ padding: '12px 28px', borderRadius: 50, border: 'none', background: 'var(--koma-red)', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.65 : 1, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 8, transition: 'background .15s' }}
            onMouseOver={e => { if (!loading) e.currentTarget.style.background = 'var(--koma-red-hover)' }}
            onMouseOut={e => { if (!loading) e.currentTarget.style.background = 'var(--koma-red)' }}>
            {loading && <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />}
            {submitLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export function MField({ label, required, error, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--koma-text)', fontFamily: FONT }}>
        {label}{required && <span style={{ color: 'var(--koma-red)', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && !error && <span style={{ fontSize: 12, color: '#9ca3af', fontFamily: FONT }}>{hint}</span>}
      {error && <span style={{ fontSize: 12, color: 'var(--koma-red)', fontFamily: FONT }}>{error}</span>}
    </div>
  )
}

export function MInput({ error, ...props }) {
  return (
    <input
      {...props}
      style={{
        width: '100%', padding: '13px 14px',
        borderRadius: 'var(--radius-sm)',
        fontSize: 14, fontFamily: FONT, boxSizing: 'border-box',
        border: `1px solid ${error ? 'var(--koma-red)' : 'var(--koma-border)'}`,
        background: error ? 'rgba(214,62,68,.04)' : '#fff',
        color: 'var(--koma-text)', outline: 'none',
        transition: 'border-color .15s, box-shadow .15s',
        ...props.style,
      }}
      onFocus={e => { e.target.style.borderColor = 'var(--koma-teal)'; e.target.style.boxShadow = '0 0 0 2px rgba(0,121,140,.15)' }}
      onBlur={e => { e.target.style.borderColor = error ? 'var(--koma-red)' : 'var(--koma-border)'; e.target.style.boxShadow = 'none' }}
    />
  )
}

export function MSelect({ error, children, ...props }) {
  return (
    <select
      {...props}
      style={{
        width: '100%', padding: '13px 14px',
        borderRadius: 'var(--radius-sm)',
        fontSize: 14, fontFamily: FONT, boxSizing: 'border-box', cursor: 'pointer',
        border: `1px solid ${error ? 'var(--koma-red)' : 'var(--koma-border)'}`,
        background: '#fff', color: 'var(--koma-text)', outline: 'none',
        transition: 'border-color .15s',
        ...props.style,
      }}
      onFocus={e => { e.target.style.borderColor = 'var(--koma-teal)'; e.target.style.boxShadow = '0 0 0 2px rgba(0,121,140,.15)' }}
      onBlur={e => { e.target.style.borderColor = error ? 'var(--koma-red)' : 'var(--koma-border)'; e.target.style.boxShadow = 'none' }}>
      {children}
    </select>
  )
}

export function MTextarea({ error, ...props }) {
  return (
    <textarea
      {...props}
      rows={props.rows || 3}
      style={{
        width: '100%', padding: '13px 14px',
        borderRadius: 'var(--radius-sm)',
        fontSize: 14, fontFamily: FONT, boxSizing: 'border-box', resize: 'vertical',
        border: `1px solid ${error ? 'var(--koma-red)' : 'var(--koma-border)'}`,
        background: '#fff', color: 'var(--koma-text)', outline: 'none',
        transition: 'border-color .15s',
        ...props.style,
      }}
      onFocus={e => { e.target.style.borderColor = 'var(--koma-teal)'; e.target.style.boxShadow = '0 0 0 2px rgba(0,121,140,.15)' }}
      onBlur={e => { e.target.style.borderColor = error ? 'var(--koma-red)' : 'var(--koma-border)'; e.target.style.boxShadow = 'none' }}
    />
  )
}

export function MSection({ label }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--koma-teal)', fontFamily: FONT }}>{label}</span>
        <div style={{ flex: 1, height: 2, background: 'var(--koma-teal)', borderRadius: 2, opacity: .25 }} />
      </div>
    </div>
  )
}
