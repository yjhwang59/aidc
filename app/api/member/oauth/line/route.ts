import { NextRequest, NextResponse } from "next/server";
import { createOAuthState, setOAuthStateCookie } from "@/lib/auth/member-oauth";
import { jsonError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const clientId = process.env.LINE_CHANNEL_ID;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
  if (!clientId) {
    return jsonError("尚未設定 LINE_CHANNEL_ID", 500);
  }

  const redirectTo = request.nextUrl.searchParams.get("redirect") ?? "/member";
  const oauth = createOAuthState(redirectTo);
  const callbackUrl = new URL("/api/member/oauth/line/callback", baseUrl);
  const url = new URL("https://access.line.me/oauth2/v2.1/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", callbackUrl.toString());
  url.searchParams.set("state", oauth.state);
  url.searchParams.set("scope", "profile openid email");

  const response = NextResponse.redirect(url);
  setOAuthStateCookie(response, oauth);
  return response;
}
