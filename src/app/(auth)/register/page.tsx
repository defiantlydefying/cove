import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 bg-cove-offwhite">
      <div className="w-full max-w-sm rounded-2xl bg-cove-card p-8 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        <h1 className="text-4xl font-light tracking-tight text-cove-accent text-center">Cove</h1>
        <p className="mb-8 text-cove-muted text-center text-sm tracking-wide">Your cove.</p>
        <RegisterForm />
      </div>
    </main>
  );
}
