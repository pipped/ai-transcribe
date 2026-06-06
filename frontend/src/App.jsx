import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { AIVoiceInput } from '@/components/ui/ai-voice-input'
import { SilkBackground } from '@/components/ui/silk-background-animation'
import { Boxes } from '@/components/ui/background-boxes'

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
    <div className="rounded-xl border border-dashed border-white/15 px-6 py-10 text-center">
      <p className="text-xs leading-6 text-white/40">{children}</p>
    </div>
  )
}

function Badge({ children }) {
  return (
    <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] tabular-nums text-white/60">
      {children}
    </span>
  )
}

function GhostButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/40 transition-colors duration-150 hover:border-white/30 hover:bg-white/5 hover:text-white/80 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
    >
      {children}
    </button>
  )
}

function SectionCard({ title, children, action, badge }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-black p-6">
      <Boxes />
      <div className="absolute inset-0 w-full h-full bg-black z-10 [mask-image:radial-gradient(transparent,white)] pointer-events-none rounded-2xl" />
      <div className="relative z-20 mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.11em] text-white/50">{title}</h3>
          {badge !== undefined && badge !== null && <Badge>{badge}</Badge>}
        </div>
        {action}
      </div>
      <div className="relative z-20">
        {children}
      </div>
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
      { label: 'Avg summary time', value: '< 30 sec' },
      { label: 'Transcripts saved', value: String(history.length) }
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

  const handleVoiceStart = () => {
    setError('')
    setNotice('Recording… speak now, then click the icon again to stop.')
  }

  const handleVoiceStop = (duration) => {
    if (duration > 0) {
      setNotice(`Captured a ${duration}s voice note. Hook this up to the backend to transcribe live audio.`)
    }
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
    setNotice('Showing a sample lecture transcript — upload your own recording to try it for real.')
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
    setNotice('Exported — open it in Notion, Google Docs, or your notes app.')
  }

  return (
    <div className="relative min-h-screen">
      <SilkBackground />
    <main className="relative z-10 min-h-screen overflow-y-auto text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/90">
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1L9.5 5.5H12L8.5 8L10 13L7 10L4 13L5.5 8L2 5.5H4.5L7 1Z" fill="black" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">AI Transcribe</span>
          </div>
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="cursor-pointer text-[11px] text-slate-400 transition-colors duration-150 hover:text-slate-300"
              >
                ← Home
              </button>
            )}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
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
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black px-8 py-10">
            <Boxes />
            <div className="absolute inset-0 w-full h-full bg-black z-10 [mask-image:radial-gradient(transparent,white)] pointer-events-none rounded-2xl" />
            <p className="relative z-20 mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
              Stop re-watching 2-hour lectures
            </p>
            <h1 className="relative z-20 max-w-xl text-[2rem] font-semibold leading-[1.2] tracking-tight text-white">
              Upload a recording. Walk away with notes.
            </h1>
            <p className="relative z-20 mt-4 max-w-lg text-sm leading-[1.75] text-slate-300">
              Drop any lecture, seminar, or voice memo and get a full transcript, tight summary,
              key concepts, and action items — automatically, before you even close your laptop.
            </p>
            <div className="relative z-20 mt-8 flex flex-wrap gap-2">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="min-w-[110px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-colors duration-200 hover:border-white/20"
                >
                  <p className="text-[10px] uppercase tracking-[0.09em] text-white/40">{stat.label}</p>
                  <p className="mt-1.5 text-lg font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upload */}
          <SectionCard title="Add your recording">
            {/* Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-xl border-2 border-dashed p-7 text-center transition-all duration-200 ${
                isDragging
                  ? 'border-white/50 bg-white/5 shadow-[0_0_40px_rgba(255,255,255,0.05)]'
                  : 'border-white/15 bg-white/5 hover:border-white/25'
              }`}
            >
              <label htmlFor="media-upload" className="block cursor-pointer select-none">
                <div
                  className={`mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl border transition-colors duration-200 ${
                    isDragging
                      ? 'border-white/50 text-white'
                      : 'border-white/15 bg-white/5 text-white/50'
                  }`}
                >
                  <UploadIcon />
                </div>
                <p className="text-sm font-medium text-white/90">
                  {isDragging ? 'Drop to upload' : 'Drop your lecture recording here'}
                </p>
                <p className="mt-1 text-xs text-slate-500">MP3, WAV, MP4, MOV and more · 50 MB max</p>
              </label>
              <input
                id="media-upload"
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileChange}
                className="sr-only"
              />
            </div>

            {/* Voice input */}
            <div className="my-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.15em] text-white/30">
              <span className="h-px flex-1 bg-white/10" />
              or record with your mic
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5">
              <AIVoiceInput onStart={handleVoiceStart} onStop={handleVoiceStop} />
            </div>

            {/* Selected file */}
            <div
              className={`mt-3 rounded-xl border px-4 py-3 transition-colors duration-200 ${
                file ? 'border-white/25 bg-white/8' : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.09em] text-slate-400">Selected file</p>
                  <p className={`mt-1 truncate text-sm ${file ? 'text-white/90' : 'text-white/30'}`}>
                    {file ? file.name : 'None'}
                  </p>
                </div>
                {file && (
                  <span className="shrink-0 rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-xs text-white/60">
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
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-150 hover:bg-white/90 hover:shadow-[0_0_32px_rgba(255,255,255,0.2)] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Spinner />
                    Working on it…
                  </>
                ) : (
                  'Get my notes'
                )}
              </button>
              <button
                onClick={handleLoadDemo}
                className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-transparent px-4 py-2.5 text-sm font-medium text-white/40 transition-colors duration-150 hover:bg-white/5 hover:text-white/80"
              >
                See a sample
              </button>
            </div>
          </SectionCard>
        </section>

        {/* Bottom row — Results */}
        <section className="mt-3 grid gap-3 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-3">
            {/* Transcript */}
            <SectionCard
              title="Full transcript"
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
                      className="cursor-pointer rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black shadow-[0_0_14px_rgba(255,255,255,0.15)] transition-all duration-150 hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
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
                    <span className="rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white/80">
                      {result.fileName}
                    </span>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/40">
                      {formatFileSize(result.fileSize)}
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-white/90">{result.transcription}</p>
                </div>
              ) : (
                <EmptyState>Upload a recording or hit &ldquo;See a sample&rdquo; to watch it work.</EmptyState>
              )}
            </SectionCard>

            <div className="grid gap-3 md:grid-cols-2">
              {/* Summary */}
              <SectionCard title="TL;DR summary">
                {result ? (
                  <p className="text-sm leading-7 text-slate-300">{result.summary}</p>
                ) : (
                  <EmptyState>The short version of your lecture — perfect for a quick refresh before an exam.</EmptyState>
                )}
              </SectionCard>

              {/* Recent */}
              <SectionCard title="Recent transcripts" badge={history.length}>
                <div className="space-y-2">
                  {history.map((entry) => (
                    <article
                      key={entry.id}
                      className="cursor-pointer rounded-xl border border-white/10 bg-white/5 p-3 transition-colors duration-150 hover:border-white/20 hover:bg-white/8"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="truncate text-xs font-medium text-white/90">{entry.fileName}</h4>
                          <p className="mt-0.5 text-[11px] text-slate-400">{formatDate(entry.createdAt)}</p>
                        </div>
                        <span className="shrink-0 text-[11px] tabular-nums text-slate-400">
                          {formatFileSize(entry.fileSize)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-400">{entry.summary}</p>
                    </article>
                  ))}
                </div>
              </SectionCard>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-3">
            {/* Key Concepts */}
            <SectionCard title="Key concepts" badge={result?.keyPoints?.length ?? null}>
              <div className="space-y-2">
                {result?.keyPoints ? (
                  result.keyPoints.map((point, i) => (
                    <div
                      key={point}
                      className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <span className="mt-0.5 shrink-0 text-[10px] font-semibold tabular-nums text-white/40">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="text-xs leading-5 text-slate-300">{point}</p>
                    </div>
                  ))
                ) : (
                  <EmptyState>The big ideas from your lecture land here — great for flashcards or a study guide.</EmptyState>
                )}
              </div>
            </SectionCard>

            {/* To-do & follow-ups */}
            <SectionCard title="To-do & follow-ups" badge={result?.actionItems?.length ?? null}>
              <div className="space-y-2">
                {result?.actionItems ? (
                  result.actionItems.map((item, i) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-[9px] font-bold text-white/60">
                        {i + 1}
                      </span>
                      <p className="text-xs leading-5 text-slate-300">{item}</p>
                    </div>
                  ))
                ) : (
                  <EmptyState>Assignments, readings, and anything your prof said to &ldquo;make sure you know&rdquo; show up here.</EmptyState>
                )}
              </div>
            </SectionCard>
          </div>
        </section>
      </div>
    </main>
    </div>
  )
}

export default App

