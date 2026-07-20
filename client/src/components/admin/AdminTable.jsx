import { useState } from 'react'
import { Search, CheckCircle, XCircle, Trash2, Eye, Pencil, ChevronLeft, ChevronRight, Plus, Link2 } from 'lucide-react'

const FONT = 'var(--font-body)'

const STATUT_STYLES = {
  en_attente:  { bg: '#FEF3E0', text: '#92400E', label: 'En attente' },
  actif:       { bg: '#D1FAE5', text: '#065F46', label: 'Actif' },
  suspendu:    { bg: '#FEE2E2', text: '#991B1B', label: 'Suspendu' },
  planifie:    { bg: '#DBEAFE', text: '#1E40AF', label: 'Planifié' },
  en_cours:    { bg: '#D1FAE5', text: '#065F46', label: 'En cours' },
  termine:     { bg: '#F3F4F6', text: '#374151', label: 'Terminé' },
  etude:       { bg: '#EDE9FE', text: '#5B21B6', label: 'Étude' },
  financement: { bg: '#FEF3E0', text: '#92400E', label: 'Financement' },
  construction:{ bg: '#DBEAFE', text: '#1E40AF', label: 'Construction' },
  exploitation:{ bg: '#D1FAE5', text: '#065F46', label: 'Exploitation' },
}

export function StatutBadge({ statut }) {
  const s = STATUT_STYLES[statut] || { bg: '#F3F4F6', text: '#374151', label: statut }
  return (
    <span style={{ display: 'inline-block', background: s.bg, color: s.text, borderRadius: 50, padding: '3px 10px', fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap', fontFamily: FONT }}>
      {s.label}
    </span>
  )
}

export default function AdminTable({
  title, eyebrow, columns, data, loading,
  onValidate, onReject, onDelete, onView, onEdit, onInvite,
  onAdd, addLabel = 'Ajouter',
  searchPlaceholder = 'Rechercher...',
  filterSlot,
  total = 0, page = 1, limit = 20, onPageChange,
}) {
  const [search, setSearch] = useState('')
  const totalPages = Math.ceil(total / limit)

  const filtered = data.filter(row =>
    columns.some(col => String(row[col.key] || '').toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={{ padding: 24 }}>

      {/* ── En-tête ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2 style={{ marginTop: 6, fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'var(--koma-text)' }}>{title}</h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          {filterSlot}
          {onAdd && (
            <button onClick={onAdd}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--koma-red)', color: '#fff', border: 'none', borderRadius: 50, padding: '11px 22px', fontSize: 13.5, fontWeight: 700, fontFamily: FONT, cursor: 'pointer', transition: 'background .15s' }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--koma-red-hover)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--koma-red)'}>
              <Plus size={15} /> {addLabel}
            </button>
          )}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input type="text" placeholder={searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)}
              style={{ padding: '10px 14px 10px 38px', border: '1px solid var(--koma-border)', borderRadius: 8, fontSize: 13, fontFamily: FONT, color: 'var(--koma-text)', background: '#fff', outline: 'none', width: 220, transition: 'border-color .15s' }}
              onFocus={e => e.target.style.borderColor = 'var(--koma-teal)'}
              onBlur={e => e.target.style.borderColor = 'var(--koma-border)'}
            />
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', color: '#9ca3af', gap: 10, fontFamily: FONT }}>
            <span style={{ width: 20, height: 20, border: '2px solid #e5e7eb', borderTopColor: 'var(--koma-teal)', borderRadius: '50%', animation: 'spin .8s linear infinite', flexShrink: 0 }} />
            Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', color: '#9ca3af', fontFamily: FONT }}>
            <p style={{ fontSize: 14 }}>Aucune entrée trouvée</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 13.5, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--koma-gray-bg)', borderBottom: '1px solid #e5e7eb' }}>
                  {columns.map(col => (
                    <th key={col.key} style={{ textAlign: 'left', padding: '12px 16px', fontFamily: FONT, fontWeight: 700, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--koma-teal)', whiteSpace: 'nowrap' }}>
                      {col.label}
                    </th>
                  ))}
                  <th style={{ textAlign: 'right', padding: '12px 16px', fontFamily: FONT, fontWeight: 700, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--koma-teal)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.id || i}
                    style={{ borderBottom: '1px solid #f3f4f6', transition: 'background .12s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--koma-teal-light)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    {columns.map(col => (
                      <td key={col.key} style={{ padding: '12px 16px', color: col.muted ? '#6b7280' : 'var(--koma-text)', verticalAlign: 'middle', fontFamily: FONT }}>
                        {col.render ? col.render(row[col.key], row) : <span>{row[col.key] ?? '—'}</span>}
                      </td>
                    ))}
                    <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                        {onInvite && (row.email || row.declarant_email) && (
                          <button title="Générer le lien d'accès" onClick={() => onInvite(row.id)}
                            style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #d1e8ff', background: '#eff6ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8', transition: 'all .15s' }}
                            onMouseOver={e => { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.borderColor = '#93c5fd' }}
                            onMouseOut={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#d1e8ff' }}>
                            <Link2 size={13} />
                          </button>
                        )}
                        {onEdit && (
                          <button title="Modifier" onClick={() => onEdit(row)}
                            style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #d1fae5', background: '#ecfdf5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#065f46', transition: 'all .15s' }}
                            onMouseOver={e => { e.currentTarget.style.background = '#a7f3d0'; e.currentTarget.style.borderColor = '#6ee7b7' }}
                            onMouseOut={e => { e.currentTarget.style.background = '#ecfdf5'; e.currentTarget.style.borderColor = '#d1fae5' }}>
                            <Pencil size={13} />
                          </button>
                        )}
                        {onView && (
                          <button title="Voir" onClick={() => onView(row)}
                            style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--koma-teal)', transition: 'all .15s' }}
                            onMouseOver={e => { e.currentTarget.style.background = 'var(--koma-teal-light)'; e.currentTarget.style.borderColor = 'var(--koma-teal)' }}
                            onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb' }}>
                            <Eye size={14} />
                          </button>
                        )}
                        {onValidate && (row.valide === false || row.statut === 'en_attente') && (
                          <button title="Valider" onClick={() => onValidate(row.id)}
                            style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #d1fae5', background: '#ecfdf5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#065f46', transition: 'background .15s' }}
                            onMouseOver={e => e.currentTarget.style.background = '#a7f3d0'}
                            onMouseOut={e => e.currentTarget.style.background = '#ecfdf5'}>
                            <CheckCircle size={14} />
                          </button>
                        )}
                        {onReject && (row.valide === false || row.statut === 'en_attente') && (
                          <button title="Rejeter" onClick={() => onReject(row.id)}
                            style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #fee2e2', background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#991b1b', transition: 'background .15s' }}
                            onMouseOver={e => e.currentTarget.style.background = '#fecaca'}
                            onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}>
                            <XCircle size={14} />
                          </button>
                        )}
                        {onDelete && (
                          <button title="Supprimer" onClick={() => { if (confirm('Supprimer cet élément ?')) onDelete(row.id) }}
                            style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #fee2e2', background: '#fef2f2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#991b1b', transition: 'background .15s' }}
                            onMouseOver={e => e.currentTarget.style.background = '#fecaca'}
                            onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <p style={{ fontSize: 12.5, color: '#9ca3af', fontFamily: FONT }}>{total} résultat{total !== 1 ? 's' : ''}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => onPageChange?.(page - 1)} disabled={page <= 1}
              style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? .4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--koma-teal)' }}>
              <ChevronLeft size={16} />
            </button>
            <span style={{ padding: '0 12px', fontSize: 13, color: 'var(--koma-text)', fontFamily: FONT }}>Page {page} / {totalPages}</span>
            <button onClick={() => onPageChange?.(page + 1)} disabled={page >= totalPages}
              style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? .4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--koma-teal)' }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
