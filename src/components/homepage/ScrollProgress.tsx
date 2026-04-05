"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const width = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.05, 0.1], [0, 0, 1]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[51] h-[3px]"
      style={{ opacity }}
      aria-hidden="true"
    >
      <motion.div
        className="h-full"
        style={{
          width,
          background: "linear-gradient(90deg, #6B8F71, #7EAAA0, #C4A055, #C4795B)",
        }}
      />
    </motion.div>
  );
}
