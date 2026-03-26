"use client";

import { useRouter } from "next/navigation";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export default function OnboardingClient() {
  const router = useRouter();

  return (
    <OnboardingWizard
      onComplete={() => {
        router.push("/dashboard");
      }}
    />
  );
}
