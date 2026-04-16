import { useState } from 'react'

function DocIcon() {
  return (
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none" className="shrink-0 text-gold-dim">
      <rect x="1" y="1" width="10" height="12" rx="0.5" stroke="currentColor" strokeWidth="1"/>
      <line x1="3" y1="5" x2="9" y2="5" stroke="currentColor" strokeWidth="0.8"/>
      <line x1="3" y1="7.5" x2="9" y2="7.5" stroke="currentColor" strokeWidth="0.8"/>
      <line x1="3" y1="10" x2="6" y2="10" stroke="currentColor" strokeWidth="0.8"/>
    </svg>
  )
}

export default function DocumentList({ documents, onDelete }) {
  const [confirming, setConfirming] = useState(null)

  const handleDelete = async (filename) => {
    try {
      const res = await fetch(`/api/documents/${encodeURIComponent(filename)}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete')
      onDelete(filename)
    } catch (e) {
      console.error(e)
    } finally {
      setConfirming(null)
    }
  }

  if (documents.length === 0) {
    return (
      <div className="px-4">
        <p className="text-[11px] text-ink-muted font-body italic">
          Δεν υπάρχουν έγγραφα.
        </p>
      </div>
    )
  }

  return (
    <div className="px-4 space-y-1">
      {documents.map((doc, i) => (
        <div
          key={doc}
          className="group flex items-center gap-2 px-2 py-1.5 rounded-sm
            bg-ink-raised border border-transparent hover:border-ink-border
            transition-all duration-150 animate-fadeUp"
          style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both', opacity: 0 }}
        >
          <DocIcon />
          <span className="flex-1 text-[11px] text-parchment-dim font-body truncate" title={doc}>
            {doc}
          </span>

          {confirming === doc ? (
            <div className="flex gap-1">
              <button
                onClick={() => handleDelete(doc)}
                className="text-[10px] text-red-400 hover:text-red-300 font-body transition-colors"
              >
                Διαγραφή
              </button>
              <span className="text-ink-muted text-[10px]">/</span>
              <button
                onClick={() => setConfirming(null)}
                className="text-[10px] text-ink-muted hover:text-parchment-dim font-body transition-colors"
              >
                Άκυρο
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(doc)}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-150
                text-ink-muted hover:text-red-400 p-0.5"
              title="Διαγραφή"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <line x1="2" y1="2" x2="9" y2="9" stroke="currentColor" strokeWidth="1.2"/>
                <line x1="9" y1="2" x2="2" y2="9" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
