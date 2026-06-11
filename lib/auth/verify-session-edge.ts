const SESSION_COOKIE = "aidc_admin_session";

function getSessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return secret;
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function verifySessionTokenEdge(
  token: string,
): Promise<string | null> {
  const secret = getSessionSecret();
  if (!secret) return null;

  const parts = token.split(":");
  if (parts.length !== 3) return null;

  const [email, expiresAtStr, signature] = parts;
  const payload = `${email}:${expiresAtStr}`;
  const expected = await signPayload(payload, secret);

  if (!timingSafeEqualHex(signature, expected)) return null;

  const expiresAt = Number(expiresAtStr);
  if (!expiresAt || Date.now() > expiresAt) return null;

  return email;
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}
