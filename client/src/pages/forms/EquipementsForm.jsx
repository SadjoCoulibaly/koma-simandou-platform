import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { tEnum, CATEGORIES_EQ, ETATS_EQ } from '../../lib/enumTranslations'
import FormWizard from '../../components/ui/FormWizard'
import { FormField, Input, Select, SelectCard, SectionTitle, SuccessScreen } from '../../components/ui/FormField'
import UploadZone from '../../components/ui/UploadZone'
import { equipementsApi } from '../../lib/api'
import { getSousTypes, getFabricants, getModeles } from '../../data/catalogueEquipements'

const CATEGORIES = [
  // ── Catégories générales ─────────────────────────────────
  { label: 'Engins de terrassement',   sub: 'Bulldozers, pelles, chargeuses, niveleuses' },
  { label: 'Équipements miniers',      sub: "Matériel d'extraction et de traitement" },
  { label: 'Matériels ferroviaires',   sub: 'Voie ferrée, traction, wagons, matériel de pose' },
  { label: 'Équipements portuaires',   sub: 'Manutention et levage portuaire' },
  { label: 'Centrales à béton',        sub: 'Production et convoyage du béton' },
  { label: 'Grues',                    sub: 'Levage et manutention lourde' },
  { label: 'Compacteurs',              sub: 'Compactage et finition de chaussée' },
  { label: 'Camions',                  sub: 'Transport de matériaux et logistique' },
  { label: 'Véhicules spécialisés',   sub: 'Matériel à usage spécifique' },
  // ── Terrassement & excavation ────────────────────────────
  { label: 'Chargeuse',                sub: 'Chargeuse sur roues' },
  { label: 'Bulldozer',                sub: 'Bouteur sur chenilles ou roues' },
  { label: 'Bulldozer SD32W',          sub: 'Modèle SD32W' },
  { label: 'Bulldozer sur chenilles',  sub: 'Bouteur à chenilles standard' },
  { label: 'Bulldozer sur chenilles SEM822D', sub: 'Modèle SEM822D' },
  { label: 'Pelle excavatrice',        sub: 'Pelle hydraulique standard' },
  { label: 'Pelle excavatrice SANY',   sub: 'Modèle SANY' },
  { label: 'Pelle excavatrice 365 (SY365)', sub: 'Modèle SY365' },
  { label: 'Pelle excavatrice SY500',  sub: 'Modèle SY500' },
  { label: 'Pelle sur chenilles',      sub: 'Pelle hydraulique sur chenilles' },
  { label: 'Niveleuse',                sub: 'Engin de nivellement' },
  { label: 'Tractopelle (chargeuse-pelleteuse)', sub: 'Polyvalent terrassement' },
  // ── Grue & levage ───────────────────────────────────────
  { label: 'Grue automobile',          sub: 'Grue mobile sur porteur' },
  { label: 'Grue mobile (camion-grue)',sub: 'Grue montée sur camion' },
  { label: 'Grue 25T',                 sub: 'Capacité 25 tonnes' },
  { label: 'Grue 50T',                 sub: 'Capacité 50 tonnes' },
  { label: 'Grue auxiliaire sur camion 5T', sub: 'Grue de manutention 5T' },
  { label: 'Nacelle élévatrice',       sub: 'Plateforme de travail en hauteur' },
  { label: 'Plateforme élévatrice mobile de travail', sub: 'Nacelle articulée ou télescopique' },
  { label: 'Chariot élévateur',        sub: 'Chariot de manutention standard' },
  { label: 'Chariot élévateur 3T',     sub: 'Capacité 3 tonnes' },
  { label: 'Chariot élévateur 5T',     sub: 'Capacité 5 tonnes' },
  // ── Compactage & finition ────────────────────────────────
  { label: 'Rouleau compresseur',      sub: 'Compacteur standard' },
  { label: 'Rouleau compresseur SANY', sub: 'Modèle SANY' },
  { label: 'Rouleau compresseur monocylindre', sub: 'Rouleau simple bille' },
  { label: 'Rouleau vibrant monocylindre', sub: 'Compacteur vibrant' },
  { label: 'Finisseur (épandeuse d\'enrobé)', sub: 'Machine de mise en œuvre du bitume' },
  // ── Béton ────────────────────────────────────────────────
  { label: 'Camion malaxeur à béton',  sub: 'Toupie à béton standard' },
  { label: 'Camion malaxeur à béton (toupie)', sub: 'Toupie béton sur porteur' },
  { label: 'Camion pompe à béton',     sub: 'Pompe à béton mobile' },
  { label: 'Camion pompe',             sub: 'Pompe de transfert' },
  { label: 'Machine à béton projeté (voie humide)', sub: 'Béton projeté voie humide' },
  // ── Forage ───────────────────────────────────────────────
  { label: 'Foreuse',                  sub: 'Machine de forage standard' },
  { label: 'Foreuse de puits d\'eau',  sub: 'Foreuse hydraulique pour puits' },
  { label: 'Foreuse fond-de-trou hydraulique intégrée', sub: 'Foreuse DTH' },
  { label: 'Foreuse multifonction',    sub: 'Foreuse polyvalente' },
  { label: 'Foreuse rotative',         sub: 'Foreuse à rotation' },
  // ── Camions & semi-remorques ─────────────────────────────
  { label: 'Camion-benne',             sub: 'Benne basculante' },
  { label: 'Camion HOWO',              sub: 'Porteur HOWO' },
  { label: 'Camion de marchandises',   sub: 'Transport de fret général' },
  { label: 'Camion léger de marchandises', sub: 'Petit porteur de marchandises' },
  { label: 'Camion léger Foton',       sub: 'Léger porteur Foton' },
  { label: 'Camion fourgon',           sub: 'Fourgon fermé' },
  { label: 'Camion frigorifique',      sub: 'Transport réfrigéré' },
  { label: 'Camion hydrocureur',       sub: 'Curage et nettoyage canalisations' },
  { label: 'Camion de transport de poutres de pont', sub: 'Transport de structures lourdes' },
  { label: 'Camion de transport avec grue auxiliaire', sub: 'Porteur avec grue' },
  { label: 'Camion de transport avec grue auxiliaire 10T', sub: 'Porteur avec grue 10T' },
  { label: 'Semi-remorque (plateau)',  sub: 'Plateau standard' },
  { label: 'Semi-remorque (plateau) 50T', sub: 'Plateau 50 tonnes' },
  { label: 'Semi-remorque plateau',    sub: 'Plateau porte-engins' },
  { label: 'Semi-remorque 30T',        sub: 'Semi-remorque 30 tonnes' },
  { label: 'Semi-remorque 50T',        sub: 'Semi-remorque 50 tonnes' },
  { label: 'Semi-remorque pour longs rails d\'acier', sub: 'Transport de rails' },
  { label: 'Semi-remorque surbaissée', sub: 'Porte-engins surbaissé' },
  { label: 'Tracteur routier (tête)',  sub: 'Tracteur 6×4 standard' },
  { label: 'Tracteur routier 30T',     sub: 'Tracteur 30 tonnes' },
  { label: 'Tracteur routier 50T',     sub: 'Tracteur 50 tonnes' },
  // ── Citernes ─────────────────────────────────────────────
  { label: 'Camion-citerne à carburant', sub: 'Transport de carburant' },
  { label: 'Camion-citerne à eau (arroseuse)', sub: 'Arrosage et dépoussiérage' },
  // ── Véhicules légers & passagers ────────────────────────
  { label: 'Pick-up',                  sub: 'Pick-up standard' },
  { label: 'Pick-up Toyota',           sub: 'Toyota Hilux ou équivalent' },
  { label: 'Pick-up (cabine simple)',  sub: 'Pick-up cabine simple' },
  { label: 'Pick-up (Alcoa)',          sub: 'Pick-up site Alcoa' },
  { label: 'TOYOTA LAND CRUISER(PICK UP)', sub: 'Land Cruiser pick-up' },
  { label: 'Toyota Prado',             sub: 'Toyota Land Cruiser Prado' },
  { label: 'Toyota Prado (blanc)',     sub: 'Prado couleur blanche' },
  { label: 'Toyota Prado (noir)',      sub: 'Prado couleur noire' },
  { label: 'Toyota Prado / Land Cruiser', sub: 'SUV Toyota' },
  { label: 'Minibus',                  sub: 'Transport de personnel standard' },
  { label: 'Minibus (moyen)',          sub: 'Minibus capacité moyenne' },
  { label: 'Minibus (Alcoa)',          sub: 'Minibus site Alcoa' },
  { label: 'Minibus (Capitale)',       sub: 'Navette Conakry' },
  { label: 'Minibus (Tunnel)',         sub: 'Navette tunnel' },
  { label: 'BUS YUTONG D7',           sub: 'Bus Yutong modèle D7' },
  { label: 'Ambulance',               sub: 'Véhicule médicalisé' },
  // ── Autre ────────────────────────────────────────────────
  { label: 'Autre',                   sub: 'Équipement non listé ci-dessus' },
]

const ETATS = [
  { value: 'neuf',         key: 'neuf' },
  { value: 'bon',          key: 'bon' },
  { value: 'moyen',        key: 'moyen' },
  { value: 'hors_service', key: 'hors_service' },
]

const INITIAL = {
  categorie: '', sous_type: '', fabricant: '', modele: '',
  marque_modele: '', numero_serie: '', annee_mise_en_service: '',
  etat: 'bon', quantite: '1', disponible: true,
  valeur_estimee: '', latitude: '', longitude: '', localisation_texte: '',
  entreprise_nom: '', entreprise_tel: '', photo_url: '',
}

export default function EquipementsForm() {
  const { t } = useTranslation()
  const STEPS = [
    t('equipementsForm.step0'),
    t('equipementsForm.step1'),
    t('equipementsForm.step2'),
    t('equipementsForm.step3'),
  ]

  const [step, setStep] = useState(0)
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (step === 0 && !form.categorie) e.categorie = t('equipementsForm.errors.categorie')
    if (step === 1) {
      if (!form.marque_modele.trim()) e.marque_modele = t('equipementsForm.errors.marqueModele')
      if (!form.etat) e.etat = t('equipementsForm.errors.etat')
    }
    if (step === 2 && !form.localisation_texte.trim()) {
      e.localisation_texte = t('equipementsForm.errors.localisation')
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => { if (validate()) setStep(s => s + 1) }
  const handleBack = () => setStep(s => s - 1)

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const payload = {
        ...form,
        annee_mise_en_service: form.annee_mise_en_service ? Number(form.annee_mise_en_service) : null,
        quantite: Number(form.quantite) || 1,
        valeur_estimee: form.valeur_estimee ? Number(form.valeur_estimee) : null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      }
      await equipementsApi.create(payload)
      setSubmitted(true)
    } catch (err) {
      setErrors({ submit: err.message || "Erreur lors de l'enregistrement. Veuillez réessayer." })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return (
    <SuccessScreen
      title={t('equipementsForm.successTitle')}
      message={`Votre équipement « ${form.marque_modele} » (${form.categorie}) a été soumis à l'inventaire national KOMA.`}
      onReset={() => { setSubmitted(false); setForm(INITIAL); setStep(0) }}
    />
  )

  return (
    <FormWizard
      title={t('equipementsForm.title')}
      subtitle={t('equipementsForm.subtitle')}
      steps={STEPS}
      currentStep={step}
      onBack={handleBack}
      onNext={handleNext}
      onSubmit={handleSubmit}
      loading={loading}
      isFirstStep={step === 0}
      isLastStep={step === STEPS.length - 1}
    >
      {/* ── Étape 0 : Catégorie ── */}
      {step === 0 && (
        <div>
          <SectionTitle title={t('equipementsForm.step0Title')} desc={t('equipementsForm.step0Desc')} />
          <div className="flex flex-col gap-2">
            {CATEGORIES.map(c => (
              <SelectCard
                key={c.label}
                label={tEnum(t, CATEGORIES_EQ, c.label)}
                sub={c.sub}
                selected={form.categorie === c.label}
                onClick={() => {
                  setForm(f => ({ ...f, categorie: c.label, sous_type: '', fabricant: '', modele: '', marque_modele: '' }))
                  setErrors(e => ({ ...e, categorie: '' }))
                }}
              />
            ))}
          </div>
          {errors.categorie && <p className="mt-3 text-[13px] text-rust">{errors.categorie}</p>}
        </div>
      )}

      {/* ── Étape 1 : Détails ── */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <SectionTitle title={t('equipementsForm.step1Title')} desc={`${t('equipementsForm.step0')} : ${form.categorie}`} />

          {/* Listes déroulantes en cascade depuis le catalogue */}
          {form.categorie !== 'Autre' && (
            <>
              <FormField label="Sous-type / Usage" required>
                <Select
                  value={form.sous_type}
                  onChange={e => {
                    set('sous_type', e.target.value)
                    set('fabricant', '')
                    set('modele', '')
                    set('marque_modele', '')
                  }}
                >
                  <option value="">— Sélectionner le sous-type —</option>
                  {getSousTypes(form.categorie).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </Select>
              </FormField>

              {form.sous_type && (
                <FormField label="Fabricant">
                  <Select
                    value={form.fabricant}
                    onChange={e => {
                      set('fabricant', e.target.value)
                      set('modele', '')
                      set('marque_modele', e.target.value ? `${e.target.value} — ` : '')
                    }}
                  >
                    <option value="">— Sélectionner le fabricant —</option>
                    {getFabricants(form.categorie, form.sous_type).map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </Select>
                </FormField>
              )}

              {form.fabricant && (
                <FormField label="Modèle">
                  <Select
                    value={form.modele}
                    onChange={e => {
                      set('modele', e.target.value)
                      set('marque_modele', e.target.value ? `${form.fabricant} — ${e.target.value}` : `${form.fabricant} — `)
                    }}
                  >
                    <option value="">— Sélectionner le modèle —</option>
                    {getModeles(form.categorie, form.sous_type, form.fabricant).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </Select>
                </FormField>
              )}
            </>
          )}

          <FormField label={t('equipementsForm.marqueModele')} required error={errors.marque_modele}
            hint={form.categorie !== 'Autre' ? 'Pré-rempli depuis le catalogue — modifiable si besoin' : undefined}>
            <Input placeholder="Ex : Komatsu PC9000-12 — Pelle hydraulique minière" value={form.marque_modele} onChange={e => set('marque_modele', e.target.value)} error={errors.marque_modele} />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={t('equipementsForm.numeroSerie')} hint={t('equipementsForm.numeroSerieHint')}>
              <Input placeholder="Numéro de série de l'équipement" value={form.numero_serie} onChange={e => set('numero_serie', e.target.value)} />
            </FormField>
            <FormField label={t('equipementsForm.annee')}>
              <Input type="number" min="1990" max={new Date().getFullYear()} placeholder="2021" value={form.annee_mise_en_service} onChange={e => set('annee_mise_en_service', e.target.value)} />
            </FormField>
            <FormField label={t('equipementsForm.etat')} required error={errors.etat}>
              <Select value={form.etat} onChange={e => set('etat', e.target.value)}>
                {ETATS.map(et => <option key={et.value} value={et.value}>{t(`equipements.etat.${et.key}`)}</option>)}
              </Select>
            </FormField>
            <FormField label={t('equipementsForm.quantite')}>
              <Input type="number" min="1" placeholder="1" value={form.quantite} onChange={e => set('quantite', e.target.value)} />
            </FormField>
          </div>

          <FormField label={t('equipementsForm.valeur')} hint={t('equipementsForm.valeurHint')}>
            <Input type="number" min="0" placeholder="280 000" value={form.valeur_estimee} onChange={e => set('valeur_estimee', e.target.value)} />
          </FormField>

          <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={t('equipementsForm.proprietaire')} hint={t('equipementsForm.proprietaireHint')}>
              <Input placeholder="Nom du propriétaire ou de l'entreprise" value={form.entreprise_nom} onChange={e => set('entreprise_nom', e.target.value)} />
            </FormField>
            <FormField label={t('equipementsForm.contact')} hint={t('equipementsForm.contactHint')}>
              <Input type="tel" placeholder="+224 620 000 000" value={form.entreprise_tel} onChange={e => set('entreprise_tel', e.target.value)} />
            </FormField>
          </div>

          <FormField label="Photo de l'équipement" hint="Optionnel — Aide à identifier et valoriser votre équipement">
            <UploadZone
              value={form.photo_url}
              onChange={url => set('photo_url', url)}
              folder="equipements"
              label="Uploader une photo de l'équipement"
            />
          </FormField>
        </div>
      )}

      {/* ── Étape 2 : Disponibilité & localisation ── */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          <SectionTitle title={t('equipementsForm.step2Title')} desc={t('equipementsForm.step2Desc')} />

          <div className="flex items-start gap-3 rounded-[12px] border border-koma-teal/25 bg-koma-teal-light px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--koma-teal)" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
            <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--koma-teal-dark)' }}>
              La <strong>quantité</strong> saisie correspond au nombre d'unités disponibles <strong>à cette localisation uniquement</strong>. Si le même équipement se trouve dans plusieurs zones géographiques, soumettez un formulaire distinct par localisation.
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-[12px] border border-pine/14 bg-bone p-4">
            <button
              type="button"
              onClick={() => set('disponible', !form.disponible)}
              className={`relative h-7 w-14 rounded-full transition-all duration-300 ${form.disponible ? 'bg-pine' : 'bg-pine/20'}`}
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${form.disponible ? 'left-8' : 'left-1'}`} />
            </button>
            <div>
              <p className="text-[14.5px] font-semibold text-ink">{form.disponible ? t('equipementsForm.disponible') : t('equipementsForm.indisponible')}</p>
              <p className="text-[12.5px] text-[#5A6A60]">{t('equipementsForm.disponibiliteQuestion')}</p>
            </div>
          </div>

          <FormField label={t('equipementsForm.localisation')} required error={errors.localisation_texte} hint={t('equipementsForm.localisationHint')}>
            <Input placeholder="Conakry — Zone industrielle de Matoto" value={form.localisation_texte} onChange={e => set('localisation_texte', e.target.value)} error={errors.localisation_texte} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label={t('equipementsForm.latitude')} hint={t('equipementsForm.latitudeHint')}>
              <Input type="number" step="0.000001" placeholder="9.535574" value={form.latitude} onChange={e => set('latitude', e.target.value)} />
            </FormField>
            <FormField label={t('equipementsForm.longitude')} hint={t('equipementsForm.longitudeHint')}>
              <Input type="number" step="0.000001" placeholder="-13.677729" value={form.longitude} onChange={e => set('longitude', e.target.value)} />
            </FormField>
          </div>
          <p className="text-[12px] text-[#8A9A90] -mt-2">{t('equipementsForm.gpsHint')}</p>
        </div>
      )}

      {/* ── Étape 3 : Confirmation ── */}
      {step === 3 && (
        <div>
          <SectionTitle title={t('equipementsForm.step3Title')} desc={t('equipementsForm.step3Desc')} />
          <div className="rounded-[14px] bg-bone border border-pine/10 overflow-hidden">
            {[
              { label: t('equipementsForm.recapCategorie'),   value: form.categorie },
              { label: t('equipementsForm.recapEquipement'),  value: form.marque_modele },
              { label: t('equipementsForm.recapSerie'),       value: form.numero_serie || '—' },
              { label: t('equipementsForm.recapAnnee'),       value: form.annee_mise_en_service || '—' },
              { label: t('equipementsForm.recapEtat'),        value: form.etat ? t(`equipements.etat.${form.etat}`) : '—' },
              { label: t('equipementsForm.recapQuantite'),    value: form.quantite },
              { label: t('equipementsForm.recapDisponible'),  value: form.disponible ? `✓ ${t('equipements.disponible')}` : t('equipements.indisponible') },
              { label: t('equipementsForm.recapLocalisation'),value: form.localisation_texte },
              { label: t('equipementsForm.recapProprietaire'),value: form.entreprise_nom || '—' },
            ].map(row => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 px-5 py-3 border-b border-pine/8 last:border-0">
                <span className="text-[12px] tracking-[.1em] uppercase font-semibold text-gold-deep font-sans flex-shrink-0">{row.label}</span>
                <span className="text-[14.5px] text-ink text-right">{row.value}</span>
              </div>
            ))}
          </div>
          {errors.submit && (
            <div className="mt-4 flex items-start gap-3 rounded-[12px] border border-rust/30 bg-rust/8 p-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B23A2E" strokeWidth="2" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
              <p className="text-[13px] text-rust leading-relaxed">{errors.submit}</p>
            </div>
          )}
        </div>
      )}
    </FormWizard>
  )
}
