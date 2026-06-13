"use client";

import NavBar from "./NavBar";
import HeroSection from "./HeroSection";
import FeatureShowcase from "./FeatureShowcase";
import SplitReveal from "./SplitReveal";
import HowItWorks from "./HowItWorks";
import Testimonials from "./Testimonials";
import FinalCTA from "./FinalCTA";
import Footer from "./Footer";

export default function HomePage() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-cove-accent focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to content
      </a>
      <NavBar />
      <main id="main-content">
        <HeroSection />
        <FeatureShowcase />
        <SplitReveal />
        <HowItWorks />
        <Testimonials />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}
