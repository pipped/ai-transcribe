import { useState } from "react";
import App from "./App";
import { LandingPage } from "@/components/landing-page";
import { SignInPage } from "@/components/ui/sign-in-flow-1";

type View = "landing" | "signin" | "app";

export default function Root() {
  const [view, setView] = useState<View>("landing");

  if (view === "app") {
    return (
      <>
        <button
          onClick={() => setView("landing")}
          className="fixed bottom-4 left-4 z-50 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-slate-200 backdrop-blur transition hover:bg-white/10"
        >
          ← Home
        </button>
        <App />
      </>
    );
  }

  if (view === "signin") {
    return (
      <>
        <button
          onClick={() => setView("landing")}
          className="fixed bottom-4 left-4 z-50 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur transition hover:bg-white/20"
        >
          ← Home
        </button>
        <SignInPage />
      </>
    );
  }

  return (
    <LandingPage onLaunch={() => setView("app")} onSignIn={() => setView("signin")} />
  );
}
