import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AGE_COOKIE } from "@/lib/age";
import AgeCheckForm from "./AgeCheckForm";

// Only allow redirecting back to internal app paths, never an absolute/external URL.
function safeNext(next: string | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/onboarding";
}

export default async function AgeCheckPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const { next } = await searchParams;
  const target = safeNext(next);

  // Already passed the gate on this device — don't re-prompt.
  const cookieStore = await cookies();
  if (cookieStore.get(AGE_COOKIE)?.value === "1") {
    redirect(target);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-cove-offwhite">
      <div className="w-full max-w-sm rounded-3xl bg-cove-card p-8 shadow-[0_4px_32px_rgba(61,56,50,0.06)]">
        <h1 className="text-2xl font-semibold tracking-tight text-cove-charcoal text-center">
          One quick thing
        </h1>
        <p className="mt-2 mb-6 text-cove-muted text-center text-sm leading-relaxed">
          Cove is designed for ages 13 and up. Please confirm your date of birth to continue.
        </p>
        <AgeCheckForm next={target} />
      </div>
    </main>
  );
}
