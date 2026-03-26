import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Redirect new users who haven't completed onboarding
  const moduleSettingsCount = await prisma.moduleSetting.count({
    where: { userId: session.user.id },
  });

  if (moduleSettingsCount === 0) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
