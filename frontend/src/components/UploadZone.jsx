import { useState, useRef } from 'react'

export default function UploadZone({ onIngest }) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file || !file.name.endsWith('.pdf')) {
      setError('Only PDF files are supported.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      let res
      try {
        res = await fetch('/api/ingest', { method: 'POST', body: formData })
      } catch {
        throw new Error('Cannot reach the backend. Make sure the FastAPI server is running on port 8000.')
      }
      const text = await res.text()
      if (!text) throw new Error('Empty response from server.')
      const data = JSON.parse(text)
      if (!res.ok) throw new Error(data.detail || 'Ingestion failed.')
      onIngest(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  return (
    <div className="px-4 pb-4">
      <div
        className={`relative border border-dashed rounded-sm transition-all duration-200 cursor-pointer group
          ${dragging ? 'drag-active' : 'border-ink-border hover:border-gold-dim'}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <div className="flex flex-col items-center gap-2 py-5 px-3">
          {loading ? (
            <>
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-dot1" />
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-dot2" />
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-dot3" />
              </div>
              <p className="text-xs text-parchment-muted font-body">Επεξεργασία...</p>
            </>
          ) : (
            <>
              {/* Papyrus scroll icon */}
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"
                className="text-ink-muted group-hover:text-gold transition-colors duration-200">
                <rect x="5" y="3" width="18" height="22" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M5 6C5 4.9 5.9 4 7 4H8C8 5.1 7.1 6 6 6H5Z" fill="currentColor" opacity="0.5"/>
                <path d="M23 6C23 4.9 22.1 4 21 4H20C20 5.1 20.9 6 22 6H23Z" fill="currentColor" opacity="0.5"/>
                <path d="M5 22C5 23.1 5.9 24 7 24H8C8 22.9 7.1 22 6 22H5Z" fill="currentColor" opacity="0.5"/>
                <path d="M23 22C23 23.1 22.1 24 21 24H20C20 22.9 20.9 22 22 22H23Z" fill="currentColor" opacity="0.5"/>
                <line x1="9" y1="10" x2="19" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
                <line x1="9" y1="13" x2="19" y2="13" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
                <line x1="9" y1="16" x2="15" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
              </svg>
              <p className="text-xs text-center text-parchment-muted font-body leading-relaxed">
                <span className="text-parchment-dim">Ανεβάστε PDF</span>
                <br />
                <span className="text-ink-muted text-[10px]">ή σύρετε εδώ</span>
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-400 font-body px-1">{error}</p>
      )}
    </div>
  )
}
