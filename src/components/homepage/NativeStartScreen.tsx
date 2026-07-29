"use client";

import Link from "next/link";
import { tapLight } from "@/lib/capacitor/haptics";

export default function NativeStartScreen() {
  return (
    <main className="native-start-screen" data-theme="light">
      <header className="native-start-header">
        <span className="native-start-mark" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 32 32">
            <path d="M5 24 13 10l4 6 4-4 6 12H5Z" fill="currentColor" />
          </svg>
        </span>
        <span>Cove</span>
      </header>

      <section className="native-start-content">
        <div className="native-start-visual" aria-hidden="true">
          <span className="native-start-orbit native-start-orbit-one" />
          <span className="native-start-orbit native-start-orbit-two" />
          <span className="native-start-glow" />
          <span className="native-start-visual-mark">
            <svg width="54" height="54" viewBox="0 0 64 64">
              <path d="M8 47 25 20l9 12 9-9 13 24H8Z" fill="currentColor" />
              <path d="M15 47c7-6 13-8 20-6 6 2 10 1 14-2" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".38" />
            </svg>
          </span>
        </div>

        <div className="native-start-copy">
          <p className="native-start-eyebrow">Your day, held gently</p>
          <h1>Start where<br />you are.</h1>
          <p className="native-start-description">
            Cove turns the noise in your head into one calm, doable next step.
          </p>
        </div>
      </section>

      <footer className="native-start-actions">
        <Link
          href="/register"
          className="native-start-primary"
          onClick={() => void tapLight()}
        >
          Create my Cove
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <Link
          href="/login"
          className="native-start-secondary"
          onClick={() => void tapLight()}
        >
          I already have an account
        </Link>
        <p>No pressure. Just a place to begin.</p>
      </footer>
    </main>
  );
}
