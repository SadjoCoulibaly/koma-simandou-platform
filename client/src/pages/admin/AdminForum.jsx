import { useEffect, useState } from 'react'
import { Trash2, UserCheck, Search, FileText, Sheet } from 'lucide-react'
import { forumApi } from '../../lib/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

const TYPE_COLORS = {
  'Opérateur économique':             { bg: '#EBF2FF', text: '#1240A8', hex: '#1A56DB' },
  "Représentant de l'État":           { bg: '#E1F5EE', text: '#0F5C42', hex: '#1C7A4D' },
  'Partenaire technique & financier': { bg: '#EBFCFF', text: '#00798C', hex: '#00798C' },
  'Société civile':                   { bg: '#EEEDFE', text: '#3D38A0', hex: '#534AB7' },
  'Presse & Médias':                  { bg: '#FCEBEB', text: '#A32D2D', hex: '#B23A2E' },
  'Autre':                            { bg: '#F1EFE8', text: '#5F5E5A', hex: '#8A9A90' },
}

const STATUT_STYLES = {
  confirme: { bg: '#E1F5EE', text: '#0F5C42', label: 'Confirmé' },
  present:  { bg: '#1C7A4D', text: '#fff',    label: 'Présent'  },
}

// ── Export PDF ────────────────────────────────────────────────
function exportPDF(participants) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  // Header
  doc.setFillColor(13, 27, 46)
  doc.rect(0, 0, 297, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('KOMA', 14, 12)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(196, 154, 69)
  doc.text('SYSTÈME NATIONAL D\'INFORMATION SUR LES CAPACITÉS TECHNIQUES', 14, 19)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Liste des Inscrits — Forum de Remobilisation Simandou', 14, 26)

  // Metadata
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(100, 100, 100)
  const now = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  doc.text(`Édité le ${now}  ·  ${participants.length} inscrits`, 14, 33)
  doc.text(`Présents : ${participants.filter(p => p.statut === 'present').length}  ·  Confirmés : ${participants.filter(p => p.statut === 'confirme').length}`, 14, 38)

  autoTable(doc, {
    startY: 42,
    head: [['Badge', 'Nom', 'Prénom', 'Organisation', 'Fonction', 'Type de participant', 'Email', 'Téléphone', 'Statut', 'Date']],
    body: participants.map(p => [
      p.numero_badge || '—',
      p.nom || '—',
      p.prenom || '—',
      p.organisation || '—',
      p.fonction || '—',
      p.type_participant || '—',
      p.email || '—',
      p.telephone || '—',
      p.statut === 'present' ? 'Présent' : 'Confirmé',
      p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '—',
    ]),
    headStyles: {
      fillColor: [26, 86, 219],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3.5,
      textColor: [30, 30, 30],
    },
    alternateRowStyles: { fillColor: [245, 248, 252] },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold' },
      1: { cellWidth: 22 },
      2: { cellWidth: 20 },
      3: { cellWidth: 38 },
      4: { cellWidth: 30 },
      5: { cellWidth: 38 },
      6: { cellWidth: 48 },
      7: { cellWidth: 24 },
      8: { cellWidth: 18 },
      9: { cellWidth: 18 },
    },
    didDrawPage: (hookData) => {
      const pageCount = doc.internal.getNumberOfPages()
      doc.setFontSize(7.5)
      doc.setTextColor(160, 160, 160)
      doc.text(
        `Page ${hookData.pageNumber} / ${pageCount}  ·  Forum Simandou — KOMA`,
        148, doc.internal.pageSize.height - 6,
        { align: 'center' }
      )
    },
  })

  doc.save(`inscrits-forum-simandou-${new Date().toISOString().slice(0, 10)}.pdf`)
}

// ── Export Excel ──────────────────────────────────────────────
function exportExcel(participants) {
  const rows = participants.map((p, i) => ({
    'N°':               i + 1,
    'N° Badge':         p.numero_badge || '',
    'Nom':              p.nom || '',
    'Prénom':           p.prenom || '',
    'Email':            p.email || '',
    'Téléphone':        p.telephone || '',
    'Organisation':     p.organisation || '',
    'Fonction':         p.fonction || '',
    'Type participant': p.type_participant || '',
    'Statut':           p.statut === 'present' ? 'Présent' : 'Confirmé',
    'Date inscription': p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '',
  }))

  const ws = XLSX.utils.json_to_sheet(rows)

  // Largeurs colonnes
  ws['!cols'] = [
    { wch: 4 }, { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 30 },
    { wch: 16 }, { wch: 32 }, { wch: 24 }, { wch: 26 }, { wch: 12 }, { wch: 16 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Inscrits Forum')

  // Feuille résumé
  const now = new Date().toLocaleDateString('fr-FR')
  const summary = [
    ['KOMA — Liste des Inscrits Forum de Remobilisation Simandou'],
    [`Édité le ${now}`],
    [''],
    ['Indicateur', 'Valeur'],
    ['Total inscrits', participants.length],
    ['Présents', participants.filter(p => p.statut === 'present').length],
    ['Confirmés', participants.filter(p => p.statut === 'confirme').length],
    [''],
    ...Object.entries(
      participants.reduce((acc, p) => {
        const t = p.type_participant || 'Autre'
        acc[t] = (acc[t] || 0) + 1
        return acc
      }, {})
    ).map(([type, n]) => [type, n]),
  ]
  const wsSummary = XLSX.utils.aoa_to_sheet(summary)
  wsSummary['!cols'] = [{ wch: 36 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé')

  XLSX.writeFile(wb, `inscrits-forum-simandou-${new Date().toISOString().slice(0, 10)}.xlsx`)
}

// ── Component ─────────────────────────────────────────────────
export default function AdminForum() {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [statut, setStatut]   = useState('Tous')

  const load = async (s = search, st = statut) => {
    setLoading(true)
    try {
      const params = { limit: 500 }
      if (st !== 'Tous') params.statut = st
      if (s) params.search = s
      const res = await forumApi.getAll(params)
      setData(res.data || [])
      setTotal(res.total || 0)
    } catch { setData([]); setTotal(0) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handlePresent = async (id) => {
    await forumApi.marquerPresent(id)
    load()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette inscription ?')) return
    await forumApi.supprimer(id)
    load()
  }

  const filtered = data.filter(p =>
    !search ||
    `${p.nom} ${p.prenom} ${p.organisation} ${p.email}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <span className="eyebrow">Forum Simandou</span>
          <h2 className="mt-1.5 font-serif text-[26px] text-pine">
            Liste des Inscrits
            <span className="ml-3 rounded-full bg-pine/8 px-3 py-0.5 text-[15px] font-sans font-semibold text-pine">{total}</span>
          </h2>
        </div>

        <div className="flex gap-2.5 flex-wrap items-center">
          {/* Filtre statut */}
          <div className="flex rounded-[9px] border border-pine/14 overflow-hidden">
            {['Tous', 'confirme', 'present'].map(s => (
              <button
                key={s}
                onClick={() => { setStatut(s); load(search, s) }}
                className={`px-3 py-2 text-[12px] font-medium font-sans transition-colors ${statut === s ? 'bg-pine text-bone' : 'bg-paper text-pine hover:bg-pine/8'}`}
              >
                {s === 'Tous' ? 'Tous' : s === 'confirme' ? 'Confirmés' : 'Présents'}
              </button>
            ))}
          </div>

          {/* Export PDF */}
          <button
            onClick={() => exportPDF(filtered)}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 rounded-[9px] border border-rust/30 bg-rust/8 px-4 py-2 text-[13px] font-semibold text-rust font-sans transition-colors hover:bg-rust hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileText size={15} />
            Exporter PDF
          </button>

          {/* Export Excel */}
          <button
            onClick={() => exportExcel(filtered)}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 rounded-[9px] border border-[#1C7A4D]/30 bg-[#1C7A4D]/8 px-4 py-2 text-[13px] font-semibold text-[#1C7A4D] font-sans transition-colors hover:bg-[#1C7A4D] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sheet size={15} />
            Exporter Excel
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="flex flex-wrap gap-3 mb-5">
        {[
          { label: 'Total inscrits',  value: total,                                                  color: 'var(--koma-teal)' },
          { label: 'Présents',        value: data.filter(p => p.statut === 'present').length,        color: '#1C7A4D' },
          { label: 'Confirmés',       value: data.filter(p => p.statut === 'confirme').length,       color: 'var(--koma-teal)' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 rounded-[10px] border border-pine/10 bg-white px-4 py-2.5">
            <span style={{ color: s.color }} className="font-serif text-[22px] font-light leading-none">{s.value}</span>
            <span className="text-[12px] text-[#8A9A90]">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-[360px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9A90]" />
        <input
          type="text"
          placeholder="Rechercher un participant..."
          value={search}
          onChange={e => { setSearch(e.target.value); load(e.target.value, statut) }}
          className="w-full rounded-[9px] border border-pine/14 bg-paper pl-9 pr-4 py-2.5 text-[13.5px] text-ink placeholder-[#8A9A90] focus:outline-none focus:border-pine focus:ring-2 focus:ring-pine/10"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <span className="h-8 w-8 border-2 border-pine/20 border-t-pine rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-[15px] text-[#8A9A90]">Aucune inscription trouvée</p>
        </div>
      ) : (
        <div className="rounded-[14px] border border-pine/10 overflow-hidden bg-paper">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pine/10 bg-bone/60">
                {['#', 'Badge', 'Participant', 'Organisation', 'Profil', 'Statut', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] tracking-[.12em] uppercase font-semibold text-gold-deep font-sans">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const colors = TYPE_COLORS[p.type_participant] || TYPE_COLORS['Autre']
                const st = STATUT_STYLES[p.statut] || STATUT_STYLES['confirme']
                return (
                  <tr key={p.id} className={`border-b border-pine/8 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-bone/30'}`}>
                    <td className="px-4 py-3 text-[12px] text-[#8A9A90] font-sans">{i + 1}</td>
                    <td className="px-4 py-3">
                      <span style={{ background: colors.hex }} className="rounded-[6px] px-2 py-0.5 text-[11px] font-bold text-white font-sans">
                        {p.numero_badge}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[14px] text-pine">{p.prenom} {p.nom}</div>
                      <div className="text-[12px] text-[#8A9A90]">{p.email}</div>
                      {p.telephone && <div className="text-[12px] text-[#8A9A90]">{p.telephone}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[13.5px] text-ink">{p.organisation || '—'}</div>
                      <div className="text-[12px] text-[#8A9A90]">{p.fonction || ''}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ background: colors.bg, color: colors.text }} className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                        {p.type_participant}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ background: st.bg, color: st.text }} className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12.5px] text-[#5A6A60]">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.statut !== 'present' && (
                          <button
                            onClick={() => handlePresent(p.id)}
                            title="Marquer présent"
                            className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-[#1C7A4D]/30 bg-[#E1F5EE] text-[#1C7A4D] transition-colors hover:bg-[#1C7A4D] hover:text-white"
                          >
                            <UserCheck size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(p.id)}
                          title="Supprimer"
                          className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-rust/20 bg-rust/8 text-rust transition-colors hover:bg-rust hover:text-white"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
