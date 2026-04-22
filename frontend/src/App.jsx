import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:3000/transcribe'
const HISTORY_STORAGE_KEY = 'ai-transcribe-history'
const MAX_HISTORY_ITEMS = 6

const demoResult = {
  fileName: 'founder-update-demo.mp3',
  fileSize: 12.6 * 1024 * 1024,
  transcription:
    'Thanks everyone for joining. This week we finalized the onboarding flow, tightened the mobile layout, and prepared the launch checklist for the beta release. The biggest blocker is still transcript export, but design and engineering are aligned on the final scope.',
  summary:
    'The recording is a project status update covering onboarding improvements, mobile polish, beta launch prep, and one remaining export blocker.',
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
    fileName: 'customer-call-demo.wav',
    fileSize: 8.3 * 1024 * 1024,
    summary: 'Customer interview discussing onboarding confusion and pricing clarity.',
    createdAt: '2026-04-18T18:45:00.000Z'
  },
  {
    id: 'demo-2',
    fileName: 'design-review-demo.mp4',
    fileSize: 24.8 * 1024 * 1024,
    summary: 'Design review focused on upload states, transcript layout, and action item cards.',
    createdAt: '2026-04-19T21:10:00.000Z'
  }
]

function formatFileSize(bytes) {
  if (!bytes) {
    return '0 B'
  }

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

function SectionCard({ title, children, action }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/75 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.35)] backdrop-blur">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

function App() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState(starterHistory)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const savedHistory = window.localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!savedHistory) {
      return
    }

    try {
      const parsed = JSON.parse(savedHistory)
      if (Array.isArray(parsed) && parsed.length > 0) {
        setHistory(parsed)
      }
    } catch {
      window.localStorage.removeItem(HISTORY_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
  }, [history])

  const stats = useMemo(
    () => [
      { label: 'Upload limit', value: '50 MB' },
      { label: 'Mode', value: 'Mocked demo' },
      { label: 'Saved previews', value: String(history.length) }
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
    setHistory((currentHistory) => [entry, ...currentHistory].slice(0, MAX_HISTORY_ITEMS))
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
      setNotice('Transcript preview generated and saved to recent history.')
    } catch (requestError) {
      setResult(null)
      setError(
        requestError.response?.data?.error ||
          'The upload failed. Make sure the backend is running on port 3000.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleLoadDemo = () => {
    setFile(null)
    setResult(demoResult)
    setError('')
    setNotice('Loaded a sample transcript so visitors can explore the UI without uploading.')
    saveToHistory(demoResult)
  }

  const handleCopy = async (label, value) => {
    try {
      await navigator.clipboard.writeText(value)
      setNotice(`${label} copied to clipboard.`)
      setError('')
    } catch {
      setError(`Could not copy ${label.toLowerCase()}.`)
    }
  }

  const handleDownload = () => {
    if (!result) {
      return
    }

    const blob = new Blob([buildExportText(result)], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${result.fileName.replace(/\.[^.]+$/, '') || 'transcript'}.txt`
    link.click()
    URL.revokeObjectURL(url)
    setNotice('Transcript exported as a text file.')
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#0f172a_50%,_#111827_100%)] text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">
              AI Transcribe
            </p>
            <h1 className="mt-1 text-lg font-semibold text-white">Portfolio Demo Dashboard</h1>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            Mocked transcription workflow
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 px-8 py-10 text-white shadow-[0_30px_80px_rgba(2,6,23,0.45)]">
            <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-sky-100">
              Product-style transcription interface
            </span>
            <h2 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight">
              A cleaner dashboard layout with a proper dark theme.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              This version keeps the same upload flow and demo features, but the whole experience
              now sits on a darker visual system with more contrast and depth.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <SectionCard title="Upload Audio or Video">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${
                isDragging
                  ? 'border-sky-400 bg-sky-500/10'
                  : 'border-white/15 bg-slate-950/60'
              }`}
            >
              <label htmlFor="media-upload" className="block cursor-pointer">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/15 text-xl text-sky-300">
                  +
                </div>
                <p className="mt-4 text-base font-medium text-white">
                  Drag a file here or click to browse
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Supports audio and video files. Results stay mocked for easy portfolio demos.
                </p>
              </label>
              <input
                id="media-upload"
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileChange}
                className="sr-only"
              />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3">
              <p className="text-sm font-medium text-slate-400">Selected file</p>
              <p className="mt-1 text-sm text-white">{file ? file.name : 'No file selected yet'}</p>
              <p className="mt-1 text-sm text-slate-500">
                {file ? formatFileSize(file.size) : 'Use MP3, WAV, MP4, MOV, or similar formats.'}
              </p>
            </div>

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            ) : null}

            {notice ? (
              <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {notice}
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className="inline-flex flex-1 items-center justify-center rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                {loading ? 'Transcribing...' : 'Generate transcript'}
              </button>
              <button
                onClick={handleLoadDemo}
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Load demo data
              </button>
            </div>
          </SectionCard>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <SectionCard
              title="Transcript Output"
              action={
                result ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCopy('Transcript', result.transcription)}
                      className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
                    >
                      Copy transcript
                    </button>
                    <button
                      onClick={() => handleCopy('Summary', result.summary)}
                      className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
                    >
                      Copy summary
                    </button>
                    <button
                      onClick={handleDownload}
                      className="rounded-full bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-200"
                    >
                      Download .txt
                    </button>
                  </div>
                ) : null
              }
            >
              {result ? (
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                      {result.fileName}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
                      {formatFileSize(result.fileSize)}
                    </span>
                  </div>
                  <p className="mt-5 text-[15px] leading-7 text-slate-300">{result.transcription}</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 px-6 py-10 text-center text-slate-500">
                  Upload a file or load demo data to view the generated transcript.
                </div>
              )}
            </SectionCard>

            <div className="grid gap-6 md:grid-cols-2">
              <SectionCard title="Summary">
                <p className="text-[15px] leading-7 text-slate-300">
                  {result?.summary || 'A concise summary will appear here after generating a transcript.'}
                </p>
              </SectionCard>

              <SectionCard title="Recent Previews">
                <div className="space-y-4">
                  {history.map((entry) => (
                    <article key={entry.id} className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-semibold text-white">{entry.fileName}</h4>
                          <p className="mt-1 text-xs text-slate-500">{formatDate(entry.createdAt)}</p>
                        </div>
                        <span className="text-xs text-slate-500">{formatFileSize(entry.fileSize)}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-400">{entry.summary}</p>
                    </article>
                  ))}
                </div>
              </SectionCard>
            </div>
          </div>

          <div className="space-y-6">
            <SectionCard title="Key Points">
              <div className="space-y-3">
                {(result?.keyPoints || ['Key takeaways will appear here after a transcript is generated.']).map(
                  (point) => (
                    <div key={point} className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm leading-6 text-slate-300">
                      {point}
                    </div>
                  )
                )}
              </div>
            </SectionCard>

            <SectionCard title="Action Items">
              <div className="space-y-3">
                {(result?.actionItems || ['Action items will appear here after a transcript is generated.']).map(
                  (item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm leading-6 text-slate-300">
                      {item}
                    </div>
                  )
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
