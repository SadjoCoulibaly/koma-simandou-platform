const FONT = 'var(--font-body)'
const HEAD = 'var(--font-heading)'

export function FormField({ label, error, required, children, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: 'var(--koma-text)', fontFamily: FONT }}>
          {label}
          {required && <span style={{ color: 'var(--koma-red)', fontSize: 14, lineHeight: 1 }}>*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p style={{ fontSize: 12, color: '#9ca3af', fontFamily: FONT, margin: 0 }}>{hint}</p>}
      {error && <p style={{ fontSize: 12, color: 'var(--koma-red)', fontFamily: FONT, margin: 0 }}>{error}</p>}
    </div>
  )
}

const inputBase = {
  width: '100%', padding: '12px 14px',
  borderRadius: 8, fontSize: 14,
  fontFamily: FONT, boxSizing: 'border-box',
  border: '1px solid var(--koma-border)',
  background: '#fff',
  color: 'var(--koma-text)', outline: 'none',
  transition: 'border-color .15s, box-shadow .15s',
}

export function Input({ error, style: externalStyle, ...props }) {
  return (
    <input
      {...props}
      style={{
        ...inputBase,
        border: `1px solid ${error ? 'var(--koma-red)' : 'var(--koma-border)'}`,
        background: error ? 'rgba(214,62,68,.04)' : '#fff',
        ...externalStyle,
      }}
      onFocus={e => { e.target.style.borderColor = 'var(--koma-teal)'; e.target.style.boxShadow = '0 0 0 2px rgba(0,121,140,.15)' }}
      onBlur={e => { e.target.style.borderColor = error ? 'var(--koma-red)' : 'var(--koma-border)'; e.target.style.boxShadow = 'none' }}
    />
  )
}

export function Select({ error, style: externalStyle, children, ...props }) {
  return (
    <select
      {...props}
      style={{
        ...inputBase,
        border: `1px solid ${error ? 'var(--koma-red)' : 'var(--koma-border)'}`,
        cursor: 'pointer',
        ...externalStyle,
      }}
      onFocus={e => { e.target.style.borderColor = 'var(--koma-teal)'; e.target.style.boxShadow = '0 0 0 2px rgba(0,121,140,.15)' }}
      onBlur={e => { e.target.style.borderColor = error ? 'var(--koma-red)' : 'var(--koma-border)'; e.target.style.boxShadow = 'none' }}
    >
      {children}
    </select>
  )
}

export function Textarea({ error, style: externalStyle, ...props }) {
  return (
    <textarea
      rows={4}
      {...props}
      style={{
        ...inputBase,
        border: `1px solid ${error ? 'var(--koma-red)' : 'var(--koma-border)'}`,
        resize: 'none',
        ...externalStyle,
      }}
      onFocus={e => { e.target.style.borderColor = 'var(--koma-teal)'; e.target.style.boxShadow = '0 0 0 2px rgba(0,121,140,.15)' }}
      onBlur={e => { e.target.style.borderColor = error ? 'var(--koma-red)' : 'var(--koma-border)'; e.target.style.boxShadow = 'none' }}
    />
  )
}

export function SelectCard({ label, sub, icon, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        width: '100%', borderRadius: 12,
        border: `2px solid ${selected ? 'var(--koma-teal)' : '#e5e7eb'}`,
        background: selected ? 'var(--koma-teal-light)' : '#fff',
        padding: '12px 14px', textAlign: 'left', cursor: 'pointer', outline: 'none',
        transition: 'all .15s',
        boxShadow: selected ? '0 0 0 3px rgba(0,121,140,.12)' : 'none',
      }}
    >
      {icon && (
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: selected ? 'var(--koma-teal)' : 'var(--koma-teal-light)',
          color: selected ? '#fff' : 'var(--koma-teal)',
          transition: 'all .15s',
        }}>
          {icon}
        </span>
      )}
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <b style={{ fontSize: 14, fontWeight: 700, color: selected ? 'var(--koma-teal)' : 'var(--koma-text)', fontFamily: FONT }}>{label}</b>
        {sub && <small style={{ fontSize: 12, color: '#6b7280', fontFamily: FONT }}>{sub}</small>}
      </span>
      <span style={{
        marginLeft: 'auto', flexShrink: 0, width: 20, height: 20, borderRadius: '50%',
        border: `2px solid ${selected ? 'var(--koma-teal)' : '#d1d5db'}`,
        background: selected ? 'var(--koma-teal)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .15s',
      }}>
        {selected && (
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" style={{ width: 11, height: 11 }}>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </span>
    </button>
  )
}

export function SectionTitle({ num, title, desc }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        {num && (
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 24, height: 24, borderRadius: '50%',
            background: 'var(--koma-teal-light)', fontSize: 11, fontWeight: 700,
            color: 'var(--koma-teal)', fontFamily: FONT,
          }}>{num}</span>
        )}
        <h3 style={{ margin: 0, fontFamily: HEAD, fontWeight: 700, fontSize: 19, color: 'var(--koma-text)' }}>{title}</h3>
      </div>
      {desc && <p style={{ fontSize: 13.5, color: '#6b7280', margin: 0, paddingLeft: num ? 34 : 0, fontFamily: FONT }}>{desc}</p>}
    </div>
  )
}

export function SuccessScreen({ title, message, onReset, resetLabel = 'Nouvel enregistrement' }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--koma-gray-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 520, textAlign: 'center' }}>
        <div style={{ margin: '0 auto 24px', display: 'flex', width: 80, height: 80, borderRadius: '50%', background: 'var(--koma-teal-light)', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--koma-teal)" strokeWidth="1.8" style={{ width: 40, height: 40 }}>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 30, color: 'var(--koma-text)', margin: '0 0 12px' }}>{title}</h2>
        <p style={{ fontSize: 15.5, color: '#6b7280', margin: '0 auto 32px', maxWidth: '40ch', lineHeight: 1.7, fontFamily: FONT }}>{message}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <button
            onClick={onReset}
            style={{ borderRadius: 50, border: '2px solid var(--koma-teal)', padding: '12px 28px', fontSize: 14, fontWeight: 600, color: 'var(--koma-teal)', background: 'transparent', cursor: 'pointer', fontFamily: FONT, transition: 'background .15s' }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--koma-teal-light)'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            {resetLabel}
          </button>
          <a
            href="/"
            style={{ borderRadius: 50, background: 'var(--koma-red)', padding: '12px 28px', fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none', display: 'inline-block', transition: 'background .15s', fontFamily: FONT }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--koma-red-hover)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--koma-red)'}
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  )
}
