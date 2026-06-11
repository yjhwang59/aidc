import { NextRequest, NextResponse } from "next/server";
import {
  verifySessionTokenEdge,
  getSessionCookieName,
} from "@/lib/auth/verify-session-edge";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(getSessionCookieName())?.value;
  const email = token ? await verifySessionTokenEdge(token) : null;

  if (!email) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
