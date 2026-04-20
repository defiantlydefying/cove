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
      <NavBar />
      <main>
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
