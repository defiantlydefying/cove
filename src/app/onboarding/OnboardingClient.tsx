"use client";

import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export default function OnboardingClient() {
  return (
    <OnboardingWizard
      onComplete={() => {
        // Full-page navigation (not router.push) so two things happen:
        //  - `?welcome=1` triggers the GuidedTour on the dashboard.
        //  - ThemeProvider (mounted in the root layout) remounts and re-fetches
        //    settings, applying the theme/accent the user just chose. A soft
        //    navigation would leave the stale first-paint theme in place.
        window.location.href = "/dashboard?welcome=1";
      }}
    />
  );
}
