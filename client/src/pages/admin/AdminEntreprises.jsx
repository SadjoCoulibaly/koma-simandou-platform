import { useEffect, useState } from 'react'
import { Link2, Copy, Check, X } from 'lucide-react'
import { VILLES_GUINEE } from '../../data/villesGuinee'
import AdminTable, { StatutBadge } from '../../components/admin/AdminTable'
import AdminModal, { MField, MInput, MSelect, MTextarea, MSection } from '../../components/admin/AdminModal'
import UploadZone from '../../components/ui/UploadZone'
import { entreprisesApi } from '../../lib/api'

const FONT = 'var(--font-body)'

function InviteResultModal({ result, onClose }) {
  const [copied, setCopied] = useState(false)
  if (!result) return null

  const copy = () => {
    if (result.inviteLink) {
      navigator.clipboard.writeText(result.inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,38,59,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 20, padding: '36px 32px', maxWidth: 520, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,.2)', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer', display: 'flex' }}>
          <X size={16} color="#6b7280" />
        </button>

        {result.error ? (
          <>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <X size={24} color="#dc2626" />
            </div>
            <h3 style={{ textAlign: 'center', fontSize: 18, fontWeight: 700, color: '#0D1B2E', margin: '0 0 10px', fontFamily: FONT }}>Impossible de générer le lien</h3>
            <p style={{ textAlign: 'center', fontSize: 13.5, color: '#6b7280', margin: '0 0 20px', lineHeight: 1.6 }}>{result.error}</p>
            <button onClick={onClose} style={{ width: '100%', padding: '11px', background: 'var(--koma-teal)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>Fermer</button>
          </>
        ) : (
          <>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--koma-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Link2 size={22} color="var(--koma-teal)" />
            </div>
            <h3 style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, color: '#0D1B2E', margin: '0 0 8px', fontFamily: FONT }}>Lien d'accès généré</h3>
            <p style={{ textAlign: 'center', fontSize: 13.5, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.6 }}>
              Envoyez ce lien à <strong style={{ color: 'var(--koma-teal)' }}>{result.email}</strong>.<br />
              Un email a également été envoyé automatiquement si le SMTP est configuré.
            </p>

            {/* Lien */}
            <div style={{ background: '#f8fafc', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
              <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#9ca3af', fontFamily: FONT }}>Lien d'invitation (valable 24h)</p>
              <span style={{ fontSize: 12, color: '#374151', wordBreak: 'break-all', lineHeight: 1.6, display: 'block' }}>{result.inviteLink}</span>
            </div>

            <button onClick={copy}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', background: copied ? '#dcfce7' : 'var(--koma-teal)', color: copied ? '#166534' : '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, transition: 'background .2s', marginBottom: 10 }}>
              {copied ? <><Check size={15} /> Lien copié !</> : <><Copy size={15} /> Copier le lien</>}
            </button>
            <button onClick={onClose}
              style={{ width: '100%', padding: '11px', background: 'transparent', color: '#6b7280', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}>
              Fermer
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const TYPES_ENT = ['Nationale','Internationale','Sous-traitant',"Bureau d'études",'Fournisseur',"Société d'inventaire d'équipements"]
const SECTEURS_ENT = ['Mines & Métallurgie','BTP & Génie Civil','Transport & Logistique','Énergie','Environnement','Agriculture','Industrie','Services','Technologie','Autre']
const VILLES_ENT = VILLES_GUINEE

const STATUTS = ['Tous', 'en_attente', 'actif', 'suspendu']

const COLUMNS = [
  {
    key: 'nom',
    label: 'Entreprise',
    render: (v, row) => (
      <div className="flex items-center gap-3">
        {row.logo_url ? (
          <img
            src={row.logo_url}
            alt={v}
            className="h-9 w-9 flex-shrink-0 rounded-[8px] border border-pine/10 bg-white object-contain p-0.5"
          />
        ) : (
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[8px] bg-pine/8 text-[13px] font-bold text-pine uppercase">
            {v?.charAt(0) ?? '?'}
          </div>
        )}
        <span className="font-semibold text-pine">{v}</span>
      </div>
    ),
  },
  { key: 'type',      label: 'Type',       muted: true },
  { key: 'secteur',   label: 'Secteur',    muted: true },
  { key: 'ville',     label: 'Ville',      muted: true },
  { key: 'telephone', label: 'Téléphone',  muted: true },
  { key: 'statut',    label: 'Statut',     render: (v) => <StatutBadge statut={v} /> },
  { key: 'created_at',label: 'Soumis le',  muted: true, render: (v) => v ? new Date(v).toLocaleDateString('fr-FR') : '—' },
]

export default function AdminEntreprises() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(true)
  const [statut, setStatut]   = useState('Tous')

  const INIT_ENT = { nom: '', type: '', secteur: '', ville: '', telephone: '', email: '', site_web: '', description: '', declarant_nom: '', declarant_email: '', logo_url: '', experience_simandou: false }
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId]       = useState(null)
  const [form, setForm]           = useState(INIT_ENT)
  const [saving, setSaving]       = useState(false)
  const [errors, setErrors]       = useState({})
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const [inviteResult, setInviteResult]   = useState(null)
  const [inviteLoading, setInviteLoading] = useState(false)

  const load = async (p = 1, s = statut) => {
    setLoading(true)
    try {
      const params = { page: p, limit: 20 }
      if (s !== 'Tous') params.statut = s
      const res = await entreprisesApi.getAll(params)
      setData(res.data || [])
      setTotal(res.total || 0)
    } catch { setData([]); setTotal(0) }
    finally { setLoading(false) }
  }

  useEffect(() => { load(1, statut) }, [statut])

  const handleValidate = async (id) => {
    await entreprisesApi.validate(id)
    load(page, statut)
  }
  const handleReject = async (id) => {
    await entreprisesApi.reject(id)
    load(page, statut)
  }
  const handleDelete = async (id) => {
    await entreprisesApi.delete(id)
    load(page, statut)
  }

  const handleInvite = async (id) => {
    setInviteLoading(true)
    try {
      const result = await entreprisesApi.generateInvite(id)
      setInviteResult(result)
    } catch (err) {
      setInviteResult({ error: err.message })
    } finally {
      setInviteLoading(false)
    }
  }

  const handleEdit = (row) => {
    setEditId(row.id)
    setForm({
      nom: row.nom || '', type: row.type || '', secteur: row.secteur || '',
      ville: row.ville || '', telephone: row.telephone || '', email: row.email || '',
      site_web: row.site_web || '', description: row.description || '',
      declarant_nom: row.declarant_nom || '', declarant_email: row.declarant_email || '',
      logo_url: row.logo_url || '', experience_simandou: row.experience_simandou || false,
    })
    setErrors({})
    setModalOpen(true)
  }

  const handleAdd = async () => {
    const e = {}
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.nom.trim()) e.nom = 'Obligatoire'
    if (!form.type) e.type = 'Obligatoire'
    if (form.email && !emailRe.test(form.email.trim())) e.email = 'Email invalide'
    if (form.declarant_email && !emailRe.test(form.declarant_email.trim())) e.declarant_email = 'Email invalide'
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      if (editId) {
        await entreprisesApi.update(editId, form)
      } else {
        const created = await entreprisesApi.create({ ...form, statut: 'actif' })
        if ((form.declarant_email || form.email) && created?.id) handleInvite(created.id)
      }
      setModalOpen(false); setForm(INIT_ENT); setEditId(null); setErrors({})
      load(page, statut)
    } catch (err) { setErrors({ submit: err.message }) }
    finally { setSaving(false) }
  }

  return (
    <>
    <InviteResultModal result={inviteResult} onClose={() => setInviteResult(null)} />

    {inviteLoading && (
      <div style={{ position: 'fixed', inset: 0, zIndex: 190, background: 'rgba(0,38,59,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '28px 36px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 16px 48px rgba(0,0,0,.18)', fontFamily: FONT }}>
          <span style={{ width: 22, height: 22, border: '3px solid #e5e7eb', borderTopColor: 'var(--koma-teal)', borderRadius: '50%', animation: 'spin .8s linear infinite', flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--koma-text)' }}>Génération du lien d'invitation…</span>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )}

    <AdminModal open={modalOpen} onClose={() => { setModalOpen(false); setEditId(null); setForm(INIT_ENT); setErrors({}) }} title={editId ? 'Modifier l\'entreprise' : 'Ajouter une entreprise'} onSubmit={handleAdd} loading={saving}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <MSection label="Identité" />
        <MField label="Logo de l'entreprise">
          <UploadZone
            value={form.logo_url}
            onChange={url => setF('logo_url', url)}
            folder="logos"
            label="Uploader le logo"
          />
        </MField>
        <MField label="Nom de l'entreprise / entité" required error={errors.nom}>
          <MInput placeholder="Ex : SOGUIMINE S.A." value={form.nom} onChange={e => setF('nom', e.target.value)} error={errors.nom} />
        </MField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <MField label="Type" required error={errors.type}>
            <MSelect value={form.type} onChange={e => setF('type', e.target.value)} error={errors.type}>
              <option value="">— Sélectionner —</option>
              {TYPES_ENT.map(t => <option key={t} value={t}>{t}</option>)}
            </MSelect>
          </MField>
          <MField label="Secteur d'activité">
            <MSelect value={form.secteur} onChange={e => setF('secteur', e.target.value)}>
              <option value="">— Sélectionner —</option>
              {SECTEURS_ENT.map(s => <option key={s} value={s}>{s}</option>)}
            </MSelect>
          </MField>
          <MField label="Ville">
            <MSelect value={form.ville} onChange={e => setF('ville', e.target.value)}>
              <option value="">— Sélectionner —</option>
              {VILLES_ENT.map(v => <option key={v} value={v}>{v}</option>)}
            </MSelect>
          </MField>
          <MField label="Téléphone">
            <MInput type="tel" placeholder="+224 620 000 000" value={form.telephone} onChange={e => setF('telephone', e.target.value)} />
          </MField>
          <MField label="Email">
            <MInput type="email" placeholder="contact@entreprise.gn" value={form.email} onChange={e => setF('email', e.target.value)} />
            {errors.email && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#B23A2E' }}>{errors.email}</p>}
          </MField>
          <MField label="Site web">
            <MInput placeholder="https://..." value={form.site_web} onChange={e => setF('site_web', e.target.value)} />
          </MField>
        </div>
        <MField label="Description">
          <MTextarea placeholder="Activités principales, domaine d'expertise..." value={form.description} onChange={e => setF('description', e.target.value)} />
        </MField>
        {/* Case à cocher expérience Simandou */}
        <button
          type="button"
          onClick={() => setF('experience_simandou', !form.experience_simandou)}
          style={{
            width: '100%', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
            border: `2px solid ${form.experience_simandou ? 'var(--koma-teal)' : '#e5e7eb'}`,
            background: form.experience_simandou ? 'var(--koma-teal-light)' : '#f8fafc',
            transition: 'all .15s',
          }}
        >
          <div style={{
            marginTop: 2, width: 18, height: 18, borderRadius: 5, flexShrink: 0,
            border: `2px solid ${form.experience_simandou ? 'var(--koma-teal)' : '#d1d5db'}`,
            background: form.experience_simandou ? 'var(--koma-teal)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
          }}>
            {form.experience_simandou && (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width="10" height="10">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: form.experience_simandou ? 'var(--koma-teal)' : 'var(--koma-text)', lineHeight: 1.4 }}>
              A travaillé sur le Projet Simandou
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#8A9A90', lineHeight: 1.4 }}>
              Chemin de fer, port, mine, infrastructures associées, sous-traitance…
            </p>
          </div>
        </button>

        <MSection label="Déclarant" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <MField label="Nom du déclarant">
            <MInput placeholder="DIALLO Mamadou" value={form.declarant_nom} onChange={e => setF('declarant_nom', e.target.value)} />
          </MField>
          <MField label="Email déclarant">
            <MInput type="email" placeholder="declarant@email.com" value={form.declarant_email} onChange={e => setF('declarant_email', e.target.value)} />
            {errors.declarant_email && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#B23A2E' }}>{errors.declarant_email}</p>}
          </MField>
        </div>
        {errors.submit && <p style={{ fontSize: 13, color: '#B23A2E', margin: 0 }}>{errors.submit}</p>}
      </div>
    </AdminModal>

    <AdminTable
      eyebrow="Composante 01"
      title="Registre des Entreprises"
      columns={COLUMNS}
      data={data}
      loading={loading}
      total={total}
      page={page}
      limit={20}
      onPageChange={(p) => { setPage(p); load(p, statut) }}
      onEdit={handleEdit}
      onAdd={() => { setForm(INIT_ENT); setEditId(null); setErrors({}); setModalOpen(true) }}
      addLabel="Ajouter une entreprise"
      onValidate={handleValidate}
      onReject={handleReject}
      onDelete={handleDelete}
      onInvite={handleInvite}
      searchPlaceholder="Rechercher une entreprise..."
      filterSlot={
        <div className="flex rounded-[9px] border border-pine/14 overflow-hidden">
          {STATUTS.map(s => (
            <button
              key={s}
              onClick={() => { setStatut(s); setPage(1) }}
              className={`px-3 py-2 text-[12px] font-medium font-sans transition-colors capitalize ${statut === s ? 'bg-pine text-bone' : 'bg-paper text-pine hover:bg-pine/8'}`}
            >
              {s === 'en_attente' ? 'En attente' : s === 'Tous' ? 'Tous' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      }
    />
    </>
  )
}
