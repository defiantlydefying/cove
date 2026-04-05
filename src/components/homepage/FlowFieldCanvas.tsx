"use client";

import { useEffect, useRef } from "react";
import { createNoise2D } from "@/lib/noise";

const PALETTE = [
  [107, 143, 113], [126, 170, 160], [196, 160, 85],
  [160, 139, 160], [196, 121, 91], [143, 168, 154],
];

interface FlowParticle {
  x: number; y: number;
  color: number[];
  alpha: number;
  width: number;
  life: number;
  maxLife: number;
}

export default function FlowFieldCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const noise2D = createNoise2D();
    let animId: number;
    let particles: FlowParticle[] = [];
    const SCALE = 0.003;
    const PARTICLE_COUNT = 200;

    const spawnParticle = (w: number, h: number): FlowParticle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      alpha: 0.1 + Math.random() * 0.3,
      width: 0.5 + Math.random() * 1,
      life: 0,
      maxLife: 200 + Math.random() * 300,
    });

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      particles = Array.from({ length: PARTICLE_COUNT }, () => spawnParticle(rect.width, rect.height));
      ctx.fillStyle = "#1C1B18";
      ctx.fillRect(0, 0, rect.width, rect.height);
    };

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    let t = 0;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.fillStyle = "rgba(28,27,24,0.03)";
      ctx.fillRect(0, 0, w, h);

      const mouse = mouseRef.current;
      t += 0.002;

      for (const p of particles) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseInfluence = dist < 150 ? (150 - dist) / 150 : 0;
        const mouseAngle = Math.atan2(dy, dx);

        const angle = noise2D(p.x * SCALE, p.y * SCALE + t) * Math.PI * 2;
        const finalAngle = mouseInfluence > 0
          ? angle * (1 - mouseInfluence) + mouseAngle * mouseInfluence
          : angle;

        const speed = 0.8;
        p.x += Math.cos(finalAngle) * speed;
        p.y += Math.sin(finalAngle) * speed;
        p.life++;

        const lifeRatio = p.life / p.maxLife;
        const fadeAlpha = lifeRatio < 0.1 ? lifeRatio * 10 : lifeRatio > 0.9 ? (1 - lifeRatio) * 10 : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.width, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${p.alpha * fadeAlpha})`;
        ctx.fill();

        if (p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10 || p.life > p.maxLife) {
          Object.assign(p, spawnParticle(w, h));
        }
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
  }, []);

  return (
    <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${className}`} aria-hidden="true" />
  );
}
