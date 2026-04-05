"use client";

import { motion } from "framer-motion";
import CoveLogo from "./CoveLogo";
import FeatureNode from "./FeatureNode";
import FeatureVignette from "./FeatureVignette";
import { useReducedMotion } from "@/lib/useReducedMotion";

const NODES = [
  { icon: "↻", label: "Routines", color: "#7EAAA0", bg: "rgba(126,170,160,0.10)", border: "rgba(126,170,160,0.22)", type: "toggles" as const, pos: "top-[8%] left-[22%]" },
  { icon: "★", label: "Streaks", color: "#C4A055", bg: "rgba(196,160,85,0.10)", border: "rgba(196,160,85,0.22)", type: "streak" as const, pos: "top-[8%] right-[22%]" },
  { icon: "♡", label: "Wellness", color: "#A08BA0", bg: "rgba(160,139,160,0.10)", border: "rgba(160,139,160,0.22)", type: "mood" as const, pos: "bottom-[12%] left-[18%]" },
  { icon: "⏰", label: "Reminders", color: "#C4795B", bg: "rgba(196,121,91,0.10)", border: "rgba(196,121,91,0.22)", type: "tasks" as const, pos: "bottom-[12%] right-[18%]" },
];

export default function FeatureNetwork() {
  const reduced = useReducedMotion();

  return (
    <section id="features" className="relative w-full min-h-screen flex items-center justify-center py-20 bg-cove-offwhite">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at center, #3D3832 1px, transparent 1px)", backgroundSize: "24px 24px" }} aria-hidden="true" />

      <div className="relative w-full max-w-[600px] aspect-square mx-auto">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 600" aria-hidden="true">
          {[
            { x2: 150, y2: 70, color: "rgba(126,170,160,0.15)", delay: 0 },
            { x2: 450, y2: 70, color: "rgba(196,160,85,0.15)", delay: 0.3 },
            { x2: 120, y2: 500, color: "rgba(160,139,160,0.15)", delay: 0.6 },
            { x2: 480, y2: 500, color: "rgba(196,121,91,0.15)", delay: 0.9 },
          ].map((line, i) => (
            <motion.line
              key={i}
              x1="300" y1="300"
              x2={line.x2} y2={line.y2}
              stroke={line.color}
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeOut", delay: line.delay }}
            />
          ))}
        </svg>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          {!reduced && [0, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-[14px]"
              style={{ border: "1px solid rgba(107,143,113,0.15)" }}
              animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: "easeOut" }}
              aria-hidden="true"
            />
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <CoveLogo size={72} />
          </motion.div>
        </div>

        {NODES.map((node, i) => (
          <div key={node.label} className={`absolute ${node.pos} z-10`}>
            <FeatureNode
              icon={<span className="text-lg">{node.icon}</span>}
              label={node.label}
              color={node.color}
              bg={node.bg}
              border={node.border}
              delay={0.15 * (i + 1)}
            >
              <FeatureVignette type={node.type} />
            </FeatureNode>
          </div>
        ))}
      </div>
    </section>
  );
}
