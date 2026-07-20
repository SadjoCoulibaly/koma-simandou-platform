import { useEffect, useRef, useState } from 'react'
import {
  Building2, Truck, Landmark, Factory, Users,
  Clock, CheckCircle, TrendingUp, FileText, Sheet,
  Banknote, Target, Activity,
} from 'lucide-react'
import {
  entreprisesApi, equipementsApi,
  projetsPublicsApi, projetsPrivesApi, forumApi,
} from '../../lib/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

// ── Export PDF ────────────────────────────────────────────────
function exportBIPDF(data, kpis) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const now = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

  // Cover header
  doc.setFillColor(13, 27, 46)
  doc.rect(0, 0, 210, 38, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18); doc.setFont('helvetica', 'bold')
  doc.text('KOMA', 14, 14)
  doc.setFontSize(9); doc.setFont('helvetica', 'normal')
  doc.setTextColor(196, 154, 69)
  doc.text('SYSTÈME NATIONAL D\'INFORMATION SUR LES CAPACITÉS TECHNIQUES', 14, 21)
  doc.setTextColor(200, 200, 200)
  doc.setFontSize(13); doc.setFont('helvetica', 'bold')
  doc.text('Rapport Business Intelligence — Tableau de Bord', 14, 30)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(160, 160, 160)
  doc.text(`Édité le ${now}`, 14, 36)

  let y = 46

  // KPIs summary
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(13, 27, 46)
  doc.text('Indicateurs Clés de Performance', 14, y); y += 6

  autoTable(doc, {
    startY: y,
    head: [['Indicateur', 'Valeur']],
    body: [
      ['Entreprises enregistrées',              kpis.nbEnt],
      ['Équipements inventoriés',               kpis.nbEquip],
      ['Projets publics',                       kpis.nbPub],
      ['Projets privés',                        kpis.nbPriv],
      ['Volume financier — Projets publics',    kpis.volumePub],
      ['Volume financier — Projets privés',     kpis.volumePriv],
      ['Projets en cours d\'exécution',         kpis.projEnCours],
      ['Contenu local moyen exigé',             kpis.contenuLocal],
      ['Avancement moyen',                      kpis.avanceMoyen],
      ['Inscrits Forum',                        kpis.nbForum],
      ['Dossiers en attente (toutes comp.)',     kpis.enAttente],
      ['Taux de validation',                    kpis.tauxValid],
      ['Équipements disponibles',               kpis.equipDispo],
      ['Entreprises exp. Simandou',             kpis.simandou],
      ['Participants présents au Forum',         kpis.forumPresents],
    ],
    headStyles: { fillColor: [26, 86, 219], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [245, 248, 252] },
    columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 40, halign: 'center', fontStyle: 'bold' } },
    didDrawPage: ({ cursor }) => { y = cursor.y + 8 },
  })

  y = doc.lastAutoTable.finalY + 10

  // Entreprises table
  if (data.ent.length) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(13, 27, 46)
    doc.text('Registre des Entreprises', 14, y); y += 4
    autoTable(doc, {
      startY: y,
      head: [['Nom', 'Type', 'Secteur', 'Ville', 'Statut']],
      body: data.ent.slice(0, 50).map(e => [e.nom, e.type, e.secteur || '—', e.ville || '—', e.statut]),
      headStyles: { fillColor: [26, 86, 219], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 248, 252] },
    })
    y = doc.lastAutoTable.finalY + 10
  }

  // Forum table
  if (data.forum.length) {
    doc.addPage()
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(13, 27, 46)
    doc.text('Inscrits Forum', 14, 20)
    autoTable(doc, {
      startY: 26,
      head: [['Badge', 'Nom', 'Prénom', 'Organisation', 'Fonction', 'Type', 'Statut']],
      body: data.forum.map(f => [f.numero_badge, f.nom, f.prenom, f.organisation || '—', f.fonction || '—', f.type_participant, f.statut === 'present' ? 'Présent' : 'Confirmé']),
      headStyles: { fillColor: [26, 86, 219], textColor: 255, fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 248, 252] },
    })
  }

  // Page numbers
  const total = doc.internal.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(160, 160, 160)
    doc.text(`Page ${i} / ${total}  ·  KOMA — Rapport BI`, 105, 290, { align: 'center' })
  }

  doc.save(`snicteps-bi-${new Date().toISOString().slice(0, 10)}.pdf`)
}

// ── Export Excel ──────────────────────────────────────────────
function exportBIExcel(data, kpis) {
  const wb = XLSX.utils.book_new()
  const now = new Date().toLocaleDateString('fr-FR')

  // Feuille KPIs
  const kpiSheet = XLSX.utils.aoa_to_sheet([
    ['KOMA — Rapport Business Intelligence'],
    [`Édité le ${now}`],
    [''],
    ['Indicateur', 'Valeur'],
    ['Entreprises enregistrées',              kpis.nbEnt],
    ['Équipements inventoriés',               kpis.nbEquip],
    ['Projets publics',                       kpis.nbPub],
    ['Projets privés',                        kpis.nbPriv],
    ['Volume financier — Projets publics',    kpis.volumePub],
    ['Volume financier — Projets privés',     kpis.volumePriv],
    ['Projets en cours d\'exécution',         kpis.projEnCours],
    ['Contenu local moyen exigé',             kpis.contenuLocal],
    ['Avancement moyen des projets',          kpis.avanceMoyen],
    ['Inscrits Forum',                        kpis.nbForum],
    ['Dossiers en attente',                   kpis.enAttente],
    ['Taux de validation',                    kpis.tauxValid],
    ['Équipements disponibles',               kpis.equipDispo],
    ['Entreprises exp. Simandou',             kpis.simandou],
    ['Participants présents au Forum',        kpis.forumPresents],
  ])
  kpiSheet['!cols'] = [{ wch: 40 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, kpiSheet, 'KPIs')

  // Feuille Entreprises
  if (data.ent.length) {
    const ws = XLSX.utils.json_to_sheet(data.ent.map(e => ({
      Nom: e.nom, Type: e.type, Secteur: e.secteur || '', Ville: e.ville || '',
      Téléphone: e.telephone || '', Email: e.email || '', NIF: e.nif || '',
      Effectifs: e.effectifs || '', Statut: e.statut,
      'Exp. Simandou': e.experience_simandou ? 'Oui' : 'Non',
      'Date inscription': e.created_at ? new Date(e.created_at).toLocaleDateString('fr-FR') : '',
    })))
    ws['!cols'] = [{ wch: 30 }, { wch: 22 }, { wch: 22 }, { wch: 14 }, { wch: 16 }, { wch: 28 }, { wch: 16 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 16 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Entreprises')
  }

  // Feuille Équipements
  if (data.equip.length) {
    const ws = XLSX.utils.json_to_sheet(data.equip.map(e => ({
      Désignation: e.designation || e.nom || '', Catégorie: e.categorie || '',
      Marque: e.marque || '', Modèle: e.modele || '',
      Disponible: e.disponible ? 'Oui' : 'Non',
      Quantité: e.quantite || '', Statut: e.statut,
      'Date inscription': e.created_at ? new Date(e.created_at).toLocaleDateString('fr-FR') : '',
    })))
    XLSX.utils.book_append_sheet(wb, ws, 'Équipements')
  }

  // Feuille Projets
  const projets = [
    ...(data.pub  || []).map(p => ({ ...p, _type: 'Public',  _vol: p.budget_estime,        _vol_field: 'budget_estime' })),
    ...(data.priv || []).map(p => ({ ...p, _type: 'Privé',   _vol: p.investissement_prevu, _vol_field: 'investissement_prevu' })),
  ]
  if (projets.length) {
    const ws = XLSX.utils.json_to_sheet(projets.map(p => ({
      Titre: p.titre || '', Type: p._type,
      'Secteur / Catégorie': p.secteur || p.categorie || '',
      'Maître d\'ouvrage / Promoteur': p.maitre_ouvrage || p.promoteur || '',
      'Volume financier': p._vol ? Number(p._vol).toLocaleString('fr-FR') : '',
      Devise: p.devise || '',
      '% Contenu local': p.contenu_local_pct != null ? `${p.contenu_local_pct}%` : '',
      '% Avancement': p.avancement_pct != null ? `${p.avancement_pct}%` : '',
      'Lots sous-traitance': p.lots_sous_traitance || '',
      Statut: p.statut || '',
      Localisation: p.localisation || '',
      'Date inscription': p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '',
    })))
    ws['!cols'] = [{ wch: 38 }, { wch: 10 }, { wch: 22 }, { wch: 30 }, { wch: 20 }, { wch: 8 }, { wch: 16 }, { wch: 14 }, { wch: 40 }, { wch: 16 }, { wch: 22 }, { wch: 16 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Projets')
  }

  // Feuille Forum
  if (data.forum.length) {
    const ws = XLSX.utils.json_to_sheet(data.forum.map(f => ({
      'N° Badge': f.numero_badge, Nom: f.nom, Prénom: f.prenom,
      Email: f.email, Téléphone: f.telephone || '',
      Organisation: f.organisation || '', Fonction: f.fonction || '',
      'Type participant': f.type_participant,
      Statut: f.statut === 'present' ? 'Présent' : 'Confirmé',
      'Date inscription': f.created_at ? new Date(f.created_at).toLocaleDateString('fr-FR') : '',
    })))
    ws['!cols'] = [{ wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 28 }, { wch: 16 }, { wch: 28 }, { wch: 22 }, { wch: 24 }, { wch: 12 }, { wch: 16 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Forum')
  }

  XLSX.writeFile(wb, `snicteps-bi-${new Date().toISOString().slice(0, 10)}.xlsx`)
}

// ── Palette design system ────────────────────────────────────
const P = {
  pine:  '#0D3A29',
  blue:  '#1A56DB',
  gold:  '#C49A45',
  rust:  '#B23A2E',
  green: '#1C7A4D',
  violet:'#534AB7',
  slate: '#4A5568',
  bone:  '#F0F4F8',
}

const CHART_COLORS = [P.blue, P.green, P.gold, P.rust, P.violet, '#0EA5E9', '#F59E0B', '#10B981']

// ── Utilitaires ──────────────────────────────────────────────
function count(arr, key) {
  return arr.reduce((acc, item) => {
    const v = item[key] || 'Non défini'
    acc[v] = (acc[v] || 0) + 1
    return acc
  }, {})
}

function byMonth(arr) {
  const months = {}
  arr.forEach(item => {
    if (!item.created_at) return
    const d = new Date(item.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    months[key] = (months[key] || 0) + 1
  })
  return Object.entries(months).sort((a, b) => a[0].localeCompare(b[0])).slice(-8)
}

const MONTH_FR = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
function fmtMonth(key) {
  const [y, m] = key.split('-')
  return `${MONTH_FR[Number(m) - 1]} ${y.slice(2)}`
}

function fmtVolume(sum, devise) {
  if (!sum) return '—'
  if (sum >= 1e12) return `${(sum / 1e12).toFixed(1).replace('.', ',')} Bn ${devise}`
  if (sum >= 1e9)  return `${(sum / 1e9).toFixed(1).replace('.', ',')} Md ${devise}`
  if (sum >= 1e6)  return `${(sum / 1e6).toFixed(1).replace('.', ',')} M ${devise}`
  return `${Math.round(sum).toLocaleString('fr-FR')} ${devise}`
}

function sumVolume(arr, field, devise) {
  const total = arr
    .filter(p => !devise || (p.devise || (field === 'budget_estime' ? 'GNF' : 'USD')) === devise)
    .reduce((s, p) => s + (Number(p[field]) || 0), 0)
  return total
}

// ── KPI Card ─────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color = P.blue, loading }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14, padding: '18px 20px',
      border: '1px solid rgba(0,0,0,.06)', boxShadow: '0 1px 4px rgba(0,0,0,.04)',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12.5, color: '#6B7A8D', fontWeight: 500 }}>{label}</span>
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 34, height: 34, borderRadius: 9,
          background: `${color}18`, color,
        }}>
          <Icon size={16} />
        </span>
      </div>
      {loading ? (
        <div style={{ height: 36, background: '#F0F4F8', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
      ) : (
        <div>
          <div style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: 32, fontWeight: 400, color: '#0B1120', lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 11.5, color: '#9AA89E', marginTop: 4 }}>{sub}</div>}
        </div>
      )}
    </div>
  )
}

// ── Équipements par ville — donut + légende ──────────────────
function EquipVilleCard({ equip, loading, chartReady }) {
  const canvasRef = useRef(null)
  const instanceRef = useRef(null)

  const entries = (() => {
    const map = {}
    ;(equip || []).forEach(e => {
      const v = (e.localisation_texte || 'Non renseigné').trim()
      map[v] = (map[v] || 0) + (e.quantite || 1)
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  })()
  const total = entries.reduce((s, [, v]) => s + v, 0)

  useEffect(() => {
    if (!chartReady || !window.Chart || !canvasRef.current || entries.length === 0) return
    if (instanceRef.current) instanceRef.current.destroy()
    instanceRef.current = new window.Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: entries.map(([k]) => k),
        datasets: [{
          data: entries.map(([, v]) => v),
          backgroundColor: CHART_COLORS,
          borderWidth: 2,
          borderColor: 'white',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0B1120',
            callbacks: { label: ctx => ` ${ctx.label} : ${ctx.parsed} unités` },
          },
        },
      },
      plugins: [{
        id: 'centerText',
        afterDraw(chart) {
          const { ctx, chartArea } = chart
          const cx = chartArea.left + chartArea.width / 2
          const cy = chartArea.top + chartArea.height / 2
          ctx.save()
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = '#0B1120'
          ctx.font = "bold 28px 'EB Garamond', Georgia, serif"
          ctx.fillText(total.toLocaleString(), cx, cy - 9)
          ctx.fillStyle = '#8A9A90'
          ctx.font = "10px 'Archivo', sans-serif"
          ctx.letterSpacing = '0.12em'
          ctx.fillText('TOTAL', cx, cy + 12)
          ctx.restore()
        },
      }],
    })
    return () => { if (instanceRef.current) instanceRef.current.destroy() }
  }, [chartReady, entries.length, total])

  return (
    <div style={{
      background: 'white', borderRadius: 14, padding: '20px',
      border: '1px solid rgba(0,0,0,.06)', boxShadow: '0 1px 4px rgba(0,0,0,.04)',
    }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0B1120', fontFamily: "'Archivo',sans-serif" }}>
          Équipements par ville
        </h3>
        <p style={{ margin: '3px 0 0', fontSize: 12, color: '#8A9A90' }}>
          Localisation des équipements · somme des quantités
        </p>
      </div>
      {loading ? (
        <div style={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#8A9A90', fontSize: 13 }}>
          <span style={{ width: 18, height: 18, border: '2px solid #E2E8F0', borderTopColor: P.blue, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
          Chargement…
        </div>
      ) : entries.length === 0 ? (
        <div style={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A9A90', fontSize: 13 }}>
          Aucun équipement enregistré
        </div>
      ) : (
        <>
          <div style={{ height: 160, position: 'relative' }}>
            <canvas ref={canvasRef} />
          </div>
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {entries.map(([ville, qty], i) => (
              <div key={ville} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  background: CHART_COLORS[i % CHART_COLORS.length],
                }} />
                <span style={{ flex: 1, fontSize: 12.5, color: '#3D4F5A', fontFamily: "'Archivo',sans-serif" }}>
                  {ville}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0B1120', fontFamily: "'Archivo',sans-serif" }}>
                  {qty.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Chart Card ───────────────────────────────────────────────
function ChartCard({ title, sub, chartRef, height = 220, loading }) {
  return (
    <div style={{
      background: 'white', borderRadius: 14, padding: '20px',
      border: '1px solid rgba(0,0,0,.06)', boxShadow: '0 1px 4px rgba(0,0,0,.04)',
    }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0B1120', fontFamily: "'Archivo',sans-serif" }}>{title}</h3>
        {sub && <p style={{ margin: '3px 0 0', fontSize: 12, color: '#8A9A90' }}>{sub}</p>}
      </div>
      <div style={{ height, position: 'relative' }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#8A9A90', fontSize: 13 }}>
            <span style={{ width: 18, height: 18, border: '2px solid #E2E8F0', borderTopColor: P.blue, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
            Chargement…
          </div>
        ) : (
          <canvas ref={chartRef} />
        )}
      </div>
    </div>
  )
}

// ── Separator label ──────────────────────────────────────────
function Section({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '8px 0 4px' }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: P.gold, fontFamily: "'Archivo',sans-serif" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(196,154,69,.2)' }} />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────
export default function AdminDashboardBI() {
  const refs = {
    entTypes:    useRef(null),
    entSecteurs: useRef(null),
    entVilles:   useRef(null),
    entStatuts:  useRef(null),
    projSecteur: useRef(null),
    projStatuts: useRef(null),
    projAvance:  useRef(null),
    evolution:   useRef(null),
    forumTypes:  useRef(null),
  }
  const instances = useRef({})
  const [chartReady, setChartReady] = useState(false)
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)

  // Load Chart.js
  useEffect(() => {
    if (window.Chart) { setChartReady(true); return }
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
    s.onload = () => setChartReady(true)
    document.head.appendChild(s)
  }, [])

  // Load all data
  useEffect(() => {
    Promise.allSettled([
      entreprisesApi.getAll({ limit: 500 }),
      equipementsApi.getAll({ limit: 2000 }),
      projetsPublicsApi.getAll({ limit: 500 }),
      projetsPrivesApi.getAll({ limit: 500 }),
      forumApi.getAll({ limit: 500 }),
    ]).then(results => {
      const [ent, equip, pub, priv, forum] = results.map(r =>
        r.status === 'fulfilled' ? (r.value?.data || []) : []
      )
      setData({ ent, equip, pub, priv, forum })
      setLoading(false)
    })
  }, [])

  // Draw charts
  useEffect(() => {
    if (!chartReady || !data) return
    const C = window.Chart

    const draw = (ref, key, type, labels, datasets, options = {}) => {
      if (!ref.current) return
      if (instances.current[key]) instances.current[key].destroy()
      instances.current[key] = new C(ref.current, {
        type,
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: options.legend ?? (type === 'doughnut' || type === 'pie'),
              position: 'right',
              labels: { font: { size: 11, family: 'Archivo' }, color: '#6B7A8D', boxWidth: 11, padding: 10 },
            },
            tooltip: {
              backgroundColor: '#0B1120',
              titleFont: { size: 12, family: 'Archivo' },
              bodyFont: { size: 12, family: 'Archivo' },
              padding: 10, cornerRadius: 8,
            },
          },
          scales: (type === 'bar' || type === 'line') ? {
            x: {
              ticks: { color: '#6B7A8D', font: { size: 11, family: 'Archivo' } },
              grid: { display: false },
              stacked: options.stacked,
            },
            y: {
              ticks: { color: '#6B7A8D', font: { size: 11, family: 'Archivo' }, precision: 0 },
              grid: { color: 'rgba(0,0,0,.05)' },
              beginAtZero: true,
              stacked: options.stacked,
            },
          } : {},
          ...options.extra,
        },
      })
    }

    const bar = (colors, values) => values.map((v, i) => ({
      data: v,
      backgroundColor: Array.isArray(colors) ? colors : colors,
      borderRadius: 6,
      borderSkipped: false,
    }))

    // ── 1. Entreprises par type ─────────────────────────────
    const entTypes = count(data.ent, 'type')
    draw(refs.entTypes, 'entTypes', 'doughnut',
      Object.keys(entTypes),
      [{ data: Object.values(entTypes), backgroundColor: CHART_COLORS, borderWidth: 2, borderColor: 'white' }]
    )

    // ── 2. Entreprises par secteur ──────────────────────────
    const secteurs = Object.entries(count(data.ent, 'secteur'))
      .filter(([k]) => k !== 'Non défini')
      .sort((a, b) => b[1] - a[1]).slice(0, 7)
    draw(refs.entSecteurs, 'entSecteurs', 'bar',
      secteurs.map(([k]) => k.length > 18 ? k.slice(0, 18) + '…' : k),
      [{ data: secteurs.map(([, v]) => v), backgroundColor: P.blue, borderRadius: 6, borderSkipped: false }]
    )

    // ── 3. Entreprises par ville ────────────────────────────
    const villes = Object.entries(count(data.ent, 'ville'))
      .filter(([k]) => k !== 'Non défini')
      .sort((a, b) => b[1] - a[1]).slice(0, 8)
    draw(refs.entVilles, 'entVilles', 'bar',
      villes.map(([k]) => k),
      [{ data: villes.map(([, v]) => v), backgroundColor: P.green, borderRadius: 6, borderSkipped: false }]
    )

    // ── 4. Statuts comparés (entreprises vs équipements) ───
    const statLabels = ['En attente', 'Actif / Disponible', 'Suspendu']
    const entStat  = count(data.ent,   'statut')
    const equipStat = count(data.equip, 'statut')
    draw(refs.entStatuts, 'entStatuts', 'bar',
      statLabels,
      [
        { label: 'Entreprises',  data: [entStat.en_attente||0, entStat.actif||0, entStat.suspendu||0],   backgroundColor: P.blue,  borderRadius: 5, borderSkipped: false },
        { label: 'Équipements',  data: [equipStat.en_attente||0, equipStat.actif||0, equipStat.suspendu||0], backgroundColor: P.gold, borderRadius: 5, borderSkipped: false },
      ],
      { legend: true }
    )

    // ── 5. Équipements par ville → géré par EquipVilleCard ───

    // ── 6. Projets par secteur (publics + privés) ───────────
    const projSect = {}
    ;[...data.pub, ...data.priv].forEach(p => {
      const s = p.secteur || 'Autre'
      projSect[s] = (projSect[s] || 0) + 1
    })
    const projEntries = Object.entries(projSect).sort((a, b) => b[1] - a[1]).slice(0, 7)
    draw(refs.projSecteur, 'projSecteur', 'bar',
      projEntries.map(([k]) => k.length > 16 ? k.slice(0, 16) + '…' : k),
      [{ data: projEntries.map(([, v]) => v), backgroundColor: P.violet, borderRadius: 6, borderSkipped: false }]
    )

    // ── 7. Évolution des inscriptions par mois ──────────────
    const allItems = [
      ...data.ent.map(e => ({ ...e, _src: 'Entreprises' })),
      ...data.equip.map(e => ({ ...e, _src: 'Équipements' })),
      ...data.forum.map(e => ({ ...e, _src: 'Forum' })),
    ]
    const monthsSet = new Set()
    allItems.forEach(item => {
      if (!item.created_at) return
      const d = new Date(item.created_at)
      monthsSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    })
    const monthKeys = Array.from(monthsSet).sort().slice(-8)

    const countByMonth = (arr) => {
      const m = {}
      arr.forEach(item => {
        if (!item.created_at) return
        const d = new Date(item.created_at)
        const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        m[k] = (m[k] || 0) + 1
      })
      return monthKeys.map(k => m[k] || 0)
    }

    draw(refs.evolution, 'evolution', 'line',
      monthKeys.map(fmtMonth),
      [
        { label: 'Entreprises', data: countByMonth(data.ent),   borderColor: P.blue,   backgroundColor: `${P.blue}18`,   fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: P.blue },
        { label: 'Équipements', data: countByMonth(data.equip), borderColor: P.gold,   backgroundColor: `${P.gold}18`,   fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: P.gold },
        { label: 'Forum',       data: countByMonth(data.forum), borderColor: P.green,  backgroundColor: `${P.green}18`,  fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: P.green },
      ],
      { legend: true }
    )

    // ── 8. Profils participants Forum ───────────────────────
    const forumTypes = count(data.forum, 'type_participant')
    const forumColors = [P.blue, P.green, P.gold, P.rust, P.violet, P.slate]
    draw(refs.forumTypes, 'forumTypes', 'pie',
      Object.keys(forumTypes),
      [{ data: Object.values(forumTypes), backgroundColor: forumColors, borderWidth: 2, borderColor: 'white' }]
    )

    // ── 9. Projets par statut (pub vs privé) ───────────────
    const PUB_STATUTS  = ['planifie', 'en_cours', 'suspendu', 'termine']
    const PRIV_STATUTS = ['etude', 'financement', 'construction', 'exploitation']
    const PUB_LABELS   = ['Planifié', 'En cours', 'Suspendu', 'Terminé']
    const PRIV_LABELS  = ['Étude', 'Financement', 'Construction', 'Exploitation']
    const pubStat  = count(data.pub,  'statut')
    const privStat = count(data.priv, 'statut')
    draw(refs.projStatuts, 'projStatuts', 'bar',
      ['Planifié / Étude', 'En cours / Construction', 'Financement / Suspendu', 'Terminé / Exploitation'],
      [
        { label: 'Projets publics',
          data: [
            (pubStat.planifie || 0),
            (pubStat.en_cours || 0),
            (pubStat.suspendu || 0),
            (pubStat.termine  || 0),
          ],
          backgroundColor: P.pine, borderRadius: 5, borderSkipped: false },
        { label: 'Projets privés',
          data: [
            (privStat.etude || 0),
            (privStat.construction || 0),
            (privStat.financement  || 0),
            (privStat.exploitation || 0),
          ],
          backgroundColor: P.violet, borderRadius: 5, borderSkipped: false },
      ],
      { legend: true }
    )

    // ── 10. Taux de contenu local — distribution ───────────
    const clBuckets = { '0–20%': 0, '21–40%': 0, '41–60%': 0, '61–80%': 0, '81–100%': 0 }
    ;[...data.pub, ...data.priv].forEach(p => {
      const v = Number(p.contenu_local_pct)
      if (isNaN(v) || p.contenu_local_pct == null) return
      if (v <= 20)       clBuckets['0–20%']++
      else if (v <= 40)  clBuckets['21–40%']++
      else if (v <= 60)  clBuckets['41–60%']++
      else if (v <= 80)  clBuckets['61–80%']++
      else               clBuckets['81–100%']++
    })
    draw(refs.projAvance, 'projAvance', 'bar',
      Object.keys(clBuckets),
      [{ data: Object.values(clBuckets), backgroundColor: [P.gold, P.green, P.blue, P.violet, P.rust], borderRadius: 6, borderSkipped: false }]
    )

  }, [chartReady, data])

  // ── Computed KPIs ───────────────────────────────────────────
  const kpis = data ? (() => {
    // volumes pub — GNF + USD + EUR séparément, on affiche les 2 plus représentés
    const pubGNF = sumVolume(data.pub, 'budget_estime', 'GNF')
    const pubUSD = sumVolume(data.pub, 'budget_estime', 'USD')
    const pubEUR = sumVolume(data.pub, 'budget_estime', 'EUR')
    const volumePubParts = [
      pubGNF && fmtVolume(pubGNF, 'GNF'),
      pubUSD && fmtVolume(pubUSD, 'USD'),
      pubEUR && fmtVolume(pubEUR, 'EUR'),
    ].filter(Boolean)

    const privUSD = sumVolume(data.priv, 'investissement_prevu', 'USD')
    const privEUR = sumVolume(data.priv, 'investissement_prevu', 'EUR')
    const privGNF = sumVolume(data.priv, 'investissement_prevu', 'GNF')
    const volumePrivParts = [
      privUSD && fmtVolume(privUSD, 'USD'),
      privEUR && fmtVolume(privEUR, 'EUR'),
      privGNF && fmtVolume(privGNF, 'GNF'),
    ].filter(Boolean)

    const clVals = [...data.pub, ...data.priv].map(p => p.contenu_local_pct).filter(v => v != null && !isNaN(Number(v)))
    const contenuLocal = clVals.length ? `${Math.round(clVals.reduce((s, v) => s + Number(v), 0) / clVals.length)}%` : '—'

    const projEnCours = data.pub.filter(p => p.statut === 'en_cours').length
      + data.priv.filter(p => ['construction', 'exploitation'].includes(p.statut)).length

    const avVals = [...data.pub, ...data.priv]
      .filter(p => p.avancement_pct != null && !isNaN(Number(p.avancement_pct)))
      .map(p => Number(p.avancement_pct))
    const avanceMoyen = avVals.length ? `${Math.round(avVals.reduce((s, v) => s + v, 0) / avVals.length)}%` : '—'

    return {
      nbEnt:      data.ent.length,
      nbEquip:    data.equip.reduce((s, e) => s + (e.quantite || 1), 0),
      nbPub:      data.pub.length,
      nbPriv:     data.priv.length,
      nbForum:    data.forum.length,
      enAttente:  data.ent.filter(e => e.statut === 'en_attente').length
                 + data.equip.filter(e => e.statut === 'en_attente').length
                 + data.pub.filter(e => e.statut === 'en_attente').length
                 + data.priv.filter(e => e.statut === 'en_attente').length,
      tauxValid: (() => {
        const total = data.ent.length + data.equip.length
        if (!total) return '—'
        const valid = data.ent.filter(e => e.statut === 'actif').length + data.equip.filter(e => e.statut === 'actif').length
        return `${Math.round((valid / total) * 100)}%`
      })(),
      equipDispo:    data.equip.filter(e => e.disponible).reduce((s, e) => s + (e.quantite || 1), 0),
      simandou:      data.ent.filter(e => e.experience_simandou).length,
      forumPresents: data.forum.filter(f => f.statut === 'present').length,
      volumePub:     volumePubParts.join(' + ') || '—',
      volumePriv:    volumePrivParts.join(' + ') || '—',
      contenuLocal,
      projEnCours,
      avanceMoyen,
      nbPubWithBudget:  data.pub.filter(p => p.budget_estime).length,
      nbPrivWithInvest: data.priv.filter(p => p.investissement_prevu).length,
    }
  })() : null

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      <div style={{ background: '#F0F4F8', minHeight: '100%', fontFamily: "'Archivo',sans-serif" }} className="p-3 md:p-6">

        {/* Header */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: P.gold }}>Analyse · KOMA</p>
            <h2 style={{ margin: '4px 0 4px', fontFamily: "'EB Garamond',Georgia,serif", fontSize: 28, fontWeight: 400, color: '#0B1120' }}>
              Dashboard Business Intelligence
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: '#8A9A90' }}>
              Données temps réel · {kpis ? `${kpis.nbEnt + kpis.nbEquip + kpis.nbPub + kpis.nbPriv + kpis.nbForum} entrées totales` : 'Chargement…'}
            </p>
          </div>

          {/* Boutons export */}
          {kpis && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => exportBIPDF(data, kpis)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: 'rgba(178,58,46,.08)', color: '#B23A2E',
                  border: '1px solid rgba(178,58,46,.25)', borderRadius: 9,
                  padding: '9px 16px', fontSize: 13, fontWeight: 600,
                  fontFamily: "'Archivo',sans-serif", cursor: 'pointer',
                  transition: 'all .15s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = '#B23A2E'; e.currentTarget.style.color = 'white' }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(178,58,46,.08)'; e.currentTarget.style.color = '#B23A2E' }}
              >
                <FileText size={15} />
                Exporter PDF
              </button>
              <button
                onClick={() => exportBIExcel(data, kpis)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  background: 'rgba(28,122,77,.08)', color: '#1C7A4D',
                  border: '1px solid rgba(28,122,77,.25)', borderRadius: 9,
                  padding: '9px 16px', fontSize: 13, fontWeight: 600,
                  fontFamily: "'Archivo',sans-serif", cursor: 'pointer',
                  transition: 'all .15s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = '#1C7A4D'; e.currentTarget.style.color = 'white' }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(28,122,77,.08)'; e.currentTarget.style.color = '#1C7A4D' }}
              >
                <Sheet size={15} />
                Exporter Excel
              </button>
            </div>
          )}
        </div>

        {/* ── KPIs ── */}
        <Section label="Indicateurs clés" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(180px, 100%), 1fr))', gap: 14, marginBottom: 24, marginTop: 12 }}>
          <KpiCard icon={Building2}    label="Entreprises enregistrées"  value={kpis?.nbEnt ?? '—'}       sub={`dont ${kpis?.simandou ?? 0} exp. Simandou`}   color={P.blue}   loading={loading} />
          <KpiCard icon={Truck}        label="Équipements inventoriés"   value={kpis?.nbEquip ?? '—'}      sub={`${kpis?.equipDispo ?? 0} disponibles`}        color={P.green}  loading={loading} />
          <KpiCard icon={Landmark}     label="Projets publics"           value={kpis?.nbPub ?? '—'}        sub="Projets de l'État"                             color={P.pine}   loading={loading} />
          <KpiCard icon={Factory}      label="Projets privés"            value={kpis?.nbPriv ?? '—'}       sub="Secteur privé structurant"                     color={P.violet} loading={loading} />
          <KpiCard icon={Users}        label="Inscrits Forum"            value={kpis?.nbForum ?? '—'}      sub={`${kpis?.forumPresents ?? 0} présents`}        color={P.gold}   loading={loading} />
          <KpiCard icon={Clock}        label="Dossiers en attente"       value={kpis?.enAttente ?? '—'}    sub="Toutes composantes"                            color={P.rust}   loading={loading} />
          <KpiCard icon={CheckCircle}  label="Taux de validation"        value={kpis?.tauxValid ?? '—'}    sub="Entreprises + Équipements"                     color={P.green}  loading={loading} />
          <KpiCard icon={TrendingUp}   label="Exp. Simandou"             value={kpis?.simandou ?? '—'}     sub="Entreprises actives sur le projet"             color={P.pine}   loading={loading} />
        </div>

        {/* ── Entreprises ── */}
        <Section label="Composante 01 — Entreprises" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))', gap: 14, marginBottom: 20, marginTop: 12 }}>
          <ChartCard title="Répartition par type"         sub="Nature juridique des entités enregistrées"    chartRef={refs.entTypes}    height={210} loading={loading} />
          <ChartCard title="Top secteurs d'activité"      sub="Entreprises par domaine professionnel"         chartRef={refs.entSecteurs} height={210} loading={loading} />
          <ChartCard title="Répartition géographique"     sub="Entreprises par ville de localisation"         chartRef={refs.entVilles}   height={210} loading={loading} />
          <ChartCard title="Statuts comparés"             sub="Entreprises vs Équipements — en attente / validé / suspendu" chartRef={refs.entStatuts} height={210} loading={loading} />
        </div>

        {/* ── Équipements ── */}
        <Section label="Composante 02 — Équipements" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))', gap: 14, marginBottom: 20, marginTop: 12 }}>
          <EquipVilleCard equip={data?.equip} loading={loading} chartReady={chartReady} />
          <ChartCard title="Projets par secteur"          sub="Projets publics et privés cumulés"             chartRef={refs.projSecteur} height={210} loading={loading} />
        </div>

        {/* ── Projets ── */}
        <Section label="Composantes 03-04 — Projets & Investissements" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: 14, marginBottom: 16, marginTop: 12 }}>
          <KpiCard
            icon={Banknote}
            label="Volume financier — Projets Publics"
            value={kpis?.volumePub ?? '—'}
            sub={kpis ? `${kpis.nbPubWithBudget} / ${kpis.nbPub} projets renseignés` : ''}
            color={P.pine}
            loading={loading}
          />
          <KpiCard
            icon={Banknote}
            label="Volume financier — Projets Privés"
            value={kpis?.volumePriv ?? '—'}
            sub={kpis ? `${kpis.nbPrivWithInvest} / ${kpis.nbPriv} projets renseignés` : ''}
            color={P.violet}
            loading={loading}
          />
          <KpiCard
            icon={Activity}
            label="Projets en cours d'exécution"
            value={kpis?.projEnCours ?? '—'}
            sub="Public : en_cours · Privé : construction / exploitation"
            color={P.green}
            loading={loading}
          />
          <KpiCard
            icon={Target}
            label="Contenu local moyen exigé"
            value={kpis?.contenuLocal ?? '—'}
            sub={`Avancement moyen : ${kpis?.avanceMoyen ?? '—'}`}
            color={P.gold}
            loading={loading}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))', gap: 14, marginBottom: 20 }}>
          <ChartCard title="Répartition par statut d'exécution"  sub="Projets publics vs privés — état d'avancement" chartRef={refs.projStatuts} height={220} loading={loading} />
          <ChartCard title="Distribution du contenu local exigé" sub="% contenu local sur tous les projets renseignés" chartRef={refs.projAvance}  height={220} loading={loading} />
        </div>

        {/* ── Évolution & Forum ── */}
        <Section label="Activité & Forum" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))', gap: 14, marginTop: 12 }}>
          <ChartCard title="Évolution des inscriptions"   sub="Entreprises, Équipements et Forum sur 8 mois"  chartRef={refs.evolution}   height={210} loading={loading} />
          <ChartCard title="Profils des participants Forum" sub="Répartition par type de participant"         chartRef={refs.forumTypes}  height={210} loading={loading} />
        </div>

      </div>
    </>
  )
}
