import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-gradient-to-br from-cove-gradient-start/5 via-cove-offwhite to-cove-gradient-end/5">
      <div className="w-full max-w-sm rounded-2xl bg-cove-card p-8 shadow-[0_4px_24px_rgba(91,78,196,0.08)]">
        <h1 className="text-4xl font-semibold tracking-tight text-cove-accent text-center">Cove</h1>
        <p className="mb-8 text-cove-muted text-center text-sm tracking-wide">Your cove.</p>
        <LoginForm />
      </div>
    </main>
  );
}
