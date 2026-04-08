"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface CharacterRevealProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "p" | "span";
}

export default function CharacterReveal({
  text,
  className = "",
  delay = 0,
  stagger = 0.04,
  as: Tag = "span",
}: CharacterRevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  // Split into words to preserve natural word wrapping
  const words = text.split(" ");
  let charIndex = 0;

  return (
    <Tag className={className} aria-label={text}>
      {words.map((word, wi) => {
        const chars = word.split("");
        const wordElement = (
          <span key={wi} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {chars.map((char) => {
              const ci = charIndex++;
              return (
                <motion.span
                  key={ci}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "20%" }}
                  transition={{
                    duration: 0.4,
                    ease: "easeOut",
                    delay: delay + ci * stagger,
                  }}
                  style={{ display: "inline-block" }}
                  aria-hidden="true"
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
        );
        charIndex++; // count the space
        return (
          <span key={`w${wi}`}>
            {wordElement}
            {wi < words.length - 1 && " "}
          </span>
        );
      })}
    </Tag>
  );
}
