import { NextRequest, NextResponse } from "next/server";
import { checkPassword, signToken, COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!password || !(await checkPassword(password))) {
    await new Promise((r) => setTimeout(r, 500));
    return NextResponse.json({ error: "Ongeldig wachtwoord" }, { status: 401 });
  }

  const token = await signToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}
