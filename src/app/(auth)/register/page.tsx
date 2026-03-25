import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold">Cove</h1>
      <p className="mb-8 text-gray-500">Your cove.</p>
      <RegisterForm />
    </main>
  );
}
