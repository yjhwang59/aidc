import { NextRequest, NextResponse } from "next/server";
import {
  clearOAuthStateCookie,
  readOAuthState,
  setMemberSessionCookie,
  signInOAuthMember,
} from "@/lib/auth/member-oauth";
import { jsonError } from "@/lib/api-utils";

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
};

type GoogleProfile = {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

export async function GET(request: NextRequest) {
  try {
    const state = readOAuthState(request);
    const code = request.nextUrl.searchParams.get("code");
    const incomingState = request.nextUrl.searchParams.get("state");
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

    if (!state || state.state !== incomingState) {
      return jsonError("Google 登入狀態驗證失敗", 400);
    }
    if (!code || !clientId || !clientSecret) {
      return jsonError("Google 登入設定不完整", 500);
    }

    const callbackUrl = new URL("/api/member/oauth/google/callback", baseUrl);
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl.toString(),
        grant_type: "authorization_code",
      }),
    });
    const token = (await tokenRes.json()) as GoogleTokenResponse;
    if (!tokenRes.ok || !token.access_token) {
      return jsonError(token.error ?? "Google token 交換失敗", 400);
    }

    const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const profile = (await profileRes.json()) as GoogleProfile;
    if (!profileRes.ok || !profile.sub || !profile.email) {
      return jsonError("無法取得 Google 會員資料", 400);
    }

    const member = await signInOAuthMember({
      provider: "GOOGLE",
      providerAccountId: profile.sub,
      email: profile.email,
      name: profile.name || profile.email,
      avatarUrl: profile.picture,
    });

    const response = NextResponse.redirect(new URL(state.redirectTo, request.url));
    clearOAuthStateCookie(response);
    setMemberSessionCookie(response, member.id);
    return response;
  } catch (error) {
    console.error("[GET /api/member/oauth/google/callback]", error);
    return jsonError("Google 登入失敗", 500);
  }
}
