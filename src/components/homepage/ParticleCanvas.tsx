"use client";

import { useEffect, useRef, useCallback } from "react";

const LOGO_TARGETS = [
  [0.214, 0.75], [0.25, 0.64], [0.286, 0.536], [0.321, 0.429],
  [0.357, 0.393], [0.393, 0.429], [0.429, 0.536], [0.464, 0.464],
  [0.5, 0.393], [0.536, 0.321], [0.571, 0.286], [0.607, 0.321],
  [0.643, 0.393], [0.679, 0.464], [0.714, 0.536], [0.75, 0.607],
  [0.786, 0.679], [0.821, 0.714], [0.857, 0.75],
  [0.393, 0.75], [0.429, 0.679], [0.464, 0.625], [0.5, 0.607],
  [0.536, 0.625], [0.571, 0.679], [0.607, 0.714], [0.643, 0.75],
];

const PALETTE = [
  [107, 143, 113], [126, 170, 160], [196, 160, 85],
  [160, 139, 160], [196, 121, 91], [143, 168, 154],
];

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  targetX: number; targetY: number;
  color: number[];
  alpha: number;
  size: number;
}

interface ParticleCanvasProps {
  className?: string;
  onFormationComplete?: () => void;
}

export default function ParticleCanvas({ className = "", onFormationComplete }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const phaseRef = useRef<"drift" | "converge">("drift");
  const callbackFiredRef = useRef(false);

  const initParticles = useCallback((w: number, h: number) => {
    const centerX = w / 2;
    const centerY = h / 2;
    const scale = Math.min(w, h) * 0.4;
    const count = 100;
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const target = LOGO_TARGETS[i % LOGO_TARGETS.length];
      const color = PALETTE[i % PALETTE.length];
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        targetX: centerX + (target[0] - 0.5) * scale,
        targetY: centerY + (target[1] - 0.5) * scale,
        color,
        alpha: 0.2 + Math.random() * 0.4,
        size: 1.5 + Math.random() * 1.5,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const startTime = Date.now();

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      particlesRef.current = initParticles(rect.width, rect.height);
    };

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const elapsed = (Date.now() - startTime) / 1000;
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      if (elapsed > 1.5 && phaseRef.current === "drift") {
        phaseRef.current = "converge";
      }

      const isConverging = phaseRef.current === "converge";
      const convergeFactor = isConverging ? Math.min((elapsed - 1.5) / 2.5, 1) : 0;

      // Draw radial glow behind formation as particles converge
      if (isConverging && convergeFactor > 0.2) {
        const centerX = w / 2;
        const centerY = h / 2;
        const glowAlpha = Math.min((convergeFactor - 0.2) / 0.8, 1);
        const pulse = convergeFactor >= 1 ? 1 + Math.sin(elapsed * 1.5) * 0.15 : 1;
        const glowRadius = Math.min(w, h) * 0.25 * pulse;

        const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
        glow.addColorStop(0, `rgba(107,143,113,${0.12 * glowAlpha})`);
        glow.addColorStop(0.4, `rgba(126,170,160,${0.06 * glowAlpha})`);
        glow.addColorStop(0.7, `rgba(196,160,85,${0.03 * glowAlpha})`);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
      }

      for (const p of particles) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100 && dist > 0) {
          const force = (100 - dist) / 100 * 2;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        if (isConverging) {
          const tx = p.targetX - p.x;
          const ty = p.targetY - p.y;
          const spring = 0.02 * convergeFactor;
          p.vx += tx * spring;
          p.vy += ty * spring;
          p.vx *= 0.92;
          p.vy *= 0.92;
        } else {
          p.vx *= 0.99;
          p.vy *= 0.99;
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Brighten particles as they converge and add glow
        const brighten = isConverging ? convergeFactor * 0.4 : 0;
        const particleAlpha = Math.min(p.alpha + brighten, 0.9);
        const glowSize = isConverging ? p.size * (1 + convergeFactor * 0.8) : p.size;

        if (isConverging && convergeFactor > 0.5) {
          ctx.shadowColor = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${0.5 * convergeFactor})`;
          ctx.shadowBlur = glowSize * 3;
        } else {
          ctx.shadowColor = "transparent";
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${particleAlpha})`;
        ctx.fill();
      }
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      const connectionDist = isConverging ? 60 + convergeFactor * 40 : 80;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < connectionDist) {
            const alpha = (1 - d / connectionDist) * 0.15 * (isConverging ? convergeFactor : 0.3);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(107,143,113,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      if (convergeFactor >= 1 && !callbackFiredRef.current) {
        callbackFiredRef.current = true;
        onFormationComplete?.();
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse);
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, [initParticles, onFormationComplete]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      aria-hidden="true"
    />
  );
}
