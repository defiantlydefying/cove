import { NextResponse } from "next/server";

export function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "Google sign-in is not configured" },
      { status: 503 }
    );
  }

  // OAuth client IDs are public identifiers. The client secret is never sent.
  return NextResponse.json(
    { clientId },
    { headers: { "Cache-Control": "private, max-age=3600" } }
  );
}
