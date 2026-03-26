import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-gradient-to-br from-cove-gradient-start/5 via-cove-offwhite to-cove-gradient-end/5">
      <div className="w-full max-w-sm rounded-3xl bg-cove-card p-8 shadow-[0_4px_32px_rgba(123,111,212,0.1)]">
        <h1 className="text-4xl font-semibold tracking-tight text-cove-accent text-center">Cove</h1>
        <p className="mb-8 text-cove-muted text-center text-sm tracking-wide">Your cove.</p>
        <RegisterForm />
      </div>
    </main>
  );
}
