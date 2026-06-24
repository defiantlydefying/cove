import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { isAtLeastAge, MIN_AGE, AGE_COOKIE, AGE_COOKIE_MAX_AGE } from "@/lib/age";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, dateOfBirth } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Age gate (COPPA): Cove is not intended for children under 13, and its AI
    // companion handles sensitive emotional content. Reject sign-ups below 13.
    if (!dateOfBirth || !isAtLeastAge(dateOfBirth, MIN_AGE)) {
      return NextResponse.json(
        { error: "You must be at least 13 years old to use Cove." },
        { status: 403 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        dateOfBirth: new Date(dateOfBirth),
        userSettings: {
          create: {},
        },
      },
    });

    // DOB was validated above; record that this account passed the age gate so the
    // OAuth interstitial doesn't re-prompt the user on this device.
    const response = NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      { status: 201 }
    );
    response.cookies.set(AGE_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: AGE_COOKIE_MAX_AGE,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
