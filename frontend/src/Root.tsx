import { useState } from "react";
import App from "./App";
import Hero from "@/components/ui/animated-shader-hero";
import { SignInPage } from "@/components/ui/sign-in-flow-1";

type Phase = "landing" | "app" | "signin";

export default function Root() {
  const [phase, setPhase] = useState<Phase>("landing");
  const [nextPhase, setNextPhase] = useState<Phase | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const fadeTo = (next: Phase) => {
    setNextPhase(next);
    setTransitioning(true);
    setTimeout(() => {
      setPhase(next);
      setNextPhase(null);
      setTransitioning(false);
    }, 200);
  };

  const pageStyle = (isActive: boolean) => ({
    position: transitioning ? "absolute" as const : "relative" as const,
    inset: transitioning ? 0 : undefined,
    width: "100%",
    minHeight: "100vh",
    opacity: transitioning ? (isActive ? 0 : 1) : 1,
    transition: "opacity 200ms ease-in-out",
    pointerEvents: (transitioning && isActive ? "none" : "auto") as React.CSSProperties["pointerEvents"],
  });

  const renderPage = (p: Phase) => {
    if (p === "signin") {
      return (
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
    }
    if (p === "app") {
      return (
        <>
          <button
            onClick={() => fadeTo("landing")}
            className="fixed bottom-4 left-4 z-50 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-slate-200 backdrop-blur transition hover:bg-white/10"
          >
            ← Home
          </button>
          <App />
        </>
      );
    }
    return (
      <Hero
        trustBadge={{ text: "Powered by OpenAI Whisper", icons: ["✨"] }}
        headline={{ line1: "Turn Any Recording Into", line2: "Structured Intelligence" }}
        subtitle="Drop an audio or video file. Get back a full transcript, concise summary, key takeaways, and action items — automatically, in seconds."
        buttons={{
          primary: { text: "Get Started Free", onClick: () => fadeTo("app") },
        }}
      />
    );
  };

  return (
    <div style={{ position: "relative", width: "100%", minHeight: "100vh", background: "black" }}>
      {/* Current page — fades out */}
      <div style={pageStyle(true)}>
        {renderPage(phase)}
      </div>

      {/* Incoming page — fades in */}
      {nextPhase && (
        <div style={{ ...pageStyle(false), opacity: transitioning ? 1 : 0 }}>
          {renderPage(nextPhase)}
        </div>
      )}
    </div>
  );
}
