import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  getSessionCookieName,
  validateAdminCredentials,
} from "@/lib/auth/session";
import { jsonError } from "@/lib/api-utils";
import { loginSchema } from "@/lib/validations/booking";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("請提供有效的帳號與密碼");
    }

    const { email, password, rememberMe } = parsed.data;

    if (!(await validateAdminCredentials(email, password))) {
      return jsonError("帳號或密碼錯誤", 401);
    }

    const { token, maxAge } = createSessionToken(email, rememberMe ?? false);
    const response = NextResponse.json({ success: true });

    // SECURITY: Do not store passwords or auth tokens in localStorage or sessionStorage. Use HttpOnly cookies only.
    response.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return jsonError("登入失敗", 500);
  }
}
