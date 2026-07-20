import { useEffect, useState } from 'react'
import AdminTable, { StatutBadge } from '../../components/admin/AdminTable'
import AdminModal, { MField, MInput, MSelect, MSection } from '../../components/admin/AdminModal'
import UploadZone from '../../components/ui/UploadZone'
import { equipementsApi } from '../../lib/api'
import { useEntreprisesList } from '../../hooks/useEntreprisesList'
import { CATEGORIES_LIST, getSousTypes, getFabricants, getModeles } from '../../data/catalogueEquipements'

const STATUTS = ['Tous', 'en_attente', 'actif', 'suspendu']
const ETATS   = [{ v: 'neuf', l: 'Neuf' }, { v: 'bon', l: 'Bon état' }, { v: 'moyen', l: 'Moyen' }, { v: 'hors_service', l: 'Hors service' }]

const COLUMNS = [
  { key: 'marque_modele', label: 'Équipement', render: (v) => <span className="font-semibold text-pine">{v}</span> },
  { key: 'categorie',  label: 'Catégorie',  muted: true },
  { key: 'etat',       label: 'État',       render: (v) => {
    const map = { neuf:['#E1F5EE','#0F6E56','Neuf'], bon:['#E6F1FB','#185FA5','Bon état'], moyen:['#FAEEDA','#854F0B','Moyen'], hors_service:['#FCEBEB','#A32D2D','Hors service'] }
    const [bg, cl, lbl] = map[v] || ['#F1EFE8','#5A6A60', v]
    return <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: bg, color: cl }}>{lbl}</span>
  }},
  { key: 'disponible', label: 'Dispo', render: (v) => (
    <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${v ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FCEBEB] text-[#A32D2D]'}`}>{v ? '✓ Oui' : '✗ Non'}</span>
  )},
  { key: 'quantite',         label: 'Qté',          muted: true },
  { key: 'localisation_texte', label: 'Localisation', muted: true },
  { key: 'entreprise_nom',   label: 'Entreprise',   muted: true, render: (v, row) => row.entreprises?.nom || v || '—' },
  { key: 'statut',           label: 'Statut',        render: (v) => <StatutBadge statut={v} /> },
  { key: 'created_at',       label: 'Soumis le',    muted: true, render: (v) => v ? new Date(v).toLocaleDateString('fr-FR') : '—' },
]

const INIT = { categorie: '', sous_type: '', fabricant: '', modele: '', marque_modele: '', numero_serie: '', annee_mise_en_service: '', etat: 'bon', quantite: '1', disponible: true, localisation_texte: '', latitude: '', longitude: '', entreprise_id: '', entreprise_nom: '', photo_url: '' }

export default function AdminEquipements() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(true)
  const [statut, setStatut]   = useState('Tous')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm]           = useState(INIT)
  const [saving, setSaving]       = useState(false)
  const [errors, setErrors]       = useState({})
  const { entreprises }           = useEntreprisesList()

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const load = async (p = 1, s = statut) => {
    setLoading(true)
    try {
      const params = { page: p, limit: 20 }
      if (s !== 'Tous') params.statut = s
      const res = await equipementsApi.getAll(params)
      setData(res.data || []); setTotal(res.total || 0)
    } catch { setData([]); setTotal(0) }
    finally { setLoading(false) }
  }

  useEffect(() => { load(1, statut) }, [statut])

  const handleAdd = async () => {
    const e = {}
    if (!form.categorie) e.categorie = 'Obligatoire'
    if (!form.marque_modele.trim()) e.marque_modele = 'Obligatoire'
    if (!form.localisation_texte.trim()) e.localisation_texte = 'Obligatoire'
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      const ent = entreprises.find(en => en.id === form.entreprise_id)
      await equipementsApi.create({
        ...form,
        statut: 'actif',
        entreprise_nom: ent ? ent.nom : form.entreprise_nom,
        annee_mise_en_service: form.annee_mise_en_service ? Number(form.annee_mise_en_service) : null,
        quantite:  Number(form.quantite) || 1,
        latitude:  form.latitude  ? parseFloat(form.latitude)  : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      })
      setModalOpen(false); setForm(INIT); setErrors({}); load(1, statut)
    } catch (err) { setErrors({ submit: err.message }) }
    finally { setSaving(false) }
  }

  return (
    <>
    <AdminModal open={modalOpen} onClose={() => { setModalOpen(false); setErrors({}) }} title="Ajouter un équipement" onSubmit={handleAdd} loading={saving}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        <MSection label="Lien entreprise" />
        <MField label="Associer à une entreprise enregistrée">
          <MSelect value={form.entreprise_id} onChange={e => {
            const ent = entreprises.find(en => en.id === e.target.value)
            setForm(f => ({ ...f, entreprise_id: e.target.value, entreprise_nom: ent ? ent.nom : '' }))
          }}>
            <option value="">— Sélectionner une entreprise (optionnel) —</option>
            {entreprises.map(en => <option key={en.id} value={en.id}>{en.nom} · {en.ville || en.type}</option>)}
          </MSelect>
        </MField>

        <MSection label="Identification de l'équipement" />
        <MField label="Catégorie" required error={errors.categorie}>
          <MSelect value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value, sous_type: '', fabricant: '', modele: '', marque_modele: '' }))} error={errors.categorie}>
            <option value="">— Sélectionner —</option>
            {CATEGORIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
            <option value="Autre">Autre</option>
          </MSelect>
        </MField>

        {form.categorie && form.categorie !== 'Autre' && (
          <>
            <MField label="Sous-type / Usage">
              <MSelect value={form.sous_type} onChange={e => setForm(f => ({ ...f, sous_type: e.target.value, fabricant: '', modele: '', marque_modele: '' }))}>
                <option value="">— Sélectionner le sous-type —</option>
                {getSousTypes(form.categorie).map(st => <option key={st} value={st}>{st}</option>)}
              </MSelect>
            </MField>
            {form.sous_type && (
              <MField label="Fabricant">
                <MSelect value={form.fabricant} onChange={e => { setF('fabricant', e.target.value); setF('modele', ''); setF('marque_modele', e.target.value ? `${e.target.value} — ` : '') }}>
                  <option value="">— Sélectionner le fabricant —</option>
                  {getFabricants(form.categorie, form.sous_type).map(f => <option key={f} value={f}>{f}</option>)}
                </MSelect>
              </MField>
            )}
            {form.fabricant && (
              <MField label="Modèle">
                <MSelect value={form.modele} onChange={e => { setF('modele', e.target.value); setF('marque_modele', e.target.value ? `${form.fabricant} — ${e.target.value}` : `${form.fabricant} — `) }}>
                  <option value="">— Sélectionner le modèle —</option>
                  {getModeles(form.categorie, form.sous_type, form.fabricant).map(m => <option key={m} value={m}>{m}</option>)}
                </MSelect>
              </MField>
            )}
          </>
        )}

        <MField label="Marque & Modèle (libellé)" required error={errors.marque_modele} hint="Pré-rempli depuis le catalogue — modifiable">
          <MInput placeholder="Ex : Komatsu PC9000-12" value={form.marque_modele} onChange={e => setF('marque_modele', e.target.value)} error={errors.marque_modele} />
        </MField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <MField label="Numéro de série">
            <MInput placeholder="SN-XXXXX" value={form.numero_serie} onChange={e => setF('numero_serie', e.target.value)} />
          </MField>
          <MField label="Année de mise en service">
            <MInput type="number" min="1990" max={new Date().getFullYear()} placeholder="2022" value={form.annee_mise_en_service} onChange={e => setF('annee_mise_en_service', e.target.value)} />
          </MField>
          <MField label="État">
            <MSelect value={form.etat} onChange={e => setF('etat', e.target.value)}>
              {ETATS.map(et => <option key={et.v} value={et.v}>{et.l}</option>)}
            </MSelect>
          </MField>
          <MField label="Quantité">
            <MInput type="number" min="1" value={form.quantite} onChange={e => setF('quantite', e.target.value)} />
          </MField>
        </div>

        <MSection label="Photo de l'équipement" />
        <MField label="Photo (optionnel)">
          <UploadZone
            value={form.photo_url}
            onChange={url => setF('photo_url', url)}
            folder="equipements"
            label="Uploader une photo de l'équipement"
          />
        </MField>
        <MSection label="Localisation & disponibilité" />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'var(--koma-teal-light)', borderRadius: 10, padding: '10px 13px', border: '1px solid rgba(0,121,140,.2)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--koma-teal)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
          <p style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--koma-teal-dark)', margin: 0 }}>
            La <strong>quantité</strong> correspond aux unités disponibles <strong>à cette localisation uniquement</strong>. Si l'équipement est présent dans plusieurs zones, ajoutez une entrée distincte par localisation.
          </p>
        </div>
        <MField label="Localisation (texte)" required error={errors.localisation_texte}>
          <MInput placeholder="Conakry — Zone industrielle de Matoto" value={form.localisation_texte} onChange={e => setF('localisation_texte', e.target.value)} error={errors.localisation_texte} />
        </MField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <MField label="Latitude GPS" hint="Ex : 9.535574">
            <MInput
              type="number" step="0.000001" placeholder="9.535574"
              value={form.latitude} onChange={e => setF('latitude', e.target.value)}
            />
          </MField>
          <MField label="Longitude GPS" hint="Ex : -13.677729">
            <MInput
              type="number" step="0.000001" placeholder="-13.677729"
              value={form.longitude} onChange={e => setF('longitude', e.target.value)}
            />
          </MField>
        </div>
        <p style={{ fontSize: 11.5, color: '#8A9A90', margin: '-6px 0 0', display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--koma-teal)" strokeWidth="2" style={{ width: 13, height: 13, flexShrink: 0 }}><circle cx="12" cy="10" r="3"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
          Les coordonnées GPS permettent d'afficher l'équipement sur la carte SIG.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" onClick={() => setF('disponible', !form.disponible)}
            style={{ position: 'relative', width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', background: form.disponible ? '#0D3A29' : 'rgba(13,27,46,.15)', transition: 'background .2s', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: 3, left: form.disponible ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
          </button>
          <span style={{ fontSize: 13.5, color: '#0D1B2E', fontWeight: 600 }}>{form.disponible ? 'Disponible à la location / utilisation' : 'Non disponible'}</span>
        </div>

        {errors.submit && <p style={{ fontSize: 13, color: '#B23A2E', margin: 0 }}>{errors.submit}</p>}
      </div>
    </AdminModal>

    <AdminTable
      eyebrow="Composante 02"
      title="Inventaire des Équipements"
      columns={COLUMNS}
      data={data}
      loading={loading}
      total={total}
      page={page}
      limit={20}
      onPageChange={(p) => { setPage(p); load(p, statut) }}
      onAdd={() => { setForm(INIT); setErrors({}); setModalOpen(true) }}
      addLabel="Ajouter un équipement"
      onValidate={async (id) => { await equipementsApi.validate(id); load(page, statut) }}
      onReject={async (id) => { await equipementsApi.reject(id); load(page, statut) }}
      onDelete={async (id) => { await equipementsApi.delete(id); load(page, statut) }}
      searchPlaceholder="Rechercher un équipement..."
      filterSlot={
        <div className="flex rounded-[9px] border border-pine/14 overflow-hidden">
          {STATUTS.map(s => (
            <button key={s} onClick={() => { setStatut(s); setPage(1) }}
              className={`px-3 py-2 text-[12px] font-medium font-sans transition-colors ${statut === s ? 'bg-pine text-bone' : 'bg-paper text-pine hover:bg-pine/8'}`}>
              {s === 'en_attente' ? 'En attente' : s === 'Tous' ? 'Tous' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      }
    />
    </>
  )
}
