"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import CoveLogo from "./CoveLogo";
import MagneticElement from "./MagneticElement";

export default function NavBar() {
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 100], [0, 0.85]);
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 0.06]);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-5 py-4"
      style={{
        backgroundColor: useTransform(bgOpacity, (v) => `rgba(247,245,240,${v})`),
        backdropFilter: useTransform(scrollY, [0, 100], ["blur(0px)", "blur(12px)"]),
        WebkitBackdropFilter: useTransform(scrollY, [0, 100], ["blur(0px)", "blur(12px)"]),
        borderBottom: useTransform(borderOpacity, (v) => `1px solid rgba(61,56,50,${v})`),
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <CoveLogo size={28} />
          <span className="text-base font-semibold tracking-tight text-cove-charcoal">cove</span>
        </a>
        <div className="flex items-center gap-6">
          <MagneticElement>
            <a href="/features" className="text-sm text-cove-muted hover:text-cove-charcoal transition-colors">Features</a>
          </MagneticElement>
          <MagneticElement>
            <a href="/about" className="text-sm text-cove-muted hover:text-cove-charcoal transition-colors">About</a>
          </MagneticElement>
          <MagneticElement>
            <a
              href="/register"
              className="text-sm px-4 py-2 rounded-lg bg-cove-accent text-cove-sidebar-text font-medium hover:bg-cove-accent-hover transition-colors"
            >
              Get started
            </a>
          </MagneticElement>
        </div>
      </div>
    </motion.nav>
  );
}
