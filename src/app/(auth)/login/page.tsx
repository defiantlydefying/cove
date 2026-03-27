import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-cove-offwhite">
      <div className="w-full max-w-sm rounded-3xl bg-cove-card p-8 shadow-[0_4px_32px_rgba(61,56,50,0.06)]">
        <h1 className="text-4xl font-semibold tracking-tight text-cove-charcoal text-center">Cove</h1>
        <p className="mb-8 text-cove-muted text-center text-sm tracking-wide">Your cove.</p>
        <LoginForm />
      </div>
    </main>
  );
}
