import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { tEnum, SECTEURS_ENT } from '../../lib/enumTranslations'
import { VILLES_GUINEE } from '../../data/villesGuinee'
import FormWizard from '../../components/ui/FormWizard'
import { FormField, Input, Select, Textarea, SelectCard, SectionTitle, SuccessScreen } from '../../components/ui/FormField'
import { entreprisesApi } from '../../lib/api'
import { supabase } from '../../lib/supabase'

const TYPES = [
  { value: 'Nationale', label: 'Entreprise nationale', sub: 'Société de droit guinéen', icon: '🏢' },
  { value: 'Internationale', label: 'Entreprise internationale', sub: 'Société étrangère opérant en Guinée', icon: '🌍' },
  { value: 'Sous-traitant', label: 'Sous-traitant', sub: 'Prestataire de second rang', icon: '🔗' },
  { value: "Bureau d'études", label: "Bureau d'études", sub: 'Ingénierie, conseil, conception', icon: '📐' },
  { value: 'Fournisseur', label: 'Fournisseur', sub: 'Biens et services aux projets', icon: '📦' },
  { value: "Société d'inventaire d'équipements", label: "Société d'inventaire d'équipements", sub: 'Recensement et gestion de parcs matériels', icon: '📋' },
]

const SECTEURS = [
  'Mines & Extraction', 'BTP & Génie Civil', 'Transport & Logistique',
  'Énergie', 'Eau & Assainissement', 'Industrie & Manufacture',
  'Agriculture', 'Services & Conseil', 'Technologies', 'Autre',
]

const INITIAL = {
  type: '', nom: '', rccm: '', nif: '', adresse: '', ville: '',
  telephone: '', email: '', site_web: '',
  declarant_nom: '', declarant_prenom: '', declarant_fonction: '',
  declarant_telephone: '', declarant_email: '',
  secteur: '', effectifs: '', capital_social: '', experience_simandou: false,
  description: '', references_techniques: '', certifications: '',
}

export default function EntreprisesForm() {
  const { t } = useTranslation()
  const STEPS = [
    t('entreprisesForm.step0'),
    t('entreprisesForm.step1'),
    t('entreprisesForm.step2'),
    t('entreprisesForm.step3'),
    t('entreprisesForm.step4'),
  ]

  const [step, setStep] = useState(0)
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [logo, setLogo] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const logoRef = useRef(null)

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
  }

  const handleLogo = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors(e => ({ ...e, logo: t('entreprisesForm.errors.logoFormat') }))
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors(e => ({ ...e, logo: t('entreprisesForm.errors.logoSize') }))
      return
    }
    setErrors(e => ({ ...e, logo: '' }))
    setLogo(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const removeLogo = () => {
    setLogo(null)
    setLogoPreview(null)
    if (logoRef.current) logoRef.current.value = ''
  }

  const validate = () => {
    const e = {}
    if (step === 0 && !form.type) e.type = t('entreprisesForm.errors.type')
    if (step === 1) {
      if (!form.nom.trim())       e.nom       = t('entreprisesForm.errors.nom')
      if (!form.telephone.trim()) e.telephone = t('entreprisesForm.errors.telephone')
      if (!form.email.trim())     e.email     = t('entreprisesForm.errors.email')
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('entreprisesForm.errors.emailInvalid')
    }
    if (step === 2) {
      if (!form.declarant_nom.trim())       e.declarant_nom       = t('entreprisesForm.errors.declarantNom')
      if (!form.declarant_prenom.trim())    e.declarant_prenom    = t('entreprisesForm.errors.declarantPrenom')
      if (!form.declarant_fonction.trim())  e.declarant_fonction  = t('entreprisesForm.errors.declarantFonction')
      if (!form.declarant_telephone.trim()) e.declarant_telephone = t('entreprisesForm.errors.declarantTelephone')
      if (!form.declarant_email.trim())     e.declarant_email     = t('entreprisesForm.errors.declarantEmail')
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.declarant_email)) e.declarant_email = t('entreprisesForm.errors.emailInvalid')
    }
    if (step === 3 && !form.secteur) e.secteur = t('entreprisesForm.errors.secteur')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => { if (validate()) setStep(s => s + 1) }
  const handleBack = () => setStep(s => s - 1)

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      let logo_url = null
      if (logo) {
        const ext = logo.name.split('.').pop()
        const fileName = `entreprises/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, logo, { contentType: logo.type, upsert: false })
        if (uploadError) throw new Error('Erreur lors du téléchargement du logo : ' + uploadError.message)
        const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName)
        logo_url = publicUrl
      }

      const payload = {
        ...form,
        logo_url,
        effectifs: form.effectifs ? Number(form.effectifs) : null,
        capital_social: form.capital_social ? Number(form.capital_social) : null,
        references_techniques: form.references_techniques
          ? form.references_techniques.split('\n').filter(Boolean)
          : [],
        certifications: form.certifications
          ? form.certifications.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      }
      await entreprisesApi.create(payload)
      setSubmitted(true)
    } catch (err) {
      setErrors({ submit: err.message || "Erreur lors de l'enregistrement. Veuillez réessayer." })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return (
    <SuccessScreen
      title={t('entreprisesForm.successTitle')}
      message={`${t('entreprisesForm.reviewNote')} ${form.declarant_email}`}
      onReset={() => { setSubmitted(false); setForm(INITIAL); setStep(0); removeLogo() }}
    />
  )

  return (
    <FormWizard
      title={t('entreprisesForm.title')}
      subtitle={t('entreprisesForm.subtitle')}
      steps={STEPS}
      currentStep={step}
      onBack={handleBack}
      onNext={handleNext}
      onSubmit={handleSubmit}
      loading={loading}
      isFirstStep={step === 0}
      isLastStep={step === STEPS.length - 1}
    >
      {/* ── Étape 0 : Type ── */}
      {step === 0 && (
        <div>
          <SectionTitle title={t('entreprisesForm.step0Title')} desc={t('entreprisesForm.step0Desc')} />
          <div className="flex flex-col gap-2.5">
            {TYPES.map(tp => (
              <SelectCard
                key={tp.label}
                label={tp.label}
                sub={tp.sub}
                selected={form.type === tp.value}
                onClick={() => set('type', tp.value)}
              />
            ))}
          </div>
          {errors.type && <p className="mt-3 text-[13px]" style={{ color: 'var(--koma-red)' }}>{errors.type}</p>}
        </div>
      )}

      {/* ── Étape 1 : Entreprise ── */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <SectionTitle title={t('entreprisesForm.step1Title')} desc={`Enregistrement — ${form.type}`} />

          {/* Logo */}
          <div>
            <span className="flex items-center gap-1 font-sans text-[12px] tracking-[.14em] uppercase font-semibold text-koma-teal mb-2">
              {t('entreprisesForm.logoLabel')}
              <span className="normal-case tracking-normal text-[#8A9A90] font-normal ml-1">{t('entreprisesForm.logoOptional')}</span>
            </span>
            {logoPreview ? (
              <div className="flex items-center gap-4 rounded-[13px] border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3">
                <img src={logoPreview} alt="Logo" className="h-14 w-14 rounded-[10px] object-contain border border-[#e5e7eb] bg-white p-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold text-koma-text truncate">{logo?.name}</p>
                  <p className="text-[12px] text-[#8A9A90]">{logo ? (logo.size / 1024).toFixed(0) + ' Ko' : ''}</p>
                </div>
                <button type="button" onClick={removeLogo} className="flex-shrink-0 text-[#8A9A90] hover:text-koma-red transition-colors text-[13px] font-medium">
                  {t('entreprisesForm.logoRemove')}
                </button>
              </div>
            ) : (
              <label
                htmlFor="logo-upload"
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[13px] border-2 border-dashed border-koma-teal/20 bg-[#f8fafc] px-6 py-6 text-center transition-colors hover:border-koma-teal/40 hover:bg-koma-teal-light"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-koma-teal-light text-koma-teal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                </span>
                <span className="text-[13.5px] text-koma-teal font-medium">{t('entreprisesForm.logoUpload')}</span>
                <span className="text-[12px] text-[#8A9A90]">{t('entreprisesForm.logoHint')}</span>
                <input
                  id="logo-upload"
                  ref={logoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleLogo(e.target.files?.[0])}
                />
              </label>
            )}
            {errors.logo && <p className="mt-1.5 text-[12px]" style={{ color: 'var(--koma-red)' }}>{errors.logo}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={t('entreprisesForm.nom')} required error={errors.nom}>
              <Input placeholder="Entreprise" value={form.nom} onChange={e => set('nom', e.target.value)} error={errors.nom} />
            </FormField>
            <FormField label={t('entreprisesForm.rccm')} hint={t('entreprisesForm.rccmHint')}>
              <Input placeholder="RC/KKY/2023/B/0001" value={form.rccm} onChange={e => set('rccm', e.target.value)} />
            </FormField>
            <FormField label={t('entreprisesForm.nif')} hint={t('entreprisesForm.nifHint')}>
              <Input placeholder="GN-NIF-XXXXXXXX" value={form.nif} onChange={e => set('nif', e.target.value)} />
            </FormField>
            <FormField label={t('entreprisesForm.ville')}>
              <Select value={form.ville} onChange={e => set('ville', e.target.value)}>
                <option value="">{t('entreprisesForm.selectVille')}</option>
                {VILLES_GUINEE.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label={t('entreprisesForm.adresse')}>
            <Input placeholder="Kaloum, Commune de Ratoma..." value={form.adresse} onChange={e => set('adresse', e.target.value)} />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={t('entreprisesForm.telephone')} required error={errors.telephone}>
              <Input type="tel" placeholder="+224 620 000 000" value={form.telephone} onChange={e => set('telephone', e.target.value)} error={errors.telephone} />
            </FormField>
            <FormField label={t('entreprisesForm.email')} required error={errors.email}>
              <Input type="email" placeholder="contact@entreprise.gn" value={form.email} onChange={e => set('email', e.target.value)} error={errors.email} />
            </FormField>
          </div>

          <FormField label={t('entreprisesForm.siteWeb')} hint={t('entreprisesForm.siteWebHint')}>
            <Input type="url" placeholder="https://www.entreprise.gn" value={form.site_web} onChange={e => set('site_web', e.target.value)} />
          </FormField>
        </div>
      )}

      {/* ── Étape 2 : Déclarant ── */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          <SectionTitle title={t('entreprisesForm.step2Title')} desc={t('entreprisesForm.step2Desc')} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={t('entreprisesForm.declarantNom')} required error={errors.declarant_nom}>
              <Input placeholder="DIALLO" value={form.declarant_nom} onChange={e => set('declarant_nom', e.target.value)} error={errors.declarant_nom} />
            </FormField>
            <FormField label={t('entreprisesForm.declarantPrenom')} required error={errors.declarant_prenom}>
              <Input placeholder="Mamadou" value={form.declarant_prenom} onChange={e => set('declarant_prenom', e.target.value)} error={errors.declarant_prenom} />
            </FormField>
          </div>

          <FormField label={t('entreprisesForm.declarantFonction')} required error={errors.declarant_fonction}>
            <Input placeholder="Directeur Général, Responsable Administratif..." value={form.declarant_fonction} onChange={e => set('declarant_fonction', e.target.value)} error={errors.declarant_fonction} />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={t('entreprisesForm.declarantTelephone')} required error={errors.declarant_telephone}>
              <Input type="tel" placeholder="+224 620 000 000" value={form.declarant_telephone} onChange={e => set('declarant_telephone', e.target.value)} error={errors.declarant_telephone} />
            </FormField>
            <FormField label={t('entreprisesForm.declarantEmail')} required error={errors.declarant_email}>
              <Input type="email" placeholder="declarant@entreprise.gn" value={form.declarant_email} onChange={e => set('declarant_email', e.target.value)} error={errors.declarant_email} />
            </FormField>
          </div>

          <div className="flex items-start gap-3 rounded-[12px] border border-koma-teal/25 p-4" style={{ background: 'var(--koma-teal-light)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--koma-teal)" strokeWidth="2" className="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
            <p className="text-[13px] text-koma-teal leading-relaxed">
              {t('entreprisesForm.declarantNote')}
            </p>
          </div>
        </div>
      )}

      {/* ── Étape 3 : Capacités ── */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
          <SectionTitle title={t('entreprisesForm.step3Title')} desc={t('entreprisesForm.step3Desc')} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField label={t('entreprisesForm.secteur')} required error={errors.secteur}>
              <Select value={form.secteur} onChange={e => set('secteur', e.target.value)} error={errors.secteur}>
                <option value="">{t('entreprisesForm.selectSecteur')}</option>
                {SECTEURS.map(s => <option key={s} value={s}>{tEnum(t, SECTEURS_ENT, s)}</option>)}
              </Select>
            </FormField>
            <FormField label={t('entreprisesForm.effectifs')} hint={t('entreprisesForm.effectifsHint')}>
              <Input type="number" min="1" placeholder="150" value={form.effectifs} onChange={e => set('effectifs', e.target.value)} />
            </FormField>
            <FormField label={t('entreprisesForm.capital')} hint={t('entreprisesForm.capitalHint')}>
              <Input type="number" min="0" placeholder="500 000 000" value={form.capital_social} onChange={e => set('capital_social', e.target.value)} />
            </FormField>
          </div>

          <FormField label="Description de l'entreprise" hint="Activités principales, domaine d'expertise, zones d'intervention…">
            <Textarea
              placeholder="Décrivez les activités principales, le domaine d'expertise et les zones d'intervention de votre entreprise…"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
            />
          </FormField>

          <FormField label={t('entreprisesForm.references')} hint={t('entreprisesForm.referencesHint')}>
            <Textarea
              placeholder={"Intitulé du projet — Année — Maître d'ouvrage\nIntitulé du projet — Phase — Donneur d'ordre"}
              value={form.references_techniques}
              onChange={e => set('references_techniques', e.target.value)}
            />
          </FormField>

          <FormField label={t('entreprisesForm.certifications')} hint={t('entreprisesForm.certificationsHint')}>
            <Input placeholder="ISO 9001, ISO 14001, OHSAS 18001..." value={form.certifications} onChange={e => set('certifications', e.target.value)} />
          </FormField>

          <button
            type="button"
            onClick={() => set('experience_simandou', !form.experience_simandou)}
            className={`w-full text-left flex items-start gap-4 rounded-[14px] border-2 p-4 transition-all ${
              form.experience_simandou
                ? 'border-koma-teal bg-koma-teal-light'
                : 'border-[#e5e7eb] bg-[#f8fafc] hover:border-koma-teal/40'
            }`}
          >
            <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${
              form.experience_simandou ? 'bg-koma-teal border-koma-teal' : 'border-koma-teal/30'
            }`}>
              {form.experience_simandou && (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="h-3 w-3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </div>
            <div>
              <p className={`text-[14px] font-semibold leading-snug ${form.experience_simandou ? 'text-koma-teal' : 'text-koma-text'}`}>
                {t('entreprisesForm.simandouExp')}
              </p>
              <p className="text-[12.5px] text-[#8A9A90] mt-0.5 leading-relaxed">
                Chemin de fer, port, mine, infrastructures associées, sous-traitance, etc.
              </p>
            </div>
          </button>
        </div>
      )}

      {/* ── Étape 4 : Confirmation ── */}
      {step === 4 && (
        <div>
          <SectionTitle title={t('entreprisesForm.step4Title')} desc={t('entreprisesForm.step4Desc')} />
          <div className="rounded-[14px] bg-koma-gray border border-[#e5e7eb] overflow-hidden mb-3">
            <div className="px-5 py-2 bg-[#f8fafc] border-b border-[#e5e7eb]">
              <span className="text-[11px] tracking-[.12em] uppercase font-semibold text-koma-teal/60 font-sans">{t('entreprisesForm.recapEntreprise')}</span>
            </div>
            {[
              { label: 'Type',                        value: form.type },
              { label: t('entreprisesForm.nom'),      value: form.nom },
              { label: 'RCCM',                        value: form.rccm || '—' },
              { label: 'NIF',                         value: form.nif || '—' },
              { label: t('entreprisesForm.ville'),    value: form.ville || '—' },
              { label: t('entreprisesForm.telephone'),value: form.telephone },
              { label: t('entreprisesForm.email'),    value: form.email },
              { label: 'Expérience Simandou',         value: form.experience_simandou ? '✓ Oui' : 'Non' },
              ...(logo ? [{ label: 'Logo', value: logo.name }] : []),
            ].map(row => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 px-5 py-3 border-b border-[#f3f4f6] last:border-0">
                <span className="text-[12px] tracking-[.1em] uppercase font-semibold text-koma-teal font-sans flex-shrink-0">{row.label}</span>
                <span className="text-[14.5px] text-koma-text text-right">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="rounded-[14px] bg-koma-gray border border-[#e5e7eb] overflow-hidden mb-4">
            <div className="px-5 py-2 bg-[#f8fafc] border-b border-[#e5e7eb]">
              <span className="text-[11px] tracking-[.12em] uppercase font-semibold text-koma-teal/60 font-sans">{t('entreprisesForm.recapDeclarant')}</span>
            </div>
            {[
              { label: t('entreprisesForm.declarantNom'),      value: `${form.declarant_prenom} ${form.declarant_nom}` },
              { label: t('entreprisesForm.declarantFonction'), value: form.declarant_fonction },
              { label: t('entreprisesForm.declarantTelephone'),value: form.declarant_telephone },
              { label: t('entreprisesForm.declarantEmail'),    value: form.declarant_email },
            ].map(row => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 px-5 py-3 border-b border-[#f3f4f6] last:border-0">
                <span className="text-[12px] tracking-[.1em] uppercase font-semibold text-koma-teal font-sans flex-shrink-0">{row.label}</span>
                <span className="text-[14.5px] text-koma-text text-right">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 rounded-[12px] border border-koma-teal/25 p-4" style={{ background: 'var(--koma-teal-light)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--koma-teal)" strokeWidth="2" className="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
            <p className="text-[13px] text-koma-teal leading-relaxed">
              {t('entreprisesForm.reviewNote')} <strong>{form.declarant_email}</strong>.
            </p>
          </div>

          {errors.submit && (
            <div className="mt-4 flex items-start gap-3 rounded-[12px] p-4" style={{ border: '1px solid rgba(214,62,68,.3)', background: 'rgba(214,62,68,.06)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--koma-red)" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--koma-red)' }}>{errors.submit}</p>
            </div>
          )}
        </div>
      )}
    </FormWizard>
  )
}
