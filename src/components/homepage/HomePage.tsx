"use client";

import NavBar from "./NavBar";
import HeroParticles from "./HeroParticles";
import ParallaxLandscape from "./ParallaxLandscape";
import FeatureTicker from "./FeatureTicker";
import FeatureNetwork from "./FeatureNetwork";
import SplitReveal from "./SplitReveal";
import StatsCounter from "./StatsCounter";
import TestimonialConstellation from "./TestimonialConstellation";
import EmpathyBreak from "./EmpathyBreak";
import GenerativeCTA from "./GenerativeCTA";
import Footer from "./Footer";
import ScrollProgress from "./ScrollProgress";
import GrainOverlay from "./GrainOverlay";
import AuroraOverlay from "./AuroraOverlay";
import ParticleMotes from "./ParticleMotes";
import CursorLight from "./CursorLight";
import MountainDivider from "./MountainDivider";
import WaveDivider from "./WaveDivider";

export default function HomePage() {
  return (
    <>
      <GrainOverlay />
      <AuroraOverlay />
      <ParticleMotes />
      <CursorLight />
      <ScrollProgress />
      <NavBar />

      <main>
        <HeroParticles />
        <ParallaxLandscape />
        <MountainDivider color="rgba(126,170,160,0.08)" />
        <FeatureTicker />
        <FeatureNetwork />
        <WaveDivider topColor="rgba(107,143,113,0.1)" bottomColor="rgba(126,170,160,0.08)" />
        <SplitReveal />
        <MountainDivider color="rgba(196,160,85,0.06)" />
        <StatsCounter />
        <TestimonialConstellation />
        <WaveDivider topColor="rgba(160,139,160,0.08)" bottomColor="rgba(196,121,91,0.06)" />
        <MountainDivider color="rgba(196,121,91,0.05)" />
        <EmpathyBreak />
        <GenerativeCTA />
        <Footer />
      </main>
    </>
  );
}
