import { useEffect, useState } from 'react'
import AdminTable, { StatutBadge } from '../../components/admin/AdminTable'
import AdminModal, { MField, MInput, MSelect, MTextarea, MSection } from '../../components/admin/AdminModal'
import UploadZone from '../../components/ui/UploadZone'
import { projetsPublicsApi } from '../../lib/api'
import { useEntreprisesList } from '../../hooks/useEntreprisesList'

const SECTEURS_P = ['Mines & Métallurgie','Infrastructure','Transport & Logistique','Énergie','Eau & Assainissement','Agriculture','Éducation','Santé','Environnement','Technologie','Autre']
const STATUTS_PP = [{ v: 'planifie', l: 'Planifié' }, { v: 'en_cours', l: 'En cours' }, { v: 'suspendu', l: 'Suspendu' }, { v: 'termine', l: 'Terminé' }]
const DEVISES_P  = ['GNF','USD','EUR','XOF']

const LAUNCHED = ['en_cours', 'suspendu', 'termine']

const COLUMNS = [
  { key: 'titre',          label: 'Projet',         render: (v) => <span className="font-semibold text-pine">{v}</span> },
  { key: 'secteur',        label: 'Secteur',        muted: true },
  { key: 'maitre_ouvrage', label: "Maître d'ouvrage", muted: true },
  { key: 'budget_estime',  label: 'Volume financier',
    render: (v, row) => v
      ? <span className="font-semibold text-pine text-[13px]">{Number(v).toLocaleString('fr-FR')} <span className="font-normal text-[11px] text-[#8A9A90]">{row.devise || 'GNF'}</span></span>
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
  { key: 'statut',     label: 'Statut',    render: (v) => <StatutBadge statut={v} /> },
  { key: 'created_at', label: 'Soumis le', muted: true, render: (v) => v ? new Date(v).toLocaleDateString('fr-FR') : '—' },
]

const INIT_PP = { titre: '', secteur: '', maitre_ouvrage: '', statut: 'planifie', localisation: '', budget_estime: '', devise: 'USD', description: '', entreprise_id: '', image_url: '' }

export default function AdminProjetsPublics() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm]           = useState(INIT_PP)
  const [saving, setSaving]       = useState(false)
  const [errors, setErrors]       = useState({})
  const { entreprises }           = useEntreprisesList()
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const load = async (p = 1) => {
    setLoading(true)
    try {
      const res = await projetsPublicsApi.getAllAdmin({ page: p, limit: 20 })
      setData(res.data || []); setTotal(res.total || 0)
    } catch { setData([]); setTotal(0) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!form.titre.trim()) { setErrors({ titre: 'Obligatoire' }); return }
    setSaving(true)
    try {
      await projetsPublicsApi.create({ ...form, budget_estime: form.budget_estime ? Number(form.budget_estime) : null })
      setModalOpen(false); setForm(INIT_PP); setErrors({}); load(1)
    } catch (err) { setErrors({ submit: err.message }) }
    finally { setSaving(false) }
  }

  return (
    <>
    <AdminModal open={modalOpen} onClose={() => { setModalOpen(false); setErrors({}) }} title="Ajouter un projet public" onSubmit={handleAdd} loading={saving}>
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
          <MInput placeholder="Ex : Réhabilitation de la route Coyah–Kindia" value={form.titre} onChange={e => setF('titre', e.target.value)} error={errors.titre} />
        </MField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <MField label="Secteur">
            <MSelect value={form.secteur} onChange={e => setF('secteur', e.target.value)}>
              <option value="">— Sélectionner —</option>
              {SECTEURS_P.map(s => <option key={s} value={s}>{s}</option>)}
            </MSelect>
          </MField>
          <MField label="Maître d'ouvrage">
            <MInput placeholder="Ministère des Travaux Publics" value={form.maitre_ouvrage} onChange={e => setF('maitre_ouvrage', e.target.value)} />
          </MField>
          <MField label="Statut">
            <MSelect value={form.statut} onChange={e => setF('statut', e.target.value)}>
              {STATUTS_PP.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
            </MSelect>
          </MField>
          <MField label="Localisation">
            <MInput placeholder="Conakry / Région de Kindia" value={form.localisation} onChange={e => setF('localisation', e.target.value)} />
          </MField>
          <MField label="Budget estimé">
            <MInput type="number" min="0" placeholder="50 000 000" value={form.budget_estime} onChange={e => setF('budget_estime', e.target.value)} />
          </MField>
          <MField label="Devise">
            <MSelect value={form.devise} onChange={e => setF('devise', e.target.value)}>
              {DEVISES_P.map(d => <option key={d} value={d}>{d}</option>)}
            </MSelect>
          </MField>
        </div>
        <MField label="Description">
          <MTextarea placeholder="Objectifs, périmètre, bénéficiaires..." value={form.description} onChange={e => setF('description', e.target.value)} />
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
      eyebrow="Composante 03"
      title="Projets Sectoriels de l'État"
      columns={COLUMNS}
      data={data}
      loading={loading}
      total={total}
      page={page}
      limit={20}
      onPageChange={(p) => { setPage(p); load(p) }}
      onAdd={() => { setForm(INIT_PP); setErrors({}); setModalOpen(true) }}
      addLabel="Ajouter un projet public"
      onValidate={async (id) => { await projetsPublicsApi.validate(id); load(page) }}
      onReject={async (id) => { await projetsPublicsApi.reject(id); load(page) }}
      onDelete={async (id) => { await projetsPublicsApi.delete(id); load(page) }}
      searchPlaceholder="Rechercher un projet..."
    />
    </>
  )
}
