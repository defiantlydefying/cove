"use client";

import { useRef, useState, ReactNode } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface MagneticElementProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

export default function MagneticElement({ children, strength = 10, className = "" }: MagneticElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const reduced = useReducedMotion();

  const handleMouse = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setPosition({
      x: (e.clientX - cx) * (strength / 100),
      y: (e.clientY - cy) * (strength / 100),
    });
  };

  const handleLeave = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      animate={position}
      transition={{ type: "spring", damping: 15, stiffness: 150 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
