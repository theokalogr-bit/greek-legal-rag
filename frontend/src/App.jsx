import { useState } from 'react'
import WelcomeView from './components/WelcomeView'
import ChatView from './components/ChatView'
import SourcePanel from './components/SourcePanel'

export default function App() {
  const [activeQuestion, setActiveQuestion] = useState(null)
  const [activeSources, setActiveSources] = useState(null)

  const handleAsk = (question) => {
    setActiveSources(null)
    setActiveQuestion(question)
  }

  const handleReset = () => {
    setActiveQuestion(null)
    setActiveSources(null)
  }

  return (
    <div className="h-full flex flex-col bg-stone-bg">

      {/* Header */}
      <header className="shrink-0 border-b border-stone-border bg-white/80 backdrop-blur-sm
        px-6 py-3 flex items-center justify-between">
        <button onClick={handleReset} className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center">
            <span className="font-display text-white text-sm italic">ν</span>
          </div>
          <div>
            <span className="font-display text-sm text-navy font-medium">Νομικός Βοηθός</span>
          </div>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[11px] text-stone-muted font-body">Ενεργό</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex min-h-0 overflow-hidden">
        {activeQuestion ? (
          <ChatView
            key={activeQuestion}
            initialQuestion={activeQuestion}
            onShowSources={setActiveSources}
            onNewSources={setActiveSources}
            onReset={handleReset}
          />
        ) : (
          <WelcomeView onAsk={handleAsk} />
        )}

        {activeSources && (
          <SourcePanel
            sources={activeSources}
            onClose={() => setActiveSources(null)}
          />
        )}
      </main>
    </div>
  )
}
