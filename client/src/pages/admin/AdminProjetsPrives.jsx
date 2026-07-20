import { useEffect, useState } from 'react'
import AdminTable, { StatutBadge } from '../../components/admin/AdminTable'
import AdminModal, { MField, MInput, MSelect, MTextarea, MSection } from '../../components/admin/AdminModal'
import UploadZone from '../../components/ui/UploadZone'
import { projetsPrivesApi } from '../../lib/api'
import { useEntreprisesList } from '../../hooks/useEntreprisesList'

const CATS_PRIVE = ['Mines & Extraction','BTP & Infrastructure','Énergie renouvelable','Agro-industrie','Immobilier','Industrie manufacturière','Technologie & Numérique','Tourisme','Transport','Services','Autre']
const STATUTS_PRIVE = [{ v: 'etude', l: 'Étude de faisabilité' }, { v: 'financement', l: 'Recherche de financement' }, { v: 'construction', l: 'Construction' }, { v: 'exploitation', l: 'Exploitation' }]
const DEVISES_PRIVE = ['USD','EUR','GNF','XOF']

const LAUNCHED = ['construction', 'exploitation']

const COLUMNS = [
  { key: 'titre',    label: 'Projet',    render: (v) => <span className="font-semibold text-pine">{v}</span> },
  { key: 'categorie', label: 'Catégorie', muted: true },
  { key: 'promoteur', label: 'Promoteur', muted: true },
  { key: 'investissement_prevu', label: 'Volume financier',
    render: (v, row) => v
      ? <span className="font-semibold text-pine text-[13px]">{Number(v).toLocaleString('fr-FR')} <span className="font-normal text-[11px] text-[#8A9A90]">{row.devise || 'USD'}</span></span>
      : <span className="text-[#C5CEDE]">—</span> },
  { key: 'contenu_local_pct', label: 'Contenu local',
    render: (v) => v != null
      ? <span style={{ background: '#FEF3E0', color: '#854F0B', borderRadius: '999px', padding: '2px 8px', fontSize: '12px', fontWeight: 600 }}>{v}%</span>
      : <span className="text-[#C5CEDE]">—</span> },
  { key: 'avancement_pct', label: 'Avancement',
    render: (v, row) => {
      if (!LAUNCHED.includes(row.statut)) return <span className="text-[11px] text-[#8A9A90]">Non lancé</span>
      const pct = v != null ? Number(v) : 0
      return (
        <div className="flex items-center gap-2 min-w-[80px]">
          <div style={{ width: 56, height: 5, borderRadius: 4, background: '#E8ECF2', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: '#1C7A4D', borderRadius: 4, transition: 'width .3s' }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#0D1B2E' }}>{pct}%</span>
        </div>
      )
    }},
  { key: 'emplois_prevus', label: 'Emplois', muted: true },
  { key: 'statut',     label: 'Statut',    render: (v) => <StatutBadge statut={v} /> },
  { key: 'created_at', label: 'Soumis le', muted: true, render: (v) => v ? new Date(v).toLocaleDateString('fr-FR') : '—' },
]

const INIT_PRIVE = { titre: '', categorie: '', promoteur: '', statut: 'etude', localisation: '', investissement_prevu: '', devise: 'USD', emplois_prevus: '', description: '', entreprise_id: '', image_url: '' }

export default function AdminProjetsPrives() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm]           = useState(INIT_PRIVE)
  const [saving, setSaving]       = useState(false)
  const [errors, setErrors]       = useState({})
  const { entreprises }           = useEntreprisesList()
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const res = await projetsPrivesApi.getAll({ page: p, limit: 20 })
      setData(res.data || []); setTotal(res.total || 0)
    } catch { setData([]); setTotal(0) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!form.titre.trim()) { setErrors({ titre: 'Obligatoire' }); return }
    setSaving(true)
    try {
      await projetsPrivesApi.create({
        ...form,
        investissement_prevu: form.investissement_prevu ? Number(form.investissement_prevu) : null,
        emplois_prevus: form.emplois_prevus ? Number(form.emplois_prevus) : null,
      })
      setModalOpen(false); setForm(INIT_PRIVE); setErrors({}); load(1)
    } catch (err) { setErrors({ submit: err.message }) }
    finally { setSaving(false) }
  }

  return (
    <>
    <AdminModal open={modalOpen} onClose={() => { setModalOpen(false); setErrors({}) }} title="Ajouter un projet privé" onSubmit={handleAdd} loading={saving}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <MSection label="Lien entreprise" />
        <MField label="Associer à une entreprise enregistrée">
          <MSelect value={form.entreprise_id} onChange={e => setF('entreprise_id', e.target.value)}>
            <option value="">— Sélectionner une entreprise (optionnel) —</option>
            {entreprises.map(en => <option key={en.id} value={en.id}>{en.nom} · {en.ville || en.type}</option>)}
          </MSelect>
        </MField>
        <MSection label="Identification du projet" />
        <MField label="Titre du projet" required error={errors.titre}>
          <MInput placeholder="Ex : Unité de transformation de bauxite" value={form.titre} onChange={e => setF('titre', e.target.value)} error={errors.titre} />
        </MField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <MField label="Catégorie">
            <MSelect value={form.categorie} onChange={e => setF('categorie', e.target.value)}>
              <option value="">— Sélectionner —</option>
              {CATS_PRIVE.map(c => <option key={c} value={c}>{c}</option>)}
            </MSelect>
          </MField>
          <MField label="Promoteur">
            <MInput placeholder="Nom de l'entreprise / investisseur" value={form.promoteur} onChange={e => setF('promoteur', e.target.value)} />
          </MField>
          <MField label="Statut">
            <MSelect value={form.statut} onChange={e => setF('statut', e.target.value)}>
              {STATUTS_PRIVE.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
            </MSelect>
          </MField>
          <MField label="Localisation">
            <MInput placeholder="Région / Ville" value={form.localisation} onChange={e => setF('localisation', e.target.value)} />
          </MField>
          <MField label="Investissement prévu">
            <MInput type="number" min="0" placeholder="10 000 000" value={form.investissement_prevu} onChange={e => setF('investissement_prevu', e.target.value)} />
          </MField>
          <MField label="Devise">
            <MSelect value={form.devise} onChange={e => setF('devise', e.target.value)}>
              {DEVISES_PRIVE.map(d => <option key={d} value={d}>{d}</option>)}
            </MSelect>
          </MField>
          <MField label="Emplois prévus">
            <MInput type="number" min="0" placeholder="250" value={form.emplois_prevus} onChange={e => setF('emplois_prevus', e.target.value)} />
          </MField>
        </div>
        <MField label="Description">
          <MTextarea placeholder="Objectifs, modèle économique, partenaires..." value={form.description} onChange={e => setF('description', e.target.value)} />
        </MField>
        <MSection label="Visuel du projet" />
        <MField label="Photo / image (optionnel)">
          <UploadZone
            value={form.image_url}
            onChange={url => setF('image_url', url)}
            folder="projets"
            label="Uploader un visuel du projet"
          />
        </MField>
        {errors.submit && <p style={{ fontSize: 13, color: '#B23A2E', margin: 0 }}>{errors.submit}</p>}
      </div>
    </AdminModal>

    <AdminTable
      eyebrow="Composante 04"
      title="Projets Structurants du Privé"
      columns={COLUMNS}
      data={data}
      loading={loading}
      total={total}
      page={page}
      limit={20}
      onPageChange={(p) => { setPage(p); load(p) }}
      onAdd={() => { setForm(INIT_PRIVE); setErrors({}); setModalOpen(true) }}
      addLabel="Ajouter un projet privé"
      onValidate={async (id) => { await projetsPrivesApi.validate(id); load(page) }}
      onReject={async (id) => { await projetsPrivesApi.reject(id); load(page) }}
      onDelete={async (id) => { await projetsPrivesApi.delete(id); load(page) }}
      searchPlaceholder="Rechercher un projet privé..."
    />
    </>
  )
}
