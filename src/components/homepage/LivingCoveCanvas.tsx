"use client";

import { useEffect, useRef } from "react";
import { createNoise2D } from "@/lib/noise";

// ── Living Cove ──────────────────────────────────────────────────────────
// The hero's water. Big soft pools of blue/teal/sage light drift across a warm
// cream base (like sun moving through shallow water), and the cursor leaves
// expanding ripples behind it with a soft light where it rests — so moving the
// mouse visibly disturbs the surface. Calm and slow, with a static fallback for
// reduced-motion.

const BASE = "#F1ECE4";

// [r,g,b, baseX, baseY, radius(×maxdim), alpha, driftSpeed, phase]
const POOLS: [number, number, number, number, number, number, number, number, number][] = [
  [78, 142, 168, 0.24, 0.30, 0.62, 0.55, 0.00018, 0], // ocean
  [108, 155, 196, 0.52, 0.18, 0.58, 0.46, 0.00015, 14], // sky blue
  [126, 170, 160, 0.74, 0.40, 0.6, 0.52, 0.0002, 33], // teal
  [107, 143, 113, 0.32, 0.7, 0.56, 0.4, 0.00016, 55], // sage
  [150, 186, 208, 0.62, 0.74, 0.5, 0.42, 0.00019, 77], // pale blue
  [201, 171, 112, 0.86, 0.66, 0.46, 0.26, 0.00014, 99], // warm spark
];

interface Ripple {
  x: number;
  y: number;
  life: number;
  maxLife: number;
}

export default function LivingCoveCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef({ x: -9999, y: -9999, active: false });
  const mouse = useRef({ x: -9999, y: -9999 });
  const last = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const noise2D = createNoise2D(7);
    let ripples: Ripple[] = [];
    let animId = 0;
    let t = 0;
    let w = 0;
    let h = 0;

    const drawPools = (time: number) => {
      const maxDim = Math.max(w, h);
      for (const p of POOLS) {
        const [r, g, b, bx, by, rad, alpha, sp, ph] = p;
        const nx = noise2D(ph, time * sp);
        const ny = noise2D(ph + 50, time * sp);
        const cx = (bx + nx * 0.16) * w;
        const cy = (by + ny * 0.16) * h;
        const radius = rad * maxDim;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`);
        grad.addColorStop(0.55, `rgba(${r},${g},${b},${alpha * 0.35})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) {
        ctx.fillStyle = BASE;
        ctx.fillRect(0, 0, w, h);
        drawPools(0);
      }
    };

    const onMove = (cx: number, cy: number) => {
      const rect = canvas.getBoundingClientRect();
      target.current = { x: cx - rect.left, y: cy - rect.top, active: true };
    };
    const onMouse = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onLeave = () => {
      target.current.active = false;
    };

    const draw = () => {
      t += 1;

      // Opaque base each frame, then the drifting pools of light.
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = BASE;
      ctx.fillRect(0, 0, w, h);
      drawPools(t);

      // Ease the cursor like it's moving through water.
      const tgt = target.current;
      if (tgt.active) {
        mouse.current.x += (tgt.x - mouse.current.x) * 0.12;
        mouse.current.y += (tgt.y - mouse.current.y) * 0.12;

        // Spawn a ripple every time the pointer travels far enough.
        const dx = mouse.current.x - last.current.x;
        const dy = mouse.current.y - last.current.y;
        if (last.current.x < -9000 || Math.hypot(dx, dy) > 26) {
          ripples.push({ x: mouse.current.x, y: mouse.current.y, life: 0, maxLife: 95 });
          if (ripples.length > 40) ripples.shift();
          last.current = { x: mouse.current.x, y: mouse.current.y };
        }

        // Soft light where the cursor rests — sun catching the surface.
        const glow = ctx.createRadialGradient(
          mouse.current.x, mouse.current.y, 0,
          mouse.current.x, mouse.current.y, 180
        );
        glow.addColorStop(0, "rgba(255,255,255,0.22)");
        glow.addColorStop(0.5, "rgba(214,232,235,0.1)");
        glow.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }

      // Expanding ripple rings.
      for (const rp of ripples) {
        rp.life++;
        const prog = rp.life / rp.maxLife;
        const eased = 1 - Math.pow(1 - prog, 3);
        const radius = 6 + eased * 230;
        const alpha = (1 - prog) * 0.5;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(120,170,190,${alpha})`;
        ctx.lineWidth = Math.max(0.5, 2.4 * (1 - prog));
        ctx.stroke();
        // a fainter inner ring for depth
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, radius * 0.72, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.6})`;
        ctx.lineWidth = Math.max(0.4, 1.4 * (1 - prog));
        ctx.stroke();
      }
      ripples = ripples.filter((rp) => rp.life < rp.maxLife);

      animId = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
        animId = 0;
      } else if (!animId && !reduced) {
        animId = requestAnimationFrame(draw);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    if (!reduced) {
      window.addEventListener("mousemove", onMouse, { passive: true });
      window.addEventListener("touchmove", onTouch, { passive: true });
      document.addEventListener("mouseleave", onLeave);
      document.addEventListener("visibilitychange", onVisibility);
      animId = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  );
}
