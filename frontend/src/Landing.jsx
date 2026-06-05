const features = [
  {
    title: 'Full Transcription',
    desc: 'Word-for-word text from any audio or video file. MP3, WAV, MP4, MOV and more — up to 50 MB.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 6h12M4 10h8M4 14h5" />
      </svg>
    ),
  },
  {
    title: 'AI Summary',
    desc: 'Instant, concise summary of key discussion points. Skim what matters without reading everything.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 3l2.5 5H17l-4 3.5 1.5 5.5L10 14l-4.5 3 1.5-5.5L3 8h4.5L10 3z" />
      </svg>
    ),
  },
  {
    title: 'Key Takeaways',
    desc: 'Automatically extracted insights and decisions. Never miss an important point from a long recording.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="5" cy="6" r="1" fill="currentColor" stroke="none" />
        <circle cx="5" cy="10" r="1" fill="currentColor" stroke="none" />
        <circle cx="5" cy="14" r="1" fill="currentColor" stroke="none" />
        <path d="M9 6h7M9 10h7M9 14h4" />
      </svg>
    ),
  },
  {
    title: 'Action Items',
    desc: 'Identified next steps and follow-ups — ready to copy straight into your task manager.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 10l2 2 4-4" />
        <rect x="3" y="3" width="14" height="14" rx="2" />
      </svg>
    ),
  },
  {
    title: 'Local History',
    desc: 'Your last 6 transcripts saved in the browser. No account required. Your data stays on your device.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 6v4l2.5 2.5" />
        <circle cx="10" cy="10" r="7" />
      </svg>
    ),
  },
  {
    title: 'Export & Copy',
    desc: 'Download a clean .txt file or copy any section to the clipboard with one click.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 4H5a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1v-3" />
        <path d="M13 3h4v4M17 3l-7 7" />
      </svg>
    ),
  },
]

const comparisonRows = [
  { feature: 'Full Transcription',  us: true,  manual: true,  rev: true,  otter: true  },
  { feature: 'AI Summary',          us: true,  manual: false, rev: false, otter: false },
  { feature: 'Key Takeaways',       us: true,  manual: false, rev: false, otter: 'partial' },
  { feature: 'Action Items',        us: true,  manual: false, rev: false, otter: false },
  { feature: 'Self-hosted',         us: true,  manual: true,  rev: false, otter: false },
  { feature: 'No account required', us: true,  manual: true,  rev: false, otter: false },
  { feature: 'Local data storage',  us: true,  manual: true,  rev: false, otter: false },
  { feature: 'Free to use',         us: true,  manual: false, rev: false, otter: 'partial' },
]

const integrations = [
  { name: 'OpenAI', desc: 'Whisper engine', color: '#10a37f', letter: 'O' },
  { name: 'Zoom',   desc: 'Record meetings', color: '#2D8CFF', letter: 'Z' },
  { name: 'Slack',  desc: 'Share transcripts', color: '#E01E5A', letter: 'S' },
  { name: 'Drive',  desc: 'Google Drive', color: '#4285F4', letter: 'G' },
  { name: 'Notion', desc: 'Import content', color: '#a0a0a0', letter: 'N' },
  { name: 'YouTube', desc: 'Video content', color: '#FF0000', letter: 'Y' },
]

const testimonials = [
  {
    quote: "Saved me two hours of note-taking after our weekly design review. The action items were spot on — I copy them straight into Notion.",
    name: 'Sarah K.',
    role: 'Product Designer',
    company: 'Figma',
    initials: 'SK',
    color: '#F97316',
  },
  {
    quote: "We run it after every customer call. The summary alone makes it worth it. No account, no setup — data stays on our machine.",
    name: 'Marcus T.',
    role: 'Head of Customer Success',
    company: 'Linear',
    initials: 'MT',
    color: '#8B5CF6',
  },
  {
    quote: "Replaced our manual meeting notes process entirely. Key points extraction is surprisingly accurate even for technical deep-dives.",
    name: 'Priya M.',
    role: 'Engineering Manager',
    company: 'Vercel',
    initials: 'PM',
    color: '#14B8A6',
  },
]

const demoKeyPoints = ['Onboarding flow completed and approved', 'Mobile responsiveness received final polish', 'Beta launch checklist in progress']
const demoActionItems = ['Finish transcript export support', 'Run final beta QA pass', 'Share launch checklist with team']

function DemoPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#141f1f] bg-[#090f0f] shadow-[0_0_80px_rgba(13,148,136,0.1)]">
      {/* Window chrome */}
      <div className="flex items-center justify-between border-b border-[#141f1f] bg-[#070d0d] px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-[11px] text-[#3a5050]">AI Transcribe — Result</span>
        <div className="w-12" />
      </div>

      {/* File meta */}
      <div className="flex items-center gap-2 border-b border-[#0d1616] bg-[#080d0d] px-4 py-2.5">
        <span className="rounded-md border border-teal-900/50 bg-teal-950/40 px-2 py-0.5 text-[11px] text-teal-300">
          team-standup-06-04.mp3
        </span>
        <span className="rounded-md border border-[#152020] bg-[#0c1212] px-2 py-0.5 text-[11px] text-[#3a5050]">
          12.6 MB
        </span>
        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-teal-500">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 6l3 3 5-5" />
          </svg>
          Transcript ready
        </div>
      </div>

      <div className="space-y-2.5 p-4">
        {/* Transcript */}
        <div className="rounded-xl border border-[#111a1a] bg-[#070d0d] p-3.5">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-teal-700">Transcript</p>
          <p className="line-clamp-2 text-[12px] leading-5 text-zinc-400">
            Thanks everyone for joining today. This week we finalized the onboarding flow, tightened the mobile layout, and prepared the launch checklist for the beta release. The biggest blocker is still transcript export…
          </p>
        </div>

        {/* Summary + Key Points side-by-side */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-[#111a1a] bg-[#070d0d] p-3.5">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-teal-700">Summary</p>
            <p className="text-[12px] leading-5 text-zinc-400">
              Status update covering onboarding, mobile polish, and beta launch prep with one open export blocker.
            </p>
          </div>
          <div className="rounded-xl border border-[#111a1a] bg-[#070d0d] p-3.5">
            <div className="mb-2 flex items-center gap-1.5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-teal-700">Key Points</p>
              <span className="rounded-full border border-teal-900/60 bg-teal-950/50 px-1.5 py-px text-[9px] tabular-nums text-teal-500">3</span>
            </div>
            <div className="space-y-1.5">
              {demoKeyPoints.map((pt, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="shrink-0 text-[9px] font-bold tabular-nums text-teal-700">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[11px] leading-4 text-zinc-400">{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="rounded-xl border border-[#111a1a] bg-[#070d0d] p-3.5">
          <div className="mb-2.5 flex items-center gap-1.5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-teal-700">Action Items</p>
            <span className="rounded-full border border-teal-900/60 bg-teal-950/50 px-1.5 py-px text-[9px] tabular-nums text-teal-500">3</span>
          </div>
          <div className="space-y-2">
            {demoActionItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-teal-900/60 bg-teal-950/50 text-[9px] font-bold text-teal-500">
                  {i + 1}
                </span>
                <span className="text-[12px] text-zinc-400">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500" aria-label="Supported">
      <path d="M3 8l3.5 3.5L13 4" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3a5050]" aria-label="Not supported">
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  )
}

function PartialIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-zinc-600" aria-label="Partially supported">
      <path d="M4 8h8" />
    </svg>
  )
}

function CellValue({ val }) {
  if (val === true) return <CheckIcon />
  if (val === false) return <XIcon />
  return <PartialIcon />
}

export default function Landing({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-[#050909] text-zinc-100">
      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b border-[#0d1a1a] bg-[#050909]/90 backdrop-blur-md">
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
            <a href="#features" className="text-sm text-[#4a6060] transition-colors duration-150 hover:text-zinc-300">
              Features
            </a>
            <a href="#docs" className="text-sm text-[#4a6060] transition-colors duration-150 hover:text-zinc-300">
              Docs
            </a>
            <button
              onClick={onGetStarted}
              className="cursor-pointer rounded-lg bg-teal-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-[0_0_14px_rgba(13,148,136,0.3)] transition-all duration-150 hover:bg-teal-500 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)]"
            >
              Open App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero — two-column on large screens */}
      <section className="relative overflow-hidden px-4 pt-20 pb-16 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 0%, rgba(13,148,136,0.12) 0%, transparent 55%)' }} />
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 85% 80%, rgba(20,184,166,0.05) 0%, transparent 45%)' }} />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: copy */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-900/60 bg-teal-950/40 px-3.5 py-1 text-xs font-medium text-teal-400">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)]" />
                Powered by OpenAI Whisper
              </div>
              <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl">
                Turn Any Recording Into{' '}
                <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
                  Structured Intelligence
                </span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-[#5a7070]">
                Drop an audio or video file. Get back a full transcript, concise summary,
                key takeaways, and action items — automatically, in seconds.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  onClick={onGetStarted}
                  className="cursor-pointer rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(13,148,136,0.4)] transition-all duration-150 hover:bg-teal-500 hover:shadow-[0_0_36px_rgba(20,184,166,0.5)]"
                >
                  Get Started Free
                </button>
                <a
                  href="#features"
                  className="rounded-xl border border-[#1a2828] px-6 py-3 text-sm font-medium text-[#5a7070] transition-colors duration-150 hover:border-[#2a3838] hover:bg-[#0d1414] hover:text-zinc-300"
                >
                  See Features
                </a>
              </div>
              {/* Social proof stats */}
              <div className="mt-10 flex flex-wrap gap-6">
                {[
                  { value: '50 MB', label: 'Max file size' },
                  { value: 'Audio + Video', label: 'File formats' },
                  { value: 'No account', label: 'Required' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-base font-semibold text-white">{s.value}</p>
                    <p className="text-xs text-[#3a5050]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: live demo preview */}
            <div className="w-full">
              <DemoPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-teal-700">Features</p>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Everything you need from a recording</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-[#141f1f] bg-[#090f0f] p-6 transition-colors duration-200 hover:border-[#1e2e2e] hover:bg-[#0c1414]"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-teal-900/50 bg-teal-950/40 text-teal-500">
                  {f.icon}
                </div>
                <h3 className="mb-2 text-sm font-semibold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-[#4a6060]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-teal-700">Customer Feedback</p>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Teams that save hours every week</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col justify-between rounded-2xl border border-[#141f1f] bg-[#090f0f] p-6 transition-colors duration-200 hover:border-[#1e2e2e] hover:bg-[#0c1414]"
              >
                {/* Stars */}
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="currentColor" className="text-teal-500" aria-hidden="true">
                      <path d="M7 1l1.8 3.6L13 5.3l-3 2.9.7 4.1L7 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7L7 1z" />
                    </svg>
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-zinc-400">"{t.quote}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: `${t.color}25`, border: `1px solid ${t.color}40`, color: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{t.name}</p>
                    <p className="text-[11px] text-[#3a5050]">{t.role} · {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section id="docs" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-teal-700">Comparison</p>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">How it stacks up</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#141f1f]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#141f1f] bg-[#070d0d]">
                  <th className="px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a5050]">Feature</th>
                  <th className="px-4 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-teal-600">AI Transcribe</th>
                  <th className="px-4 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a5050]">Manual</th>
                  <th className="px-4 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a5050]">Rev.ai</th>
                  <th className="px-4 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-[#3a5050]">Otter.ai</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-[#0d1616] transition-colors duration-150 hover:bg-[#0a1414] ${i % 2 === 0 ? 'bg-[#090f0f]' : 'bg-[#080d0d]'}`}
                  >
                    <td className="px-5 py-3.5 text-sm text-zinc-400">{row.feature}</td>
                    <td className="px-4 py-3.5 text-center"><div className="flex justify-center"><CellValue val={row.us} /></div></td>
                    <td className="px-4 py-3.5 text-center"><div className="flex justify-center"><CellValue val={row.manual} /></div></td>
                    <td className="px-4 py-3.5 text-center"><div className="flex justify-center"><CellValue val={row.rev} /></div></td>
                    <td className="px-4 py-3.5 text-center"><div className="flex justify-center"><CellValue val={row.otter} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-teal-700">Integrations</p>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Works with your stack</h2>
            <p className="mt-3 text-sm text-[#4a6060]">Import recordings from anywhere. Export results everywhere.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {integrations.map((integ) => (
              <div
                key={integ.name}
                className="flex flex-col items-center gap-3 rounded-2xl border border-[#141f1f] bg-[#090f0f] px-4 py-6 transition-colors duration-200 hover:border-[#1e2e2e] hover:bg-[#0c1414]"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold"
                  style={{ backgroundColor: `${integ.color}20`, color: integ.color, border: `1px solid ${integ.color}30` }}
                >
                  {integ.letter}
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-zinc-300">{integ.name}</p>
                  <p className="mt-0.5 text-[11px] text-[#3a5050]">{integ.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(13,148,136,0.1) 0%, transparent 60%)' }} />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Start transcribing in seconds</h2>
          <p className="mt-4 text-base text-[#5a7070]">No account. No setup. Just drop a file and get results.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="cursor-pointer rounded-xl bg-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(13,148,136,0.4)] transition-all duration-150 hover:bg-teal-500 hover:shadow-[0_0_36px_rgba(20,184,166,0.5)]"
            >
              Get Started Free
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-[#1a2828] px-8 py-3.5 text-sm font-medium text-[#5a7070] transition-colors duration-150 hover:border-[#2a3838] hover:bg-[#0d1414] hover:text-zinc-300"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#0d1a1a] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.4)]">
              <svg width="9" height="9" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1L9.5 5.5H12L8.5 8L10 13L7 10L4 13L5.5 8L2 5.5H4.5L7 1Z" fill="white" />
              </svg>
            </div>
            <span className="text-xs font-medium text-[#3a5050]">AI Transcribe</span>
          </div>
          <p className="text-xs text-[#2a3a3a]">Open source · Built with OpenAI Whisper · v0.1.0</p>
        </div>
      </footer>
    </div>
  )
}
