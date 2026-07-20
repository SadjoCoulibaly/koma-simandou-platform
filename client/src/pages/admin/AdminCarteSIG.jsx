import { useEffect, useRef, useState, useMemo } from 'react'
import { Search, MapPin, List, RefreshCw, AlertCircle } from 'lucide-react'
import { equipementsApi } from '../../lib/api'
import { StatutBadge } from '../../components/admin/AdminTable'

const CATEGORIES = ['Toutes', 'Engins de terrassement', 'Grues', 'Camions', 'Équipements miniers', 'Équipements portuaires', 'Compacteurs', 'Matériels ferroviaires', 'Centrales à béton', 'Véhicules spécialisés', 'Autre']

const CAT_ICONS = {
  'Engins de terrassement': '🚜',
  'Grues':                  '🏗️',
  'Camions':                '🚛',
  'Équipements miniers':    '⛏️',
  'Équipements portuaires': '⚓',
  'Compacteurs':            '🚧',
  'Matériels ferroviaires': '🚂',
  'Centrales à béton':      '🏭',
  'Véhicules spécialisés':  '🚗',
  'Autre':                  '🔧',
}

const STATUT_COLORS  = { actif: '#0D3A29', en_attente: '#00798C', suspendu: '#B23A2E' }
const STATUT_LABELS  = { actif: 'Validé', en_attente: 'En attente', suspendu: 'Suspendu' }
const ETAT_LABELS    = { neuf: 'Neuf', bon: 'Bon état', moyen: 'État moyen', hors_service: 'Hors service' }

function buildIcon(L, eq) {
  const color = STATUT_COLORS[eq.statut] || '#0D3A29'
  const emoji = CAT_ICONS[eq.categorie] || '🔧'
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:42px;height:42px;">
        <div style="
          width:42px;height:42px;border-radius:12px 12px 12px 2px;
          background:white;
          border:2.5px solid ${color};
          box-shadow:0 4px 14px rgba(0,0,0,.28);
          display:flex;align-items:center;justify-content:center;
          font-size:20px;line-height:1;
        ">${emoji}</div>
        <div style="
          position:absolute;bottom:-6px;left:3px;
          width:0;height:0;
          border-left:5px solid transparent;
          border-right:5px solid transparent;
          border-top:7px solid ${color};
        "></div>
      </div>`,
    iconSize:   [42, 48],
    iconAnchor: [21, 48],
    popupAnchor:[0, -50],
  })
}

function buildPopup(eq) {
  const emoji      = CAT_ICONS[eq.categorie] || '🔧'
  const etatLbl    = ETAT_LABELS[eq.etat]    || eq.etat || '—'
  const entreprise = eq.entreprises || {}
  const nomProp    = eq.entreprise_nom || entreprise.nom || null
  const tel        = eq.entreprise_tel || entreprise.telephone || null
  const email      = entreprise.email || null

  const row = (label, value) => (value != null && value !== '')
    ? `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:5px 0;border-bottom:1px solid #F0F1F4;font-size:12.5px">
         <span style="color:#8A9A90;font-weight:500;flex-shrink:0;margin-right:12px">${label}</span>
         <span style="color:#0D1B2E;font-weight:600;text-align:right;max-width:160px;word-break:break-word">${value}</span>
       </div>`
    : ''

  return `
    <div style="font-family:'Inter',sans-serif;width:300px;padding:2px 0;">

      ${eq.photo_url ? `
      <div style="margin-bottom:12px;border-radius:10px;overflow:hidden;height:120px;background:#F5F6F9">
        <img src="${eq.photo_url}" alt="${eq.marque_modele || 'Équipement'}" style="width:100%;height:100%;object-fit:cover;display:block" />
      </div>` : ''}

      <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;padding-bottom:10px;border-bottom:2px solid #F0F1F4">
        <span style="font-size:26px;line-height:1;flex-shrink:0;margin-top:2px">${emoji}</span>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:15px;color:#0D1B2E;line-height:1.25;word-break:break-word">${eq.marque_modele || '—'}</div>
          <div style="font-size:12px;color:#5A6A60;margin-top:2px">${eq.categorie || '—'}</div>
        </div>
      </div>

      <div style="margin-bottom:10px">
        ${row('État', etatLbl)}
        ${row('Disponibilité', eq.disponible != null ? (eq.disponible ? '✅ Disponible' : '❌ Indisponible') : null)}
        ${row('Quantité', eq.quantite != null ? `${Number(eq.quantite).toLocaleString('fr-FR')} unité${Number(eq.quantite) > 1 ? 's' : ''}` : '1 unité')}
        ${row('Année mise en service', eq.annee_mise_en_service || null)}
        ${row('N° de série', eq.numero_serie || null)}
        ${row('Propriétaire', nomProp)}
        ${row('Localisation', eq.localisation_texte || null)}
      </div>

      ${(tel || email) ? `
      <div style="display:flex;gap:6px;margin-top:4px">
        ${tel   ? `<a href="tel:${tel}" style="flex:1;text-align:center;background:#00798C;color:white;text-decoration:none;border-radius:8px;padding:7px 0;font-size:12px;font-weight:700">📞 Appeler</a>` : ''}
        ${email ? `<a href="mailto:${email}" style="flex:1;text-align:center;background:#00263B;color:white;text-decoration:none;border-radius:8px;padding:7px 0;font-size:12px;font-weight:700">✉️ Contacter</a>` : ''}
      </div>` : ''}
    </div>`
}

export default function AdminCarteSIG() {
  const mapRef      = useRef(null)
  const leafletRef  = useRef(null)
  const markersRef  = useRef([])
  const [view, setView]                 = useState('map')
  const [equipements, setEquipements]   = useState([])
  const [search, setSearch]             = useState('')
  const [catFilter, setCatFilter]       = useState('Toutes')
  const [statutFilter, setStatutFilter] = useState('tous')
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [loading, setLoading]           = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await equipementsApi.getAll({ limit: 10000 })
      setEquipements(res.data || [])
    } catch { setEquipements([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'; link.rel = 'stylesheet'
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
  }, [])

  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || leafletRef.current) return
    const L = window.L
    const map = L.map(mapRef.current, { center: [10.5, -12.5], zoom: 7 })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 18,
    }).addTo(map)
    leafletRef.current = map
  }, [leafletLoaded])

  useEffect(() => {
    if (view === 'map' && leafletRef.current) {
      setTimeout(() => leafletRef.current.invalidateSize(), 50)
    }
  }, [view])

  const filtered = useMemo(() => equipements.filter(e => {
    const q = search.toLowerCase()
    const matchSearch  = e.marque_modele?.toLowerCase().includes(q) || e.localisation_texte?.toLowerCase().includes(q)
    const matchCat     = catFilter === 'Toutes' || e.categorie === catFilter
    const matchStatut  = statutFilter === 'tous' || e.statut === statutFilter
    return matchSearch && matchCat && matchStatut
  }), [equipements, search, catFilter, statutFilter])

  const hasCoords = (e) => {
    const lat = parseFloat(e.latitude)
    const lng = parseFloat(e.longitude)
    return e.latitude != null && e.longitude != null && !isNaN(lat) && !isNaN(lng)
  }
  const withCoords    = useMemo(() => filtered.filter(hasCoords),        [filtered])
  const withoutCoords = useMemo(() => filtered.filter(e => !hasCoords(e)), [filtered])

  useEffect(() => {
    if (!leafletRef.current || !window.L) return
    const L = window.L
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    withCoords.forEach(eq => {
      const marker = L.marker(
        [parseFloat(eq.latitude), parseFloat(eq.longitude)],
        { icon: buildIcon(L, eq) }
      )
        .addTo(leafletRef.current)
        .bindPopup(buildPopup(eq), { maxWidth: 320, className: 'sig-popup' })
      markersRef.current.push(marker)
    })
  }, [withCoords, leafletLoaded])

  useEffect(() => {
    return () => {
      if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null }
    }
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="flex-shrink-0 flex flex-wrap items-center gap-3 border-b border-pine/10 bg-paper px-6 py-3">
        <span className="eyebrow">Carte SIG</span>
        <div className="relative ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9A90]" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
            className="rounded-[9px] border border-pine/14 bg-bone pl-8 pr-3 py-2 text-[13px] w-44 focus:outline-none focus:border-pine" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="rounded-[9px] border border-pine/14 bg-bone px-3 py-2 text-[13px] cursor-pointer focus:outline-none">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex rounded-[9px] border border-pine/14 overflow-hidden">
          {[['tous','Tous'],['actif','Actifs'],['en_attente','En attente']].map(([v,l]) => (
            <button key={v} onClick={() => setStatutFilter(v)}
              className={`px-3 py-2 text-[12px] font-medium font-sans transition-colors ${statutFilter===v?'bg-pine text-bone':'bg-paper text-pine hover:bg-pine/8'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex rounded-[9px] border border-pine/14 overflow-hidden">
          <button onClick={() => setView('map')}  className={`px-3 py-2 transition-colors ${view==='map'  ?'bg-pine text-gold-soft':'bg-paper text-pine hover:bg-pine/8'}`}><MapPin size={15} /></button>
          <button onClick={() => setView('list')} className={`px-3 py-2 transition-colors ${view==='list' ?'bg-pine text-gold-soft':'bg-paper text-pine hover:bg-pine/8'}`}><List size={15} /></button>
        </div>
        <button onClick={load} className="h-8 w-8 rounded-[9px] border border-pine/14 flex items-center justify-center text-pine hover:bg-pine/8 transition-colors" title="Actualiser">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
        <span className="text-[12px] text-[#8A9A90]">{filtered.length} équipement{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Légende */}
      <div className="flex-shrink-0 flex flex-wrap items-center gap-5 px-6 py-2 bg-bone/50 border-b border-pine/8 text-[11.5px]">
        <span className="font-semibold text-[#5A6A60]">Statut :</span>
        {Object.entries(STATUT_COLORS).map(([s, c]) => (
          <span key={s} className="flex items-center gap-1.5">
            <span style={{background:c}} className="inline-block w-2.5 h-2.5 rounded-[3px]" />
            <span className="text-[#5A6A60]">{STATUT_LABELS[s]}</span>
          </span>
        ))}
        <span className="font-semibold text-[#5A6A60] ml-2">Icônes :</span>
        {Object.entries(CAT_ICONS).slice(0, 5).map(([cat, emoji]) => (
          <span key={cat} className="flex items-center gap-1" title={cat}>
            <span>{emoji}</span>
            <span className="text-[#5A6A60] hidden xl:inline">{cat.split(' ')[0]}</span>
          </span>
        ))}
        {withoutCoords.length > 0 && (
          <span className="ml-auto flex items-center gap-1 text-[#00798C]">
            <AlertCircle size={11} />
            {withoutCoords.length} sans GPS · {withCoords.length} sur carte
          </span>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Carte — toujours montée, masquée par CSS en vue liste */}
        <div ref={mapRef} className="absolute inset-0 z-0"
          style={{ display: view === 'map' ? 'block' : 'none' }}>
          {!leafletLoaded && (
            <div className="flex h-full items-center justify-center text-[#8A9A90] gap-3">
              <span className="h-5 w-5 border-2 border-pine/20 border-t-pine rounded-full animate-spin" />
              Chargement de la carte...
            </div>
          )}
        </div>

        {/* Liste */}
        {view === 'list' && (
          <div className="flex-1 overflow-y-auto p-5">
            <div className="rounded-[14px] border border-pine/14 bg-paper overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-pine/10 bg-pine/4">
                    {['Icône','Équipement','Catégorie','État','Localisation','GPS','Statut'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-[11px] tracking-widest uppercase text-gold-deep font-sans whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-[#8A9A90]">Aucun équipement trouvé</td></tr>
                  ) : filtered.map((eq, i) => (
                    <tr key={eq.id || i} className="border-b border-pine/8 hover:bg-pine/3">
                      <td className="px-4 py-3 text-[20px]">{CAT_ICONS[eq.categorie] || '🔧'}</td>
                      <td className="px-4 py-3 font-semibold text-pine">{eq.marque_modele}</td>
                      <td className="px-4 py-3 text-[#5A6A60]">{eq.categorie}</td>
                      <td className="px-4 py-3 text-[#5A6A60]">{ETAT_LABELS[eq.etat] || eq.etat || '—'}</td>
                      <td className="px-4 py-3 text-[#5A6A60]">{eq.localisation_texte || '—'}</td>
                      <td className="px-4 py-3">
                        {hasCoords(eq)
                          ? <span className="text-[11px] font-mono text-[#0F6E56]">{parseFloat(eq.latitude).toFixed(4)}, {parseFloat(eq.longitude).toFixed(4)}</span>
                          : <span className="text-[11px] text-[#00798C] font-semibold">Sans GPS</span>
                        }
                      </td>
                      <td className="px-4 py-3"><StatutBadge statut={eq.statut} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
