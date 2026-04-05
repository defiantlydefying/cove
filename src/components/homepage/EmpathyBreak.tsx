"use client";

import CharacterReveal from "./CharacterReveal";
import MorphingBlob from "./MorphingBlob";

export default function EmpathyBreak() {
  return (
    <section id="about" className="relative w-full py-32 flex items-center justify-center overflow-hidden bg-cove-offwhite">
      <MorphingBlob className="absolute w-[400px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50" />

      <div className="relative z-10 max-w-[560px] text-center px-6">
        <CharacterReveal
          text="You don't need to work harder."
          as="p"
          className="text-[clamp(1.1rem,2.5vw,1.5rem)] font-normal leading-relaxed text-cove-charcoal"
          delay={0}
          stagger={0.03}
        />
        <CharacterReveal
          text="You don't need another system that makes you feel behind."
          as="p"
          className="text-[clamp(1.1rem,2.5vw,1.5rem)] font-normal leading-relaxed text-cove-charcoal mt-4"
          delay={0.5}
          stagger={0.025}
        />
        <div className="mt-6">
          <CharacterReveal
            text="You need a space that "
            as="p"
            className="text-[clamp(1.1rem,2.5vw,1.5rem)] font-normal leading-relaxed text-cove-charcoal inline"
            delay={1.5}
            stagger={0.03}
          />
          <CharacterReveal
            text="gets it"
            as="span"
            className="text-[clamp(1.1rem,2.5vw,1.5rem)] font-medium leading-relaxed text-cove-accent inline"
            delay={2.1}
            stagger={0.05}
          />
          <CharacterReveal
            text="."
            as="span"
            className="text-[clamp(1.1rem,2.5vw,1.5rem)] font-normal leading-relaxed text-cove-charcoal inline"
            delay={2.5}
          />
        </div>
      </div>
    </section>
  );
}
