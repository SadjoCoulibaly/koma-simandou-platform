import { useEffect, useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { VILLES_GUINEE } from '../../data/villesGuinee'
import AdminTable, { StatutBadge } from '../../components/admin/AdminTable'
import AdminModal, { MField, MInput, MSelect, MSection } from '../../components/admin/AdminModal'
import { humanResourcesApi } from '../../lib/api'
import { useEntreprisesList } from '../../hooks/useEntreprisesList'

const FONCTIONS = ['Ingénieur minier','Géologue','Topographe','Technicien de maintenance','Électromécanicien','Soudeur','Opérateur engins','Chauffeur','Chef de chantier','Conducteur de travaux','Responsable HSE','Logisticien','Comptable','Juriste','Informaticien','Autre']
const NATIONALITES = ['Guinéenne','Française','Sénégalaise','Malienne','Ivoirienne','Burkinabè','Ghanéenne','Nigériane','Sud-africaine','Chinoise','Australienne','Canadienne','Américaine','Britannique','Autre']
const VILLES_HR = VILLES_GUINEE
const DISPOS = [{ v: 'disponible', l: 'Disponible' }, { v: 'partiel', l: 'Temps partiel' }, { v: 'indisponible', l: 'Indisponible' }]

const DISPO_STYLES = {
  disponible:   { bg: '#E1F5EE', text: '#0F6E56', label: 'Disponible' },
  partiel:      { bg: '#FAEEDA', text: '#854F0B', label: 'Partiel' },
  indisponible: { bg: '#FCEBEB', text: '#A32D2D', label: 'Indisponible' },
}

const STATUTS = ['Tous', 'en_attente', 'actif', 'suspendu']

const COLUMNS = [
  {
    key: 'nom_complet',
    label: 'Professionnel',
    render: (v, row) => (
      <div className="flex items-center gap-3">
        {row.photo_url ? (
          <img src={row.photo_url} alt={v}
            className="h-9 w-9 flex-shrink-0 rounded-full border border-pine/10 object-cover" />
        ) : (
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-pine/10 text-[13px] font-bold text-pine uppercase">
            {v?.charAt(0) ?? '?'}
          </div>
        )}
        <span className="font-semibold text-pine">{v}</span>
      </div>
    ),
  },
  { key: 'fonction',     label: 'Fonction',     muted: true },
  { key: 'nationalite',  label: 'Nationalité',  muted: true },
  { key: 'localisation', label: 'Localisation', muted: true },
  {
    key: 'competences',
    label: 'Compétences',
    render: (v) => {
      if (!v || !v.length) return <span className="text-[#C5CEDE]">—</span>
      return (
        <div className="flex flex-wrap gap-1">
          {v.slice(0, 3).map((c, i) => (
            <span key={i} style={{ background: '#EBF4FF', color: '#185FA5', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>{c}</span>
          ))}
          {v.length > 3 && <span style={{ fontSize: 11, color: '#8A9A90' }}>+{v.length - 3}</span>}
        </div>
      )
    },
  },
  {
    key: 'disponibilite',
    label: 'Disponibilité',
    render: (v) => {
      const s = DISPO_STYLES[v] || { bg: '#F1EFE8', text: '#5F5E5A', label: v }
      return (
        <span className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap"
          style={{ background: s.bg, color: s.text }}>
          {s.label}
        </span>
      )
    },
  },
  { key: 'statut',     label: 'Statut',    render: (v) => <StatutBadge statut={v} /> },
  { key: 'created_at', label: 'Soumis le', muted: true, render: (v) => v ? new Date(v).toLocaleDateString('fr-FR') : '—' },
]

const INIT_HR = {
  nom_complet: '', telephone: '', email: '', nationalite: 'Guinéenne',
  fonction: '', disponibilite: 'disponible', localisation: '',
  competences: [], entreprise_id: '', photo_url: '',
}

function CompetencesTags({ values, onChange }) {
  const [input, setInput] = useState('')

  const add = () => {
    const v = input.trim()
    if (!v || values.includes(v)) return
    onChange([...values, v])
    setInput('')
  }

  const remove = (idx) => onChange(values.filter((_, i) => i !== idx))

  return (
    <div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          type="text"
          placeholder="Ex : Forages, Explosifs, SIG…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          style={{
            flex: 1, padding: '7px 11px', borderRadius: 8,
            border: '1.5px solid rgba(13,58,41,.13)', background: '#F9FAF8',
            fontSize: 13.5, color: '#0D1B2E', outline: 'none',
          }}
        />
        <button type="button" onClick={add}
          style={{
            padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: '#0D3A29', color: '#F5EDD3', fontSize: 13, fontWeight: 600,
          }}>
          + Ajouter
        </button>
      </div>
      {values.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {values.map((c, i) => (
            <span key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#EBF4FF', color: '#185FA5',
              borderRadius: 999, padding: '3px 10px', fontSize: 12.5, fontWeight: 600,
            }}>
              {c}
              <button type="button" onClick={() => remove(i)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#185FA5', lineHeight: 1 }}>
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function PhotoUpload({ value, onChange, uploading }) {
  const fileRef = useRef()

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    onChange(file)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
          border: '2px solid rgba(13,58,41,.18)', background: '#F1EFE8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {value ? (
            typeof value === 'string'
              ? <img src={value} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <img src={URL.createObjectURL(value)} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Camera size={28} color="#8A9A90" />
          )}
        </div>
        {uploading && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 22, height: 22, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFile} />
        <button type="button" onClick={() => fileRef.current?.click()}
          style={{
            padding: '8px 16px', borderRadius: 8, border: '1.5px solid rgba(13,58,41,.2)',
            background: 'white', cursor: 'pointer', fontSize: 13, color: '#0D3A29', fontWeight: 600,
            display: 'block', marginBottom: 5,
          }}>
          {value ? 'Changer la photo' : 'Choisir une photo'}
        </button>
        <p style={{ fontSize: 11.5, color: '#8A9A90', margin: 0 }}>JPG, PNG ou WebP · max 5 Mo</p>
        {value && typeof value !== 'string' && (
          <button type="button" onClick={() => { onChange(null); fileRef.current.value = '' }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#B23A2E', padding: 0, marginTop: 4 }}>
            Supprimer
          </button>
        )}
      </div>
    </div>
  )
}

export default function AdminHumanResources() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(true)
  const [statut, setStatut]   = useState('Tous')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors]       = useState({})
  const [form, setForm]           = useState(INIT_HR)
  const [photoFile, setPhotoFile] = useState(null)
  const { entreprises }           = useEntreprisesList()
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const load = async (p = 1, s = statut) => {
    setLoading(true)
    try {
      const params = { page: p, limit: 20 }
      if (s !== 'Tous') params.statut = s
      const res = await humanResourcesApi.getAll(params)
      setData(res.data || [])
      setTotal(res.total || 0)
    } catch { setData([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleStatut = (s) => { setStatut(s); setPage(1); load(1, s) }

  const handleValidate = async (id) => { try { await humanResourcesApi.validate(id); load(page) } catch (err) { alert('Erreur : ' + err.message) } }
  const handleReject   = async (id) => { try { await humanResourcesApi.reject(id);   load(page) } catch (err) { alert('Erreur : ' + err.message) } }
  const handleDelete   = async (id) => { try { await humanResourcesApi.delete(id);   load(page) } catch (err) { alert('Erreur : ' + err.message) } }

  const handleAdd = async () => {
    const e = {}
    if (!form.nom_complet.trim()) e.nom_complet = 'Obligatoire'
    if (!form.telephone.trim())   e.telephone   = 'Obligatoire'
    if (!form.fonction)           e.fonction    = 'Obligatoire'
    if (Object.keys(e).length) { setErrors(e); return }

    setSaving(true)
    try {
      let photo_url = form.photo_url

      if (photoFile) {
        setUploading(true)
        const reader = new FileReader()
        const base64 = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(photoFile)
        })
        const res = await humanResourcesApi.uploadPhoto(base64, photoFile.name, photoFile.type)
        photo_url = res.url
        setUploading(false)
      }

      await humanResourcesApi.create({ ...form, photo_url, statut: 'actif' })
      setModalOpen(false)
      setForm(INIT_HR)
      setPhotoFile(null)
      setErrors({})
      load(1, statut)
    } catch (err) {
      setUploading(false)
      setErrors({ submit: err.message })
    } finally { setSaving(false) }
  }

  const openModal = () => {
    setForm(INIT_HR)
    setPhotoFile(null)
    setErrors({})
    setModalOpen(true)
  }

  return (
    <>
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    <AdminModal
      open={modalOpen}
      onClose={() => { setModalOpen(false); setErrors({}) }}
      title="Ajouter un professionnel"
      onSubmit={handleAdd}
      loading={saving}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        <MSection label="Photo de profil" />
        <PhotoUpload
          value={photoFile || form.photo_url || null}
          onChange={setPhotoFile}
          uploading={uploading}
        />

        <MSection label="Lien entreprise" />
        <MField label="Associer à une entreprise enregistrée">
          <MSelect value={form.entreprise_id} onChange={e => setF('entreprise_id', e.target.value)}>
            <option value="">— Sélectionner une entreprise (optionnel) —</option>
            {entreprises.map(en => <option key={en.id} value={en.id}>{en.nom} · {en.ville || en.type}</option>)}
          </MSelect>
        </MField>

        <MSection label="Identité professionnelle" />
        <MField label="Nom complet" required error={errors.nom_complet}>
          <MInput placeholder="DIALLO Mamadou" value={form.nom_complet} onChange={e => setF('nom_complet', e.target.value)} error={errors.nom_complet} />
        </MField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <MField label="Fonction" required error={errors.fonction}>
            <MSelect value={form.fonction} onChange={e => setF('fonction', e.target.value)} error={errors.fonction}>
              <option value="">— Sélectionner —</option>
              {FONCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </MSelect>
          </MField>
          <MField label="Nationalité">
            <MSelect value={form.nationalite} onChange={e => setF('nationalite', e.target.value)}>
              {NATIONALITES.map(n => <option key={n} value={n}>{n}</option>)}
            </MSelect>
          </MField>
          <MField label="Téléphone" required error={errors.telephone}>
            <MInput type="tel" placeholder="+224 620 000 000" value={form.telephone} onChange={e => setF('telephone', e.target.value)} error={errors.telephone} />
          </MField>
          <MField label="Email">
            <MInput type="email" placeholder="profil@email.com" value={form.email} onChange={e => setF('email', e.target.value)} />
          </MField>
          <MField label="Disponibilité">
            <MSelect value={form.disponibilite} onChange={e => setF('disponibilite', e.target.value)}>
              {DISPOS.map(d => <option key={d.v} value={d.v}>{d.l}</option>)}
            </MSelect>
          </MField>
          <MField label="Localisation">
            <MSelect value={form.localisation} onChange={e => setF('localisation', e.target.value)}>
              <option value="">— Ville —</option>
              {VILLES_HR.map(v => <option key={v} value={v}>{v}</option>)}
            </MSelect>
          </MField>
        </div>

        <MSection label="Compétences" />
        <MField label="Compétences clés" hint="Appuyez sur Entrée ou cliquez + Ajouter après chaque compétence">
          <CompetencesTags values={form.competences} onChange={v => setF('competences', v)} />
        </MField>

        {errors.submit && <p style={{ fontSize: 13, color: '#B23A2E', margin: 0 }}>{errors.submit}</p>}
      </div>
    </AdminModal>

    <AdminTable
      eyebrow="Composante 05"
      title="Ressources Humaines"
      columns={COLUMNS}
      data={data}
      loading={loading}
      total={total}
      page={page}
      limit={20}
      onPageChange={(p) => { setPage(p); load(p) }}
      onAdd={openModal}
      addLabel="Ajouter un professionnel"
      onValidate={handleValidate}
      onReject={handleReject}
      onDelete={handleDelete}
      searchPlaceholder="Rechercher un professionnel..."
      filterSlot={
        <div className="flex gap-1.5 flex-wrap">
          {STATUTS.map(s => (
            <button key={s} onClick={() => handleStatut(s)}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition-all ${
                statut === s ? 'bg-pine text-bone' : 'bg-pine/8 text-pine hover:bg-pine/15'
              }`}>
              {s === 'Tous' ? 'Tous' : s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      }
    />
    </>
  )
}
