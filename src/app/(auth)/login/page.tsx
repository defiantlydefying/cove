import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="auth-screen flex min-h-screen flex-col items-center justify-center px-4 bg-cove-offwhite" data-theme="light">
      <div className="auth-card w-full max-w-sm rounded-3xl bg-cove-card p-8 shadow-[0_4px_32px_rgba(61,56,50,0.06)]">
        <div className="auth-brand">
          <span className="auth-app-mark" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 32 32">
              <path d="M5 24 13 10l4 6 4-4 6 12H5Z" fill="currentColor" />
            </svg>
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-cove-charcoal text-center">Cove</h1>
        </div>
        <p className="mb-8 text-cove-muted text-center text-sm tracking-wide">A calmer place to begin.</p>
        <LoginForm />
      </div>
    </main>
  );
}
