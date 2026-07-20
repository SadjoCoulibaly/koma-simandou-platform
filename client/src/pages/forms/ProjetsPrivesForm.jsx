import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { tEnum, CATEGORIES_PROJ_PRIVES } from '../../lib/enumTranslations'
import FormWizard from '../../components/ui/FormWizard'
import { FormField, Input, Select, Textarea, SelectCard, SectionTitle, SuccessScreen } from '../../components/ui/FormField'
import UploadZone from '../../components/ui/UploadZone'
import { projetsPrivesApi } from '../../lib/api'

const CATEGORIES = [
  { value: 'Minier',      label: 'Projet minier',      sub: 'Extraction et valorisation minière' },
  { value: 'Industriel',  label: 'Projet industriel',  sub: 'Transformation et production' },
  { value: 'Énergétique', label: 'Projet énergétique', sub: "Production et distribution d'énergie" },
  { value: 'Logistique',  label: 'Projet logistique',  sub: 'Transport, stockage, distribution' },
  { value: 'Immobilier',  label: 'Projet immobilier',  sub: 'Construction et aménagement' },
  { value: 'Agricole',    label: 'Projet agricole',    sub: 'Production et agro-industrie' },
]

const STATUTS = [
  { value: 'etude',        key: 'etude' },
  { value: 'financement',  key: 'financement' },
  { value: 'construction', key: 'construction' },
  { value: 'exploitation', key: 'exploitation' },
]

const INITIAL = {
  categorie: '', titre: '', description: '', promoteur: '',
  investissement_prevu: '', devise: 'USD', emplois_prevus: '',
  date_debut: '', localisation: '', statut: 'etude',
  lots_sous_traitance: '', contenu_local_pct: '', avancement_pct: '',
  travaux_realises: '',
  image_url: '',
}

export default function ProjetsPrivesForm() {
  const { t } = useTranslation()
  const STEPS = [
    t('projetsPrivesForm.step0'),
    t('projetsPrivesForm.step1'),
    t('projetsPrivesForm.step2'),
    t('projetsPrivesForm.step3'),
  ]

  const [step, setStep]           = useState(0)
  const [form, setForm]           = useState(INITIAL)
  const [errors, setErrors]       = useState({})
  const [loading, setLoading]     = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (step === 0 && !form.categorie) e.categorie = t('projetsPrivesForm.errors.categorie')
    if (step === 1) {
      if (!form.titre.trim())    e.titre    = t('projetsPrivesForm.errors.titre')
      if (!form.promoteur.trim()) e.promoteur = t('projetsPrivesForm.errors.promoteur')
    }
    if (step === 2) {
      if (form.contenu_local_pct !== '' && (Number(form.contenu_local_pct) < 0 || Number(form.contenu_local_pct) > 100))
        e.contenu_local_pct = t('projetsPrivesForm.errors.percent')
      if (form.avancement_pct !== '' && (Number(form.avancement_pct) < 0 || Number(form.avancement_pct) > 100))
        e.avancement_pct = t('projetsPrivesForm.errors.percent')
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
        investissement_prevu: form.investissement_prevu ? Number(form.investissement_prevu) : null,
        emplois_prevus:       form.emplois_prevus       ? Number(form.emplois_prevus)       : null,
        contenu_local_pct:    form.contenu_local_pct    ? Number(form.contenu_local_pct)    : null,
        avancement_pct:       form.avancement_pct       ? Number(form.avancement_pct)       : null,
      }
      await projetsPrivesApi.create(payload)
      setSubmitted(true)
    } catch (err) { setErrors({ submit: err.message || "Erreur lors de l'enregistrement. Veuillez réessayer." }) }
    finally { setLoading(false) }
  }

  if (submitted) return (
    <SuccessScreen
      title={t('projetsPrivesForm.successTitle')}
      message={`Le projet structurant « ${form.titre} » (${form.categorie}) a été soumis au registre national.`}
      onReset={() => { setSubmitted(false); setForm(INITIAL); setStep(0) }}
    />
  )

  const isLaunched = ['construction', 'exploitation'].includes(form.statut)
  const statutLabel = form.statut ? t(`projetsPrivesForm.statuts.${form.statut}`) : ''

  return (
    <FormWizard
      title={t('projetsPrivesForm.title')}
      subtitle={t('projetsPrivesForm.subtitle')}
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
          <SectionTitle title={t('projetsPrivesForm.step0Title')} desc={t('projetsPrivesForm.step0Desc')} />
          <div className="flex flex-col gap-2.5">
            {CATEGORIES.map(c => (
              <SelectCard key={c.value} label={tEnum(t, CATEGORIES_PROJ_PRIVES, c.value)} sub={c.sub} selected={form.categorie === c.value} onClick={() => set('categorie', c.value)} />
            ))}
          </div>
          {errors.categorie && <p className="mt-3 text-[13px] text-rust">{errors.categorie}</p>}
        </div>
      )}

      {/* ── Étape 1 : Détails ── */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <SectionTitle title={t('projetsPrivesForm.step1Title')} desc={`${t('projetsPrivesForm.step0')} : ${form.categorie}`} />

          <FormField label={t('projetsPrivesForm.titre')} required error={errors.titre}>
            <Input placeholder="Intitulé du projet d'investissement" value={form.titre} onChange={e => set('titre', e.target.value)} error={errors.titre} />
          </FormField>

          <FormField label={t('projetsPrivesForm.description')} hint={t('projetsPrivesForm.descriptionHint')}>
            <Textarea placeholder="Décrivez les objectifs, la technologie, les partenaires et les impacts attendus..." value={form.description} onChange={e => set('description', e.target.value)} />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={t('projetsPrivesForm.promoteur')} required error={errors.promoteur}>
              <Input placeholder="Nom du promoteur ou de l'investisseur" value={form.promoteur} onChange={e => set('promoteur', e.target.value)} error={errors.promoteur} />
            </FormField>
            <FormField label={t('projetsPrivesForm.statut')}>
              <Select value={form.statut} onChange={e => set('statut', e.target.value)}>
                {STATUTS.map(s => <option key={s.value} value={s.value}>{t(`projetsPrivesForm.statuts.${s.key}`)}</option>)}
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={t('projetsPrivesForm.investissement')}>
              <Input type="number" min="0" placeholder="250 000 000" value={form.investissement_prevu} onChange={e => set('investissement_prevu', e.target.value)} />
            </FormField>
            <FormField label={t('projetsPrivesForm.devise')}>
              <Select value={form.devise} onChange={e => set('devise', e.target.value)}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GNF">GNF</option>
              </Select>
            </FormField>
            <FormField label={t('projetsPrivesForm.emplois')} hint={t('projetsPrivesForm.emploisHint')}>
              <Input type="number" min="0" placeholder="1 200" value={form.emplois_prevus} onChange={e => set('emplois_prevus', e.target.value)} />
            </FormField>
            <FormField label={t('projetsPrivesForm.dateDebut')}>
              <Input type="date" value={form.date_debut} onChange={e => set('date_debut', e.target.value)} />
            </FormField>
          </div>

          <FormField label={t('projetsPrivesForm.localisation')} hint={t('projetsPrivesForm.localisationHint')}>
            <Input placeholder="Préfecture — Région — Zone d'implantation" value={form.localisation} onChange={e => set('localisation', e.target.value)} />
          </FormField>

          <FormField label="Photo / visuel du projet" hint="Optionnel — Photo du site, plan d'aménagement ou visuel illustrant le projet">
            <UploadZone
              value={form.image_url}
              onChange={url => set('image_url', url)}
              folder="projets"
              label="Uploader un visuel du projet"
            />
          </FormField>
        </div>
      )}

      {/* ── Étape 2 : Sous-traitance & Indicateurs ── */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          <SectionTitle title={t('projetsPrivesForm.step2Title')} desc={t('projetsPrivesForm.step2Desc')} />

          <FormField label="Travaux réalisés" hint="Décrivez les travaux déjà effectués sur ce projet (études, infrastructure, équipements installés, etc.)">
            <Textarea
              placeholder={"Études de faisabilité et d'impact\nObtention des permis et autorisations\nAménagement du site\nInstallation des équipements pilotes"}
              value={form.travaux_realises}
              onChange={e => set('travaux_realises', e.target.value)}
              rows={4}
            />
          </FormField>

          <FormField label={t('projetsPrivesForm.lots')} hint={t('projetsPrivesForm.lotsHint')}>
            <Textarea
              placeholder={"Terrassement et génie civil\nInstallations électriques\nTransport et logistique\nMaintenance industrielle\nFormation et transfert de compétences"}
              value={form.lots_sous_traitance}
              onChange={e => set('lots_sous_traitance', e.target.value)}
              rows={5}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={t('projetsPrivesForm.contenuLocal')} hint={t('projetsPrivesForm.contenuLocalHint')} error={errors.contenu_local_pct}>
              <div className="relative">
                <Input
                  type="number" min="0" max="100" placeholder="40"
                  value={form.contenu_local_pct}
                  onChange={e => set('contenu_local_pct', e.target.value)}
                  error={errors.contenu_local_pct}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-[#8A9A90] pointer-events-none">%</span>
              </div>
              {form.contenu_local_pct && (
                <div className="mt-2 h-1.5 rounded-full bg-bone-2 overflow-hidden">
                  <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${Math.min(form.contenu_local_pct, 100)}%` }} />
                </div>
              )}
            </FormField>

            <FormField
              label={t('projetsPrivesForm.avancement')}
              hint={isLaunched ? t('projetsPrivesForm.avancementHint') : t('projetsPrivesForm.avancementNotLaunched')}
              error={errors.avancement_pct}
            >
              <div className="relative">
                <Input
                  type="number" min="0" max="100"
                  placeholder={isLaunched ? '45' : t('projetsPrivesForm.notLaunched')}
                  value={form.avancement_pct}
                  onChange={e => set('avancement_pct', e.target.value)}
                  error={errors.avancement_pct}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-[#8A9A90] pointer-events-none">%</span>
              </div>
              {form.avancement_pct && (
                <div className="mt-2 h-1.5 rounded-full bg-bone-2 overflow-hidden">
                  <div className="h-full rounded-full bg-leaf transition-all" style={{ width: `${Math.min(form.avancement_pct, 100)}%` }} />
                </div>
              )}
              {!isLaunched && (
                <p className="mt-1.5 text-[11.5px] text-[#8A9A90]">
                  {`${t('projetsPrivesForm.recapStatut')} « ${statutLabel} » — ${t('projetsPrivesForm.notLaunched')}.`}
                </p>
              )}
            </FormField>
          </div>
        </div>
      )}

      {/* ── Étape 3 : Confirmation ── */}
      {step === 3 && (
        <div>
          <SectionTitle title={t('projetsPrivesForm.step3Title')} desc={t('projetsPrivesForm.step3Desc')} />
          <div className="rounded-[14px] bg-bone border border-pine/10 overflow-hidden">
            {[
              { label: t('projetsPrivesForm.recapCategorie'),    value: form.categorie },
              { label: t('projetsPrivesForm.recapTitre'),        value: form.titre },
              { label: t('projetsPrivesForm.recapPromoteur'),    value: form.promoteur },
              { label: t('projetsPrivesForm.recapStatut'),       value: form.statut ? t(`projetsPrivesForm.statuts.${form.statut}`) : '—' },
              { label: t('projetsPrivesForm.recapInvestissement'),value: form.investissement_prevu ? `${Number(form.investissement_prevu).toLocaleString('fr-FR')} ${form.devise}` : '—' },
              { label: t('projetsPrivesForm.recapEmplois'),      value: form.emplois_prevus || '—' },
              { label: t('projetsPrivesForm.recapLocalisation'), value: form.localisation || '—' },
              { label: t('projetsPrivesForm.recapDebut'),        value: form.date_debut || '—' },
              { label: t('projetsPrivesForm.recapContenu'),      value: form.contenu_local_pct ? `${form.contenu_local_pct} %` : '—' },
              { label: t('projetsPrivesForm.recapAvancement'),   value: form.avancement_pct ? `${form.avancement_pct} %` : t('projetsPrivesForm.notLaunched') },
              { label: 'Travaux réalisés',                       value: form.travaux_realises ? form.travaux_realises.split('\n').filter(Boolean).join(' · ') : '—' },
              { label: t('projetsPrivesForm.recapLots'),         value: form.lots_sous_traitance ? form.lots_sous_traitance.split('\n').filter(Boolean).join(' · ') : '—' },
            ].map(row => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 px-5 py-3 border-b border-pine/8 last:border-0">
                <span className="text-[12px] tracking-[.1em] uppercase font-semibold text-gold-deep font-sans flex-shrink-0">{row.label}</span>
                <span className="text-[13.5px] text-ink text-right">{row.value}</span>
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
