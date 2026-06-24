import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isAtLeastAge, MIN_AGE, AGE_COOKIE, AGE_COOKIE_MAX_AGE } from "@/lib/age";

// Records that an authenticated user (typically an OAuth sign-up who never saw the
// registration DOB field) has passed the age gate. Sets the age-confirmed cookie
// that middleware checks before granting access to the app.
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { dateOfBirth } = body;

  if (!dateOfBirth || !isAtLeastAge(dateOfBirth, MIN_AGE)) {
    return NextResponse.json(
      { error: "You must be at least 13 years old to use Cove." },
      { status: 403 }
    );
  }

  // Persist the attested DOB on the user record (OAuth sign-ups never hit the
  // registration form, so this is the only place we capture it for them).
  await prisma.user.update({
    where: { id: session.user.id },
    data: { dateOfBirth: new Date(dateOfBirth) },
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AGE_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AGE_COOKIE_MAX_AGE,
  });
  return response;
}
