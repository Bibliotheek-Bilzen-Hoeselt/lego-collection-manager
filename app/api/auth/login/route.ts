import { NextRequest, NextResponse } from "next/server";
import { checkPassword, signToken, COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password || !checkPassword(password)) {
    // Small delay to slow brute-force
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ error: "Ongeldig wachtwoord" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, signToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}
