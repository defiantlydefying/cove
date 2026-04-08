"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

/* ── Firefly data (deterministic to avoid hydration mismatch) ── */
const FIREFLIES = [
  { id: 0, x: 18, y: 62, size: 3, color: "rgba(126,170,160,0.5)", delay: 0, dur: 6.5 },
  { id: 1, x: 35, y: 55, size: 2.5, color: "rgba(107,143,113,0.45)", delay: 1.2, dur: 7.2 },
  { id: 2, x: 52, y: 68, size: 3.5, color: "rgba(196,160,85,0.4)", delay: 2.8, dur: 5.8 },
  { id: 3, x: 70, y: 58, size: 2.8, color: "rgba(126,170,160,0.45)", delay: 0.6, dur: 6.8 },
  { id: 4, x: 25, y: 72, size: 2.2, color: "rgba(107,143,113,0.4)", delay: 3.5, dur: 7.5 },
  { id: 5, x: 82, y: 65, size: 3.2, color: "rgba(196,160,85,0.35)", delay: 1.8, dur: 6.2 },
  { id: 6, x: 45, y: 60, size: 2.6, color: "rgba(126,170,160,0.4)", delay: 4.2, dur: 7.0 },
  { id: 7, x: 60, y: 74, size: 3, color: "rgba(107,143,113,0.45)", delay: 2.0, dur: 5.5 },
  { id: 8, x: 12, y: 70, size: 2.4, color: "rgba(196,160,85,0.4)", delay: 3.0, dur: 6.0 },
  { id: 9, x: 90, y: 60, size: 2.8, color: "rgba(126,170,160,0.5)", delay: 0.8, dur: 7.8 },
];

/* ── Spore data ── */
const SPORES = [
  { id: 0, x: 15, size: 2, delay: 0, dur: 9 },
  { id: 1, x: 28, size: 1.5, delay: 2.5, dur: 11 },
  { id: 2, x: 42, size: 2.2, delay: 1, dur: 8.5 },
  { id: 3, x: 55, size: 1.8, delay: 4, dur: 10 },
  { id: 4, x: 68, size: 2, delay: 0.5, dur: 9.5 },
  { id: 5, x: 78, size: 1.6, delay: 3, dur: 11.5 },
  { id: 6, x: 88, size: 2.1, delay: 1.5, dur: 8 },
  { id: 7, x: 35, size: 1.4, delay: 5, dur: 10.5 },
  { id: 8, x: 50, size: 1.8, delay: 2, dur: 9.2 },
  { id: 9, x: 8, size: 1.6, delay: 3.5, dur: 10.8 },
];

export default function ParallaxLandscape() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const reduced = useReducedMotion();

  // Parallax offsets (back layers move slower)
  const canopyY = useTransform(scrollYProgress, [0, 1], [30, -15]);
  const distantY = useTransform(scrollYProgress, [0, 1], [50, -25]);
  const midY = useTransform(scrollYProgress, [0, 1], [40, -45]);
  const nearY = useTransform(scrollYProgress, [0, 1], [20, -65]);

  // Layer opacities (fade in as user scrolls)
  const distantOp = useTransform(scrollYProgress, [0.05, 0.2], [0, 1]);
  const midOp = useTransform(scrollYProgress, [0.15, 0.35], [0, 1]);
  const nearOp = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);

  // Bioluminescent triggers
  const sporeOp = useTransform(scrollYProgress, [0.1, 0.25], [0, 1]);
  const mushroomOp = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);
  const fireflyOp = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);
  const poolOp = useTransform(scrollYProgress, [0.4, 0.7], [0, 0.7]);
  const lightShaftOp = useTransform(scrollYProgress, [0.3, 0.55], [0, 0.35]);

  // Fade out into features section
  const sectionOp = useTransform(scrollYProgress, [0.8, 1], [1, 0]);

  return (
    <motion.section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{
        height: "120vh",
        background: "linear-gradient(180deg, #1C1B18 0%, #1a2118 40%, #1f2b1e 70%, #EAF0EB 100%)",
        opacity: reduced ? 1 : sectionOp,
      }}
    >
      {/* ── Layer 1: Canopy ceiling ── */}
      <motion.div
        className="absolute inset-0"
        style={{ y: reduced ? 0 : canopyY }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 1200 300" preserveAspectRatio="xMidYMin slice" className="absolute top-0 w-full h-[40%]">
          {/* Dense canopy with breaks */}
          <path d="M0,0 L0,200 C50,180 80,140 120,160 C180,190 200,120 260,150 C320,180 360,100 420,130 C480,160 520,90 580,120 C640,150 680,80 740,110 C800,140 840,70 900,100 C960,130 1000,60 1060,90 C1120,120 1160,50 1200,80 L1200,0 Z" fill="#1C1B18" />
          {/* Canopy breaks showing deep blue-green */}
          <ellipse cx="300" cy="130" rx="30" ry="20" fill="rgba(30,50,40,0.6)" />
          <ellipse cx="700" cy="100" rx="25" ry="15" fill="rgba(30,50,40,0.5)" />
          <ellipse cx="1000" cy="120" rx="20" ry="12" fill="rgba(30,50,40,0.4)" />
        </svg>
      </motion.div>

      {/* ── Layer 2: Distant trees ── */}
      <motion.div
        className="absolute bottom-0 left-[-5%] w-[110%] h-[70%]"
        style={{ y: reduced ? 0 : distantY, opacity: reduced ? 1 : distantOp }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice" className="w-full h-full">
          {/* Tall distant tree silhouettes */}
          <path d="M80,400 L80,180 C80,160 60,100 70,60 C75,30 85,30 90,60 C100,100 80,160 80,180 Z" fill="rgba(107,143,113,0.12)" />
          <path d="M200,400 L200,200 C200,170 185,120 192,70 C196,40 204,40 208,70 C215,120 200,170 200,200 Z" fill="rgba(107,143,113,0.1)" />
          <path d="M380,400 L380,160 C380,130 365,80 374,35 C378,10 386,10 390,35 C399,80 380,130 380,160 Z" fill="rgba(107,143,113,0.14)" />
          <path d="M550,400 L550,190 C550,160 538,110 545,65 C548,40 556,40 559,65 C566,110 550,160 550,190 Z" fill="rgba(107,143,113,0.11)" />
          <path d="M720,400 L720,170 C720,140 708,90 715,45 C718,20 726,20 729,45 C736,90 720,140 720,170 Z" fill="rgba(107,143,113,0.13)" />
          <path d="M900,400 L900,195 C900,165 888,115 895,70 C898,45 906,45 909,70 C916,115 900,165 900,195 Z" fill="rgba(107,143,113,0.1)" />
          <path d="M1050,400 L1050,175 C1050,145 1038,95 1045,50 C1048,25 1056,25 1059,50 C1066,95 1050,145 1050,175 Z" fill="rgba(107,143,113,0.12)" />
          {/* Mist between distant trees */}
          <rect x="0" y="280" width="1200" height="120" fill="url(#distantMist)" />
          <defs>
            <linearGradient id="distantMist" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(143,168,154,0)" />
              <stop offset="50%" stopColor="rgba(143,168,154,0.06)" />
              <stop offset="100%" stopColor="rgba(143,168,154,0)" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* ── Light shafts ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: reduced ? 0.2 : lightShaftOp }}
        aria-hidden="true"
      >
        <div
          className="absolute top-[5%] left-[25%] w-[80px] h-[60%]"
          style={{
            background: "linear-gradient(180deg, rgba(196,160,85,0.08) 0%, rgba(196,160,85,0.02) 60%, transparent 100%)",
            transform: "rotate(8deg)",
            filter: "blur(15px)",
          }}
        />
        <div
          className="absolute top-[3%] left-[58%] w-[60px] h-[55%]"
          style={{
            background: "linear-gradient(180deg, rgba(196,160,85,0.06) 0%, rgba(196,160,85,0.015) 60%, transparent 100%)",
            transform: "rotate(-5deg)",
            filter: "blur(12px)",
          }}
        />
        <div
          className="absolute top-[8%] right-[20%] w-[50px] h-[50%]"
          style={{
            background: "linear-gradient(180deg, rgba(229,224,216,0.04) 0%, rgba(229,224,216,0.01) 60%, transparent 100%)",
            transform: "rotate(3deg)",
            filter: "blur(18px)",
          }}
        />
      </motion.div>

      {/* ── Layer 3: Mid-ground trees ── */}
      <motion.div
        className="absolute bottom-0 left-[-5%] w-[110%] h-[55%]"
        style={{ y: reduced ? 0 : midY, opacity: reduced ? 1 : midOp }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 1200 350" preserveAspectRatio="xMidYMax slice" className="w-full h-full">
          {/* Larger mid-ground tree silhouettes */}
          <path d="M50,350 L50,120 C50,90 30,50 40,15 C44,-5 56,-5 60,15 C70,50 50,90 50,120 Z" fill="rgba(60,85,65,0.3)" />
          <path d="M150,350 L150,100 C145,70 155,35 150,15 L150,100 M130,180 C120,160 110,170 130,180 M170,160 C180,140 190,155 170,160" fill="rgba(60,85,65,0.25)" />
          <path d="M300,350 L300,80 C300,50 288,20 295,-10 C298,-25 306,-25 309,-10 C316,20 300,50 300,80 Z" fill="rgba(55,80,60,0.35)" />
          <path d="M500,350 L500,110 C500,80 490,45 496,10 C498,-5 506,-5 508,10 C514,45 500,80 500,110 Z" fill="rgba(60,85,65,0.28)" />
          <path d="M680,350 L680,90 C680,60 668,25 675,-5 C678,-20 686,-20 689,-5 C696,25 680,60 680,90 Z" fill="rgba(55,80,60,0.32)" />
          <path d="M850,350 L850,105 C850,75 840,40 846,5 C848,-10 856,-10 858,5 C864,40 850,75 850,105 Z" fill="rgba(60,85,65,0.26)" />
          <path d="M1020,350 L1020,85 C1020,55 1008,20 1015,-10 C1018,-25 1026,-25 1029,-10 C1036,20 1020,55 1020,85 Z" fill="rgba(55,80,60,0.3)" />
          <path d="M1150,350 L1150,115 C1150,85 1140,50 1146,15 C1148,0 1156,0 1158,15 C1164,50 1150,85 1150,115 Z" fill="rgba(60,85,65,0.22)" />
          {/* Branches */}
          <path d="M285,180 C260,165 240,170 235,168" stroke="rgba(55,80,60,0.2)" strokeWidth="2" fill="none" />
          <path d="M315,200 C340,185 355,190 360,188" stroke="rgba(55,80,60,0.2)" strokeWidth="2" fill="none" />
          <path d="M665,170 C640,155 625,160 620,158" stroke="rgba(55,80,60,0.18)" strokeWidth="2" fill="none" />
          <path d="M695,195 C720,180 735,185 740,183" stroke="rgba(55,80,60,0.18)" strokeWidth="2" fill="none" />
        </svg>
      </motion.div>

      {/* ── Floating spores ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: reduced ? 0.6 : sporeOp }}
        aria-hidden="true"
      >
        {SPORES.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full"
            style={{
              width: s.size,
              height: s.size,
              left: `${s.x}%`,
              bottom: "20%",
              background: "rgba(229,224,216,0.25)",
              animation: reduced ? "none" : `sporeFloat ${s.dur}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </motion.div>

      {/* ── Mushroom clusters ── */}
      <motion.div
        className="absolute bottom-0 w-full h-[35%] pointer-events-none"
        style={{ y: reduced ? 0 : nearY, opacity: reduced ? 0.8 : mushroomOp }}
        aria-hidden="true"
      >
        {/* Cluster 1 - left */}
        <div className="absolute bottom-[15%] left-[12%]">
          <div className="relative">
            <div style={{ width: 3, height: 18, background: "rgba(180,170,150,0.25)", borderRadius: 2, margin: "0 auto" }} />
            <div
              className={reduced ? "" : "animate-mushroom-pulse"}
              style={{ width: 16, height: 9, borderRadius: "50% 50% 20% 20%", background: "rgba(126,170,160,0.35)", marginTop: -2, boxShadow: "0 0 12px rgba(126,170,160,0.25), 0 2px 8px rgba(126,170,160,0.15)", animationDelay: "0s" }}
            />
          </div>
          <div className="relative -mt-1 ml-4">
            <div style={{ width: 2, height: 12, background: "rgba(180,170,150,0.2)", borderRadius: 2, margin: "0 auto" }} />
            <div
              className={reduced ? "" : "animate-mushroom-pulse"}
              style={{ width: 11, height: 6, borderRadius: "50% 50% 20% 20%", background: "rgba(126,170,160,0.3)", marginTop: -1, boxShadow: "0 0 8px rgba(126,170,160,0.2)", animationDelay: "0.8s" }}
            />
          </div>
        </div>

        {/* Cluster 2 - center-right */}
        <div className="absolute bottom-[10%] right-[28%]">
          <div className="relative">
            <div style={{ width: 3, height: 20, background: "rgba(180,170,150,0.25)", borderRadius: 2, margin: "0 auto" }} />
            <div
              className={reduced ? "" : "animate-mushroom-pulse"}
              style={{ width: 18, height: 10, borderRadius: "50% 50% 20% 20%", background: "rgba(126,170,160,0.35)", marginTop: -2, boxShadow: "0 0 14px rgba(126,170,160,0.25), 0 2px 10px rgba(126,170,160,0.15)", animationDelay: "1.5s" }}
            />
          </div>
          <div className="relative -mt-2 -ml-3">
            <div style={{ width: 2, height: 14, background: "rgba(180,170,150,0.2)", borderRadius: 2, margin: "0 auto" }} />
            <div
              className={reduced ? "" : "animate-mushroom-pulse"}
              style={{ width: 13, height: 7, borderRadius: "50% 50% 20% 20%", background: "rgba(126,170,160,0.3)", marginTop: -1, boxShadow: "0 0 10px rgba(126,170,160,0.2)", animationDelay: "2.2s" }}
            />
          </div>
          <div className="relative -mt-1 ml-5">
            <div style={{ width: 2, height: 10, background: "rgba(180,170,150,0.18)", borderRadius: 2, margin: "0 auto" }} />
            <div
              className={reduced ? "" : "animate-mushroom-pulse"}
              style={{ width: 9, height: 5, borderRadius: "50% 50% 20% 20%", background: "rgba(126,170,160,0.25)", marginTop: -1, boxShadow: "0 0 6px rgba(126,170,160,0.15)", animationDelay: "0.5s" }}
            />
          </div>
        </div>

        {/* Cluster 3 - far right */}
        <div className="absolute bottom-[18%] right-[8%]">
          <div className="relative">
            <div style={{ width: 2, height: 15, background: "rgba(180,170,150,0.2)", borderRadius: 2, margin: "0 auto" }} />
            <div
              className={reduced ? "" : "animate-mushroom-pulse"}
              style={{ width: 14, height: 8, borderRadius: "50% 50% 20% 20%", background: "rgba(126,170,160,0.3)", marginTop: -2, boxShadow: "0 0 10px rgba(126,170,160,0.2), 0 2px 6px rgba(126,170,160,0.12)", animationDelay: "1.0s" }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Layer 4: Foreground ferns and floor ── */}
      <motion.div
        className="absolute bottom-0 left-[-5%] w-[110%] h-[30%]"
        style={{ y: reduced ? 0 : nearY, opacity: reduced ? 1 : nearOp }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 1200 200" preserveAspectRatio="xMidYMax slice" className="w-full h-full">
          {/* Forest floor */}
          <rect x="0" y="140" width="1200" height="60" fill="rgba(40,55,42,0.5)" />
          {/* Fern fronds - left */}
          <path d="M80,200 C80,170 60,150 40,140 C55,148 65,135 50,125 C65,130 75,120 65,110 C78,118 85,108 80,100 C88,110 90,130 80,200 Z" fill="rgba(80,115,85,0.35)" />
          <path d="M100,200 C100,175 115,155 130,145 C118,152 110,140 122,132 C112,136 105,128 112,120 C102,126 98,118 102,110 C96,120 95,140 100,200 Z" fill="rgba(75,110,80,0.3)" />
          {/* Fern fronds - center */}
          <path d="M520,200 C520,178 505,160 490,152 C502,158 508,148 498,140 C508,144 515,136 508,128 C516,134 520,126 518,120 C524,128 525,148 520,200 Z" fill="rgba(80,115,85,0.3)" />
          {/* Fern fronds - right */}
          <path d="M950,200 C950,172 935,155 920,148 C932,154 938,144 928,136 C938,140 945,132 938,124 C946,130 950,122 948,116 C954,124 955,145 950,200 Z" fill="rgba(75,110,80,0.32)" />
          <path d="M1080,200 C1080,175 1095,158 1108,150 C1097,156 1092,146 1100,138 C1092,142 1087,134 1093,128 C1085,134 1082,126 1085,120 C1080,128 1078,148 1080,200 Z" fill="rgba(80,115,85,0.28)" />
          {/* Fallen log */}
          <ellipse cx="350" cy="180" rx="60" ry="8" fill="rgba(70,60,50,0.3)" />
          <ellipse cx="350" cy="178" rx="55" ry="5" fill="rgba(80,70,58,0.2)" />
        </svg>
      </motion.div>

      {/* ── Fireflies ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: reduced ? 0.5 : fireflyOp }}
        aria-hidden="true"
      >
        {FIREFLIES.map((f) => (
          <div
            key={f.id}
            className="absolute rounded-full"
            style={{
              width: f.size,
              height: f.size,
              left: `${f.x}%`,
              top: `${f.y}%`,
              background: f.color,
              boxShadow: `0 0 ${f.size * 3}px ${f.color}`,
              animation: reduced ? "none" : `fireflyDrift ${f.dur}s ease-in-out ${f.delay}s infinite`,
            }}
          />
        ))}
      </motion.div>

      {/* ── Pool / clearing glow (the "cove") ── */}
      <motion.div
        className="absolute bottom-[8%] left-1/2 -translate-x-1/2"
        style={{ opacity: reduced ? 0.4 : poolOp }}
        aria-hidden="true"
      >
        <div
          style={{
            width: 200,
            height: 80,
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(126,170,160,0.2) 0%, rgba(107,143,113,0.1) 40%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 100,
            height: 40,
            borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(126,170,160,0.15) 0%, transparent 70%)",
            filter: "blur(8px)",
          }}
        />
      </motion.div>

      {/* ── Ground gradient to features ── */}
      <div
        className="absolute bottom-0 w-full h-[12%]"
        style={{ background: "linear-gradient(180deg, transparent 0%, rgba(234,240,235,0.3) 50%, #EAF0EB 100%)" }}
        aria-hidden="true"
      />

      {/* ── Scroll hint ── */}
      <motion.p
        className="absolute bottom-[3%] left-1/2 -translate-x-1/2 text-xs text-[rgba(229,224,216,0.3)] z-10"
        animate={reduced ? {} : { opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ↓ enter the cove
      </motion.p>
    </motion.section>
  );
}
