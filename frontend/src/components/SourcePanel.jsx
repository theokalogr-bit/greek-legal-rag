export default function SourcePanel({ sources, onClose }) {
  if (!sources?.length) return null

  return (
    <div className="w-72 shrink-0 border-l border-stone-border bg-white flex flex-col animate-slideRight">
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-border-light">
        <div className="flex items-center gap-2">
          <span className="text-xs font-body font-600 text-navy uppercase tracking-widest">Πηγές</span>
          <span className="text-[10px] bg-navy-pale text-navy font-body px-1.5 py-0.5 rounded">
            {sources.length}
          </span>
        </div>
        <button onClick={onClose}
          className="text-stone-soft hover:text-ink transition-colors p-1 rounded">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <line x1="1" y1="1" x2="10" y2="10" stroke="currentColor" strokeWidth="1.3"/>
            <line x1="10" y1="1" x2="1" y2="10" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sources.map((s, i) => (
          <div key={i}
            className="border border-stone-border rounded-lg p-3 space-y-2 bg-stone-bg
              animate-fadeUp"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both', opacity: 0 }}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-body font-medium text-ink leading-tight truncate max-w-[140px]"
                  title={s.document_name}>{s.document_name}</p>
                <p className="text-[10px] text-stone-muted font-body mt-0.5">Σελ. {s.page}</p>
              </div>
              <span className={`shrink-0 text-[10px] font-body font-medium px-1.5 py-0.5 rounded
                ${s.relevance_score >= 0.7
                  ? 'bg-emerald-50 text-emerald-700'
                  : s.relevance_score >= 0.4
                  ? 'bg-amber-pale text-amber'
                  : 'bg-stone-bg text-stone-muted'}`}>
                {Math.round(s.relevance_score * 100)}%
              </span>
            </div>
            <p className="text-[10px] font-mono text-stone-muted leading-relaxed line-clamp-4 border-t border-stone-border-light pt-2">
              {s.chunk_text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
