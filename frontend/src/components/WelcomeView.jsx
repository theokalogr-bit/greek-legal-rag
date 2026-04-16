import { useState } from 'react'

const CATEGORIES = [
  { id: 'all', label: 'Όλα' },
  { id: 'work', label: 'Εργασία' },
  { id: 'tax', label: 'Φόροι' },
  { id: 'rent', label: 'Ενοίκια' },
  { id: 'company', label: 'Εταιρείες' },
  { id: 'consumer', label: 'Καταναλωτής' },
]

const QUESTIONS = [
  { cat: 'work', text: 'Μπορεί ο εργοδότης να μου κόψει μισθό χωρίς λόγο;' },
  { cat: 'work', text: 'Πότε δικαιούμαι αποζημίωση απόλυσης;' },
  { cat: 'work', text: 'Ποια είναι τα δικαιώματά μου σε υπερωρίες;' },
  { cat: 'rent', text: 'Πότε μπορεί ο ιδιοκτήτης να με διώξει από το σπίτι;' },
  { cat: 'rent', text: 'Τι ισχύει για την επιστροφή εγγύησης ενοικίου;' },
  { cat: 'tax', text: 'Ποιες δαπάνες μπορώ να εκπέσω από τη φορολογία;' },
  { cat: 'tax', text: 'Τι είναι το τεκμήριο διαβίωσης και πώς υπολογίζεται;' },
  { cat: 'company', text: 'Ποιες είναι οι προϋποθέσεις για ίδρυση ΑΕ;' },
  { cat: 'company', text: 'Τι διαφορά έχει μια ΙΚΕ από μια ΕΠΕ;' },
  { cat: 'consumer', text: 'Τι δικαιώματα έχω αν αγόρασα ελαττωματικό προϊόν;' },
  { cat: 'consumer', text: 'Πότε έχω δικαίωμα υπαναχώρησης από αγορά;' },
  { cat: 'work', text: 'Πόσες μέρες άδεια δικαιούμαι κάθε χρόνο;' },
]

export default function WelcomeView({ onAsk }) {
  const [active, setActive] = useState('all')
  const [input, setInput] = useState('')

  const filtered = active === 'all' ? QUESTIONS : QUESTIONS.filter(q => q.cat === active)

  const submit = () => {
    const q = input.trim()
    if (q) onAsk(q)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Hero */}
        <div className="mb-10 animate-fadeUp" style={{ animationFillMode: 'both' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center">
              <span className="font-display text-white text-base italic">ν</span>
            </div>
            <span className="text-xs font-body font-medium text-stone-muted uppercase tracking-widest">
              Νομικός Βοηθός
            </span>
          </div>
          <h1 className="font-display text-4xl text-ink leading-tight mb-3">
            Τα δικαιώματά σου,<br />
            <span className="italic text-navy">στα απλά ελληνικά.</span>
          </h1>
          <p className="text-base text-stone-muted font-body leading-relaxed">
            Ρώτα ό,τι θέλεις για την εργασία, τα ενοίκια, τους φόρους ή τις εταιρείες.
            Οι απαντήσεις βασίζονται σε πραγματικούς ελληνικούς νόμους.
          </p>
        </div>

        {/* Search input */}
        <div className="mb-8 animate-fadeUp" style={{ animationDelay: '80ms', animationFillMode: 'both', opacity: 0 }}>
          <div className="flex items-center gap-2 bg-white border-2 border-stone-border
            hover:border-navy/30 focus-within:border-navy focus-within:ring-4 focus-within:ring-navy/8
            rounded-2xl transition-all shadow-sm">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="Γράψε την ερώτησή σου εδώ..."
              className="flex-1 px-5 py-4 bg-transparent text-base font-body text-ink
                placeholder:text-stone-soft outline-none"
            />
            <button
              onClick={submit}
              disabled={!input.trim()}
              className="mr-2 px-4 py-2 bg-navy hover:bg-navy-light disabled:opacity-30
                text-white text-sm font-body font-medium rounded-xl transition-colors">
              Ρώτα
            </button>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-6 animate-fadeUp"
          style={{ animationDelay: '140ms', animationFillMode: 'both', opacity: 0 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-body font-medium border transition-all
                ${active === cat.id
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-stone-muted border-stone-border hover:border-navy/40 hover:text-navy'}`}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Suggested questions */}
        <div className="animate-fadeUp" style={{ animationDelay: '200ms', animationFillMode: 'both', opacity: 0 }}>
          <p className="text-[11px] text-stone-soft font-body uppercase tracking-widest mb-3">
            Συχνές ερωτήσεις
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filtered.map((q, i) => (
              <button
                key={q.text}
                onClick={() => onAsk(q.text)}
                className="text-left px-4 py-3 bg-white border border-stone-border rounded-xl
                  hover:border-navy/40 hover:shadow-md hover:-translate-y-0.5
                  transition-all duration-150 group animate-fadeUp"
                style={{ animationDelay: `${200 + i * 40}ms`, animationFillMode: 'both', opacity: 0 }}>
                <p className="text-sm font-body text-ink leading-snug group-hover:text-navy transition-colors">
                  {q.text}
                </p>
                <span className="mt-1.5 inline-block text-[10px] text-stone-soft group-hover:text-amber
                  font-body uppercase tracking-wider transition-colors">
                  {CATEGORIES.find(c => c.id === q.cat)?.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-10 text-[11px] text-stone-soft font-body text-center leading-relaxed">
          Οι απαντήσεις βασίζονται στην ελληνική νομοθεσία και δεν αντικαθιστούν επαγγελματική νομική συμβουλή.
        </p>
      </div>
    </div>
  )
}
