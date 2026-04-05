"use client";

import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FeatureNodeProps {
  icon: ReactNode;
  label: string;
  color: string;
  bg: string;
  border: string;
  delay?: number;
  children?: ReactNode;
}

export default function FeatureNode({ icon, label, color, bg, border, delay = 0, children }: FeatureNodeProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.5, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <motion.div
        className="w-14 h-14 rounded-[14px] flex items-center justify-center text-xl cursor-pointer backdrop-blur-[10px] relative z-10"
        style={{ background: bg, border: `1.5px solid ${border}` }}
        whileHover={{ scale: 1.15, rotateX: -4, rotateY: 8, transition: { duration: 0.3 } }}
      >
        <div className="absolute inset-0 rounded-[14px] pointer-events-none opacity-0 hover:opacity-60 transition-opacity" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)" }} />
        {icon}
      </motion.div>
      <p className="text-center text-[0.6rem] font-medium mt-1.5" style={{ color }}>{label}</p>

      <AnimatePresence>
        {expanded && children && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ duration: 0.25 }}
            className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-[220px] rounded-2xl overflow-hidden z-20"
            style={{ background: "rgba(255,253,249,0.85)", backdropFilter: "blur(12px)", border: `1px solid ${border}`, boxShadow: "0 8px 30px rgba(61,56,50,0.08)" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
