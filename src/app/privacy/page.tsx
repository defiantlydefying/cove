import type { Metadata } from "next";
import NavBar from "@/components/homepage/NavBar";
import Footer from "@/components/homepage/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy · Cove",
  description: "How Cove collects, uses, and protects your information.",
};

const LAST_UPDATED = "June 2026";

export default function PrivacyPage() {
  return (
    <>
      <NavBar />
      <main className="bg-[#F7F5F0]">
        <section className="pt-32 pb-16 bg-[#1C1B18]">
          <div className="max-w-3xl mx-auto px-6">
            <span className="text-xs font-medium tracking-widest uppercase text-cove-accent">Legal</span>
            <h1 className="text-4xl font-semibold text-[#E5E0D8] tracking-tight mt-3">Privacy Policy</h1>
            <p className="text-sm text-[#E5E0D8]/40 mt-3">Last updated: {LAST_UPDATED}</p>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6 space-y-10 text-[#4A453F] leading-relaxed">
            <p className="text-[#6B6560]">
              Cove (&quot;Cove,&quot; &quot;we,&quot; &quot;us&quot;) is a wellness and productivity app.
              This policy explains what we collect, how we use it, and the choices you have. We
              designed Cove to handle your information with care — much of what you share here is
              personal, and we treat it that way.
            </p>

            <Section title="Information we collect">
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Account information:</strong> your name, email address, and date of birth (used to confirm you meet our minimum age). If you sign in with Google, we receive your basic Google profile and email.</li>
                <li><strong>Content you create:</strong> tasks, routines, reminders, notes, brain dumps, wellness check-ins (mood, energy, sleep), messages to your companion, and any images you upload for capture.</li>
                <li><strong>Optional profile details:</strong> information you choose to add, such as conditions, medications, or age, to personalize your experience. You are never required to provide these.</li>
                <li><strong>Community content:</strong> routines or posts you choose to share, which are shown to other users under a pseudonymous display name.</li>
                <li><strong>Technical data:</strong> basic information needed to operate the app securely, such as authentication sessions.</li>
              </ul>
            </Section>

            <Section title="Sensitive information">
              <p>
                Some of what you share — your mood, your reflections, what you tell your companion —
                can reveal personal or health-related details. We do not sell this information, we do
                not use it for advertising, and we do not share it with advertisers or data brokers.
                We use it only to provide and improve the features you use.
              </p>
            </Section>

            <Section title="How we use your information">
              <ul className="list-disc pl-5 space-y-2">
                <li>To provide Cove&apos;s features — saving your tasks, tracking your routines and wellness, and powering your companion.</li>
                <li>To personalize your experience based on the settings and profile details you choose.</li>
                <li>To keep your account secure and operate the service.</li>
                <li>To communicate with you about your account when necessary.</li>
              </ul>
            </Section>

            <Section title="AI processing">
              <p>
                Cove&apos;s companion, brain dump, task breakdown, image capture, and reminder parsing
                are powered by a third-party AI provider (Google&apos;s Gemini API). When you use these
                features, the relevant text or image is sent to that provider to generate a response.
                We send only what is needed to perform the feature. We do not use your content to train
                our own models. Your use of these features is also subject to the provider&apos;s terms.
              </p>
              <p className="mt-3">
                The companion is an AI, not a person, and not a medical or mental-health professional.
                Please see our <a href="/terms" className="text-cove-accent hover:underline">Terms of Service</a> for important disclaimers.
              </p>
            </Section>

            <Section title="Sharing">
              <p>We share your information only in these limited cases:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>With service providers who help us operate Cove (such as hosting, database, and the AI provider above), under appropriate confidentiality obligations.</li>
                <li>Content you explicitly choose to publish to the community, shown pseudonymously.</li>
                <li>When required by law, or to protect the safety of a person or the public.</li>
              </ul>
              <p className="mt-3">We do not sell your personal information.</p>
            </Section>

            <Section title="Your choices and rights">
              <ul className="list-disc pl-5 space-y-2">
                <li>You can view and edit most of your information directly in the app.</li>
                <li>You can request a copy of your data, or ask us to delete your account and associated content, by contacting us.</li>
                <li>You can turn modules on or off at any time, and choose what optional information to provide.</li>
              </ul>
              <p className="mt-3">
                Depending on where you live, you may have additional rights over your personal and
                health-related information. We honor applicable requests.
              </p>
            </Section>

            <Section title="Data retention">
              <p>
                We keep your information for as long as your account is active. When you delete your
                account, we delete or de-identify your personal content within a reasonable period,
                except where we must retain it to comply with legal obligations.
              </p>
            </Section>

            <Section title="Security">
              <p>
                We use reasonable technical and organizational measures to protect your information,
                including encrypted connections and hashed passwords. No system is perfectly secure,
                but we work to safeguard your data.
              </p>
            </Section>

            <Section title="Children">
              <p>
                Cove is not intended for children under 13, and we do not knowingly collect personal
                information from them. We ask for date of birth at sign-up to enforce this. If you
                believe a child under 13 has created an account, please contact us and we will remove it.
              </p>
            </Section>

            <Section title="Changes to this policy">
              <p>
                We may update this policy from time to time. If we make material changes, we will
                update the date above and, where appropriate, notify you in the app.
              </p>
            </Section>

            <Section title="Contact">
              <p>
                Questions about this policy or your data? Contact us at{" "}
                <a href="mailto:privacy@cove.app" className="text-cove-accent hover:underline">privacy@cove.app</a>.
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
