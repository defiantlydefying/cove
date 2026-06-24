import type { Metadata } from "next";
import NavBar from "@/components/homepage/NavBar";
import Footer from "@/components/homepage/Footer";

export const metadata: Metadata = {
  title: "Terms of Service · Cove",
  description: "The terms that govern your use of Cove.",
};

const LAST_UPDATED = "June 2026";

export default function TermsPage() {
  return (
    <>
      <NavBar />
      <main className="bg-[#F7F5F0]">
        <section className="pt-32 pb-16 bg-[#1C1B18]">
          <div className="max-w-3xl mx-auto px-6">
            <span className="text-xs font-medium tracking-widest uppercase text-cove-accent">Legal</span>
            <h1 className="text-4xl font-semibold text-[#E5E0D8] tracking-tight mt-3">Terms of Service</h1>
            <p className="text-sm text-[#E5E0D8]/40 mt-3">Last updated: {LAST_UPDATED}</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6 space-y-10 text-[#4A453F] leading-relaxed">
            <p className="text-[#6B6560]">
              These Terms of Service (&quot;Terms&quot;) govern your use of Cove. By creating an
              account or using Cove, you agree to these Terms. Please read them carefully, especially
              the health and AI disclaimers below.
            </p>

            {/* Prominent medical disclaimer */}
            <div className="rounded-2xl border border-cove-accent/30 bg-white p-6">
              <h2 className="text-lg font-semibold text-[#3D3832] mb-2">Important: Cove is not medical care</h2>
              <p className="text-[#6B6560] text-sm leading-relaxed">
                Cove is a wellness and productivity tool. It is not a medical device, and it does not
                provide medical, psychological, or therapeutic advice, diagnosis, or treatment. Cove
                is not a substitute for care from a qualified professional. Never disregard professional
                advice or delay seeking it because of something in Cove.
              </p>
              <p className="text-[#6B6560] text-sm leading-relaxed mt-3">
                If you are in crisis or may be in danger, contact your local emergency services
                immediately. In the US, you can call or text <strong>988</strong> (Suicide &amp; Crisis
                Lifeline) or text <strong>HOME</strong> to <strong>741741</strong>.
              </p>
            </div>

            <Section title="Eligibility">
              <p>
                You must be at least 13 years old to use Cove. By using Cove, you confirm that you meet
                this requirement and that the information you provide, including your date of birth, is
                accurate.
              </p>
            </Section>

            <Section title="What Cove is">
              <p>
                Cove helps you capture thoughts, organize tasks, build routines, reflect on your
                wellbeing, and stay gently motivated. Features are optional and can be turned on or off.
                Cove is designed to support everyday organization and emotional wellbeing — not to
                diagnose or treat any condition.
              </p>
            </Section>

            <Section title="The AI companion">
              <p>
                Cove&apos;s companion and other AI features generate responses automatically using a
                third-party AI model. The companion is not a person, not a therapist, counselor, or
                medical professional, and does not have professional training. Its responses may be
                inaccurate or incomplete and should not be relied on as professional advice. Use your
                own judgment, and consult a qualified professional for medical, legal, financial, or
                mental-health decisions.
              </p>
            </Section>

            <Section title="Your account">
              <p>
                You are responsible for keeping your login credentials secure and for activity on your
                account. Let us know promptly if you believe your account has been compromised.
              </p>
            </Section>

            <Section title="Your content">
              <p>
                You own the content you create in Cove. You grant us a limited license to store and
                process it solely to operate and provide the service to you (including sending relevant
                content to our AI provider to power features you use). You are responsible for the
                content you create and share.
              </p>
            </Section>

            <Section title="Community guidelines">
              <p>
                If you use community features, share only content you have the right to share, and be
                respectful. Do not post content that is harmful, harassing, hateful, threatening, or
                that encourages self-harm or violence. We may remove content and suspend accounts that
                violate these guidelines. Community posts are pseudonymous but are not private.
              </p>
            </Section>

            <Section title="Acceptable use">
              <ul className="list-disc pl-5 space-y-2">
                <li>Don&apos;t misuse, disrupt, or attempt to gain unauthorized access to the service.</li>
                <li>Don&apos;t use Cove for any unlawful purpose.</li>
                <li>Don&apos;t attempt to reverse-engineer or scrape the service except as permitted by law.</li>
              </ul>
            </Section>

            <Section title="Disclaimers">
              <p>
                Cove is provided &quot;as is&quot; and &quot;as available,&quot; without warranties of
                any kind, whether express or implied, to the fullest extent permitted by law. We do not
                warrant that the service will be uninterrupted, error-free, or that AI-generated content
                will be accurate.
              </p>
            </Section>

            <Section title="Limitation of liability">
              <p>
                To the fullest extent permitted by law, Cove and its operators will not be liable for
                any indirect, incidental, special, consequential, or punitive damages, or any loss of
                data, arising from your use of the service.
              </p>
            </Section>

            <Section title="Termination">
              <p>
                You may stop using Cove and delete your account at any time. We may suspend or terminate
                access if you violate these Terms or to protect the service or its users.
              </p>
            </Section>

            <Section title="Changes to these Terms">
              <p>
                We may update these Terms from time to time. If we make material changes, we will update
                the date above and, where appropriate, notify you in the app. Continued use after changes
                means you accept the updated Terms.
              </p>
            </Section>

            <Section title="Contact">
              <p>
                Questions about these Terms? Contact us at{" "}
                <a href="mailto:support@cove.app" className="text-cove-accent hover:underline">support@cove.app</a>.
              </p>
            </Section>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-[#3D3832] tracking-tight mb-3">{title}</h2>
      <div className="text-[#6B6560] space-y-2">{children}</div>
    </div>
  );
}
