import { NextRequest, NextResponse } from "next/server";
import {
  clearOAuthStateCookie,
  readOAuthState,
  setMemberSessionCookie,
  signInOAuthMember,
} from "@/lib/auth/member-oauth";
import { jsonError } from "@/lib/api-utils";

type LineTokenResponse = {
  access_token?: string;
  id_token?: string;
  error_description?: string;
};

type LineProfile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const state = readOAuthState(request);
    const code = request.nextUrl.searchParams.get("code");
    const incomingState = request.nextUrl.searchParams.get("state");
    const channelId = process.env.LINE_CHANNEL_ID;
    const channelSecret = process.env.LINE_CHANNEL_SECRET;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

    if (!state || state.state !== incomingState) {
      return jsonError("LINE 登入狀態驗證失敗", 400);
    }
    if (!code || !channelId || !channelSecret) {
      return jsonError("LINE 登入設定不完整", 500);
    }

    const callbackUrl = new URL("/api/member/oauth/line/callback", baseUrl);
    const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: callbackUrl.toString(),
        client_id: channelId,
        client_secret: channelSecret,
      }),
    });
    const token = (await tokenRes.json()) as LineTokenResponse;
    if (!tokenRes.ok || !token.access_token) {
      return jsonError(token.error_description ?? "LINE token 交換失敗", 400);
    }

    const profileRes = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const profile = (await profileRes.json()) as LineProfile;
    const idPayload = token.id_token ? decodeJwtPayload(token.id_token) : null;
    const email = typeof idPayload?.email === "string" ? idPayload.email : null;
    if (!profileRes.ok || !profile.userId || !email) {
      return jsonError("LINE 未提供 Email，暫時無法建立會員帳號", 400);
    }

    const member = await signInOAuthMember({
      provider: "LINE",
      providerAccountId: profile.userId,
      email,
      name: profile.displayName || email,
      avatarUrl: profile.pictureUrl,
    });

    const response = NextResponse.redirect(new URL(state.redirectTo, request.url));
    clearOAuthStateCookie(response);
    setMemberSessionCookie(response, member.id);
    return response;
  } catch (error) {
    console.error("[GET /api/member/oauth/line/callback]", error);
    return jsonError("LINE 登入失敗", 500);
  }
}
