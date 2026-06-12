import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

const MEMBER_SESSION_COOKIE = "aidc_member_session";
const MEMBER_SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const MEMBER_SESSION_SHORT_MAX_AGE = 60 * 60 * 8;

function getSessionSecret(): string | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return secret;
}

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function getMemberSessionCookieName(): string {
  return MEMBER_SESSION_COOKIE;
}

export function createMemberSessionToken(memberId: string, rememberMe = true): {
  token: string;
  maxAge: number;
} {
  const secret = getSessionSecret();
  if (!secret) throw new Error("SESSION_SECRET_NOT_CONFIGURED");

  const maxAge = rememberMe ? MEMBER_SESSION_MAX_AGE : MEMBER_SESSION_SHORT_MAX_AGE;
  const expiresAt = Date.now() + maxAge * 1000;
  const payload = `${memberId}:${expiresAt}`;
  const signature = signPayload(payload, secret);
  return { token: `${payload}:${signature}`, maxAge };
}

export function verifyMemberSessionToken(token: string): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;

  const parts = token.split(":");
  if (parts.length !== 3) return null;

  const [memberId, expiresAtStr, signature] = parts;
  const payload = `${memberId}:${expiresAtStr}`;
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

  return memberId;
}

export async function getMemberSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(MEMBER_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyMemberSessionToken(token);
}

export async function getCurrentMember() {
  const memberId = await getMemberSessionId();
  if (!memberId) return null;

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      company: true,
      jobTitle: true,
      status: true,
      emailVerifiedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!member || member.status !== "ACTIVE") return null;
  return member;
}

export async function requireMember() {
  const member = await getCurrentMember();
  if (!member) throw new Error("UNAUTHORIZED");
  return member;
}

export async function registerMember(input: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  company?: string;
}) {
  return prisma.member.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash: hashPassword(input.password),
      name: input.name,
      phone: input.phone || null,
      company: input.company || null,
      emailVerifiedAt: new Date(),
      status: "ACTIVE",
    },
  });
}

export async function validateMemberCredentials(email: string, password: string) {
  const member = await prisma.member.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!member || !member.passwordHash) return null;
  if (member.status !== "ACTIVE") return null;
  if (!verifyPassword(password, member.passwordHash)) return null;

  await prisma.member.update({
    where: { id: member.id },
    data: { lastLoginAt: new Date() },
  });

  return member;
}
