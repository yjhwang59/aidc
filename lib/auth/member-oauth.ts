import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import type { OAuthProvider } from "@prisma/client";
import {
  createMemberSessionToken,
  getMemberSessionCookieName,
} from "@/lib/auth/member-session";
import { prisma } from "@/lib/prisma";

const OAUTH_STATE_COOKIE = "aidc_member_oauth_state";

export function createOAuthState(redirectTo: string) {
  return {
    state: randomBytes(24).toString("hex"),
    redirectTo: redirectTo.startsWith("/") ? redirectTo : "/member",
  };
}

export function setOAuthStateCookie(
  response: NextResponse,
  payload: { state: string; redirectTo: string },
) {
  response.cookies.set(OAUTH_STATE_COOKIE, JSON.stringify(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
}

export function readOAuthState(request: NextRequest) {
  const raw = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { state: string; redirectTo: string };
  } catch {
    return null;
  }
}

export function clearOAuthStateCookie(response: NextResponse) {
  response.cookies.set(OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function signInOAuthMember(input: {
  provider: OAuthProvider;
  providerAccountId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}) {
  const email = input.email.toLowerCase();
  const account = await prisma.memberOAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: input.provider,
        providerAccountId: input.providerAccountId,
      },
    },
    include: { member: true },
  });

  if (account) {
    return prisma.member.update({
      where: { id: account.memberId },
      data: { lastLoginAt: new Date() },
    });
  }

  const member = await prisma.member.upsert({
    where: { email },
    update: {
      name: input.name,
      emailVerifiedAt: new Date(),
      lastLoginAt: new Date(),
    },
    create: {
      email,
      name: input.name,
      emailVerifiedAt: new Date(),
      lastLoginAt: new Date(),
      status: "ACTIVE",
    },
  });

  await prisma.memberOAuthAccount.create({
    data: {
      memberId: member.id,
      provider: input.provider,
      providerAccountId: input.providerAccountId,
      email,
      displayName: input.name,
      avatarUrl: input.avatarUrl || null,
    },
  });

  return member;
}

export function setMemberSessionCookie(response: NextResponse, memberId: string) {
  const { token, maxAge } = createMemberSessionToken(memberId, true);
  response.cookies.set(getMemberSessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}
