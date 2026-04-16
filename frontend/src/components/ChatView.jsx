import { useState, useRef, useEffect } from 'react'

function TypingDots() {
  return (
    <div className="flex items-start gap-3 animate-fadeUp">
      <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center shrink-0 mt-0.5">
        <span className="font-display text-white text-sm italic">ν</span>
      </div>
      <div className="bg-white border border-stone-border rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-navy/40 animate-dot1" />
          <span className="w-1.5 h-1.5 rounded-full bg-navy/40 animate-dot2" />
          <span className="w-1.5 h-1.5 rounded-full bg-navy/40 animate-dot3" />
        </div>
      </div>
    </div>
  )
}

function Message({ msg, onShowSources }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex items-end gap-3 animate-fadeUp ${isUser ? 'flex-row-reverse' : ''}`}
      style={{ animationFillMode: 'both' }}>
      <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-sm
        ${isUser ? 'bg-amber-pale text-amber' : 'bg-navy text-white'}`}>
        <span className="font-display italic">{isUser ? 'Σ' : 'ν'}</span>
      </div>
      <div className={`max-w-[75%] flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm font-body leading-relaxed
          ${isUser
            ? 'bg-navy text-white rounded-br-sm'
            : 'bg-white border border-stone-border text-ink rounded-bl-sm shadow-sm'}`}>
          {isUser ? (
            <p>{msg.content}</p>
          ) : (
            <div className="prose-answer">
              {msg.content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          )}
        </div>
        {msg.sources?.length > 0 && (
          <button onClick={() => onShowSources(msg.sources)}
            className="flex items-center gap-1.5 text-[11px] text-stone-muted hover:text-amber
              font-body transition-colors group">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
              className="group-hover:scale-110 transition-transform">
              <rect x="1" y="1" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1"/>
              <line x1="3" y1="4" x2="8" y2="4" stroke="currentColor" strokeWidth="0.8"/>
              <line x1="3" y1="6.5" x2="8" y2="6.5" stroke="currentColor" strokeWidth="0.8"/>
            </svg>
            {msg.sources.length} νομικές πηγές
          </button>
        )}
      </div>
    </div>
  )
}

export default function ChatView({ initialQuestion, onShowSources, onNewSources, onReset }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (initialQuestion) {
      sendQuestion(initialQuestion)
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendQuestion = async (question) => {
    if (!question?.trim() || loading) return
    setError(null)
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setLoading(true)

    try {
      let res
      try {
        res = await fetch('/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, top_k: 5 })
        })
      } catch {
        throw new Error('Δεν βρέθηκε ο διακομιστής. Βεβαιωθείτε ότι τρέχει το backend.')
      }
      const text = await res.text()
      if (!text) throw new Error('Κενή απάντηση από διακομιστή.')
      const data = JSON.parse(text)
      if (!res.ok) throw new Error(data.detail || 'Σφάλμα κατά την αναζήτηση.')

      const msg = { role: 'assistant', content: data.answer, sources: data.sources }
      setMessages(prev => [...prev, msg])
      if (data.sources?.length > 0) onNewSources(data.sources)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const submit = () => {
    const q = input.trim()
    if (!q) return
    setInput('')
    sendQuestion(q)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Back button */}
      <div className="px-6 py-3 border-b border-stone-border-light flex items-center justify-between">
        <button onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-stone-muted hover:text-navy
            font-body transition-colors group">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
            className="group-hover:-translate-x-0.5 transition-transform">
            <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Νέα ερώτηση
        </button>
        <span className="text-xs text-stone-soft font-body">Νομικός Βοηθός</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} onShowSources={onShowSources} />
        ))}
        {loading && <TypingDots />}
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-body animate-fadeUp">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-stone-border bg-white px-4 py-4">
        <div className="flex items-end gap-2 border border-stone-border rounded-xl
          focus-within:border-navy/50 focus-within:ring-2 focus-within:ring-navy/10
          transition-all bg-stone-bg">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
            placeholder="Συνεχίστε με άλλη ερώτηση..."
            rows={1}
            className="flex-1 bg-transparent px-4 py-3 text-sm font-body text-ink
              placeholder:text-stone-soft resize-none outline-none leading-relaxed max-h-28"
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 112) + 'px'
            }}
          />
          <button onClick={submit} disabled={!input.trim() || loading}
            className="mb-2 mr-2 w-8 h-8 rounded-lg bg-navy hover:bg-navy-light
              disabled:opacity-30 disabled:cursor-not-allowed
              flex items-center justify-center transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="white" strokeWidth="1.4"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-stone-soft font-body px-1">
          Οι απαντήσεις βασίζονται στην ελληνική νομοθεσία. Δεν αντικαθιστούν νομική συμβουλή.
        </p>
      </div>
    </div>
  )
}
