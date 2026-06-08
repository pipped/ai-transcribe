import { useState, useTransition } from "react";
import App from "./App";
import Hero from "@/components/ui/animated-shader-hero";
import { SignInPage } from "@/components/ui/sign-in-flow-1";

type Phase = "landing" | "app" | "signin";

export default function Root() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [isPending, startTransition] = useTransition();

  const fadeTo = (next: Phase) => {
    startTransition(() => setPhase(next));
  };

  let content: React.ReactNode;

  if (phase === "signin") {
    content = (
      <>
        <button
          onClick={() => fadeTo("landing")}
          className="fixed bottom-4 left-4 z-50 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur transition hover:bg-white/20"
        >
          ← Home
        </button>
        <SignInPage />
      </>
    );
  } else if (phase === "app") {
    content = (
      <>
        <button
          onClick={() => fadeTo("landing")}
          disabled={isPending}
          className="fixed bottom-4 left-4 z-50 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-slate-200 backdrop-blur transition hover:bg-white/10 disabled:opacity-50"
        >
          {isPending ? "Loading…" : "← Home"}
        </button>
        <App />
      </>
    );
  } else {
    content = (
      <Hero
        trustBadge={{ text: "Powered by OpenAI Whisper", icons: ["✨"] }}
        headline={{ line1: "Turn Any Recording Into", line2: "Structured Intelligence" }}
        subtitle="Drop an audio or video file. Get back a full transcript, concise summary, key takeaways, and action items — automatically, in seconds."
        buttons={{
          primary: {
            text: isPending ? "Loading…" : "Get Started Free",
            onClick: () => fadeTo("app"),
          },
        }}
      />
    );
  }

  return (
    <div key={phase} className="page-fade-in">
      {content}
    </div>
  );
}
