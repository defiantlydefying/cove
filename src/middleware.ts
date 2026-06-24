import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { AGE_COOKIE } from "@/lib/age";

// Enforces the age gate for authenticated users. OAuth sign-ups skip the
// registration DOB field, so they reach the app without the age-confirmed cookie.
// Here we intercept them and send them to the /age-check interstitial first.
//
// Unauthenticated requests pass through — the protected pages already redirect to
// /login on their own. We only add the age step on top of an existing session.
export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  if (!token) return NextResponse.next();

  const ageConfirmed = req.cookies.get(AGE_COOKIE)?.value === "1";
  if (ageConfirmed) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/age-check";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*"],
};
