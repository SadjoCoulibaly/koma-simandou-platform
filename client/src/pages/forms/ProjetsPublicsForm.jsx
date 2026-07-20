import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { tEnum, SECTEURS_PROJ_PUBLICS } from '../../lib/enumTranslations'
import FormWizard from '../../components/ui/FormWizard'
import { FormField, Input, Select, Textarea, SelectCard, SectionTitle, SuccessScreen } from '../../components/ui/FormField'
import UploadZone from '../../components/ui/UploadZone'
import { projetsPublicsApi } from '../../lib/api'

const SECTEURS = [
  { label: 'Infrastructures', sub: 'Routes · ponts · autoroutes · ports · aéroports · chemins de fer' },
  { label: 'Énergie', sub: 'Barrages · centrales électriques · électrification rurale' },
  { label: 'Eau & assainissement', sub: "Adductions d'eau · barrages · réseaux d'assainissement" },
  { label: 'Santé', sub: 'Hôpitaux · centres de santé · équipements biomédicaux' },
  { label: 'Éducation', sub: 'Universités · écoles · centres de formation' },
  { label: 'Habitat', sub: 'Logements sociaux · cités administratives' },
  { label: 'Agriculture', sub: 'Aménagements hydroagricoles · stockage · agro-industrie' },
]

const STATUTS = [
  { value: 'planifie',  key: 'planifie' },
  { value: 'en_cours',  key: 'en_cours' },
  { value: 'suspendu',  key: 'suspendu' },
  { value: 'termine',   key: 'termine' },
]

const INITIAL = {
  secteur: '', titre: '', description: '', maitre_ouvrage: '',
  budget_estime: '', devise: 'GNF', date_debut: '', date_fin_prevue: '',
  localisation: '',
  lots_sous_traitance: '', contenu_local_pct: '', avancement_pct: '',
  travaux_realises: '', image_url: '',
  soumis_par_nom: '', soumis_par_email: '', soumis_par_telephone: '', soumis_par_organisation: '',
}

export default function ProjetsPublicsForm() {
  const { t } = useTranslation()
  const STEPS = [
    t('projetsPublicsForm.step0'),
    t('projetsPublicsForm.step1'),
    t('projetsPublicsForm.step2'),
    'Vos coordonnées',
    t('projetsPublicsForm.step3'),
  ]

  const [step, setStep]         = useState(0)
  const [form, setForm]         = useState(INITIAL)
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (step === 0 && !form.secteur) e.secteur = t('projetsPublicsForm.errors.secteur')
    if (step === 1) {
      if (!form.titre.trim())          e.titre          = t('projetsPublicsForm.errors.titre')
      if (!form.maitre_ouvrage.trim()) e.maitre_ouvrage = t('projetsPublicsForm.errors.maitreOuvrage')
      if (!form.localisation.trim())   e.localisation   = t('projetsPublicsForm.errors.localisation')
    }
    if (step === 2) {
      if (form.contenu_local_pct !== '' && (Number(form.contenu_local_pct) < 0 || Number(form.contenu_local_pct) > 100))
        e.contenu_local_pct = t('projetsPublicsForm.errors.percent')
      if (form.avancement_pct !== '' && (Number(form.avancement_pct) < 0 || Number(form.avancement_pct) > 100))
        e.avancement_pct = t('projetsPublicsForm.errors.percent')
    }
    if (step === 3) {
      if (!form.soumis_par_nom.trim())   e.soumis_par_nom   = 'Votre nom complet est obligatoire.'
      if (!form.soumis_par_email.trim()) e.soumis_par_email = 'Votre adresse email est obligatoire.'
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
        budget_estime:     form.budget_estime     ? Number(form.budget_estime)     : null,
        contenu_local_pct: form.contenu_local_pct ? Number(form.contenu_local_pct) : null,
        avancement_pct:    form.avancement_pct    ? Number(form.avancement_pct)    : null,
      }
      await projetsPublicsApi.create(payload)
      setSubmitted(true)
    } catch (err) { setErrors({ submit: err.message || "Erreur lors de l'enregistrement. Veuillez réessayer." }); setStep(4) }
    finally { setLoading(false) }
  }

  if (submitted) return (
    <SuccessScreen
      title={t('projetsPublicsForm.successTitle')}
      message={`Le projet « ${form.titre} » (${form.secteur}) a été soumis au registre national.`}
      onReset={() => { setSubmitted(false); setForm(INITIAL); setStep(0) }}
    />
  )

  const isLaunched = ['en_cours', 'suspendu', 'termine'].includes(form.statut)
  const statutLabel = form.statut ? t(`projetsPublicsForm.statuts.${form.statut}`, { defaultValue: form.statut }) : ''

  return (
    <FormWizard
      title={t('projetsPublicsForm.title')}
      subtitle={t('projetsPublicsForm.subtitle')}
      steps={STEPS}
      currentStep={step}
      onBack={handleBack}
      onNext={handleNext}
      onSubmit={handleSubmit}
      loading={loading}
      isFirstStep={step === 0}
      isLastStep={step === STEPS.length - 1}
    >
      {/* ── Étape 0 : Secteur ── */}
      {step === 0 && (
        <div>
          <SectionTitle title={t('projetsPublicsForm.step0Title')} desc={t('projetsPublicsForm.step0Desc')} />
          <div className="flex flex-col gap-2.5">
            {SECTEURS.map(s => (
              <SelectCard key={s.label} label={tEnum(t, SECTEURS_PROJ_PUBLICS, s.label)} sub={s.sub} selected={form.secteur === s.label} onClick={() => set('secteur', s.label)} />
            ))}
          </div>
          {errors.secteur && <p className="mt-3 text-[13px] text-rust">{errors.secteur}</p>}
        </div>
      )}

      {/* ── Étape 1 : Détails ── */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <SectionTitle title={t('projetsPublicsForm.step1Title')} desc={`${t('projetsPublicsForm.step0')} : ${form.secteur}`} />

          <FormField label={t('projetsPublicsForm.titre')} required error={errors.titre}>
            <Input placeholder="Intitulé officiel du projet" value={form.titre} onChange={e => set('titre', e.target.value)} error={errors.titre} />
          </FormField>

          <FormField label={t('projetsPublicsForm.description')} hint={t('projetsPublicsForm.descriptionHint')}>
            <Textarea placeholder="Décrivez les objectifs, la portée et les résultats attendus du projet..." value={form.description} onChange={e => set('description', e.target.value)} />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={t('projetsPublicsForm.maitreOuvrage')} required error={errors.maitre_ouvrage}>
              <Input placeholder="Ministère ou autorité responsable" value={form.maitre_ouvrage} onChange={e => set('maitre_ouvrage', e.target.value)} error={errors.maitre_ouvrage} />
            </FormField>
            <FormField label={t('projetsPublicsForm.statut')}>
              <Select value={form.statut} onChange={e => set('statut', e.target.value)}>
                {STATUTS.map(s => <option key={s.value} value={s.value}>{t(`projetsPublicsForm.statuts.${s.key}`)}</option>)}
              </Select>
            </FormField>
            <FormField label={t('projetsPublicsForm.dateDebut')}>
              <Input type="date" value={form.date_debut} onChange={e => set('date_debut', e.target.value)} />
            </FormField>
            <FormField label={t('projetsPublicsForm.dateFin')}>
              <Input type="date" value={form.date_fin_prevue} onChange={e => set('date_fin_prevue', e.target.value)} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={t('projetsPublicsForm.budget')}>
              <Input type="number" min="0" placeholder="50 000 000 000" value={form.budget_estime} onChange={e => set('budget_estime', e.target.value)} />
            </FormField>
            <FormField label={t('projetsPublicsForm.devise')}>
              <Select value={form.devise} onChange={e => set('devise', e.target.value)}>
                <option value="GNF">GNF — Franc guinéen</option>
                <option value="USD">USD — Dollar américain</option>
                <option value="EUR">EUR — Euro</option>
              </Select>
            </FormField>
          </div>

          <FormField label={t('projetsPublicsForm.localisation')} required error={errors.localisation} hint={t('projetsPublicsForm.localisationHint')}>
            <Input placeholder="Préfecture — Région — Corridor concerné" value={form.localisation} onChange={e => set('localisation', e.target.value)} error={errors.localisation} />
          </FormField>

          <FormField label="Photo / visuel du projet" hint="Optionnel — Photo aérienne, plan, carte ou visuel illustrant le projet">
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
          <SectionTitle title={t('projetsPublicsForm.step2Title')} desc={t('projetsPublicsForm.step2Desc')} />

          <FormField label="Travaux réalisés" hint="Décrivez les travaux déjà effectués sur ce projet (études, terrassement, fondations, etc.)">
            <Textarea
              placeholder={"Études géotechniques et topographiques\nInstallation du chantier\nTerrassement général (40 %)\nCoffrages et fondations du tronçon A"}
              value={form.travaux_realises}
              onChange={e => set('travaux_realises', e.target.value)}
              rows={4}
            />
          </FormField>

          <FormField label={t('projetsPublicsForm.lots')} hint={t('projetsPublicsForm.lotsHint')}>
            <Textarea
              placeholder={"Terrassement général\nEnrobé bitumineux\nSignalisation routière\nOuvrages d'art\nÉlectricité & éclairage public"}
              value={form.lots_sous_traitance}
              onChange={e => set('lots_sous_traitance', e.target.value)}
              rows={5}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={t('projetsPublicsForm.contenuLocal')} hint={t('projetsPublicsForm.contenuLocalHint')} error={errors.contenu_local_pct}>
              <div className="relative">
                <Input
                  type="number" min="0" max="100" placeholder="30"
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
              label={isLaunched ? t('projetsPublicsForm.avancement') : t('projetsPublicsForm.avancement')}
              hint={isLaunched ? t('projetsPublicsForm.avancementHint') : t('projetsPublicsForm.avancementNotLaunched')}
              error={errors.avancement_pct}
            >
              <div className="relative">
                <Input
                  type="number" min="0" max="100"
                  placeholder={isLaunched ? '45' : t('projetsPublicsForm.notLaunched')}
                  value={form.avancement_pct}
                  onChange={e => set('avancement_pct', e.target.value)}
                  error={errors.avancement_pct}
                  disabled={!isLaunched && form.avancement_pct === ''}
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
                  {`${t('projetsPublicsForm.recapStatut')} « ${statutLabel} » — ${t('projetsPublicsForm.notLaunched')}.`}
                </p>
              )}
            </FormField>
          </div>
        </div>
      )}

      {/* ── Étape 3 : Vos coordonnées ── */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
          <SectionTitle title="Vos coordonnées" desc="Ces informations permettront aux visiteurs et à l'administration de vous contacter au sujet du projet." />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label="Nom complet" required error={errors.soumis_par_nom}>
              <Input
                placeholder="Prénom Nom"
                value={form.soumis_par_nom}
                onChange={e => set('soumis_par_nom', e.target.value)}
                error={errors.soumis_par_nom}
              />
            </FormField>

            <FormField label="Adresse email" required error={errors.soumis_par_email}>
              <Input
                type="email"
                placeholder="votre@email.com"
                value={form.soumis_par_email}
                onChange={e => set('soumis_par_email', e.target.value)}
                error={errors.soumis_par_email}
              />
            </FormField>

            <FormField label="Téléphone">
              <Input
                placeholder="+224 6XX XX XX XX"
                value={form.soumis_par_telephone}
                onChange={e => set('soumis_par_telephone', e.target.value)}
              />
            </FormField>

            <FormField label="Organisation / Structure">
              <Input
                placeholder="Ministère, entreprise, ONG..."
                value={form.soumis_par_organisation}
                onChange={e => set('soumis_par_organisation', e.target.value)}
              />
            </FormField>
          </div>

          <div className="rounded-[10px] bg-[#EBF4FF] border border-[rgba(24,95,165,.2)] p-4">
            <p className="text-[13px] text-[#185FA5] leading-relaxed m-0">
              Votre projet sera soumis à validation avant d'être publié sur la plateforme. Vous serez contacté si des informations complémentaires sont nécessaires.
            </p>
          </div>
        </div>
      )}

      {/* ── Étape 4 : Confirmation ── */}
      {step === 4 && (
        <div>
          <SectionTitle title={t('projetsPublicsForm.step3Title')} desc={t('projetsPublicsForm.step3Desc')} />
          <div className="rounded-[14px] bg-bone border border-pine/10 overflow-hidden">
            {[
              { label: t('projetsPublicsForm.recapSecteur'),      value: form.secteur },
              { label: t('projetsPublicsForm.recapTitre'),        value: form.titre },
              { label: t('projetsPublicsForm.recapMaitre'),       value: form.maitre_ouvrage },
              { label: t('projetsPublicsForm.recapBudget'),       value: form.budget_estime ? `${Number(form.budget_estime).toLocaleString('fr-FR')} ${form.devise}` : '—' },
              { label: t('projetsPublicsForm.recapLocalisation'), value: form.localisation },
              { label: t('projetsPublicsForm.recapDebut'),        value: form.date_debut || '—' },
              { label: t('projetsPublicsForm.recapFin'),          value: form.date_fin_prevue || '—' },
              { label: t('projetsPublicsForm.recapContenu'),      value: form.contenu_local_pct ? `${form.contenu_local_pct} %` : '—' },
              { label: t('projetsPublicsForm.recapAvancement'),   value: form.avancement_pct ? `${form.avancement_pct} %` : t('projetsPublicsForm.notLaunched') },
              { label: 'Travaux réalisés',                        value: form.travaux_realises ? form.travaux_realises.split('\n').filter(Boolean).join(' · ') : '—' },
              { label: t('projetsPublicsForm.recapLots'),         value: form.lots_sous_traitance ? form.lots_sous_traitance.split('\n').filter(Boolean).join(' · ') : '—' },
              { label: 'Déposé par',                              value: `${form.soumis_par_nom}${form.soumis_par_organisation ? ' — ' + form.soumis_par_organisation : ''}` },
              { label: 'Contact',                                 value: `${form.soumis_par_email}${form.soumis_par_telephone ? ' · ' + form.soumis_par_telephone : ''}` },
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
