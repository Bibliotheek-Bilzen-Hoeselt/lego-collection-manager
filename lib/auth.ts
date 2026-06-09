// Uses Web Crypto API — works on both Node.js and Edge Runtime (Vercel)

export const COOKIE_NAME = "lego_session";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET env var is not set");
  return secret;
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacVerify(data: string, token: string, secret: string): Promise<boolean> {
  const expected = await hmacSign(data, secret);
  if (expected.length !== token.length) return false;
  // Constant-time comparison
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}

export async function signToken(): Promise<string> {
  return hmacSign("authenticated", getSecret());
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    return await hmacVerify("authenticated", token, getSecret());
  } catch {
    return false;
  }
}

export async function checkPassword(input: string): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || input.length !== password.length) return false;
  // Constant-time comparison
  let diff = 0;
  for (let i = 0; i < password.length; i++) {
    diff |= input.charCodeAt(i) ^ password.charCodeAt(i);
  }
  return diff === 0;
}
