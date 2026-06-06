import { useState } from "react";
import App from "./App";
import Hero from "@/components/ui/animated-shader-hero";
import { SignInPage } from "@/components/ui/sign-in-flow-1";

type Phase = "landing" | "app" | "signin";

export default function Root() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [opacity, setOpacity] = useState(1);

  const fadeTo = (next: Phase) => {
    setOpacity(0);
    setTimeout(() => {
      setPhase(next);
      setOpacity(1);
    }, 300);
  };

  if (phase === "signin") {
    return (
      <div style={{ opacity, transition: "opacity 300ms ease-in-out" }}>
        <button
          onClick={() => fadeTo("landing")}
          className="fixed bottom-4 left-4 z-50 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur transition hover:bg-white/20"
        >
          ← Home
        </button>
        <SignInPage />
      </div>
    );
  }

  if (phase === "app") {
    return (
      <div style={{ opacity, transition: "opacity 300ms ease-in-out" }}>
        <button
          onClick={() => fadeTo("landing")}
          className="fixed bottom-4 left-4 z-50 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-slate-200 backdrop-blur transition hover:bg-white/10"
        >
          ← Home
        </button>
        <App />
      </div>
    );
  }

  return (
    <div style={{ opacity, transition: "opacity 300ms ease-in-out" }}>
      <Hero
        trustBadge={{ text: "Powered by OpenAI Whisper", icons: ["✨"] }}
        headline={{ line1: "Turn Any Recording Into", line2: "Structured Intelligence" }}
        subtitle="Drop an audio or video file. Get back a full transcript, concise summary, key takeaways, and action items — automatically, in seconds."
        buttons={{
          primary: { text: "Get Started Free", onClick: () => fadeTo("app") },
        }}
      />
    </div>
  );
}
