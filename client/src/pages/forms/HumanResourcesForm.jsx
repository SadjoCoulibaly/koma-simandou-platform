import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { VILLES_GUINEE } from '../../data/villesGuinee'
import FormWizard from '../../components/ui/FormWizard'
import { FormField, Input, Select, Textarea, SectionTitle, SuccessScreen } from '../../components/ui/FormField'
import { humanResourcesApi } from '../../lib/api'

const DISPONIBILITES = [
  { value: 'disponible',   key: 'disponible' },
  { value: 'partiel',      key: 'partiel' },
  { value: 'indisponible', key: 'indisponible' },
]

const NATIONALITES = [
  'Guinéenne', 'Française', 'Américaine', 'Chinoise', 'Indienne', 'Nigériane',
  'Sénégalaise', 'Malienne', 'Ivoirienne', 'Ghanéenne', 'Camerounaise', 'Autre',
]

const FONCTIONS = [
  'Ingénieur civil', 'Ingénieur minier', 'Géologue', 'Topographe', 'Chef de chantier',
  'Mécanicien', 'Électricien', 'Technicien BTP', "Opérateur d'engins", 'Soudeur',
  'Comptable', 'Juriste', 'Logisticien', 'Infirmier', 'Interprète / Traducteur',
  'Informaticien', 'Manager de projet', 'Autre',
]

const VILLES = VILLES_GUINEE

const INITIAL = {
  nom_complet: '', telephone: '', email: '', nationalite: '',
  fonction: '', competences: '', projet_realise: '',
  disponibilite: 'disponible', localisation: '',
}

export default function HumanResourcesForm() {
  const { t } = useTranslation()
  const STEPS = [
    t('hrForm.step0'),
    t('hrForm.step1'),
    t('hrForm.step2'),
  ]

  const [step, setStep]     = useState(0)
  const [form, setForm]     = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (step === 0) {
      if (!form.nom_complet.trim()) e.nom_complet = t('hrForm.errors.nomComplet')
      if (!form.telephone.trim())   e.telephone   = t('hrForm.errors.telephone')
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('hrForm.errors.emailInvalid')
    }
    if (step === 1) {
      if (!form.fonction.trim()) e.fonction = t('hrForm.errors.fonction')
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
        competences: form.competences
          ? form.competences.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      }
      await humanResourcesApi.create(payload)
      setSubmitted(true)
    } catch (err) {
      setErrors({ submit: err.message || "Erreur lors de l'enregistrement." })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return (
    <SuccessScreen
      title={t('hrForm.successTitle')}
      message={t('hrForm.reviewNote')}
      onReset={() => { setSubmitted(false); setForm(INITIAL); setStep(0) }}
      resetLabel={t('hrForm.newEntry')}
    />
  )

  return (
    <FormWizard
      title={t('hrForm.title')}
      subtitle={t('hrForm.subtitle')}
      steps={STEPS}
      currentStep={step}
      onBack={handleBack}
      onNext={handleNext}
      onSubmit={handleSubmit}
      loading={loading}
      isFirstStep={step === 0}
      isLastStep={step === STEPS.length - 1}
    >
      {/* ── Étape 0 : Identité ── */}
      {step === 0 && (
        <div className="flex flex-col gap-5">
          <SectionTitle title={t('hrForm.step0Title')} desc={t('hrForm.step0Desc')} />

          <FormField label={t('hrForm.nomComplet')} required error={errors.nom_complet}>
            <Input placeholder="DIALLO Mamadou" value={form.nom_complet} onChange={e => set('nom_complet', e.target.value)} error={errors.nom_complet} />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={t('hrForm.telephone')} required error={errors.telephone}>
              <Input type="tel" placeholder="+224 620 000 000" value={form.telephone} onChange={e => set('telephone', e.target.value)} error={errors.telephone} />
            </FormField>
            <FormField label={t('hrForm.email')} error={errors.email}>
              <Input type="email" placeholder="contact@email.com" value={form.email} onChange={e => set('email', e.target.value)} error={errors.email} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={t('hrForm.nationalite')}>
              <Select value={form.nationalite} onChange={e => set('nationalite', e.target.value)}>
                <option value="">{t('hrForm.selectNationalite')}</option>
                {NATIONALITES.map(n => <option key={n} value={n}>{n}</option>)}
              </Select>
            </FormField>
            <FormField label={t('hrForm.localisation')}>
              <Select value={form.localisation} onChange={e => set('localisation', e.target.value)}>
                <option value="">{t('hrForm.selectVille')}</option>
                {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
              </Select>
            </FormField>
          </div>
        </div>
      )}

      {/* ── Étape 1 : Compétences ── */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <SectionTitle title={t('hrForm.step1Title')} desc={t('hrForm.step1Desc')} />

          <FormField label={t('hrForm.fonction')} required error={errors.fonction}>
            <Select value={form.fonction} onChange={e => set('fonction', e.target.value)} error={errors.fonction}>
              <option value="">{t('hrForm.selectFonction')}</option>
              {FONCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </Select>
          </FormField>

          <FormField label={t('hrForm.competences')} hint={t('hrForm.competencesHint')}>
            <Input
              placeholder="Forage, Topographie, AutoCAD, Anglais..."
              value={form.competences}
              onChange={e => set('competences', e.target.value)}
            />
          </FormField>

          <FormField label={t('hrForm.projetRealise')} hint={t('hrForm.projetRealiseHint')}>
            <Textarea
              placeholder="Ex: Construction du pont de Garafiri (2021-2023) — Chef de chantier pour SOGUIPAH…"
              value={form.projet_realise}
              onChange={e => set('projet_realise', e.target.value)}
            />
          </FormField>

          <FormField label={t('hrForm.disponibilite')}>
            <div className="flex flex-col gap-2.5">
              {DISPONIBILITES.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => set('disponibilite', d.value)}
                  className={`flex items-center gap-3 rounded-[11px] border px-4 py-3 text-left transition-all text-[14px] font-sans ${
                    form.disponibilite === d.value
                      ? 'border-pine bg-pine/6 text-pine font-semibold'
                      : 'border-pine/14 bg-bone text-ink hover:border-pine/30'
                  }`}
                >
                  <span className={`h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                    form.disponibilite === d.value ? 'border-pine bg-pine' : 'border-pine/25'
                  }`}>
                    {form.disponibilite === d.value && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                    )}
                  </span>
                  {t(`hrForm.disponibilites.${d.key}`)}
                </button>
              ))}
            </div>
          </FormField>
        </div>
      )}

      {/* ── Étape 2 : Confirmation ── */}
      {step === 2 && (
        <div>
          <SectionTitle title={t('hrForm.step2Title')} desc={t('hrForm.step2Desc')} />
          <div className="rounded-[14px] bg-bone border border-pine/10 overflow-hidden mb-4">
            {[
              { label: t('hrForm.recapNom'),          value: form.nom_complet },
              { label: t('hrForm.recapTel'),           value: form.telephone },
              { label: t('hrForm.recapEmail'),         value: form.email || '—' },
              { label: t('hrForm.recapNationalite'),   value: form.nationalite || '—' },
              { label: t('hrForm.recapFonction'),      value: form.fonction },
              { label: t('hrForm.recapDisponibilite'), value: form.disponibilite ? t(`hrForm.disponibilites.${form.disponibilite}`) : '—' },
              { label: t('hrForm.recapLocalisation'),  value: form.localisation || '—' },
            ].map(row => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 px-5 py-3 border-b border-pine/8 last:border-0">
                <span className="text-[12px] tracking-[.1em] uppercase font-semibold text-gold-deep font-sans flex-shrink-0">{row.label}</span>
                <span className="text-[14.5px] text-ink text-right">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 rounded-[12px] border border-gold/30 bg-gold/8 p-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A2792C" strokeWidth="2" className="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
            <p className="text-[13px] text-gold-deep leading-relaxed">
              {t('hrForm.reviewNote')}
            </p>
          </div>

          {errors.submit && (
            <div className="mt-4 flex items-start gap-3 rounded-[12px] border border-rust/30 bg-rust/8 p-4">
              <p className="text-[13px] text-rust">{errors.submit}</p>
            </div>
          )}
        </div>
      )}
    </FormWizard>
  )
}
