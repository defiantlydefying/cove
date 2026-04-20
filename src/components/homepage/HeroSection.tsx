"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ParticleCanvas from "./ParticleCanvas";

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
    <section className="relative w-full min-h-screen flex items-center overflow-hidden bg-[#1C1B18]">
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

      {/* Ambient gradient mesh */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute w-[500px] h-[500px] rounded-full top-[5%] left-[10%]" style={{ background: "radial-gradient(circle, rgba(107,143,113,0.12) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full top-[30%] right-[5%]" style={{ background: "radial-gradient(circle, rgba(126,170,160,0.08) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute w-[350px] h-[350px] rounded-full bottom-[10%] left-[25%]" style={{ background: "radial-gradient(circle, rgba(196,160,85,0.06) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Text content */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block text-xs font-medium tracking-widest uppercase text-cove-accent mb-6">
              Executive function companion
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[clamp(2.2rem,5vw,3.8rem)] font-semibold tracking-tight leading-[1.1] text-[#E5E0D8]"
          >
            Your brain works{" "}
            <span className="text-cove-accent">differently.</span>
            <br />
            Cove works with it.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-[#E5E0D8]/50 mt-6 max-w-md leading-relaxed"
          >
            A calm productivity app that helps you capture thoughts, plan your day, and build momentum — without the overwhelm.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-4 mt-8"
          >
            <a
              href="/register"
              className="inline-block px-8 py-3.5 rounded-xl bg-cove-accent text-white font-medium text-sm hover:bg-cove-accent-hover transition-all hover:-translate-y-0.5 shadow-lg shadow-cove-accent/20"
            >
              Start for free
            </a>
            <a
              href="#features"
              className="inline-block px-6 py-3.5 rounded-xl border border-[#E5E0D8]/15 text-[#E5E0D8]/60 text-sm font-medium hover:text-[#E5E0D8] hover:border-[#E5E0D8]/30 transition-all"
            >
              See how it works
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-xs text-[#E5E0D8]/25 mt-4"
          >
            No credit card required. Free forever for personal use.
          </motion.p>
        </div>

        {/* Right: Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
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

            {/* App content mockup */}
            <div className="flex" style={{ height: "380px" }}>
              {/* Sidebar nav */}
              <div className="w-40 bg-[#2F3B33] p-3 flex flex-col gap-1 shrink-0">
                <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
                  <div className="w-5 h-5 rounded-md bg-cove-accent/30" />
                  <span className="text-xs font-semibold text-white/70">Cove</span>
                </div>
                {["Companion", "Daily View", "Tasks", "Planner", "Routines", "Wellness", "Progress"].map((item, i) => (
                  <div
                    key={item}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] ${
                      i === 1 ? "bg-white/10 text-white font-medium" : "text-white/40"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-sm ${i === 1 ? "bg-cove-accent/50" : "bg-white/10"}`} />
                    {item}
                  </div>
                ))}
              </div>

              {/* Main content area */}
              <div className="flex-1 p-4 bg-[#F7F5F0]">
                <div className="text-xs font-semibold text-[#3D3832] mb-3">Good afternoon, Emma</div>
                <div className="grid grid-cols-2 gap-2">
                  {/* Task card */}
                  <div className="rounded-lg border border-[#E5E0D8] bg-white p-3">
                    <div className="text-[9px] font-medium text-[#3D3832] mb-2">Tasks</div>
                    {["Write chapter draft", "Review feedback", "Submit outline"].map((t, i) => (
                      <div key={t} className="flex items-center gap-1.5 mb-1">
                        <div className={`w-2.5 h-2.5 rounded-sm border ${i === 0 ? "bg-cove-accent border-cove-accent" : "border-[#C5BFB5]"}`} />
                        <span className={`text-[8px] ${i === 0 ? "line-through text-[#A09A90]" : "text-[#3D3832]"}`}>{t}</span>
                      </div>
                    ))}
                  </div>
                  {/* Streak card */}
                  <div className="rounded-lg border border-[#E5E0D8] bg-white p-3">
                    <div className="text-[9px] font-medium text-[#3D3832] mb-2">Streak</div>
                    <div className="text-2xl font-bold text-cove-accent">7</div>
                    <div className="text-[8px] text-[#A09A90]">days in a row</div>
                    <div className="flex gap-0.5 mt-2">
                      {[1,1,1,1,1,1,1].map((_, i) => (
                        <div key={i} className="w-3 h-3 rounded-full bg-cove-accent/20 border border-cove-accent/40" />
                      ))}
                    </div>
                  </div>
                  {/* Wellness card */}
                  <div className="rounded-lg border border-[#E5E0D8] bg-white p-3">
                    <div className="text-[9px] font-medium text-[#3D3832] mb-2">Wellness</div>
                    <div className="flex items-end gap-1">
                      {[3, 4, 3, 5, 4, 4, 5].map((v, i) => (
                        <div key={i} className="w-2.5 rounded-sm bg-cove-accent/30" style={{ height: `${v * 5}px` }} />
                      ))}
                    </div>
                    <div className="text-[8px] text-[#A09A90] mt-1">Mood this week</div>
                  </div>
                  {/* Companion card */}
                  <div className="rounded-lg border border-[#E5E0D8] bg-white p-3">
                    <div className="text-[9px] font-medium text-[#3D3832] mb-1">Companion</div>
                    <div className="bg-[#F7F5F0] rounded-md p-2 text-[8px] text-[#6B6560]">
                      &ldquo;You&apos;re doing great today! Ready to tackle that chapter?&rdquo;
                    </div>
                    <div className="text-[7px] text-[#A09A90] mt-1">Otter &middot; just now</div>
                  </div>
                </div>
              </div>

              {/* Tasks sidebar */}
              <div className="w-36 bg-[#2F3B33] p-3 shrink-0">
                <div className="text-[9px] font-medium text-white/60 mb-2">Today</div>
                <div className="text-[8px] text-white/30 mb-2">2 of 4 done</div>
                <div className="w-full h-1 rounded-full bg-white/10 mb-3">
                  <div className="w-1/2 h-full rounded-full bg-cove-accent" />
                </div>
                {["Write draft", "Call advisor", "Read chapter", "Plan week"].map((t, i) => (
                  <div key={t} className="flex items-center gap-1.5 mb-1.5">
                    <div className={`w-2 h-2 rounded-sm border ${i < 2 ? "bg-cove-accent/60 border-cove-accent/60" : "border-white/20"}`} />
                    <span className={`text-[7px] ${i < 2 ? "line-through text-white/20" : "text-white/50"}`}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating glow behind mockup */}
          <div className="absolute -inset-10 -z-10 rounded-3xl bg-cove-accent/5 blur-3xl" />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
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
