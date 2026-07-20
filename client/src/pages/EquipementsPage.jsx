import { useEffect, useRef, useState } from 'react'
import { Search, MapPin, List, X, Phone, Mail, Building2, Package, Calendar, Hash, DollarSign, Star } from 'lucide-react'
import { equipementsApi } from '../lib/api'
import { useTranslation } from 'react-i18next'
import { tEnum, CATEGORIES_EQ, ETATS_EQ } from '../lib/enumTranslations'

function EquipementModal({ eq, onClose, t }) {
  if (!eq) return null
  const etatInfo = ETAT_COLORS[eq.etat] || ETAT_COLORS.bon
  const entrepriseNom = eq.entreprises?.nom || eq.entreprise_nom || ''
  const tel  = eq.entreprises?.telephone || eq.entreprise_tel || ''
  const mail = eq.entreprises?.email || ''

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(11,30,22,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.25)', position: 'relative' }}>

        {/* Photo */}
        {eq.photo_url ? (
          <div style={{ height: 200, borderRadius: '20px 20px 0 0', overflow: 'hidden' }}>
            <img src={eq.photo_url} alt={eq.marque_modele} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ) : null}

        <button onClick={onClose} style={{ position: 'absolute', top: eq.photo_url ? 12 : 14, right: 14, background: eq.photo_url ? 'rgba(0,0,0,.4)' : '#f0f4f2', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex', zIndex: 1 }}>
          <X size={16} color={eq.photo_url ? '#fff' : '#5A6A60'} />
        </button>

        <div style={{ padding: '24px 28px 28px' }}>
          {/* Header */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <span style={{ background: etatInfo.bg, color: etatInfo.text, borderRadius: 50, padding: '3px 11px', fontSize: 11.5, fontWeight: 700 }}>{etatInfo.label}</span>
              <span style={{ background: eq.disponible ? '#E1F5EE' : '#FCEBEB', color: eq.disponible ? '#0F6E56' : '#A32D2D', borderRadius: 50, padding: '3px 11px', fontSize: 11.5, fontWeight: 700 }}>
                {eq.disponible ? '✓ ' + t('equipements.disponible') : '✗ ' + t('equipements.indisponible')}
              </span>
              {eq.quantite > 1 && (
                <span style={{ background: '#F0F4F2', color: '#46564C', borderRadius: 50, padding: '3px 11px', fontSize: 11.5, fontWeight: 600 }}>Qté : {eq.quantite}</span>
              )}
            </div>
            <p style={{ margin: '0 0 2px', fontSize: 12, fontWeight: 700, color: '#B07B30', textTransform: 'uppercase', letterSpacing: '.08em' }}>{tEnum(t, CATEGORIES_EQ, eq.categorie)}</p>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0D3A29', fontFamily: 'var(--font-heading)', lineHeight: 1.2 }}>{eq.marque_modele}</h2>
          </div>

          {/* Description */}
          {eq.description && (
            <div style={{ background: '#F5F8F6', borderRadius: 12, padding: '12px 16px', marginBottom: 18 }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#8A9A90', textTransform: 'uppercase', letterSpacing: '.06em' }}>Description</p>
              <p style={{ margin: 0, fontSize: 13.5, color: '#2D3A32', lineHeight: 1.7 }}>{eq.description}</p>
            </div>
          )}

          {/* Infos grille */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            {[
              { icon: Calendar,  label: 'Mise en service', value: eq.annee_mise_en_service },
              { icon: Hash,      label: 'N° de série',     value: eq.numero_serie },
              { icon: DollarSign,label: 'Valeur estimée',  value: eq.valeur_estimee ? Number(eq.valeur_estimee).toLocaleString('fr-FR') + ' USD' : null },
              { icon: MapPin,    label: 'Localisation',    value: eq.localisation_texte },
            ].filter(r => r.value).map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ background: '#F5F8F6', borderRadius: 10, padding: '10px 13px', display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                <Icon size={14} color="#5A9A80" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, color: '#8A9A90', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: '#0D3A29', fontWeight: 600 }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Entreprise propriétaire */}
          {entrepriseNom && (
            <div style={{ border: '1.5px solid #E0EDE5', borderRadius: 13, padding: '14px 16px', marginBottom: 16 }}>
              <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#8A9A90', textTransform: 'uppercase', letterSpacing: '.06em' }}>Entreprise propriétaire</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building2 size={18} color="#0F6E56" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0D3A29' }}>{entrepriseNom}</p>
                  {eq.entreprises?.experience_simandou && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#92400E', background: '#FEF3E0', borderRadius: 20, padding: '2px 8px', marginTop: 3 }}>
                      <Star size={10} fill="#92400E" /> Partenaire Simandou
                    </span>
                  )}
                </div>
              </div>
              {(tel || mail) && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  {tel && (
                    <a href={`tel:${tel}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0D3A29', color: '#fff', padding: '7px 14px', borderRadius: 50, fontSize: 12.5, fontWeight: 700, textDecoration: 'none' }}>
                      <Phone size={13} /> {tel}
                    </a>
                  )}
                  {mail && (
                    <a href={`mailto:${mail}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F0F4F2', color: '#0D3A29', border: '1.5px solid #C5D5CC', padding: '7px 14px', borderRadius: 50, fontSize: 12.5, fontWeight: 700, textDecoration: 'none' }}>
                      <Mail size={13} /> Email
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const CATEGORIES = ['Toutes', 'Engins de terrassement', 'Grues', 'Camions', 'Équipements miniers', 'Équipements portuaires', 'Compacteurs']

const ETAT_COLORS = {
  neuf:        { bg: '#E1F5EE', text: '#0F6E56', label: 'Neuf' },
  bon:         { bg: '#E6F1FB', text: '#185FA5', label: 'Bon état' },
  moyen:       { bg: '#FAEEDA', text: '#854F0B', label: 'État moyen' },
  hors_service:{ bg: '#FCEBEB', text: '#A32D2D', label: 'Hors service' },
}

export default function EquipementsPage() {
  const mapRef    = useRef(null)
  const leafletRef = useRef(null)
  const markersRef = useRef([])
  const [view, setView]         = useState('map')
  const [equipements, setEquipements] = useState([])
  const [search, setSearch]     = useState('')
  const [catFilter, setCatFilter] = useState('Toutes')
  const [dispoFilter, setDispoFilter] = useState('tous')
  const [selected, setSelected] = useState(null)
  const [modalEq, setModalEq]   = useState(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const { t } = useTranslation()

  // ── Charger données API ─────────────────────────────────────
  useEffect(() => {
    equipementsApi.getAll({ limit: 5000, statut: 'actif' })
      .then(res => setEquipements(res?.data || []))
      .catch(() => setEquipements([]))
  }, [])

  // ── Initialiser Leaflet ───────────────────────────────────
  useEffect(() => {
    if (view !== 'map') return
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }
    if (!window.L) {
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = () => setLeafletLoaded(true)
      document.head.appendChild(script)
    } else {
      setLeafletLoaded(true)
    }
  }, [view])

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || leafletRef.current) return
    const L = window.L
    const map = L.map(mapRef.current, { center: [10.5, -12.5], zoom: 7, zoomControl: true })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map)
    leafletRef.current = map
    addMarkers(map, filteredEquipements)
  }, [leafletLoaded])

  // ── Filtrage ──────────────────────────────────────────────
  const filteredEquipements = equipements.filter(e => {
    const matchSearch = e.marque_modele?.toLowerCase().includes(search.toLowerCase()) ||
                        e.localisation_texte?.toLowerCase().includes(search.toLowerCase())
    const matchCat    = catFilter === 'Toutes' || e.categorie === catFilter
    const matchDispo  = dispoFilter === 'tous' || (dispoFilter === 'dispo' ? e.disponible : !e.disponible)
    return matchSearch && matchCat && matchDispo
  })

  // ── Mettre à jour les marqueurs ───────────────────────────
  useEffect(() => {
    if (!leafletRef.current || !window.L) return
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    addMarkers(leafletRef.current, filteredEquipements)
  }, [filteredEquipements])

  function addMarkers(map, data) {
    const L = window.L
    const lblDispo  = t('equipements.disponible')
    const lblNdispo = t('equipements.indisponible')
    const ETAT_LABELS = { neuf: t('enums.etats.neuf'), bon: t('enums.etats.bon'), moyen: t('enums.etats.moyen'), hors_service: t('enums.etats.hors_service') }
    const ETAT_COLORS_MAP = { neuf: '#0F6E56', bon: '#185FA5', moyen: '#854F0B', hors_service: '#A32D2D' }
    const ETAT_BG_MAP    = { neuf: '#E1F5EE', bon: '#E6F1FB', moyen: '#FAEEDA', hors_service: '#FCEBEB' }
    data.forEach(eq => {
      if (!eq.latitude || !eq.longitude) return
      const color = eq.disponible ? '#0D3A29' : '#B23A2E'
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${color};border:2.5px solid white;box-shadow:0 3px 10px rgba(0,0,0,.3);transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;">
          <div style="transform:rotate(45deg);width:8px;height:8px;background:rgba(255,255,255,.6);border-radius:50%;"></div>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      })
      const entrepriseNom = eq.entreprises?.nom || eq.entreprise_nom || ''
      const tel  = eq.entreprises?.telephone || eq.entreprise_tel || ''
      const mail = eq.entreprises?.email || ''
      const etat = eq.etat || 'bon'
      const valeur = eq.valeur_estimee ? Number(eq.valeur_estimee).toLocaleString('fr-FR') + ' USD' : ''
      const marker = L.marker([eq.latitude, eq.longitude], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:'Archivo',sans-serif;min-width:240px;max-width:300px">
            <div style="font-weight:700;font-size:14.5px;color:#0D3A29;margin-bottom:2px;line-height:1.3">${eq.marque_modele}</div>
            <div style="font-size:11.5px;color:#5A6A60;margin-bottom:8px">${tEnum(t, CATEGORIES_EQ, eq.categorie)}${eq.annee_mise_en_service ? ' · ' + eq.annee_mise_en_service : ''}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
              <span style="background:${eq.disponible ? '#E1F5EE' : '#FCEBEB'};color:${eq.disponible ? '#0F6E56' : '#A32D2D'};padding:3px 9px;border-radius:12px;font-size:11px;font-weight:700">
                ${eq.disponible ? '✓ ' + lblDispo : '✗ ' + lblNdispo}
              </span>
              <span style="background:${ETAT_BG_MAP[etat]};color:${ETAT_COLORS_MAP[etat]};padding:3px 9px;border-radius:12px;font-size:11px;font-weight:600">
                ${ETAT_LABELS[etat] || etat}
              </span>
              ${eq.quantite > 1 ? `<span style="background:#F0F4F2;color:#46564C;padding:3px 9px;border-radius:12px;font-size:11px;font-weight:600">Qté : ${eq.quantite}</span>` : ''}
            </div>
            <div style="border-top:1px solid #eee;padding-top:8px;display:flex;flex-direction:column;gap:4px">
              ${eq.localisation_texte ? `<div style="font-size:12px;color:#5A6A60">📍 ${eq.localisation_texte}</div>` : ''}
              ${entrepriseNom ? `<div style="font-size:12px;color:#5A6A60">🏢 ${entrepriseNom}</div>` : ''}
              ${valeur ? `<div style="font-size:12px;color:#5A6A60">💰 Valeur estimée : <strong>${valeur}</strong></div>` : ''}
              ${eq.numero_serie ? `<div style="font-size:11px;color:#8A9A90">N° série : ${eq.numero_serie}</div>` : ''}
            </div>
            ${tel || mail ? `
            <div style="border-top:1px solid #eee;margin-top:8px;padding-top:8px;display:flex;gap:8px;flex-wrap:wrap">
              ${tel ? `<a href="tel:${tel}" style="display:inline-flex;align-items:center;gap:4px;background:#0D3A29;color:#fff;padding:5px 12px;border-radius:20px;font-size:11.5px;font-weight:600;text-decoration:none">📞 ${tel}</a>` : ''}
              ${mail ? `<a href="mailto:${mail}" style="display:inline-flex;align-items:center;gap:4px;background:#F0F4F2;color:#0D3A29;padding:5px 12px;border-radius:20px;font-size:11.5px;font-weight:600;text-decoration:none;border:1px solid #C5D5CC">✉ Email</a>` : ''}
            </div>` : ''}
          </div>
        `, { maxWidth: 320 })
      markersRef.current.push(marker)
    })
  }

  const DISPO_FILTERS = [
    ['tous',   t('equipements.tous')],
    ['dispo',  t('equipements.available')],
    ['indispo',t('equipements.unavailable')],
  ]

  return (
    <div className="flex flex-col h-screen bg-bone overflow-hidden">
      {/* ── Topbar ── */}
      <div className="flex-shrink-0 border-b border-pine/10 bg-paper px-3 md:px-6 py-3">
        <div className="mx-auto max-w-[1400px] flex flex-wrap items-center gap-2 md:gap-3">
          <div>
            <span className="text-[11px] tracking-widest uppercase font-semibold text-gold-deep font-sans">{t('equipements.eyebrow')}</span>
            <h1 className="font-serif text-[20px] text-pine leading-tight">{t('equipements.title')}</h1>
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs ml-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9A90]" />
            <input
              type="text"
              placeholder={t('equipements.search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-[9px] border border-pine/14 bg-bone pl-8 pr-3 py-2 text-[13px] focus:outline-none focus:border-pine transition"
            />
          </div>

          {/* Category filter */}
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="rounded-[9px] border border-pine/14 bg-bone px-3 py-2 text-[13px] focus:outline-none focus:border-pine transition cursor-pointer"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Dispo filter */}
          <div className="flex rounded-[9px] border border-pine/14 overflow-hidden">
            {DISPO_FILTERS.map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => setDispoFilter(val)}
                className={`px-3 py-2 text-[12.5px] font-medium font-sans transition-colors ${dispoFilter === val ? 'bg-pine text-bone' : 'bg-bone text-pine hover:bg-pine/8'}`}
              >
                {lbl}
              </button>
            ))}
          </div>

          {/* Map / List toggle */}
          <div className="flex rounded-[9px] border border-pine/14 overflow-hidden">
            <button onClick={() => setView('map')}  className={`px-3 py-2 transition-colors ${view==='map'  ? 'bg-pine text-gold-soft' : 'bg-bone text-pine hover:bg-pine/8'}`}><MapPin size={16} /></button>
            <button onClick={() => setView('list')} className={`px-3 py-2 transition-colors ${view==='list' ? 'bg-pine text-gold-soft' : 'bg-bone text-pine hover:bg-pine/8'}`}><List size={16} /></button>
          </div>

          <span className="text-[12px] text-[#8A9A90] ml-1">{filteredEquipements.length} équipement{filteredEquipements.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Carte Leaflet ── */}
        {view === 'map' && (
          <>
            <div ref={mapRef} className="flex-1 z-0" style={{ minHeight: 0 }}>
              {!leafletLoaded && (
                <div className="flex h-full items-center justify-center text-[#8A9A90] text-[14px] gap-3">
                  <span className="h-5 w-5 border-2 border-pine/20 border-t-pine rounded-full animate-spin" />
                  {t('equipements.loadingMap')}
                </div>
              )}
            </div>

            {/* Sidebar liste (panneau latéral) */}
            <div className="hidden md:block w-72 flex-shrink-0 border-l border-pine/10 bg-paper overflow-y-auto">
              <div className="p-4 border-b border-pine/10">
                <p className="text-[12px] tracking-wide uppercase text-gold-deep font-semibold font-sans">
                  {filteredEquipements.length} équipement{filteredEquipements.length !== 1 ? 's' : ''}
                </p>
              </div>
              {filteredEquipements.map(eq => {
                const etatInfo = ETAT_COLORS[eq.etat] || ETAT_COLORS.bon
                const entrepriseNom = eq.entreprises?.nom || eq.entreprise_nom || ''
                const tel = eq.entreprises?.telephone || eq.entreprise_tel || ''
                return (
                  <button
                    key={eq.id}
                    onClick={() => {
                      setSelected(eq)
                      if (leafletRef.current && eq.latitude) {
                        leafletRef.current.setView([eq.latitude, eq.longitude], 12)
                      }
                    }}
                    className={`w-full text-left px-4 py-4 border-b border-pine/8 transition-colors hover:bg-pine/4 ${selected?.id === eq.id ? 'bg-pine/6' : ''}`}
                  >
                    <p className="text-[13.5px] font-semibold text-pine leading-tight mb-0.5">{eq.marque_modele}</p>
                    <p className="text-[11.5px] text-[#5A6A60] mb-2">{tEnum(t, CATEGORIES_EQ, eq.categorie)}{eq.annee_mise_en_service ? ` · ${eq.annee_mise_en_service}` : ''}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${eq.disponible ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FCEBEB] text-[#A32D2D]'}`}>
                        {eq.disponible ? t('equipements.disponible') : t('equipements.indisponible')}
                      </span>
                      <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{ background: etatInfo.bg, color: etatInfo.text }}>
                        {etatInfo.label}
                      </span>
                      {eq.quantite > 1 && <span className="text-[10.5px] text-[#8A9A90]">× {eq.quantite}</span>}
                    </div>
                    {entrepriseNom && <p className="text-[11px] text-[#5A6A60] mb-0.5">🏢 {entrepriseNom}</p>}
                    {eq.localisation_texte && <p className="text-[11px] text-[#8A9A90]">📍 {eq.localisation_texte}</p>}
                    {tel && <p className="mt-1 text-[11px] font-semibold text-[#0D3A29]">📞 {tel}</p>}
                    {eq.valeur_estimee && (
                      <p className="mt-1 text-[11px] text-[#5A6A60]">💰 {Number(eq.valeur_estimee).toLocaleString('fr-FR')} USD</p>
                    )}
                    <button
                      onClick={ev => { ev.stopPropagation(); setModalEq(eq) }}
                      className="mt-2 text-[11px] font-semibold text-koma-teal underline underline-offset-2"
                    >
                      Voir les détails →
                    </button>
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* ── Vue liste ── */}
        {view === 'list' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-[1200px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEquipements.map(eq => {
                  const etatInfo = ETAT_COLORS[eq.etat] || ETAT_COLORS.bon
                  const entrepriseNom = eq.entreprises?.nom || eq.entreprise_nom || ''
                  const tel  = eq.entreprises?.telephone || eq.entreprise_tel || ''
                  const mail = eq.entreprises?.email || ''
                  return (
                    <div key={eq.id} className="rounded-[14px] border border-pine/14 bg-paper hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer" onClick={() => setModalEq(eq)}>
                      {/* Photo */}
                      {eq.photo_url && (
                        <img src={eq.photo_url} alt={eq.marque_modele} className="w-full h-40 object-cover" />
                      )}

                      <div className="p-5 flex flex-col flex-1">
                        {/* Header : catégorie + état */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[11px] font-semibold tracking-wide uppercase text-gold-deep font-sans leading-tight">{tEnum(t, CATEGORIES_EQ, eq.categorie)}</span>
                          <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: etatInfo.bg, color: etatInfo.text }}>
                            {etatInfo.label}
                          </span>
                        </div>

                        {/* Titre + année */}
                        <h3 className="font-serif text-[17px] text-pine leading-tight mb-0.5 hover:text-koma-teal underline-offset-2 hover:underline transition-colors">{eq.marque_modele}</h3>
                        {eq.annee_mise_en_service && (
                          <p className="text-[12px] text-[#8A9A90] mb-2">Mise en service : {eq.annee_mise_en_service}</p>
                        )}

                        {/* Entreprise propriétaire */}
                        {entrepriseNom && (
                          <p className="text-[12.5px] text-[#5A6A60] mb-3">🏢 {entrepriseNom}</p>
                        )}

                        {/* Badges disponibilité + quantité */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${eq.disponible ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FCEBEB] text-[#A32D2D]'}`}>
                            {eq.disponible ? '✓ ' + t('equipements.disponible') : '✗ ' + t('equipements.indisponible')}
                          </span>
                          <span className="bg-pine/8 text-pine text-[11px] font-medium px-2.5 py-1 rounded-full">{t('equipements.qty')} : {eq.quantite}</span>
                        </div>

                        {/* Infos détaillées */}
                        <div className="flex flex-col gap-1.5 mb-3 text-[12px] text-[#5A6A60]">
                          {eq.localisation_texte && <span>📍 {eq.localisation_texte}</span>}
                          {eq.valeur_estimee && (
                            <span>💰 Valeur estimée : <strong className="text-pine">{Number(eq.valeur_estimee).toLocaleString('fr-FR')} USD</strong></span>
                          )}
                          {eq.numero_serie && <span className="text-[11px] text-[#8A9A90]">N° série : {eq.numero_serie}</span>}
                        </div>

                        {/* Contact */}
                        {(tel || mail) && (
                          <div className="mt-auto pt-3 border-t border-pine/8 flex flex-wrap gap-2">
                            {tel && (
                              <a href={`tel:${tel}`} onClick={ev => ev.stopPropagation()} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#0D3A29] rounded-full px-3 py-1.5 hover:bg-[#0a2e21] transition-colors" style={{ textDecoration: 'none' }}>
                                📞 {tel}
                              </a>
                            )}
                            {mail && (
                              <a href={`mailto:${mail}`} onClick={ev => ev.stopPropagation()} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-pine border border-pine/20 bg-pine/5 rounded-full px-3 py-1.5 hover:bg-pine/10 transition-colors" style={{ textDecoration: 'none' }}>
                                ✉ Email
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {filteredEquipements.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-[#8A9A90] text-center">
                  <MapPin size={48} className="mb-4 opacity-20" />
                  <p className="text-[15px]">{t('equipements.empty')}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <EquipementModal eq={modalEq} onClose={() => setModalEq(null)} t={t} />
    </div>
  )
}
