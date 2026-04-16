import { useState, useRef, useEffect } from 'react'

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fadeUp">
      <div className="w-6 h-6 rounded-sm bg-ink-raised border border-ink-border
        flex items-center justify-center shrink-0 mt-0.5">
        <span className="font-display text-gold text-xs">Σ</span>
      </div>
      <div className="bg-ink-raised border border-ink-border rounded-sm px-4 py-3">
        <div className="flex gap-1.5 items-center h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-dot1" />
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-dot2" />
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-dot3" />
        </div>
      </div>
    </div>
  )
}

function Message({ msg, onShowSources }) {
  const isUser = msg.role === 'user'

  return (
    <div
      className={`flex items-start gap-3 animate-fadeUp ${isUser ? 'flex-row-reverse' : ''}`}
      style={{ animationFillMode: 'both' }}
    >
      {/* Avatar */}
      <div className={`w-6 h-6 rounded-sm shrink-0 mt-0.5 flex items-center justify-center
        border ${isUser
          ? 'bg-gold/10 border-gold/30'
          : 'bg-ink-raised border-ink-border'}`}>
        <span className={`font-display text-xs ${isUser ? 'text-gold' : 'text-gold'}`}>
          {isUser ? 'Θ' : 'Σ'}
        </span>
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] space-y-2 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`rounded-sm px-4 py-3 text-sm font-body leading-relaxed
          ${isUser
            ? 'bg-gold/10 border border-gold/20 text-parchment'
            : 'bg-ink-raised border border-ink-border text-parchment'}`}>
          <div className="prose-legal">
            {msg.content.split('\n').map((line, i) => (
              <p key={i} className={line === '' ? 'mb-2' : ''}>{line}</p>
            ))}
          </div>
        </div>

        {/* Sources button */}
        {msg.sources && msg.sources.length > 0 && (
          <button
            onClick={() => onShowSources(msg.sources)}
            className="flex items-center gap-1.5 text-[11px] text-gold-dim hover:text-gold
              font-body transition-colors duration-150 group"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"
              className="group-hover:scale-110 transition-transform duration-150">
              <rect x="1" y="1" width="9" height="9" rx="0.5" stroke="currentColor" strokeWidth="1"/>
              <line x1="3" y1="4" x2="8" y2="4" stroke="currentColor" strokeWidth="0.8"/>
              <line x1="3" y1="6" x2="8" y2="6" stroke="currentColor" strokeWidth="0.8"/>
              <line x1="3" y1="8" x2="6" y2="8" stroke="currentColor" strokeWidth="0.8"/>
            </svg>
            {msg.sources.length} {msg.sources.length === 1 ? 'πηγή' : 'πηγές'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function ChatPanel({ onShowSources, onNewSources }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const submit = async () => {
    const question = input.trim()
    if (!question || loading) return

    setInput('')
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
        throw new Error('Cannot reach the backend. Make sure the FastAPI server is running on port 8000.')
      }
      const text = await res.text()
      if (!text) throw new Error('Empty response from server.')
      const data = JSON.parse(text)
      if (!res.ok) throw new Error(data.detail || 'Query failed.')

      const assistantMsg = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources
      }
      setMessages(prev => [...prev, assistantMsg])
      if (data.sources?.length > 0) {
        onNewSources(data.sources)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-60">
            <div className="text-5xl font-display text-ink-border select-none">Δ</div>
            <p className="text-sm text-ink-muted font-body text-center max-w-xs leading-relaxed">
              Ανεβάστε νομικά έγγραφα PDF και υποβάλετε ερωτήσεις στα ελληνικά ή αγγλικά.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <Message key={i} msg={msg} onShowSources={onShowSources} />
        ))}

        {loading && <TypingIndicator />}

        {error && (
          <div className="text-xs text-red-400 font-body bg-red-400/5 border border-red-400/20
            rounded-sm px-3 py-2 animate-fadeUp">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-ink-border px-4 py-4">
        <div className="flex items-end gap-2 bg-ink-raised border border-ink-border rounded-sm
          focus-within:border-gold/40 transition-colors duration-200">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Υποβάλετε ερώτηση για τα έγγραφά σας..."
            rows={1}
            className="flex-1 bg-transparent px-4 py-3 text-sm font-body text-parchment
              placeholder:text-ink-muted resize-none outline-none
              leading-relaxed max-h-32 overflow-y-auto"
            style={{ minHeight: '44px' }}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
            }}
          />
          <button
            onClick={submit}
            disabled={!input.trim() || loading}
            className="mb-2 mr-2 p-2 rounded-sm transition-all duration-150
              disabled:opacity-30 disabled:cursor-not-allowed
              enabled:bg-gold enabled:hover:bg-gold-light enabled:text-ink group"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
              className="group-enabled:translate-x-0.5 group-enabled:group-hover:-translate-y-0.5
                transition-transform duration-150">
              <path d="M2 7L12 7M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.4"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-ink-muted font-body px-1">
          Enter για αποστολή · Shift+Enter για νέα γραμμή
        </p>
      </div>
    </div>
  )
}
