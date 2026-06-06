import { useState } from "react";
import {
  AudioLines,
  FileText,
  Sparkles,
  BookOpen,
  Clock,
  ArrowRight,
  GraduationCap,
  Zap,
  BrainCircuit,
} from "lucide-react";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";

interface LandingPageProps {
  onLaunch?: () => void;
  onSignIn?: () => void;
}

const features = [
  {
    icon: AudioLines,
    title: "Record any lecture",
    description:
      "Tap record, drop your phone in your bag, and let it run. Upload the file after class or record live — same result.",
  },
  {
    icon: BrainCircuit,
    title: "AI pulls the key points",
    description:
      "No more re-listening to a 90-min lecture. Get a tight summary, the main concepts, and action items in seconds.",
  },
  {
    icon: FileText,
    title: "Study-ready notes",
    description:
      "Clean, readable transcripts you can search, copy, and paste straight into Notion, Google Docs, or your flashcard app.",
  },
  {
    icon: Zap,
    title: "Done before you leave the library",
    description:
      "Upload, wait a few seconds, done. Faster than typing it yourself. Way faster than watching the recording back.",
  },
];

const proof = [
  { label: "Lecture hours saved", value: "3 hrs/wk" },
  { label: "Avg summary time", value: "< 30 sec" },
  { label: "Formats supported", value: "MP3, MP4, WAV…" },
];

export function LandingPage({ onLaunch, onSignIn }: LandingPageProps) {
  const [status, setStatus] = useState("Try it — tap the mic and say something.");

  const handleVoiceStart = () => {
    setStatus("Recording… tap again when you're done.");
  };

  const handleVoiceStop = (duration: number) => {
    if (duration > 0) {
      setStatus(`Got it — ${duration}s captured. Open the dashboard to turn it into notes.`);
    } else {
      setStatus("Try it — tap the mic and say something.");
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#0f172a_50%,_#111827_100%)] text-slate-100">

      {/* Nav */}
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
              <AudioLines className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-white">AI Transcribe</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onSignIn}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
            >
              Log in
            </button>
            <button
              onClick={onLaunch}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Try for free
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">

          {/* Left — copy */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-sky-300">
              <GraduationCap className="h-3.5 w-3.5" /> Built for students
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Stop re-watching{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-sky-300 via-blue-400 to-sky-300 bg-clip-text text-transparent">
                  2-hour lectures.
                </span>
                {/* underline squiggle */}
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-sky-500/0 via-sky-400 to-sky-500/0" />
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-7 text-slate-300">
              Record your lecture, drop it here, and get a full transcript + smart summary in under a minute.
              Study from the <em className="not-italic text-white">notes</em>, not the recording.
            </p>

            {/* Social proof pill */}
            <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              <span className="flex -space-x-1.5">
                {["bg-sky-400","bg-blue-500","bg-indigo-400","bg-sky-300"].map((c, i) => (
                  <span key={i} className={`h-6 w-6 rounded-full border-2 border-slate-900 ${c} flex items-center justify-center text-[9px] font-bold text-white`}>
                    {["A","B","C","D"][i]}
                  </span>
                ))}
              </span>
              <span>Used by students at <span className="text-white font-medium">100+ universities</span></span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={onLaunch}
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-7 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-sky-400 active:scale-95"
              >
                Transcribe a lecture free
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <BookOpen className="h-4 w-4 text-sky-300" />
                How it works
              </a>
            </div>

            {/* Mini proof stats */}
            <div className="mt-10 flex flex-wrap gap-6">
              {proof.map((p) => (
                <div key={p.label}>
                  <p className="text-xl font-bold text-white">{p.value}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{p.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — interactive demo card */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-sky-500/25 via-transparent to-blue-600/20 blur-2xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-slate-900/80 p-7 shadow-[0_30px_80px_rgba(2,6,23,0.5)] backdrop-blur">

              {/* Card header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Try recording right now</p>
                  <p className="mt-0.5 text-xs text-slate-400">No sign-up needed</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>

              {/* Voice input */}
              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/60">
                <AIVoiceInput onStart={handleVoiceStart} onStop={handleVoiceStop} />
              </div>

              <p className="mt-4 min-h-8 text-center text-xs leading-5 text-slate-400">{status}</p>

              {/* Simulated output preview */}
              <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/60 p-4 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-sky-400">Sample output</p>
                <p className="text-xs leading-5 text-slate-300 line-clamp-2">
                  "…the mitochondria generate ATP via oxidative phosphorylation across the inner membrane,
                  regulated by the electron transport chain…"
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["ATP synthesis","Krebs cycle","ETC","NADH","Exam likely ⚡"].map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-3">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">How it works</span>
        </div>
        <h2 className="max-w-xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
          From class to study notes in three steps.
        </h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            { n: "01", title: "Record or upload", body: "Hit record before the prof starts, or drag in any audio/video file after class. MP3, MP4, WAV, MOV — all good." },
            { n: "02", title: "AI processes it", body: "Full transcript in seconds. Key concepts, a tight summary, and a list of action items — all extracted automatically." },
            { n: "03", title: "Copy, paste, study", body: "Export as plain text, copy the summary, or paste into your notes app. No fiddling, no formatting, no wasted time." },
          ].map((s) => (
            <div key={s.n} className="rounded-3xl border border-white/10 bg-slate-900/75 p-7 shadow-[0_20px_60px_rgba(2,6,23,0.35)] backdrop-blur">
              <span className="text-3xl font-black text-white/10">{s.n}</span>
              <h3 className="mt-3 text-base font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="rounded-3xl border border-white/10 bg-slate-900/75 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.35)] backdrop-blur transition hover:border-sky-400/40"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{feature.description}</p>
              </article>
            );
          })}
        </div>

        {/* CTA banner */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 px-8 py-10 shadow-[0_30px_80px_rgba(2,6,23,0.45)]">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Finals week incoming?</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
                Catch up on a semester of lectures tonight.
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-300">
                Drop in your recordings, let AI do the heavy lifting, and walk into the exam with actual notes.
              </p>
            </div>
            <button
              onClick={onLaunch}
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-sky-500 px-7 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-sky-400 active:scale-95"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <span>AI Transcribe — your lecture notes, automated.</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}
