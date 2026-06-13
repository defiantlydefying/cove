"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ParticleCanvas from "./ParticleCanvas";

/* ── Split-text animation helpers ── */

function SplitWords({
  text,
  accentWord,
  ready,
  baseDelay,
}: {
  text: string;
  accentWord?: string;
  ready: boolean;
  baseDelay: number;
}) {
  return text.split(" ").map((word, i) => {
    const delay = baseDelay + i * 0.12;
    return (
      <span
        key={i}
        className="inline-block mr-[0.3em] leading-[1.15]"
        style={{
          opacity: ready ? 1 : 0,
          transform: ready ? "translateY(0)" : "translateY(10px)",
          transitionProperty: "opacity, transform",
          transitionDuration: "0.9s",
          transitionDelay: `${delay}s`,
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: "opacity, transform",
        }}
      >
        {word === accentWord ? (
          <span className="text-shimmer">{word}</span>
        ) : (
          word
        )}
      </span>
    );
  });
}

function SplitText({
  children,
  accentWord,
  afterAccent,
}: {
  children: string;
  accentWord?: string;
  afterAccent?: string;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const line1WordCount = children.split(" ").length;

  return (
    <span aria-label={children + (afterAccent ? " " + afterAccent : "")} suppressHydrationWarning>
      <SplitWords text={children} accentWord={accentWord} ready={ready} baseDelay={0} />
      {afterAccent && (
        <>
          <br />
          <SplitWords text={afterAccent} ready={ready} baseDelay={line1WordCount * 0.1} />
        </>
      )}
    </span>
  );
}

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
}

function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 60;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      r: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.3 + 0.1,
      color: [
        [107, 143, 113],
        [126, 170, 160],
        [196, 160, 85],
        [160, 139, 160],
        [143, 168, 154],
      ][Math.floor(Math.random() * 5)],
    }));

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${p.alpha})`;
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(126,170,160,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  if (!mounted) return null;
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

export default function HeroSection() {
  return (
    <section className="hero-grain relative w-full min-h-screen flex items-center overflow-hidden bg-[#1C1B18]" suppressHydrationWarning>
      {/* Logo formation particle canvas (client-only) */}
      <ClientOnly>
        <div className="absolute inset-0 z-[2] pointer-events-none opacity-60">
          <ParticleCanvas />
        </div>
      </ClientOnly>

      {/* Floating ambient particles (client-only) */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <FloatingParticles />
      </div>

      {/* Animated gradient mesh — stronger, pulsing glows */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true" suppressHydrationWarning>
        <div
          className="hero-glow absolute w-[600px] h-[600px] rounded-full top-[0%] left-[5%]"
          style={{ background: "radial-gradient(circle, rgba(107,143,113,0.2) 0%, transparent 65%)", filter: "blur(80px)" }}
        />
        <div
          className="hero-glow-slow absolute w-[500px] h-[500px] rounded-full top-[20%] right-[0%]"
          style={{ background: "radial-gradient(circle, rgba(126,170,160,0.15) 0%, transparent 65%)", filter: "blur(80px)" }}
        />
        <div
          className="hero-glow-slower absolute w-[450px] h-[450px] rounded-full bottom-[5%] left-[20%]"
          style={{ background: "radial-gradient(circle, rgba(196,160,85,0.12) 0%, transparent 65%)", filter: "blur(80px)" }}
        />
        {/* Extra accent glow behind text area */}
        <div
          className="hero-glow-slow absolute w-[400px] h-[400px] rounded-full top-[30%] left-[15%]"
          style={{ background: "radial-gradient(circle, rgba(107,143,113,0.1) 0%, transparent 60%)", filter: "blur(100px)" }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Text content */}
        <div suppressHydrationWarning>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-cove-accent/80 mb-6">
              <span className="w-6 h-px bg-cove-accent/40" />
              Executive function companion
            </span>
          </motion.div>

          <h1 className="text-[clamp(2.6rem,5.5vw,4.2rem)] font-semibold tracking-tight leading-[1.08] text-[#E5E0D8]">
            <SplitText
              accentWord="differently."
              afterAccent="Cove works with it."
            >
              Your brain works differently.
            </SplitText>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-lg text-[#E5E0D8]/45 mt-6 max-w-md leading-relaxed"
          >
            A calm productivity app that helps you capture thoughts, plan your day, and build momentum — without the overwhelm.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="flex items-center gap-4 mt-10"
          >
            <a
              href="/register"
              className="group relative inline-block px-8 py-3.5 rounded-xl bg-cove-accent text-white font-medium text-sm hover:bg-cove-accent-hover transition-all hover:-translate-y-0.5 shadow-lg shadow-cove-accent/25"
            >
              <span className="relative z-10">Start for free</span>
              <div className="absolute inset-0 rounded-xl bg-cove-accent/40 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a
              href="/features"
              className="inline-block px-6 py-3.5 rounded-xl border border-[#E5E0D8]/15 text-[#E5E0D8]/60 text-sm font-medium hover:text-[#E5E0D8] hover:border-[#E5E0D8]/30 transition-all"
            >
              See how it works
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-xs text-[#E5E0D8]/25 mt-4"
          >
            No credit card required to get started.
          </motion.p>
        </div>

        {/* Right: Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
          className="relative hidden lg:block"
        >
          {/* Browser chrome mockup */}
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40 bg-[#2A2825]">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#232220] border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-[10px] text-white/20">cove.app</span>
              </div>
            </div>

            {/* App content mockup — simplified to show 2 clear features */}
            <div className="flex" style={{ height: "360px" }}>
              {/* Sidebar nav */}
              <div className="w-36 bg-[#2F3B33] p-3 flex flex-col gap-1 shrink-0">
                <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
                  <div className="w-5 h-5 rounded-md bg-cove-accent/30" />
                  <span className="text-xs font-semibold text-white/70">Cove</span>
                </div>
                {["Companion", "Daily View", "Tasks", "Planner", "Routines"].map((item, i) => (
                  <div
                    key={item}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] ${
                      i === 0 ? "bg-white/10 text-white font-medium" : "text-white/40"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-sm ${i === 0 ? "bg-cove-accent/50" : "bg-white/10"}`} />
                    {item}
                  </div>
                ))}
              </div>

              {/* Main content area — companion chat focus */}
              <div className="flex-1 p-5 bg-[#F7F5F0]">
                <div className="text-xs font-semibold text-[#3D3832] mb-1">Good afternoon, Emma</div>
                <div className="text-[9px] text-[#A09A90] mb-4">Here&apos;s what&apos;s on your mind today</div>

                {/* Companion chat — the core feature */}
                <div className="space-y-3">
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#7EAAA0]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[8px] text-[#7EAAA0] font-bold">O</span>
                    </div>
                    <div className="bg-white rounded-xl rounded-tl-sm px-3.5 py-2.5 text-[10px] text-[#3D3832] leading-relaxed max-w-[85%] shadow-sm border border-[#E5E0D8]/60">
                      Hey Emma! You mentioned wanting to finish your chapter draft today. Want me to block off some focus time?
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-cove-accent/10 rounded-xl rounded-tr-sm px-3.5 py-2.5 text-[10px] text-[#3D3832] max-w-[75%]">
                      yes please, and remind me to take my meds at 2pm
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#7EAAA0]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[8px] text-[#7EAAA0] font-bold">O</span>
                    </div>
                    <div className="bg-white rounded-xl rounded-tl-sm px-3.5 py-2.5 text-[10px] text-[#3D3832] leading-relaxed max-w-[85%] shadow-sm border border-[#E5E0D8]/60">
                      Done! I&apos;ve blocked 10–12 for deep work and set a reminder for 2 PM. You&apos;re on it today.
                    </div>
                  </div>

                  {/* Action cards the companion created */}
                  <div className="flex gap-2 ml-9">
                    <div className="bg-white rounded-lg px-3 py-2 border border-[#E5E0D8]/60 flex items-center gap-2 shadow-sm">
                      <div className="w-2 h-2 rounded-sm bg-cove-accent" />
                      <span className="text-[9px] text-[#3D3832]">Focus: 10–12am</span>
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2 border border-[#E5E0D8]/60 flex items-center gap-2 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-[#C4A055]" />
                      <span className="text-[9px] text-[#3D3832]">Meds: 2pm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stronger floating glow behind mockup */}
          <div className="absolute -inset-16 -z-10 rounded-3xl bg-cove-accent/8 blur-[60px] hero-glow" />
          <div className="absolute -inset-8 -z-10 rounded-3xl bg-cove-accent/5 blur-3xl" />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] text-[#E5E0D8]/20">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 rounded-full border border-[#E5E0D8]/15 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-1.5 rounded-full bg-[#E5E0D8]/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}
