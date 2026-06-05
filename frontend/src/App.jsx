import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:3000/transcribe'
const HISTORY_STORAGE_KEY = 'ai-transcribe-history'
const MAX_HISTORY_ITEMS = 6

const demoResult = {
  fileName: 'team-standup-06-04.mp3',
  fileSize: 12.6 * 1024 * 1024,
  transcription:
    'Thanks everyone for joining. This week we finalized the onboarding flow, tightened the mobile layout, and prepared the launch checklist for the beta release. The biggest blocker is still transcript export, but design and engineering are aligned on the final scope.',
  summary:
    'A project status update covering onboarding improvements, mobile polish, beta launch prep, and one remaining export blocker.',
  keyPoints: [
    'The onboarding flow was completed and approved.',
    'Mobile responsiveness received a final polish pass.',
    'The team is preparing a beta launch checklist.',
    'Transcript export is the only notable remaining blocker.'
  ],
  actionItems: [
    'Finish transcript export support.',
    'Run a final beta QA pass.',
    'Share launch checklist ownership across the team.'
  ]
}

const starterHistory = [
  {
    id: 'demo-1',
    fileName: 'customer-call-05-18.wav',
    fileSize: 8.3 * 1024 * 1024,
    summary: 'Customer interview discussing onboarding confusion and pricing clarity.',
    createdAt: '2026-04-18T18:45:00.000Z'
  },
  {
    id: 'demo-2',
    fileName: 'design-review-05-19.mp4',
    fileSize: 24.8 * 1024 * 1024,
    summary: 'Design review focused on upload states, transcript layout, and action item cards.',
    createdAt: '2026-04-19T21:10:00.000Z'
  }
]

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }
  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function createHistoryEntry(result) {
  return {
    id: `${Date.now()}-${result.fileName}`,
    fileName: result.fileName,
    fileSize: result.fileSize,
    summary: result.summary,
    createdAt: new Date().toISOString()
  }
}

function buildExportText(result) {
  return [
    `File: ${result.fileName}`,
    '',
    'Transcription',
    result.transcription,
    '',
    'Summary',
    result.summary,
    '',
    'Key Points',
    ...result.keyPoints.map((point) => `- ${point}`),
    '',
    'Action Items',
    ...result.actionItems.map((item) => `- ${item}`)
  ].join('\n')
}

function Spinner() {
  return (
    <svg className="animate-spin h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" className="opacity-20" />
      <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function UploadIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 12V3M9 3L6 6M9 3L12 6" />
      <path d="M3 13v1a2 2 0 002 2h8a2 2 0 002-2v-1" />
    </svg>
  )
}

function EmptyState({ children }) {
  return (
    <div className="rounded-xl border border-dashed border-teal-900/30 px-6 py-10 text-center">
      <p className="text-xs leading-6 text-[#3a5050]">{children}</p>
    </div>
  )
}

function Badge({ children }) {
  return (
    <span className="rounded-full border border-teal-900/60 bg-teal-950/50 px-2 py-0.5 text-[10px] tabular-nums text-teal-500">
      {children}
    </span>
  )
}

function GhostButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-[#1e2d2d] px-3 py-1.5 text-xs text-zinc-500 transition-colors duration-150 hover:border-[#2a3838] hover:bg-[#0f1a1a] hover:text-zinc-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-400/20"
    >
      {children}
    </button>
  )
}

function SectionCard({ title, children, action, badge }) {
  return (
    <section className="rounded-2xl border border-[#141f1f] bg-[#090f0f] p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.11em] text-teal-700">{title}</h3>
          {badge !== undefined && badge !== null && <Badge>{badge}</Badge>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function App({ onBack }) {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState(starterHistory)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const savedHistory = window.localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!savedHistory) return
    try {
      const parsed = JSON.parse(savedHistory)
      if (Array.isArray(parsed) && parsed.length > 0) setHistory(parsed)
    } catch {
      window.localStorage.removeItem(HISTORY_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
  }, [history])

  const stats = useMemo(
    () => [
      { label: 'Max file size', value: '50 MB' },
      { label: 'Formats', value: 'Audio & Video' },
      { label: 'Saved locally', value: String(history.length) }
    ],
    [history.length]
  )

  const setSelectedFile = (nextFile) => {
    setFile(nextFile)
    setResult(null)
    setError('')
    setNotice('')
  }

  const saveToHistory = (nextResult) => {
    const entry = createHistoryEntry(nextResult)
    setHistory((current) => [entry, ...current].slice(0, MAX_HISTORY_ITEMS))
  }

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] ?? null
    setSelectedFile(nextFile)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    const nextFile = event.dataTransfer.files?.[0] ?? null
    setSelectedFile(nextFile)
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Choose an audio or video file first.')
      return
    }
    setLoading(true)
    setError('')
    setNotice('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await axios.post(API_URL, formData)
      setResult(response.data)
      saveToHistory(response.data)
      setNotice('Transcript generated and saved.')
    } catch (requestError) {
      setResult(null)
      setError(
        requestError.response?.data?.error ||
          'Upload failed. Make sure the backend is running on port 3000.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleLoadDemo = () => {
    setFile(null)
    setResult(demoResult)
    setError('')
    setNotice('Sample transcript loaded.')
    saveToHistory(demoResult)
  }

  const handleCopy = async (label, value) => {
    try {
      await navigator.clipboard.writeText(value)
      setNotice(`${label} copied.`)
      setError('')
    } catch {
      setError(`Could not copy ${label.toLowerCase()}.`)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const blob = new Blob([buildExportText(result)], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${result.fileName.replace(/\.[^.]+$/, '') || 'transcript'}.txt`
    link.click()
    URL.revokeObjectURL(url)
    setNotice('Transcript exported.')
  }

  return (
    <main className="min-h-screen bg-[#050909] text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#0d1a1a] bg-[#050909]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-500 shadow-[0_0_14px_rgba(20,184,166,0.5)]">
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1L9.5 5.5H12L8.5 8L10 13L7 10L4 13L5.5 8L2 5.5H4.5L7 1Z" fill="white" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">AI Transcribe</span>
          </div>
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="cursor-pointer text-[11px] text-[#3a5050] transition-colors duration-150 hover:text-zinc-400"
              >
                ← Home
              </button>
            )}
            <div className="flex items-center gap-1.5 text-[11px] text-[#3a5050]">
              <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)]" />
              v0.1.0
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top row — Hero + Upload */}
        <section className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-2xl border border-[#121c1c] bg-[#080e0e] px-8 py-10">
            <div className="pointer-events-none absolute inset-0 rounded-2xl" style={{ background: 'radial-gradient(ellipse at 18% 55%, rgba(20,184,166,0.07) 0%, transparent 62%)' }} />
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 70%)' }} />
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-teal-700">
              Audio &amp; Video Intelligence
            </p>
            <h1 className="max-w-xl text-[2rem] font-semibold leading-[1.2] tracking-tight text-white">
              Turn recordings into structured insights.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-[1.75] text-[#5a7070]">
              Drop any audio or video file to get a full transcript, concise summary, key
              takeaways, and extracted action items — automatically.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="min-w-[110px] rounded-xl border border-[#152020] bg-[#0c1212] px-4 py-3 transition-colors duration-200 hover:border-[#1e2e2e]"
                >
                  <p className="text-[10px] uppercase tracking-[0.09em] text-[#3a5050]">{stat.label}</p>
                  <p className="mt-1.5 text-lg font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upload */}
          <SectionCard title="Upload">
            {/* Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-xl border-2 border-dashed p-7 text-center transition-all duration-200 ${
                isDragging
                  ? 'border-teal-500 bg-teal-950/10 shadow-[0_0_40px_rgba(20,184,166,0.07)]'
                  : 'border-[#1a2424] bg-[#060c0c] hover:border-[#213030]'
              }`}
            >
              <label htmlFor="media-upload" className="block cursor-pointer select-none">
                <div
                  className={`mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl border transition-colors duration-200 ${
                    isDragging
                      ? 'border-teal-500 text-teal-400'
                      : 'border-[#1e2a2a] bg-[#0c1212] text-[#3a5050]'
                  }`}
                >
                  <UploadIcon />
                </div>
                <p className="text-sm font-medium text-zinc-300">
                  {isDragging ? 'Drop to upload' : 'Drag a file here or click to browse'}
                </p>
                <p className="mt-1 text-xs text-[#3a3a3a]">MP3, WAV, MP4, MOV and more · 50 MB max</p>
              </label>
              <input
                id="media-upload"
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileChange}
                className="sr-only"
              />
            </div>

            {/* Selected file */}
            <div
              className={`mt-3 rounded-xl border px-4 py-3 transition-colors duration-200 ${
                file ? 'border-teal-900/50 bg-[#091212]' : 'border-[#141f1f] bg-[#060c0c]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.09em] text-[#3a5050]">Selected file</p>
                  <p className={`mt-1 truncate text-sm ${file ? 'text-teal-300' : 'text-[#2a3a3a]'}`}>
                    {file ? file.name : 'None'}
                  </p>
                </div>
                {file && (
                  <span className="shrink-0 rounded-md border border-teal-900/50 bg-teal-950/40 px-2 py-0.5 text-xs text-teal-500">
                    {formatFileSize(file.size)}
                  </span>
                )}
              </div>
            </div>

            {/* Feedback */}
            {error && (
              <div className="mt-3 rounded-xl border border-red-950/50 bg-red-950/10 px-4 py-3 text-xs leading-5 text-red-400">
                {error}
              </div>
            )}
            {notice && (
              <div className="mt-3 rounded-xl border border-emerald-950/50 bg-emerald-950/10 px-4 py-3 text-xs leading-5 text-emerald-400">
                {notice}
              </div>
            )}

            {/* CTA buttons */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(13,148,136,0.3)] transition-all duration-150 hover:bg-teal-500 hover:shadow-[0_0_32px_rgba(20,184,166,0.4)] disabled:cursor-not-allowed disabled:bg-[#141f1f] disabled:text-[#3a5050] disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Spinner />
                    Transcribing…
                  </>
                ) : (
                  'Generate transcript'
                )}
              </button>
              <button
                onClick={handleLoadDemo}
                className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-[#1a2828] bg-transparent px-4 py-2.5 text-sm font-medium text-[#4a6060] transition-colors duration-150 hover:bg-[#0d1414] hover:text-zinc-300"
              >
                Load sample
              </button>
            </div>
          </SectionCard>
        </section>

        {/* Bottom row — Results */}
        <section className="mt-3 grid gap-3 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-3">
            {/* Transcript */}
            <SectionCard
              title="Transcript"
              action={
                result ? (
                  <div className="flex flex-wrap gap-1.5">
                    <GhostButton onClick={() => handleCopy('Transcript', result.transcription)}>
                      Copy transcript
                    </GhostButton>
                    <GhostButton onClick={() => handleCopy('Summary', result.summary)}>
                      Copy summary
                    </GhostButton>
                    <button
                      onClick={handleDownload}
                      className="cursor-pointer rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_0_14px_rgba(13,148,136,0.25)] transition-all duration-150 hover:bg-teal-500 hover:shadow-[0_0_20px_rgba(20,184,166,0.35)] focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-400/30"
                    >
                      Export .txt
                    </button>
                  </div>
                ) : null
              }
            >
              {result ? (
                <div>
                  <div className="mb-5 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-md border border-teal-900/50 bg-teal-950/40 px-2.5 py-1 text-xs text-teal-300">
                      {result.fileName}
                    </span>
                    <span className="rounded-md border border-[#1a2828] bg-[#0c1212] px-2.5 py-1 text-xs text-[#3a5050]">
                      {formatFileSize(result.fileSize)}
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-zinc-300">{result.transcription}</p>
                </div>
              ) : (
                <EmptyState>Upload a file or load the sample to see the transcript.</EmptyState>
              )}
            </SectionCard>

            <div className="grid gap-3 md:grid-cols-2">
              {/* Summary */}
              <SectionCard title="Summary">
                {result ? (
                  <p className="text-sm leading-7 text-zinc-400">{result.summary}</p>
                ) : (
                  <EmptyState>A concise summary will appear here after generating a transcript.</EmptyState>
                )}
              </SectionCard>

              {/* Recent */}
              <SectionCard title="Recent" badge={history.length}>
                <div className="space-y-2">
                  {history.map((entry) => (
                    <article
                      key={entry.id}
                      className="cursor-pointer rounded-xl border border-[#111a1a] bg-[#060d0d] p-3 transition-colors duration-150 hover:border-[#1a2e2e] hover:bg-[#091212]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="truncate text-xs font-medium text-zinc-300">{entry.fileName}</h4>
                          <p className="mt-0.5 text-[11px] text-[#3a5050]">{formatDate(entry.createdAt)}</p>
                        </div>
                        <span className="shrink-0 text-[11px] tabular-nums text-[#3a5050]">
                          {formatFileSize(entry.fileSize)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-[#3a5050]">{entry.summary}</p>
                    </article>
                  ))}
                </div>
              </SectionCard>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-3">
            {/* Key Points */}
            <SectionCard title="Key Points" badge={result?.keyPoints?.length ?? null}>
              <div className="space-y-2">
                {result?.keyPoints ? (
                  result.keyPoints.map((point, i) => (
                    <div
                      key={point}
                      className="flex items-start gap-3 rounded-xl border border-[#111a1a] bg-[#060d0d] px-4 py-3"
                    >
                      <span className="mt-0.5 shrink-0 text-[10px] font-semibold tabular-nums text-teal-700">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="text-xs leading-5 text-zinc-400">{point}</p>
                    </div>
                  ))
                ) : (
                  <EmptyState>Key takeaways will appear here after a transcript is generated.</EmptyState>
                )}
              </div>
            </SectionCard>

            {/* Action Items */}
            <SectionCard title="Action Items" badge={result?.actionItems?.length ?? null}>
              <div className="space-y-2">
                {result?.actionItems ? (
                  result.actionItems.map((item, i) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-xl border border-[#111a1a] bg-[#060d0d] px-4 py-3"
                    >
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-teal-900/60 bg-teal-950/50 text-[9px] font-bold text-teal-500">
                        {i + 1}
                      </span>
                      <p className="text-xs leading-5 text-zinc-400">{item}</p>
                    </div>
                  ))
                ) : (
                  <EmptyState>Action items will appear here after a transcript is generated.</EmptyState>
                )}
              </div>
            </SectionCard>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
