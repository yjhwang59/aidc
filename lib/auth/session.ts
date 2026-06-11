import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

const SESSION_COOKIE = "aidc_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const SESSION_SHORT_MAX_AGE = 60 * 60 * 8; // 8 hours

function getSessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    return null;
  }
  return secret;
}

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createSessionToken(email: string, rememberMe = false): {
  token: string;
  maxAge: number;
} {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("SESSION_SECRET_NOT_CONFIGURED");
  }
  const expiresAt = Date.now() + (rememberMe ? SESSION_MAX_AGE : SESSION_SHORT_MAX_AGE) * 1000;
  const payload = `${email}:${expiresAt}`;
  const signature = signPayload(payload, secret);
  return {
    token: `${payload}:${signature}`,
    maxAge: rememberMe ? SESSION_MAX_AGE : SESSION_SHORT_MAX_AGE,
  };
}

export function verifySessionToken(token: string): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;

  const parts = token.split(":");
  if (parts.length !== 3) return null;

  const [email, expiresAtStr, signature] = parts;
  const payload = `${email}:${expiresAtStr}`;
  const expected = signPayload(payload, secret);

  try {
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expected);
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null;
  } catch {
    return null;
  }

  const expiresAt = Number(expiresAtStr);
  if (!expiresAt || Date.now() > expiresAt) return null;

  return email;
}

export async function getSessionEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAdmin(): Promise<string> {
  const email = await getSessionEmail();
  if (!email) {
    throw new Error("UNAUTHORIZED");
  }
  return email;
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}

export async function validateAdminCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  const adminUser = await prisma.adminUser.findUnique({ where: { email } });
  if (adminUser) {
    const valid = verifyPassword(password, adminUser.passwordHash);
    if (valid) {
      await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: { lastLoginAt: new Date() },
      });
    }
    return valid;
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return false;
  if (email !== adminEmail || password !== adminPassword) return false;

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: hashPassword(adminPassword),
      lastLoginAt: new Date(),
    },
    create: {
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      lastLoginAt: new Date(),
    },
  });
  return true;
}

export async function changeAdminPassword(options: {
  email: string;
  currentPassword: string;
  newPassword: string;
}): Promise<boolean> {
  const adminUser = await prisma.adminUser.findUnique({
    where: { email: options.email },
  });

  if (!adminUser || !verifyPassword(options.currentPassword, adminUser.passwordHash)) {
    return false;
  }

  await prisma.adminUser.update({
    where: { id: adminUser.id },
    data: { passwordHash: hashPassword(options.newPassword) },
  });
  return true;
}
