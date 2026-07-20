import { useEffect, useState, useRef } from 'react'
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react'
import api from '../../lib/api'
import UploadZone from '../../components/ui/UploadZone'

const TABS = [
  { key: 'chiffres',     label: 'Chiffres clés'       },
  { key: 'themes',       label: 'Thématiques'          },
  { key: 'intervenants', label: 'Intervenants'         },
  { key: 'programme',    label: 'Programme'            },
  { key: 'sponsors',     label: 'Sponsors & Exposants' },
  { key: 'faq',          label: 'FAQ'                  },
]

const EMPTY = {
  chiffres:     { label: '', valeur: '', icone: '📊', ordre: 0 },
  themes:       { titre: '', description: '', icone: '🎯', ordre: 0 },
  intervenants: { nom: '', titre: '', organisation: '', photo_url: '', biographie: '', ordre: 0 },
  programme:    { jour: 1, heure_debut: '09:00', heure_fin: '10:00', titre: '', description: '', type: 'session', salle: '', intervenant_id: '', ordre: 0 },
  sponsors:     { nom: '', logo_url: '', site_url: '', categorie: 'exposant', ordre: 0 },
  faq:          { question: '', reponse: '', ordre: 0 },
}

const TYPE_PROG  = ['ouverture', 'keynote', 'session', 'atelier', 'pause', 'cloture']
const CAT_SPON   = ['platine', 'or', 'argent', 'partenaire', 'exposant']
const CAT_LABELS = { platine: 'Platine', or: 'Or', argent: 'Argent', partenaire: 'Partenaire', exposant: 'Exposant' }

function Modal({ title, onClose, onSave, children, loading }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 20, padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0D1B2E' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={20} /></button>
        </div>
        {children}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(13,27,46,.08)' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(13,27,46,.15)', background: 'white', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: '#374151' }}>
            Annuler
          </button>
          <button onClick={onSave} disabled={loading} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: 'var(--koma-teal)', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, opacity: loading ? .7 : 1 }}>
            <Save size={14} /> {loading ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6, letterSpacing: '.04em', textTransform: 'uppercase' }}>
        {label}{required && <span style={{ color: 'var(--koma-red)', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid rgba(13,27,46,.15)',
  fontSize: 14, outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box',
}

export default function AdminForumContent() {
  const [tab, setTab]             = useState('chiffres')
  const [items, setItems]         = useState([])
  const [intervenants, setIntervenants] = useState([])
  const [loading, setLoading]     = useState(false)
  const [loadError, setLoadError] = useState('')
  const [modal, setModal]         = useState(null)
  const [form, setForm]           = useState({})
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  const changeTab = (newTab) => {
    setItems([])      // vidé dans le même batch React que le changement de tab
    setLoadError('')
    setTab(newTab)
  }

  const load = async (currentTab) => {
    setLoading(true)
    try {
      const data = await api.get(`/forum-content/${currentTab}`)
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setLoadError(err.message || 'Erreur lors du chargement.')
    } finally { setLoading(false) }
  }

  useEffect(() => { load(tab) }, [tab])

  useEffect(() => {
    if (tab === 'programme') {
      api.get('/forum-content/intervenants').then(d => setIntervenants(Array.isArray(d) ? d : [])).catch(() => {})
    }
  }, [tab])

  const openCreate = () => { setForm({ ...EMPTY[tab] }); setError(''); setModal('create') }
  const openEdit   = item => { setForm({ ...item }); setError(''); setModal('edit') }
  const closeModal = () => { setModal(null); setForm({}) }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true); setError('')
    try {
      if (modal === 'create') await api.post(`/forum-content/${tab}`, form)
      else await api.put(`/forum-content/${tab}/${form.id}`, form)
      closeModal()
      load(tab)
    } catch (err) { setError(err.message || 'Erreur lors de l\'enregistrement.') }
    finally { setSaving(false) }
  }

  const remove = async id => {
    if (!confirm('Supprimer cet élément ?')) return
    try { await api.delete(`/forum-content/${tab}/${id}`); load() } catch {}
  }

  const renderForm = () => {
    switch (tab) {
      case 'chiffres': return (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Label" required><input style={inputStyle} value={form.label || ''} onChange={e => set('label', e.target.value)} placeholder="Participants attendus" /></Field>
            <Field label="Valeur" required><input style={inputStyle} value={form.valeur || ''} onChange={e => set('valeur', e.target.value)} placeholder="500+" /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Icône (emoji)"><input style={inputStyle} value={form.icone || ''} onChange={e => set('icone', e.target.value)} placeholder="👥" /></Field>
            <Field label="Ordre"><input type="number" style={inputStyle} value={form.ordre || 0} onChange={e => set('ordre', Number(e.target.value))} /></Field>
          </div>
        </>
      )
      case 'themes': return (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 12 }}>
            <Field label="Titre" required><input style={inputStyle} value={form.titre || ''} onChange={e => set('titre', e.target.value)} placeholder="Développement des capacités locales" /></Field>
            <Field label="Icône"><input style={inputStyle} value={form.icone || ''} onChange={e => set('icone', e.target.value)} placeholder="🏗️" /></Field>
          </div>
          <Field label="Description"><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} value={form.description || ''} onChange={e => set('description', e.target.value)} /></Field>
          <Field label="Ordre"><input type="number" style={{ ...inputStyle, width: 100 }} value={form.ordre || 0} onChange={e => set('ordre', Number(e.target.value))} /></Field>
        </>
      )
      case 'intervenants': return (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Nom complet" required><input style={inputStyle} value={form.nom || ''} onChange={e => set('nom', e.target.value)} placeholder="Mamadou Diallo" /></Field>
            <Field label="Titre / Poste"><input style={inputStyle} value={form.titre || ''} onChange={e => set('titre', e.target.value)} placeholder="Directeur Général" /></Field>
          </div>
          <Field label="Organisation"><input style={inputStyle} value={form.organisation || ''} onChange={e => set('organisation', e.target.value)} placeholder="Ministère des Mines" /></Field>
          <Field label="Photo">
            <UploadZone value={form.photo_url} onChange={url => set('photo_url', url)} bucket="forum-media" folder="forum" label="Uploader une photo" />
          </Field>
          <Field label="Biographie"><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} value={form.biographie || ''} onChange={e => set('biographie', e.target.value)} /></Field>
          <Field label="Ordre"><input type="number" style={{ ...inputStyle, width: 100 }} value={form.ordre || 0} onChange={e => set('ordre', Number(e.target.value))} /></Field>
        </>
      )
      case 'programme': return (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="Jour" required>
              <select style={inputStyle} value={form.jour || 1} onChange={e => set('jour', Number(e.target.value))}>
                <option value={1}>Jour 1</option><option value={2}>Jour 2</option><option value={3}>Jour 3</option>
              </select>
            </Field>
            <Field label="Début" required><input type="time" style={inputStyle} value={form.heure_debut || ''} onChange={e => set('heure_debut', e.target.value)} /></Field>
            <Field label="Fin"><input type="time" style={inputStyle} value={form.heure_fin || ''} onChange={e => set('heure_fin', e.target.value)} /></Field>
          </div>
          <Field label="Titre" required><input style={inputStyle} value={form.titre || ''} onChange={e => set('titre', e.target.value)} placeholder="Session d'ouverture officielle" /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Type">
              <select style={inputStyle} value={form.type || 'session'} onChange={e => set('type', e.target.value)}>
                {TYPE_PROG.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="Salle"><input style={inputStyle} value={form.salle || ''} onChange={e => set('salle', e.target.value)} placeholder="Salle A" /></Field>
          </div>
          <Field label="Intervenant">
            <select style={inputStyle} value={form.intervenant_id || ''} onChange={e => set('intervenant_id', e.target.value)}>
              <option value="">— Aucun —</option>
              {intervenants.map(iv => <option key={iv.id} value={iv.id}>{iv.nom}{iv.titre ? ` — ${iv.titre}` : ''}</option>)}
            </select>
          </Field>
          <Field label="Description"><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }} value={form.description || ''} onChange={e => set('description', e.target.value)} /></Field>
          <Field label="Ordre"><input type="number" style={{ ...inputStyle, width: 100 }} value={form.ordre || 0} onChange={e => set('ordre', Number(e.target.value))} /></Field>
        </>
      )
      case 'sponsors': return (
        <>
          <Field label="Catégorie" required>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CAT_SPON.map(c => (
                <button key={c} type="button" onClick={() => set('categorie', c)} style={{
                  padding: '7px 16px', borderRadius: 20, border: '1.5px solid', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', transition: 'all .15s',
                  background: form.categorie === c ? (c === 'exposant' ? 'var(--koma-teal-dark)' : 'var(--koma-teal)') : 'white',
                  color:      form.categorie === c ? 'white' : '#374151',
                  borderColor: form.categorie === c ? (c === 'exposant' ? 'var(--koma-teal-dark)' : 'var(--koma-teal)') : 'rgba(13,27,46,.15)',
                }}>
                  {CAT_LABELS[c]}
                </button>
              ))}
            </div>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Nom" required>
              <input style={inputStyle} value={form.nom || ''} onChange={e => set('nom', e.target.value)} placeholder={form.categorie === 'exposant' ? "Nom de l'exposant" : "Nom du sponsor"} />
            </Field>
            <Field label="Ordre"><input type="number" style={inputStyle} value={form.ordre || 0} onChange={e => set('ordre', Number(e.target.value))} /></Field>
          </div>
          <Field label="Logo">
            <UploadZone value={form.logo_url} onChange={url => set('logo_url', url)} bucket="forum-media" folder="forum" label="Uploader un logo" />
          </Field>
          <Field label="Site web"><input style={inputStyle} value={form.site_url || ''} onChange={e => set('site_url', e.target.value)} placeholder="https://..." /></Field>
          {form.categorie === 'exposant' && (
            <div style={{ background: 'rgba(13,27,46,.04)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#6B7280', border: '1px solid rgba(13,27,46,.08)' }}>
              💡 Les exposants apparaîtront dans une section dédiée "Exposants" sur la page publique du forum.
            </div>
          )}
        </>
      )
      case 'faq': return (
        <>
          <Field label="Question" required><input style={inputStyle} value={form.question || ''} onChange={e => set('question', e.target.value)} placeholder="Qui peut participer ?" /></Field>
          <Field label="Réponse" required><textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }} value={form.reponse || ''} onChange={e => set('reponse', e.target.value)} /></Field>
          <Field label="Ordre"><input type="number" style={{ ...inputStyle, width: 100 }} value={form.ordre || 0} onChange={e => set('ordre', Number(e.target.value))} /></Field>
        </>
      )
      default: return null
    }
  }

  const renderItem = item => {
    switch (tab) {
      case 'chiffres': return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 28 }}>{item.icone}</span>
          <div><div style={{ fontWeight: 700, fontSize: 18, color: 'var(--koma-teal)' }}>{item.valeur}</div><div style={{ fontSize: 13, color: '#6B7280' }}>{item.label}</div></div>
        </div>
      )
      case 'themes': return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>{item.icone}</span>
          <div><div style={{ fontWeight: 600, color: '#0D1B2E' }}>{item.titre}</div>{item.description && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2, maxWidth: 400 }}>{item.description.slice(0, 80)}…</div>}</div>
        </div>
      )
      case 'intervenants': return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {item.photo_url
            ? <img src={item.photo_url} alt={item.nom} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
            : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--koma-teal-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>{item.nom?.charAt(0) ?? '?'}</div>
          }
          <div><div style={{ fontWeight: 600, color: '#0D1B2E' }}>{item.nom}</div><div style={{ fontSize: 12, color: '#9CA3AF' }}>{item.titre}{item.organisation ? ` · ${item.organisation}` : ''}</div></div>
        </div>
      )
      case 'programme': return (
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--koma-teal)', textTransform: 'uppercase' }}>Jour {item.jour} · {item.heure_debut?.slice(0,5)}{item.heure_fin ? `–${item.heure_fin?.slice(0,5)}` : ''}</span>
          <div style={{ fontWeight: 600, color: '#0D1B2E', marginTop: 2 }}>{item.titre}</div>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>{item.type}{item.salle ? ` · ${item.salle}` : ''}</div>
        </div>
      )
      case 'sponsors': return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {item.logo_url
            ? <img src={item.logo_url} alt={item.nom} style={{ height: 32, maxWidth: 80, objectFit: 'contain', borderRadius: 4 }} />
            : <div style={{ width: 40, height: 32, borderRadius: 6, background: item.categorie === 'exposant' ? 'var(--koma-teal-dark)' : 'rgba(0,121,140,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                {item.categorie === 'exposant' ? '🏢' : '🤝'}
              </div>
          }
          <div>
            <div style={{ fontWeight: 600, color: '#0D1B2E' }}>{item.nom}</div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: item.categorie === 'exposant' ? 'var(--koma-teal-dark)' : 'rgba(0,121,140,.15)', color: item.categorie === 'exposant' ? 'white' : 'var(--koma-teal)' }}>
              {CAT_LABELS[item.categorie] || item.categorie}
            </span>
          </div>
        </div>
      )
      case 'faq': return (
        <div><div style={{ fontWeight: 600, color: '#0D1B2E' }}>{item.question}</div><div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{item.reponse.slice(0, 80)}…</div></div>
      )
      default: return null
    }
  }

  return (
    <div style={{ padding: '28px 24px', fontFamily: 'var(--font-body)' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#0D1B2E' }}>Contenu du Forum</h1>
        <p style={{ margin: 0, color: '#6B7280', fontSize: 14 }}>Gérez les contenus affichés sur la page publique du Forum de Remobilisation.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap', background: '#F1F5F9', borderRadius: 12, padding: 4 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => changeTab(t.key)} style={{ padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--font-body)', transition: 'all .15s', background: tab === t.key ? 'white' : 'transparent', color: tab === t.key ? '#0D1B2E' : '#6B7280', boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,.1)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Header liste */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: '#6B7280' }}>{items.length} élément{items.length !== 1 ? 's' : ''}</span>
        <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--koma-teal)', color: 'white', border: 'none', borderRadius: 9, padding: '9px 18px', cursor: 'pointer', fontSize: 13.5, fontWeight: 700, fontFamily: 'var(--font-body)' }}>
          <Plus size={15} /> Ajouter
        </button>
      </div>

      {/* Liste */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Chargement…</div>
      ) : loadError ? (
        <div style={{ background: '#FFF5F5', border: '1px solid rgba(178,58,46,.2)', borderRadius: 12, padding: '20px 24px', color: '#B23A2E', fontSize: 14 }}>
          ⚠️ {loadError}
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF' }}>
          <p style={{ fontSize: 15 }}>Aucun élément. Cliquez sur "Ajouter" pour commencer.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '1px solid rgba(13,27,46,.08)', borderRadius: 12, padding: '14px 18px', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>{renderItem(item)}</div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => openEdit(item)} style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid rgba(13,27,46,.12)', background: 'white', cursor: 'pointer', color: '#374151' }}><Pencil size={14} /></button>
                <button onClick={() => remove(item.id)} style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid rgba(196,0,0,.15)', background: '#FFF5F5', cursor: 'pointer', color: '#B23A2E' }}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal title={modal === 'create' ? 'Ajouter' : 'Modifier'} onClose={closeModal} onSave={save} loading={saving}>
          {renderForm()}
          {error && <p style={{ color: '#B23A2E', fontSize: 13, marginTop: 8 }}>{error}</p>}
        </Modal>
      )}
    </div>
  )
}
