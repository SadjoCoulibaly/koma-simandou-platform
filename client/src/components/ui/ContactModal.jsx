import { useState, useEffect } from 'react'
import { X, Send, CheckCircle } from 'lucide-react'
import api from '../../lib/api'

const FONT = 'var(--font-body)'
const HEAD = 'var(--font-heading)'

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: '1.5px solid #e5e7eb', fontSize: 14, fontFamily: FONT,
  color: 'var(--koma-text)', background: '#fff', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color .15s',
}

export default function ContactModal({ open, onClose, defaultSubject = '' }) {
  const [form, setForm]       = useState({ nom: '', email: '', sujet: defaultSubject, message: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  useEffect(() => {
    if (open) {
      setForm(f => ({ ...f, sujet: defaultSubject }))
      setErrors({})
      setSent(false)
    }
  }, [open, defaultSubject])

  if (!open) return null

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.nom.trim())     e.nom     = 'Obligatoire'
    if (!form.email.trim())   e.email   = 'Obligatoire'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide'
    if (!form.message.trim()) e.message = 'Obligatoire'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await api.post('/contact', form)
      setSent(true)
    } catch (err) {
      setErrors({ submit: err.message || 'Erreur lors de l\'envoi. Réessayez.' })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSent(false)
    setForm({ nom: '', email: '', sujet: defaultSubject, message: '' })
    setErrors({})
    onClose()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,38,59,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={handleClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 500, boxShadow: '0 24px 64px rgba(0,0,0,.18)', position: 'relative', overflow: 'hidden', maxHeight: '95vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, var(--koma-teal-dark) 0%, var(--koma-teal) 100%)', padding: '28px 32px 24px' }}>
          <button onClick={handleClose}
            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex', color: '#fff' }}>
            <X size={18} />
          </button>
          <h2 style={{ fontFamily: HEAD, fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Nous contacter</h2>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.7)', margin: '0 0 6px' }}>Votre message sera transmis à notre équipe sous 24h.</p>
          <a href="tel:+224621727276" style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', textDecoration: 'none', fontFamily: FONT }}>📞 +224 621 727 276</a>
        </div>

        {/* Corps */}
        <div style={{ padding: '28px 32px' }}>
          {sent ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0', textAlign: 'center' }}>
              <CheckCircle size={52} color="var(--koma-teal)" strokeWidth={1.5} />
              <h3 style={{ fontFamily: HEAD, fontSize: 20, fontWeight: 800, color: 'var(--koma-text)', margin: 0 }}>Message envoyé !</h3>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.7 }}>
                Merci pour votre message. Notre équipe vous répondra dans les meilleurs délais à l'adresse <strong>{form.email}</strong>.
              </p>
              <button onClick={handleClose}
                style={{ marginTop: 8, padding: '10px 28px', borderRadius: 50, background: 'var(--koma-teal)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: FONT }}>
                Fermer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--koma-text)', marginBottom: 6, fontFamily: FONT }}>
                    Nom <span style={{ color: 'var(--koma-red)' }}>*</span>
                  </label>
                  <input
                    type="text" placeholder="Votre nom" value={form.nom}
                    onChange={e => set('nom', e.target.value)}
                    style={{ ...inputStyle, borderColor: errors.nom ? 'var(--koma-red)' : '#e5e7eb' }}
                    onFocus={e => e.target.style.borderColor = 'var(--koma-teal)'}
                    onBlur={e => e.target.style.borderColor = errors.nom ? 'var(--koma-red)' : '#e5e7eb'}
                  />
                  {errors.nom && <p style={{ fontSize: 11.5, color: 'var(--koma-red)', margin: '4px 0 0' }}>{errors.nom}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--koma-text)', marginBottom: 6, fontFamily: FONT }}>
                    Email <span style={{ color: 'var(--koma-red)' }}>*</span>
                  </label>
                  <input
                    type="email" placeholder="votre@email.com" value={form.email}
                    onChange={e => set('email', e.target.value)}
                    style={{ ...inputStyle, borderColor: errors.email ? 'var(--koma-red)' : '#e5e7eb' }}
                    onFocus={e => e.target.style.borderColor = 'var(--koma-teal)'}
                    onBlur={e => e.target.style.borderColor = errors.email ? 'var(--koma-red)' : '#e5e7eb'}
                  />
                  {errors.email && <p style={{ fontSize: 11.5, color: 'var(--koma-red)', margin: '4px 0 0' }}>{errors.email}</p>}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--koma-text)', marginBottom: 6, fontFamily: FONT }}>
                  Sujet
                </label>
                <input
                  type="text" placeholder="Objet de votre message" value={form.sujet}
                  onChange={e => set('sujet', e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--koma-teal)'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--koma-text)', marginBottom: 6, fontFamily: FONT }}>
                  Message <span style={{ color: 'var(--koma-red)' }}>*</span>
                </label>
                <textarea
                  placeholder="Décrivez votre demande..." value={form.message}
                  onChange={e => set('message', e.target.value)}
                  rows={5}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 110, borderColor: errors.message ? 'var(--koma-red)' : '#e5e7eb' }}
                  onFocus={e => e.target.style.borderColor = 'var(--koma-teal)'}
                  onBlur={e => e.target.style.borderColor = errors.message ? 'var(--koma-red)' : '#e5e7eb'}
                />
                {errors.message && <p style={{ fontSize: 11.5, color: 'var(--koma-red)', margin: '4px 0 0' }}>{errors.message}</p>}
              </div>

              {errors.submit && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#991b1b' }}>
                  {errors.submit}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--koma-teal)', color: '#fff', border: 'none', borderRadius: 50, padding: '13px 28px', fontSize: 14, fontWeight: 700, fontFamily: FONT, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, transition: 'background .15s' }}
                onMouseOver={e => { if (!loading) e.currentTarget.style.background = 'var(--koma-teal-dark)' }}
                onMouseOut={e => e.currentTarget.style.background = 'var(--koma-teal)'}>
                {loading
                  ? <span style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} />
                  : <><Send size={15} /> Envoyer le message</>
                }
              </button>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
