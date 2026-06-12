import { NextRequest, NextResponse } from "next/server";
import { createOAuthState, setOAuthStateCookie } from "@/lib/auth/member-oauth";
import { jsonError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
  if (!clientId) {
    return jsonError("尚未設定 GOOGLE_CLIENT_ID", 500);
  }

  const redirectTo = request.nextUrl.searchParams.get("redirect") ?? "/member";
  const oauth = createOAuthState(redirectTo);
  const callbackUrl = new URL("/api/member/oauth/google/callback", baseUrl);
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", callbackUrl.toString());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", oauth.state);
  url.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(url);
  setOAuthStateCookie(response, oauth);
  return response;
}
