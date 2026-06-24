"use client";

import { useEffect, useRef } from "react";

// A custom cursor for the marketing pages: a precise dot that tracks exactly,
// and a soft ring that trails behind with easing — like a ripple following your
// hand through water. The ring swells over interactive elements. Activates only
// on fine-pointer, non-reduced-motion devices; everyone else keeps the native
// cursor untouched.

const INTERACTIVE = "a, button, [role='button'], input, textarea, select, label, summary, [data-cursor='hover']";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!finePointer || reduced || !dot || !ring) return;

    document.body.classList.add("cursor-none");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let scale = 1;
    let targetScale = 1;
    let visible = false;
    let hovering = false;
    let raf = 0;

    const show = () => {
      if (visible) return;
      visible = true;
      dot.style.opacity = hovering ? "0" : "1";
      ring.style.opacity = "1";
    };

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX - 3.5}px, ${mouseY - 3.5}px)`;
      show();
    };

    const onOver = (e: MouseEvent) => {
      const el = e.target as Element | null;
      hovering = !!el?.closest?.(INTERACTIVE);
      targetScale = hovering ? 1.7 : 1;
      ring.classList.toggle("is-hover", hovering);
      // The ring fills to a solid disc on hover, so the dot would just sit on top
      // of it — hide it for a clean invert.
      if (visible) dot.style.opacity = hovering ? "0" : "1";
    };

    const onDown = () => {
      targetScale = ring.classList.contains("is-hover") ? 1.5 : 0.7;
    };
    const onUp = () => {
      targetScale = ring.classList.contains("is-hover") ? 1.8 : 1;
    };
    const onLeave = () => {
      visible = false;
      dot.style.opacity = "0";
      ring.style.opacity = "0";
    };

    const loop = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      scale += (targetScale - scale) * 0.15;
      ring.style.transform = `translate(${ringX - 19}px, ${ringY - 19}px) scale(${scale})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      document.body.classList.remove("cursor-none");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cove-cursor-ring" aria-hidden="true" />
      <div ref={dotRef} className="cove-cursor-dot" aria-hidden="true" />
    </>
  );
}
